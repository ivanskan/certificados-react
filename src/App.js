import React, { useState } from "react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import CertificatePreview from "./components/CertificatePreview";
import SyllabusPreview from "./components/SyllabusPreview";
import syllabusData from "./data/syllabus.json";
import companiesMap from "./data/companies.json";
import "./Certificate.css";
import "./Syllabus.css";
import "./App.css";

function App() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("");

  // === Leer archivo Excel ===
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);

    const normalized = json.map((row) => {
      const newRow = {};
      for (const key in row) {
        newRow[key.trim().toUpperCase()] = row[key];
      }
      return newRow;
    });
    setRows(normalized);
  };

  // === Generar ZIP clasificado + PDF general (optimizado) ===
  const generateAllOptimized = async () => {
    if (!rows.length) return alert("Sube primero un Excel.");
    setStatus("Generando certificados...");

    const zip = new JSZip();
    const pdfGeneral = new jsPDF({ orientation: "landscape", unit: "px", format: "a4" });
    const pageW = pdfGeneral.internal.pageSize.getWidth();
    const pageH = pdfGeneral.internal.pageSize.getHeight();

    // Cursos con temario
    const cursosConTemario = ["INDUCCION GENERAL"];

    // ⚙️ Renderiza una sola vez el template del certificado
    const certContainer = document.createElement("div");
    certContainer.style.position = "absolute";
    certContainer.style.left = "-9999px";
    document.body.appendChild(certContainer);
    certContainer.innerHTML = document.getElementById("certTemplate")?.outerHTML || "";

    // ⚙️ Renderiza una sola vez el template del temario
    const temarioContainer = document.createElement("div");
    temarioContainer.style.position = "absolute";
    temarioContainer.style.left = "-9999px";
    document.body.appendChild(temarioContainer);
    temarioContainer.innerHTML = document.getElementById("temarioTemplate")?.outerHTML || "";

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      setStatus(`Generando ${i + 1}/${rows.length}...`);

      // === Actualiza dinámicamente el contenido del certificado ===
      const nombre = row["NOMBRE"] || "";
      const curso = row["CURSO"] || "";
      const empresa = row["EMPRESA"] || "";
      const instructor = row["INSTRUCTOR"] || "";

      // Edita campos dinámicos del certificado
      certContainer.querySelector(".fs-2.fw-bold").textContent = nombre;
      certContainer.querySelector(".fs-4.fw-bold.mb-4").textContent = curso;
      const empresaEl = certContainer.querySelector(".text-empresa");
      if (empresaEl) empresaEl.textContent = empresa;

      const instrEl = certContainer.querySelector(".instr-sign-block .fw-bold.fs-7");
      if (instrEl) instrEl.textContent = instructor;

      const firmaInstr = certContainer.querySelector(".instr-sign-block img");
      if (firmaInstr) firmaInstr.src = `/assets/${(instructor || "").replace(/\s+/g, " ").trim()}.png`;

      // === Renderizar certificado a imagen ===
      const certCanvas = await html2canvas(certContainer, { scale: 2 });
      const certImg = certCanvas.toDataURL("image/png");

      // Añadir al PDF general
      if (i > 0) pdfGeneral.addPage("a4", "landscape");
      pdfGeneral.addImage(certImg, "PNG", 0, 0, pageW, pageH);

      // === Guardar PDF individual en ZIP ===
      const pdfIndividual = new jsPDF({ orientation: "landscape", unit: "px", format: "a4" });
      pdfIndividual.addImage(certImg, "PNG", 0, 0, pageW, pageH);

      // === Si el curso tiene temario ===
      const cursoMayus = curso.trim().toUpperCase();
      if (cursosConTemario.includes(cursoMayus)) {
        const temarioCanvas = await html2canvas(temarioContainer, { scale: 2 });
        const temarioImg = temarioCanvas.toDataURL("image/png");

        // Añadir al PDF general
        pdfGeneral.addPage("a4", "landscape");
        pdfGeneral.addImage(temarioImg, "PNG", 0, 0, pageW, pageH);

        // Añadir también al individual
        pdfIndividual.addPage("a4", "landscape");
        pdfIndividual.addImage(temarioImg, "PNG", 0, 0, pageW, pageH);
      }

      // Clasificación por empresa (abreviada)
      let empresaFull = (empresa || "SIN_EMPRESA").trim().toUpperCase();
      let empresaAbrev = companiesMap[empresaFull] || empresaFull;
      empresaAbrev = empresaAbrev.replace(/[^a-z0-9_ -]/gi, "_");

      const nombreFile = (nombre || "SIN_NOMBRE").replace(/[^a-z0-9_ -]/gi, "_");
      const ab = await pdfIndividual.output("arraybuffer");
      zip.folder(empresaAbrev).file(`${nombreFile}.pdf`, ab);
    }

    // Limpieza DOM temporal
    document.body.removeChild(certContainer);
    document.body.removeChild(temarioContainer);

    // === Agregar el PDF general al ZIP ===
    const abGeneral = await pdfGeneral.output("arraybuffer");
    zip.file("CERTIFICADOS_GENERAL.pdf", abGeneral);

    // === Guardar ZIP final ===
    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, "certificados.zip");
    setStatus("Listo ✔");
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <span className="fw-bold fs-3 text-danger">ERS</span>
        <h2 className="text-center mb-0 fw-bolder">GENERADOR DE CERTIFICADOS</h2>
        <div className="d-flex align-items-center">
          <span className="fs-3 fw-bold">Pk</span>
          <i className="fs-6 mt-1 text-warning">corp.</i>
        </div>
      </div>

      <div className="d-flex gap-2 align-items-center flex-wrap mb-3">
        <input
          type="file"
          onChange={handleFile}
          accept=".xlsx,.xls"
          className="form-control"
          style={{ maxWidth: 400 }}
        />
        {rows.length > 0 && (
          <>
            <button onClick={generateAllOptimized} className="btn btn-success">
              Generar PDF + ZIP
            </button>
            <span>{status}</span>
            <span className="badge bg-info text-dark ms-auto">
              Participantes: {rows.length}
            </span>
          </>
        )}
      </div>

      {/* Previews invisibles usados como plantillas */}
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <CertificatePreview data={rows[0] || {}} preview />
        <SyllabusPreview
          curso={"INDUCCION GENERAL"}
          temas={syllabusData["INDUCCION GENERAL"] || []}
          preview
        />
      </div>

      {/* Vista previa visible solo del primero */}
      <CertificatePreview data={rows[0] || {}} />
      {["INDUCCION GENERAL"].includes(rows[0]?.["CURSO"]?.toUpperCase()) && (
        <SyllabusPreview
          curso={rows[0]?.["CURSO"]}
          temas={syllabusData[rows[0]?.["CURSO"]] || []}
        />
      )}
    </div>
  );
}

export default App;

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import CertificatePreview from "./components/CertificatePreview";
import SyllabusPreview from "./components/SyllabusPreview";
import syllabusData from "./data/syllabus.json";
import "./Certificate.css";
import "./Syllabus.css";

function App() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);

    // normalizamos keys
    const normalized = json.map((row) => {
      const newRow = {};
      for (const key in row) {
        newRow[key.trim().toUpperCase()] = row[key];
      }
      return newRow;
    });

    setRows(normalized);
  };

  const generateZip = async () => {
    if (!rows.length) return alert("Sube primero un Excel.");
    setStatus("Generando certificados...");
    const zip = new JSZip();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      setStatus(`Generando ${i + 1}/${rows.length}...`);

      // crea PDF
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      // ===== Página 1: Certificado =====
      const certEl = document.getElementById("certTemplate");
      const certCanvas = await html2canvas(certEl, { scale: 2 });
      const certImg = certCanvas.toDataURL("image/png");
      pdf.addImage(certImg, "PNG", 0, 0, pageW, pageH);

      // ===== Página 2: Temario =====
      const curso = row?.["CURSO"] || "";
      const temas = syllabusData[curso] || [];

      if (temas.length > 0) {
        pdf.addPage("a4", "landscape");

        // renderizamos el temario dinámico en el DOM oculto
        const tempNode = document.createElement("div");
        tempNode.style.position = "absolute";
        tempNode.style.left = "-9999px";
        document.body.appendChild(tempNode);

        const syllabusHtml = (
          <SyllabusPreview curso={curso} temas={temas} preview />
        );

        // usamos React para montar el componente dentro del div temporal
        const { createRoot } = await import("react-dom/client");
        const root = createRoot(tempNode);
        root.render(syllabusHtml);

        await new Promise((resolve) => setTimeout(resolve, 300)); // un pequeño delay

        const temarioEl = document.getElementById("temarioTemplate");
        const temarioCanvas = await html2canvas(temarioEl, { scale: 2 });
        const temarioImg = temarioCanvas.toDataURL("image/png");
        pdf.addImage(temarioImg, "PNG", 0, 0, pageW, pageH);

        root.unmount();
        document.body.removeChild(tempNode);
      }

      // ===== Guardar en ZIP =====
      const empresa = (row["EMPRESA"] || "SIN_EMPRESA").replace(/[^a-z0-9_ -]/gi, "_");
      const nombre = (row["NOMBRE"] || "SIN_NOMBRE").replace(/[^a-z0-9_ -]/gi, "_");
      const ab = await pdf.output("arraybuffer");
      zip.folder(empresa).file(`${nombre}.pdf`, ab);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, "certificados.zip");
    setStatus("Listo ✔");
  };

  return (
    <div className="container py-4">
      <h2 className="mb-3">Generador de Certificados + Temario</h2>
      <div className="d-flex gap-2 align-items-center flex-wrap mb-3">
        <input
          type="file"
          onChange={handleFile}
          accept=".xlsx,.xls"
          className="form-control"
          style={{ maxWidth: 320 }}
        />
        <button onClick={generateZip} className="btn btn-primary">
          Generar ZIP PDF
        </button>
        <span>{status}</span>
      </div>

      {/* Previews (solo el primero para revisar) */}
      <CertificatePreview data={rows[0] || {}} preview />
      <SyllabusPreview curso={rows[0]?.["CURSO"]} temas={syllabusData[rows[0]?.["CURSO"]] || []} preview />
    </div>
  );
}

export default App;

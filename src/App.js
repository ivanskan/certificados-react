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
import "./App.css"

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

  // === Generar ZIP con PDFs individuales ===
  const generateZip = async () => {
    if (!rows.length) return alert("Sube primero un Excel.");
    setStatus("Generando certificados...");
    const zip = new JSZip();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      setStatus(`Generando ${i + 1}/${rows.length}...`);

      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      // ===== Página 1: Certificado dinámico =====
      const tempCertNode = document.createElement("div");
      tempCertNode.style.position = "absolute";
      tempCertNode.style.left = "-9999px";
      document.body.appendChild(tempCertNode);

      const { createRoot } = await import("react-dom/client");
      const certRoot = createRoot(tempCertNode);
      certRoot.render(<CertificatePreview data={row} preview />);

      await new Promise((resolve) => setTimeout(resolve, 300));
      const certEl = document.getElementById("certTemplate");
      const certCanvas = await html2canvas(certEl, { scale: 2 });
      const certImg = certCanvas.toDataURL("image/png");
      pdf.addImage(certImg, "PNG", 0, 0, pageW, pageH);

      certRoot.unmount();
      document.body.removeChild(tempCertNode);

      // ===== Página 2: Temario dinámico =====
      const curso = row?.["CURSO"] || "";
      const temas = syllabusData[curso] || [];
      if (temas.length > 0) {
        const tempNode = document.createElement("div");
        tempNode.style.position = "absolute";
        tempNode.style.left = "-9999px";
        document.body.appendChild(tempNode);

        const syllabusRoot = createRoot(tempNode);
        syllabusRoot.render(<SyllabusPreview curso={curso} temas={temas} preview />);

        await new Promise((resolve) => setTimeout(resolve, 300));
        const temarioEl = document.getElementById("temarioTemplate");
        const temarioCanvas = await html2canvas(temarioEl, { scale: 2 });
        const temarioImg = temarioCanvas.toDataURL("image/png");

        pdf.addPage("a4", "landscape");
        pdf.addImage(temarioImg, "PNG", 0, 0, pageW, pageH);

        syllabusRoot.unmount();
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

  // === Generar un único PDF con todos los certificados ===
  const generateSinglePdf = async () => {
    if (!rows.length) return alert("Sube primero un Excel.");
    setStatus("Generando PDF único...");

    const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      setStatus(`Generando ${i + 1}/${rows.length}...`);

      // ===== Certificado dinámico =====
      const tempCertNode = document.createElement("div");
      tempCertNode.style.position = "absolute";
      tempCertNode.style.left = "-9999px";
      document.body.appendChild(tempCertNode);

      const { createRoot } = await import("react-dom/client");
      const certRoot = createRoot(tempCertNode);
      certRoot.render(<CertificatePreview data={row} preview />);

      await new Promise((resolve) => setTimeout(resolve, 300));
      const certEl = document.getElementById("certTemplate");
      const certCanvas = await html2canvas(certEl, { scale: 2 });
      const certImg = certCanvas.toDataURL("image/png");

      if (i > 0) pdf.addPage("a4", "landscape");
      pdf.addImage(certImg, "PNG", 0, 0, pageW, pageH);

      certRoot.unmount();
      document.body.removeChild(tempCertNode);

      // ===== Temario dinámico =====
      const curso = row?.["CURSO"] || "";
      const temas = syllabusData[curso] || [];
      if (temas.length > 0) {
        const tempNode = document.createElement("div");
        tempNode.style.position = "absolute";
        tempNode.style.left = "-9999px";
        document.body.appendChild(tempNode);

        const syllabusRoot = createRoot(tempNode);
        syllabusRoot.render(<SyllabusPreview curso={curso} temas={temas} preview />);

        await new Promise((resolve) => setTimeout(resolve, 300));
        const temarioEl = document.getElementById("temarioTemplate");
        const temarioCanvas = await html2canvas(temarioEl, { scale: 2 });
        const temarioImg = temarioCanvas.toDataURL("image/png");

        pdf.addPage("a4", "landscape");
        pdf.addImage(temarioImg, "PNG", 0, 0, pageW, pageH);

        syllabusRoot.unmount();
        document.body.removeChild(tempNode);
      }
    }

    pdf.save("CERTIFICADOS.pdf");
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
            <button onClick={generateSinglePdf} className="btn btn-success">Generar PDF General</button>
            <button onClick={generateZip} className="btn btn-primary">Generar ZIP PDF</button>
            <span>{status}</span>
            <span className="badge bg-info text-dark ms-auto">Participantes: {rows.length}</span>
          </>
        )}
      </div>

      {/* Vista previa visible solo del primero */}
      <CertificatePreview data={rows[0] || {}} />
      {["INDUCCION GENERAL", "IPERC"].includes(rows[0]?.["CURSO"]) && (
        <SyllabusPreview
          curso={rows[0]?.["CURSO"]}
          temas={syllabusData[rows[0]?.["CURSO"]] || []}
        />
      )}
    </div>
  );
}

export default App;

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import CertificatePreview from "./components/CertificatePreview";
import { createRoot } from "react-dom/client";
import "./Certificate.css";

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

    // ✅ normalizar keys
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

      // 🔹 crear contenedor temporal
      const container = document.createElement("div");
      container.style.width = "1123px"; // A4 apaisado
      container.style.height = "794px";
      container.style.position = "absolute";
      container.style.top = "-9999px"; // oculto
      document.body.appendChild(container);

      // 🔹 renderizar certificado
      const root = createRoot(container);
      root.render(<CertificatePreview data={row} />);

      // 🔹 esperar a que React pinte
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 🔹 capturar con html2canvas
      const canvas = await html2canvas(container, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: "a4",
      });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, pageW, pageH);

      const empresa = (row["EMPRESA"] || "SIN_EMPRESA").replace(
        /[^a-z0-9_ -]/gi,
        "_"
      );
      const nombre = (row["NOMBRE"] || "SIN_NOMBRE").replace(
        /[^a-z0-9_ -]/gi,
        "_"
      );

      const ab = await pdf.output("arraybuffer");
      zip.folder(empresa).file(`${nombre}.pdf`, ab);

      // 🔹 limpiar
      root.unmount();
      document.body.removeChild(container);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, "certificados.zip");
    setStatus("Listo ✔");
  };

  return (
    <div className="container py-4">
      <h2 className="mb-3">Generador de Certificados</h2>
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

      {/* 🔹 vista previa del primer certificado */}
      {rows.length > 0 && <CertificatePreview data={rows[0]} preview />}
    </div>
  );
}

export default App;

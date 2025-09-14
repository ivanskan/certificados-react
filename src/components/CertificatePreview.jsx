import React from "react";

export default function CertificatePreview({ data, preview = false }) {
  return (
    <div
      id={preview ? "certTemplate" : undefined} 
      className="cert-container row g-0"
    >
      {/* Columna izquierda */}
      <div className="col-2 left-col">
        <img src="/assets/image1.png" className="left-img" alt="decoracion" />
      </div>

      {/* Columna derecha */}
      <div className="col-10 right-col px-5">
        {/* Marca de agua */}
        <img src="/assets/marca.png" className="marca" alt="marca agua" />

        {/* Logo superior derecho */}
        <img src="/assets/logo.png" className="logo" alt="logo" />

        {/* Contenido textual */}
        <div className="subtitle">Otorga el presente certificado a:</div>
        <div className="field name">
          {data?.["NOMBRE"] || "NOMBRE PARTICIPANTE"}
        </div>
        <div className="field">Por haber aprobado el curso de:</div>
        <div className="field course">
          {data?.["CURSO"] || "NOMBRE DEL CURSO"}
        </div>
        <div className="field">
          {data?.["TEXTO CURSO"] || "Texto curso"}
        </div>
        <div className="field">
          {data?.["TEXTO FECHA"] || "Fecha y lugar"}
        </div>

        {/* Bloque de datos extra en dos columnas */}
        <div className="datos-extra">
          <div className="col-izq">
            <p>Nro. Sesión</p>
            <p>Duración</p>
            <p>Nro. Certificado</p>
            <p>Modalidad</p>
            <p>Vigencia</p>
            <p>Empresa</p>
          </div>
          <div className="col-der">
            <p>: {data?.["NRO SESION"] || "—"}</p>
            <p>: {data?.["DURACION"] || "—"}</p>
            <p>: {data?.["NRO CERTIFICADO"] || "—"}</p>
            <p>: {data?.["MODALIDAD"] || "—"}</p>
            <p>: {data?.["VIGENCIA"] || "—"}</p>
            <p>: {data?.["EMPRESA"] || "—"}</p>
          </div>
        </div>

        {/* Firmas */}
       <div className="firma-block main-sign-block">
  <img src="/assets/mainSign.png" className="firma-img" alt="firma gerente" />
  <div className="firma-line"></div>
  <div className="firma-nombre">Luisa Narro León</div>
</div>

<div className="firma-block instr-sign-block">
  <img
    src={`/assets/signatures/${(data?.["INSTRUCTOR"] || "default")
      .replace(/\s+/g, " ")
      .trim()}.PNG`}
    className="firma-img"
    alt="firma instructor"
    onError={(e) => (e.target.src = "/assets/signatures/default.PNG")}
  />
  <div className="firma-line"></div>
  <div className="firma-nombre">{data?.["INSTRUCTOR"] || "Instructor"}</div>
</div>

      </div>
    </div>
  );
}

import React from "react";

export default function CertificatePreview({ data, preview = false }) {
  return (
    <div id={ preview ? "certTemplate" : undefined} className="cert-container row g-0">

      <div className="col-2 left-col">
        <img src="/assets/image1.png" className="left-img" alt="decoracion" />
      </div>

      <div className="col-10 right-col px-5">
        <img src="/assets/logo.png" className="logo" alt="logo" />
        <p className="fs-5 fw-semibold">Otorga el presente certificado a:</p>
        <p className="fs-3 fw-bold">{data?.["NOMBRE"] || "NOMBRE PARTICIPANTE"}</p>
        <p className="fs-5">Por haber aprobado el curso de:</p>
        <p className="fs-4 fw-bold">{data?.["CURSO"] || "NOMBRE DEL CURSO"}</p>
        <p className="fs-5">{data?.["TEXTO CURSO"] || "Texto curso"}</p>
        <p className="fs-5 fw-semibold">{data?.["TEXTO FECHA"] || "Fecha y lugar"}</p>

        <div className="datos-extra fs-5">
          <div className="text-start fw-semibold lh-1">
            <p>Nro. Sesión</p>
            <p>Duración</p>
            <p>Nro. Certificado</p>
            <p>Modalidad</p>
            <p>Vigencia</p>
            <p>Empresa</p>
          </div>
          <div className="text-start lh-1 ms-2">
            <p>: {data?.["NRO SESION"] || ""}</p>
            <p>: {data?.["DURACION"] || ""}</p>
            <p>: {data?.["NRO CERTIFICADO"] || ""}</p>
            <p>: {data?.["MODALIDAD"] || ""}</p>
            <p>: {data?.["VIGENCIA"] || ""}</p>
            <p className="empresa-text over" >: {data?.["EMPRESA"] || ""}</p>
          </div>
        </div>

       <div className="firma-block main-sign-block lh-1">
          <img src="/assets/signatures/Luisa Narro.png" className="firma-img" alt="firma gerente" />
          <div className="border border-secondary mx-1"></div>
          <div className="fw-semibold fs-6 pb-1">Luisa Narro León</div>
          <span>Gerente General</span>
        </div>

        <div className="firma-block instr-sign-block lh-1">
          <img src={`/assets/signatures/${(data?.["INSTRUCTOR"] || "default").replace(/\s+/g, " ").trim()}.PNG`} className="firma-img"
            alt="firma instructor" onError={(e) => (e.target.src = "/assets/signatures/default.PNG")}/>
          <div className="border border-secondary mx-1"></div>
          <div className="fw-semibold fs-6 pb-1">{data?.["INSTRUCTOR"] ? data["INSTRUCTOR"].toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())
              : "Instructor"}</div>
          <span>Instructor</span>
        </div>

      </div>
    </div>
  );
}

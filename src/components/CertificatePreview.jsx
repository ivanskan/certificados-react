import React from "react";

export default function CertificatePreview({ data, preview = false }) {
  return (
    <div id={ preview ? "certTemplate" : undefined} className="cert-container row g-0">

      <div className="col-2">
        <img src="/assets/brand.png" className="left-img" alt="Brand" />
      </div>

      <div className="col-10 right-col px-5">
        <img src="/assets/LogoERS.png" className="logo" alt="ERS logo" />
        <p className="fs-3 mb-3">Otorga el presente certificado a:</p>
        <p className="fs-2 fw-bold">{data?.["NOMBRE"] || "NOMBRE PARTICIPANTE"}</p>
        <p className="fs-4 mb-3">Por haber aprobado el curso de:</p>
        <p className="fs-4 fw-bold mb-4">{data?.["CURSO"] || "NOMBRE DEL CURSO"}</p>
        <p className="fs-5 mb-4">{data?.["TEXTO CURSO"] || "Texto curso"}</p>
        <p className="fs-5 fw-semibold mb-3">{data?.["TEXTO FECHA"] || "Fecha y lugar"}</p>

        <div className="datos-extra d-flex fs-5">
          <div className="text-start  lh-1">
            <p>Nro. Sesión</p>
            <p>Duración</p>
            <p>Nro. Certificado</p>
            <p>Modalidad</p>
            <p>Vigencia</p>
            <p>Empresa</p>
          </div>
          <div className="text-start lh-1 ms-2">
            <p>: &nbsp;&nbsp;{data?.["NRO SESION"] || ""}</p>
            <p>: &nbsp;&nbsp;{data?.["DURACION"] || ""}</p>
            <p>: &nbsp;&nbsp;{data?.["NRO CERTIFICADO"] || ""}</p>
            <p>: &nbsp;&nbsp;{data?.["MODALIDAD"] || ""}</p>
            <p>: &nbsp;&nbsp;{data?.["VIGENCIA"] || ""}</p>
            <div className="text-empresa" >{data?.["EMPRESA"] || ""}</div>
          </div>
        </div>

       <div className="firma-main-block main-sign-block lh-1">
          <img src="/assets/Luisa Narro León.png" className="firma-img" alt="firma gerente" />
          <div className="divider mb-1"></div>
          <div className="fw-bold fs-7">Luisa Narro León</div>
          <span className="fs-8 fw-semibold">Gerente General</span>
        </div>

        <div className="firma-block instr-sign-block lh-1">
          <img src={`/assets/${(data?.["INSTRUCTOR"] || "").replace(/\s+/g, " ").trim()}.png`} className="firma-img"
            alt="firma instructor" 
            // onError={(e) => (e.target.src = "/assets/signatures/default.png")}
            />
          <div className="divider mb-1"></div>
          <div className="fw-bold fs-7">{data?.["INSTRUCTOR"] ? data["INSTRUCTOR"] : "Instructor"}</div>
          <span className="fs-8 fw-semibold">Instructor</span>
        </div>

      </div>
    </div>
  );
}

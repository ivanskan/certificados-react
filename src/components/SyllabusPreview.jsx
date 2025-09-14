import React from "react";

export default function SyllabusPreview({ curso, temas = [], preview = false }) {
  const mitad = Math.ceil(temas.length / 2);
  const izquierda = temas.slice(0, mitad);
  const derecha = temas.slice(mitad);

  return (
    <div
      id={preview ? "temarioTemplate" : undefined}
      className="cert-container row g-0 py-4 mt-2"
    >
      <div className="syllabus-content px-5 py-3 text-start">
        <div className="syllabus-header">
          <h2>Temario</h2>
          <h3>{curso || ""}</h3>
        </div>

        <div className="syllabus-body">
          <div className="syllabus-column">
            {izquierda.map((tema, idx) => {
              const numero = String(idx + 1).padStart(2, "0");
              return (
                <p key={idx}>
                  {numero}. {tema}
                </p>
              );
            })}
          </div>
          <div className="syllabus-column">
            {derecha.map((tema, idx) => {
              const numero = String(mitad + idx + 1).padStart(2, "0");
              return (
                <p key={idx}>
                  {numero}. {tema}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

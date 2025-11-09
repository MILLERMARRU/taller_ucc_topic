"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Document, Packer, Paragraph, TextRun } from "docx"
import { saveAs } from "file-saver"

export default function PacientePage() {
  const [paciente, setPaciente] = useState<any>(null)

  useEffect(() => {
    const fetchPaciente = async () => {
      const { data, error } = await supabase
        .from("pacientes")
        .select(`
          nombre,
          edad,
          sexo,
          raza,
          telefono,
          dni,
          estado_civil,
          lugar_nacimiento,
          fecha_nacimiento,
          grado_instruccion,
          domicilio_actual,
          lugar_procedencia,
          tiempo_procedencia,
          tipo_seguro,
          persona_responsable,
          celular_responsable,
          dni_responsable,
          direccion_responsable,
          estado,
          antecedentes (
            ocupacion,
            religion,
            tabaquismo,
            alcoholismo,
            drogas,
            alimentacion,
            actividad_fisica,
            inmunizaciones,
            diagnostico_previo,
            enfermedades_infancia,
            cirugias_previas,
            alergias,
            medicamentos_actuales,
            menarca,
            ritmo_menstrual,
            uso_anticonceptivos,
            numero_embarazos
          ),
          consultas (
            motivo_consulta,
            presion_arterial,
            pulso,
            temperatura,
            saturacion_o2,
            peso,
            talla,
            examen_fisico,
            diagnostico,
            medicamentos,
            indicaciones,
            fecha,
            hora
          )
        `)
        .eq("id_paciente", 6) 

      if (!error && data.length > 0) setPaciente(data[0])
    }

    fetchPaciente()
  }, [])

  const exportWord = () => {
    if (!paciente) return

    const doc = new Document({
      sections: [
        {
          children: [
            // Encabezado
            new Paragraph({
              children: [new TextRun({ text: "Historial Clínico", bold: true, size: 32 })],
            }),
            new Paragraph(" "),
            // Datos del Paciente
            new Paragraph({ children: [new TextRun({ text: "Datos del Paciente", bold: true, size: 24 })] }),
            ...Object.entries(paciente)
              .filter(([key]) => key !== "antecedentes" && key !== "consultas")
              .map(
                ([key, value]) =>
                  new Paragraph(`${key.replace(/_/g, " ")}: ${value !== null ? value : "N/A"}`)
              ),
            new Paragraph(" "),
            // Antecedentes
            new Paragraph({ children: [new TextRun({ text: "Antecedentes", bold: true, size: 24 })] }),
            ...(paciente.antecedentes || []).map(
              (a: any) =>
                new Paragraph(
                  Object.entries(a)
                    .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v !== null ? v : "N/A"}`)
                    .join(", ")
                )
            ),
            new Paragraph(" "),
            // Consultas
            new Paragraph({ children: [new TextRun({ text: "Consultas", bold: true, size: 24 })] }),
            ...(paciente.consultas || []).map(
              (c: any) =>
                new Paragraph(
                  Object.entries(c)
                    .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v !== null ? v : "N/A"}`)
                    .join(", ")
                )
            ),
          ],
        },
      ],
    })

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `Historial_${paciente.nombre}.docx`)
    })
  }

  return (
    <div className="p-6">
      {paciente ? (
        <>
          <h2 className="text-2xl font-bold mb-4">
            {paciente.nombre} - {paciente.edad} años
          </h2>

          {/* Datos del paciente */}
          <div className="space-y-2">
            {Object.entries(paciente)
              .filter(([key]) => key !== "antecedentes" && key !== "consultas")
              .map(([key, value]) => (
                <p key={key}>
                  <b>{key.replace(/_/g, " ")}:</b> {value !== null ? String(value) : "N/A"}
                </p>
              ))}

            {/* Antecedentes */}
            <h3 className="mt-4 font-bold">Antecedentes</h3>
            {paciente.antecedentes?.map((a: any, i: number) => (
              <div key={i} className="ml-4 border p-2 mb-2">
                {Object.entries(a).map(([key, value]) => (
                  <p key={key}>
                    <b>{key.replace(/_/g, " ")}:</b> {value !== null ? String(value) : "N/A"}
                  </p>
                ))}
              </div>
            ))}

            {/* Consultas */}
            <h3 className="mt-4 font-bold">Consultas</h3>
            {paciente.consultas?.map((c: any, i: number) => (
              <div key={i} className="ml-4 border p-2 mb-2">
                {Object.entries(c).map(([key, value]) => (
                  <p key={key}>
                    <b>{key.replace(/_/g, " ")}:</b> {value !== null ? String(value) : "N/A"}
                  </p>
                ))}
              </div>
            ))}
          </div>

          {/* Botón exportar */}
          <button
            onClick={exportWord}
            className="px-4 py-2 bg-blue-600 text-white rounded mt-6"
          >
            Descargar en Word
          </button>
        </>
      ) : (
        <p>Cargando paciente...</p>
      )}
    </div>
  )
}

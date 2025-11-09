"use client";

import { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, HeadingLevel, TextRun, Table, TableRow, TableCell, WidthType } from "docx";
import { FileDown } from "lucide-react";
import { supabase } from "@/lib/supabase";

export type WordPatient = {
  nombre: string;
  dni: string;
  edad: number | null;
  telefono: string | null;
  domicilio_actual: string | null;
  fecha_nacimiento: string | null;
};

export type WordConsulta = {
  id_consulta?: number;
  fecha: string;
  hora: string;
  motivo_consulta: string | null;
  diagnostico: string | null;
  presion_arterial: string | null;
  pulso: number | null;
  temperatura: number | null;
  saturacion_o2: number | null;
  peso: number | null;
  talla: number | null;
  examen_fisico: string | null;
  medicamentos: string | null;
  indicaciones: string | null;
};

export default function ExportWordButton({
  paciente,
  enfermedades = [],
  alergias = [],
  consultas = [],
  fileName = "historial.docx",
  pacienteId,
  className,
  label = "Exportar Word",
}: {
  paciente?: WordPatient;
  enfermedades?: string[];
  alergias?: string[];
  consultas?: WordConsulta[];
  fileName?: string;
  pacienteId?: number;
  className?: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState<any | null>(null);

  // Si se pasa pacienteId, obtener todo desde supabase como en el ejemplo pedido
  useEffect(() => {
    if (!pacienteId) return;
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
        .eq("id_paciente", pacienteId)
        .single();

      if (!error && data) setFetched(data);
    };

    fetchPaciente();
  }, [pacienteId]);

  const createParagraph = (text: string) => new Paragraph({ children: [new TextRun(text)] });

  const handleExport = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // Elegir fuente de datos: fetched (si hay pacienteId) o props
      const basePaciente: any = fetched || paciente || {};
      const baseEnfermedades: string[] = fetched
        ? (fetched.antecedentes && fetched.antecedentes[0]?.enfermedades_infancia
            ? String(fetched.antecedentes[0].enfermedades_infancia).split(",").map((s: string) => s.trim()).filter(Boolean)
            : [])
        : enfermedades;
      const baseAlergias: string[] = fetched
        ? (fetched.antecedentes && fetched.antecedentes[0]?.alergias
            ? String(fetched.antecedentes[0].alergias).split(",").map((s: string) => s.trim()).filter(Boolean)
            : [])
        : alergias;
      const baseConsultas: WordConsulta[] = fetched ? (fetched.consultas || []) : (consultas || []);

      // Usar UNA SOLA sección para evitar saltos de página artificiales
      const children: any[] = [];

      // Encabezado
      children.push(new Paragraph({ children: [new TextRun({ text: "Historial Clínico", bold: true, size: 32 })] }));
      children.push(new Paragraph(" "));

      // Datos del Paciente
      children.push(new Paragraph({ children: [new TextRun({ text: "Datos del Paciente", bold: true, size: 24 })] }));
      children.push(
        ...Object.entries(basePaciente)
          .filter(([key]) => key !== "antecedentes" && key !== "consultas")
          .map(([key, value]) => new Paragraph(`${key.replace(/_/g, " ")}: ${value ?? "N/A"}`))
      );
      children.push(new Paragraph(" "));

      // Antecedentes
      if (fetched && Array.isArray(fetched.antecedentes)) {
        children.push(new Paragraph({ children: [new TextRun({ text: "Antecedentes", bold: true, size: 24 })] }));
        fetched.antecedentes.forEach((a: any) => {
          children.push(
            new Paragraph(
              Object.entries(a)
                .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v ?? "N/A"}`)
                .join(", ")
            )
          );
        });
        children.push(new Paragraph(" "));
      } else {
        children.push(new Paragraph({ children: [new TextRun({ text: "Antecedentes", bold: true, size: 24 })] }));
        children.push(
          new Paragraph(baseEnfermedades.length ? `Enfermedades: ${baseEnfermedades.join(", ")}` : "Enfermedades: N/A")
        );
        children.push(new Paragraph(baseAlergias.length ? `Alergias: ${baseAlergias.join(", ")}` : "Alergias: N/A"));
        children.push(new Paragraph(" "));
      }

      // Consultas
      children.push(new Paragraph({ children: [new TextRun({ text: "Consultas", bold: true, size: 24 })] }));
      baseConsultas.forEach((c: any, i: number) => {
        const table = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [createParagraph("Presión Arterial")] }),
                new TableCell({ children: [createParagraph(c.presion_arterial ?? "-")] }),
                new TableCell({ children: [createParagraph("Pulso")] }),
                new TableCell({ children: [createParagraph(((c.pulso ?? "-") as any) + " lpm")] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [createParagraph("Temperatura")] }),
                new TableCell({ children: [createParagraph(((c.temperatura ?? "-") as any) + " °C")] }),
                new TableCell({ children: [createParagraph("Saturación O2")] }),
                new TableCell({ children: [createParagraph(((c.saturacion_o2 ?? "-") as any) + " %")] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [createParagraph("Peso")] }),
                new TableCell({ children: [createParagraph(((c.peso ?? "-") as any) + " kg")] }),
                new TableCell({ children: [createParagraph("Talla")] }),
                new TableCell({ children: [createParagraph(((c.talla ?? "-") as any) + " cm")] }),
              ],
            }),
          ],
        });

        children.push(new Paragraph({ children: [new TextRun({ text: `Consulta ${i + 1} - ${c.fecha}`, bold: true })] }));
        children.push(createParagraph(`Motivo: ${c.motivo_consulta ?? "-"}`));
        children.push(table);
        children.push(new Paragraph({ children: [new TextRun({ text: "Examen Físico", bold: true })] }));
        children.push(createParagraph(c.examen_fisico ?? "-"));
        children.push(new Paragraph({ children: [new TextRun({ text: "Diagnóstico", bold: true })] }));
        children.push(createParagraph(c.diagnostico ?? "-"));
        children.push(new Paragraph({ children: [new TextRun({ text: "Medicamentos", bold: true })] }));
        children.push(createParagraph(c.medicamentos ?? "-"));
        children.push(new Paragraph({ children: [new TextRun({ text: "Indicaciones", bold: true })] }));
        children.push(createParagraph(c.indicaciones ?? "-"));
      });

      const doc = new Document({ sections: [{ children }] });
      const blob = await Packer.toBlob(doc);
      const name = basePaciente?.nombre ? `Historial_${basePaciente.nombre}.docx` : fileName;
      saveAs(blob, name);
    } catch (e) {
      console.error("Error al exportar Word", e);
      alert("No se pudo exportar el archivo Word. Revisa la consola para más detalles.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className={
        className ||
        "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      }
      title={label}
    >
      <FileDown size={16} /> {loading ? "Exportando..." : label}
    </button>
  );
}

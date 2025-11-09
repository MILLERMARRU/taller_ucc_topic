"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";

export type PdfPatient = {
  nombre: string;
  dni: string;
  edad: number | null;
  telefono: string | null;
  domicilio_actual: string | null;
  fecha_nacimiento: string | null;
};

export type PdfConsulta = {
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

export default function ExportPdfButton({
  pacienteId,
  paciente,
  enfermedades = [],
  alergias = [],
  consultas = [],
  fileName = "historial.pdf",
}: {
  pacienteId?: number;
  paciente?: PdfPatient;
  enfermedades?: string[];
  alergias?: string[];
  consultas?: PdfConsulta[];
  fileName?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState<any | null>(null);

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

  const handleExport = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const jsPdfMod: any = await import("jspdf");
      const JsPDFCtor = jsPdfMod.default || jsPdfMod.jsPDF; // compat default/named export
      const pdf = new JsPDFCtor("p", "mm", "a4");

      const margin = 12;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let x = margin;
      let y = margin;
      const maxWidth = pageWidth - margin * 2;
      const line = 6; // line height

      const addText = (text: string, opts?: { bold?: boolean; size?: number }) => {
        const size = opts?.size ?? 12;
        pdf.setFont("helvetica", opts?.bold ? "bold" : "normal");
        pdf.setFontSize(size);
        const lines = pdf.splitTextToSize(text, maxWidth);
        lines.forEach((ln: string) => {
          if (y + line > pageHeight - margin) {
            pdf.addPage();
            y = margin;
          }
          pdf.text(ln, x, y);
          y += line;
        });
      };

      const addSpacer = (h = 4) => {
        if (y + h > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
        y += h;
      };

      const drawKeyValues = (obj: Record<string, any>) => {
        Object.entries(obj).forEach(([k, v]) => {
          addText(`${k.replace(/_/g, " ")}: ${v ?? "N/A"}`);
        });
      };

      // data source
      const basePaciente: any = fetched || paciente || {};
      const baseConsultas: any[] = fetched ? (fetched.consultas || []) : (consultas || []);
      const baseEnfermedades: string[] = fetched
        ? (fetched.antecedentes && fetched.antecedentes[0]?.enfermedades_infancia
            ? String(fetched.antecedentes[0].enfermedades_infancia).split(",").map((s: string) => s.trim()).filter(Boolean)
            : [])
        : (enfermedades || []);
      const baseAlergias: string[] = fetched
        ? (fetched.antecedentes && fetched.antecedentes[0]?.alergias
            ? String(fetched.antecedentes[0].alergias).split(",").map((s: string) => s.trim()).filter(Boolean)
            : [])
        : (alergias || []);

      // Title
      addText("Historial Clínico", { bold: true, size: 16 });
      addSpacer(2);

      // Datos del paciente (todo en una sola sección, sin salto de página forzado)
      addText("Datos del Paciente", { bold: true });
      const filteredPatient: Record<string, any> = Object.fromEntries(
        Object.entries(basePaciente).filter(([k]) => k !== "antecedentes" && k !== "consultas")
      );
      drawKeyValues(filteredPatient);
      addSpacer();

      // Antecedentes
      addText("Antecedentes", { bold: true });
      addText(baseEnfermedades.length ? `Enfermedades: ${baseEnfermedades.join(", ")}` : "Enfermedades: N/A");
      addText(baseAlergias.length ? `Alergias: ${baseAlergias.join(", ")}` : "Alergias: N/A");
      addSpacer();

      // Consultas
      addText("Consultas", { bold: true });
      baseConsultas.forEach((c, idx) => {
        addText(`Consulta ${idx + 1} - ${c.fecha}` , { bold: true });
        addText(`Motivo: ${c.motivo_consulta ?? "-"}`);
        // vitals line by line to evitar grandes tablas
        addText(`Presión Arterial: ${c.presion_arterial ?? "-"}`);
        addText(`Pulso: ${c.pulso ?? "-"} lpm`);
        addText(`Temperatura: ${c.temperatura ?? "-"} °C`);
        addText(`Saturación O2: ${c.saturacion_o2 ?? "-"} %`);
        addText(`Peso: ${c.peso ?? "-"} kg`);
        addText(`Talla: ${c.talla ?? "-"} cm`);
        addText("Examen Físico", { bold: true });
        addText(String(c.examen_fisico ?? "-"));
        addText("Diagnóstico", { bold: true });
        addText(String(c.diagnostico ?? "-"));
        addText("Medicamentos", { bold: true });
        addText(String(c.medicamentos ?? "-"));
        addText("Indicaciones", { bold: true });
        addText(String(c.indicaciones ?? "-"));
        addSpacer();
      });

      const name = basePaciente?.dni ? `historial_${basePaciente.dni}.pdf` : fileName;
      pdf.save(name);
    } catch (e) {
      console.error("Error al exportar PDF", e);
      alert("No se pudo exportar el PDF. Revisa la consola para más detalles.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
      title="Exportar PDF"
    >
      <FileText size={16} /> {loading ? "Exportando..." : "Exportar PDF"}
    </button>
  );
}

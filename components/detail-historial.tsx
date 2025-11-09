"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Calendar, Phone, MapPin, FileText, ChevronDown, ChevronUp, Plus } from "lucide-react";
import ExportPdfButton from "@/components/export-pdf-button";
import ExportWordButton from "@/components/export-word-button";
import { useRouter } from "next/navigation";

export type DetailHistorialProps = {
  pacienteId: number;
};

type Paciente = {
  id_paciente: number;
  nombre: string;
  dni: string;
  edad: number | null;
  telefono: string | null;
  domicilio_actual: string | null;
  fecha_nacimiento: string | null;
};

type Antecedentes = {
  enfermedades_infancia: string | null;
  alergias: string | null;
};

type Consulta = {
  id_consulta: number;
  fecha: string; // YYYY-MM-DD
  hora: string;  // HH:MM:SS
  motivo_consulta: string | null;
  diagnostico: string | null;
  presion_arterial: string | null; // Ej: 120/80
  pulso: number | null;
  temperatura: number | null;
  saturacion_o2: number | null;
  peso: number | null;
  talla: number | null;
  examen_fisico: string | null;
  medicamentos: string | null;
  indicaciones: string | null;
};

function formatDate(d: string | null) {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString("es-PE", { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch {
    return d;
  }
}

function Pill({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "red" | "orange" }) {
  const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  const tones: Record<string, string> = {
    default: "bg-gray-100 text-gray-700",
    red: "bg-red-100 text-red-700",
    orange: "bg-orange-100 text-orange-700",
  };
  return <span className={`${base} ${tones[tone]}`}>{children}</span>;
}

export default function DetailHistorial({ pacienteId }: DetailHistorialProps) {
  const router = useRouter();
  const printableRef = useRef<HTMLDivElement>(null);
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [antecedentes, setAntecedentes] = useState<Antecedentes | null>(null);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openIds, setOpenIds] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        const [{ data: pData, error: pErr }, { data: aData }, { data: cData, error: cErr }] = await Promise.all([
          supabase
            .from("pacientes")
            .select("id_paciente, nombre, dni, edad, telefono, domicilio_actual, fecha_nacimiento")
            .eq("id_paciente", pacienteId)
            .single(),
          supabase
            .from("antecedentes")
            .select("enfermedades_infancia, alergias")
            .eq("id_paciente", pacienteId)
            .maybeSingle(),
          supabase
            .from("consultas")
            .select(
              `id_consulta, fecha, hora, motivo_consulta, diagnostico, presion_arterial, pulso, temperatura, saturacion_o2, peso, talla, examen_fisico, medicamentos, indicaciones`
            )
            .eq("id_paciente", pacienteId)
            .order("fecha", { ascending: false })
            .order("hora", { ascending: false }),
        ]);

        if (pErr) throw pErr;
        if (cErr) throw cErr;

        setPaciente(pData as Paciente);
        setAntecedentes((aData || null) as Antecedentes | null);
        setConsultas((cData as Consulta[]) || []);
      } catch (e: any) {
        setError(e.message || "No se pudo cargar el historial");
      } finally {
        setLoading(false);
      }
    };

    if (pacienteId) fetchAll();
  }, [pacienteId]);

  const toggle = (id: number) => setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Cargando historial...</p>
        </div>
      </div>
    );
  }

  if (error || !paciente) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <div className="text-5xl mb-2">⚠️</div>
          <p className="text-gray-700">{error || "Paciente no encontrado"}</p>
        </div>
      </div>
    );
  }

  // Utilidades para mostrar listas de antecedentes
  const enfermedades = antecedentes?.enfermedades_infancia
    ? antecedentes!.enfermedades_infancia.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const alergias = antecedentes?.alergias
    ? antecedentes!.alergias.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="p-6 space-y-6" ref={printableRef}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Historial Clínico</h1>
          <p className="text-gray-600">{paciente?.nombre}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/admin/consultas/nueva/${pacienteId}`)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Plus size={16} /> Nueva Consulta
          </button>
          <ExportPdfButton pacienteId={pacienteId} fileName={`historial_${paciente?.dni || pacienteId}.pdf`} />
          <ExportWordButton
            pacienteId={pacienteId}
            fileName={`historial_${paciente?.dni || pacienteId}.docx`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda: paciente + antecedentes */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Información del Paciente</h2>
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-700 font-semibold text-lg">
                {paciente.nombre.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{paciente.nombre}</p>
                <p className="text-sm text-gray-600">DNI: {paciente.dni}</p>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>Edad: {paciente.edad ?? "-"} años</p>
                  <p className="flex items-center gap-2"><Phone size={14} /> {paciente.telefono ?? "-"}</p>
                  <p className="flex items-center gap-2 break-words"><MapPin size={14} /> {paciente.domicilio_actual ?? "-"}</p>
                  <p className="flex items-center gap-2"><Calendar size={14} /> {formatDate(paciente.fecha_nacimiento)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Antecedentes Médicos</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Enfermedades Previas</p>
                {enfermedades.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                    {enfermedades.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Sin registros</p>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Alergias</p>
                {alergias.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                    {alergias.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Sin registros</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha: historial */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Historial de Consultas</h2>
            <div className="space-y-4">
              {consultas.length === 0 && (
                <p className="text-sm text-gray-500">No hay consultas registradas.</p>
              )}

              {consultas.map((c) => {
                const open = !!openIds[c.id_consulta];
                return (
                  <div key={c.id_consulta} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggle(c.id_consulta)}
                      className="w-full flex items-center justify-between text-left px-4 py-3 bg-gray-50 hover:bg-gray-100"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">
                          Consulta del {formatDate(c.fecha)}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {c.motivo_consulta || "Sin motivo registrado"}
                        </p>
                      </div>
                      {open ? <ChevronUp size={18} className="text-gray-600" /> : <ChevronDown size={18} className="text-gray-600" />}
                    </button>

                    {open && (
                      <div className="px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-3">Signos Vitales</h3>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-blue-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500">Presión Arterial</p>
                              <p className="text-lg font-bold text-blue-700">{c.presion_arterial ?? "-"}</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500">Pulso</p>
                              <p className="text-lg font-bold text-green-700">{c.pulso ?? "-"} <span className="text-xs font-normal">lpm</span></p>
                            </div>
                            <div className="bg-rose-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500">Temperatura</p>
                              <p className="text-lg font-bold text-rose-700">{c.temperatura ?? "-"} <span className="text-xs font-normal">°C</span></p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500">Saturación O₂</p>
                              <p className="text-lg font-bold text-purple-700">{c.saturacion_o2 ?? "-"} <span className="text-xs font-normal">%</span></p>
                            </div>
                            <div className="bg-amber-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500">Peso</p>
                              <p className="text-lg font-bold text-amber-700">{c.peso ?? "-"} <span className="text-xs font-normal">kg</span></p>
                            </div>
                            <div className="bg-teal-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500">Talla</p>
                              <p className="text-lg font-bold text-teal-700">{c.talla ?? "-"} <span className="text-xs font-normal">cm</span></p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-1">Examen Físico</h3>
                            <p className="text-sm text-gray-700 whitespace-pre-line">{c.examen_fisico ?? "-"}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-1">Diagnóstico</h3>
                            <p className="text-sm text-gray-700 whitespace-pre-line">{c.diagnostico ?? "-"}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-1">Medicamentos</h3>
                            <p className="text-sm text-gray-700 whitespace-pre-line">{c.medicamentos ?? "-"}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-1">Indicaciones</h3>
                            <p className="text-sm text-gray-700 whitespace-pre-line">{c.indicaciones ?? "-"}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

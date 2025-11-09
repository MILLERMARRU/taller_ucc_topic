"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import FormConsulta from "@/components/form-consulta";

type Paciente = {
  id_paciente: number;
  nombre: string;
  dni: string;
  edad: number;
  telefono: string | null;
  domicilio_actual: string | null;
};

type Antecedente = {
  enfermedades_infancia: string;
  alergias: string;
};

export default function NuevaConsultaPage() {
  const params = useParams();
  const pacienteId = parseInt(params.id as string);

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [antecedentes, setAntecedentes] = useState<Antecedente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPacienteData = async () => {
      try {
        // Obtener datos del paciente
        const { data: pacienteData, error: pacienteError } = await supabase
          .from("pacientes")
          .select("id_paciente, nombre, dni, edad, telefono, domicilio_actual")
          .eq("id_paciente", pacienteId)
          .single();

        if (pacienteError) throw pacienteError;
        setPaciente(pacienteData);

        // Obtener antecedentes del paciente
        const { data: antecedentesData, error: antecedentesError } = await supabase
          .from("antecedentes")
          .select("enfermedades_infancia, alergias")
          .eq("id_paciente", pacienteId)
          .single();

        if (!antecedentesError && antecedentesData) {
          setAntecedentes(antecedentesData);
        }
      } catch (err: any) {
        setError(err.message || "Error al cargar datos del paciente");
      } finally {
        setLoading(false);
      }
    };

    if (pacienteId) {
      fetchPacienteData();
    }
  }, [pacienteId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos del paciente...</p>
        </div>
      </div>
    );
  }

  if (error || !paciente) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">
            {error || "No se pudo cargar la información del paciente"}
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Preparar antecedentes para el componente
  const antecedentesFormateados = antecedentes
    ? {
        enfermedades: antecedentes.enfermedades_infancia
          ? antecedentes.enfermedades_infancia.split(",").map((e) => e.trim())
          : [],
        alergias: antecedentes.alergias
          ? antecedentes.alergias.split(",").map((a) => a.trim())
          : [],
      }
    : undefined;

  return (
    <FormConsulta
      pacienteId={paciente.id_paciente}
      pacienteNombre={paciente.nombre}
      pacienteDni={paciente.dni}
      pacienteEdad={paciente.edad}
      pacienteTelefono={paciente.telefono || undefined}
      pacienteDireccion={paciente.domicilio_actual || undefined}
      antecedentes={antecedentesFormateados}
    />
  );
}

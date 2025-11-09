"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type ConsultaFormProps = {
  pacienteId: number;
  pacienteNombre: string;
  pacienteDni: string;
  pacienteEdad: number;
  pacienteTelefono?: string;
  pacienteDireccion?: string;
  antecedentes?: {
    enfermedades?: string[];
    alergias?: string[];
  };
};

type ConsultaData = {
  motivo_consulta: string;
  presion_arterial_sistolica: string;
  presion_arterial_diastolica: string;
  pulso: string;
  temperatura: string;
  saturacion_o2: string;
  peso: string;
  talla: string;
  examen_fisico: string;
  diagnostico: string;
  medicamentos: string;
  indicaciones: string;
};

export default function FormConsulta({
  pacienteId,
  pacienteNombre,
  pacienteDni,
  pacienteEdad,
  pacienteTelefono,
  pacienteDireccion,
  antecedentes,
}: ConsultaFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ConsultaData>({
    motivo_consulta: "",
    presion_arterial_sistolica: "",
    presion_arterial_diastolica: "",
    pulso: "",
    temperatura: "",
    saturacion_o2: "",
    peso: "",
    talla: "",
    examen_fisico: "",
    diagnostico: "",
    medicamentos: "",
    indicaciones: "",
  });

  // Obtener fecha y hora actual
  const now = new Date();
  const fechaActual = now.toLocaleDateString("es-PE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const horaActual = now.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validar campos obligatorios
      if (!formData.motivo_consulta || !formData.diagnostico) {
        setError("Por favor completa los campos obligatorios");
        setLoading(false);
        return;
      }

      // Combinar presión arterial
      const presion_arterial = formData.presion_arterial_sistolica && formData.presion_arterial_diastolica
        ? `${formData.presion_arterial_sistolica}/${formData.presion_arterial_diastolica}`
        : null;

      // Preparar datos para insertar
      const consultaData = {
        id_paciente: pacienteId,
        motivo_consulta: formData.motivo_consulta,
        presion_arterial: presion_arterial,
        pulso: formData.pulso ? parseInt(formData.pulso) : null,
        temperatura: formData.temperatura ? parseFloat(formData.temperatura) : null,
        saturacion_o2: formData.saturacion_o2 ? parseFloat(formData.saturacion_o2) : null,
        peso: formData.peso ? parseFloat(formData.peso) : null,
        talla: formData.talla ? parseFloat(formData.talla) : null,
        examen_fisico: formData.examen_fisico || null,
        diagnostico: formData.diagnostico,
        medicamentos: formData.medicamentos || null,
        indicaciones: formData.indicaciones || null,
        fecha: now.toISOString().split("T")[0], // YYYY-MM-DD
        hora: now.toTimeString().split(" ")[0], // HH:MM:SS
      };

      const { error: insertError } = await supabase
        .from("consultas")
        .insert([consultaData]);

      if (insertError) throw insertError;

      // Redirigir a la página de pacientes o historial
      router.push("/admin/pacientes");
    } catch (err: any) {
      setError(err.message || "Error al guardar la consulta");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Nueva Consulta Médica</h1>
          <p className="text-gray-600">Registra una nueva consulta médica</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar izquierdo */}
          <div className="lg:col-span-1 space-y-4">
            {/* Información del paciente */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Seleccionar Paciente
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                    {pacienteNombre.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-lg">{pacienteNombre}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">DNI:</span> {pacienteDni}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Edad:</span> {pacienteEdad} años
                      </p>
                      {pacienteTelefono && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Teléfono:</span> {pacienteTelefono}
                        </p>
                      )}
                      {pacienteDireccion && (
                        <p className="text-sm text-gray-600 break-words">
                          <span className="font-medium">Dirección:</span> {pacienteDireccion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Antecedentes médicos */}
            {antecedentes && (
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Información del Paciente
                </h2>

                {antecedentes.enfermedades && antecedentes.enfermedades.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Antecedentes Médicos
                    </h3>
                    {antecedentes.enfermedades.map((enfermedad, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-red-600 mb-1">
                        <span className="text-red-500">⚠</span>
                        <span>{enfermedad}</span>
                      </div>
                    ))}
                  </div>
                )}

                {antecedentes.alergias && antecedentes.alergias.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Alergias</h3>
                    {antecedentes.alergias.map((alergia, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-orange-600 mb-1">
                        <span className="text-orange-500">⚠</span>
                        <span>{alergia}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Formulario principal */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-xl shadow p-6">
                {/* Header de consulta */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Consulta Médica</h2>
                    <p className="text-sm text-gray-600">Paciente: {pacienteNombre}</p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>Fecha: {fechaActual}</p>
                    <p>Hora: {horaActual}</p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Motivo de consulta */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo de Consulta <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="motivo_consulta"
                    value={formData.motivo_consulta}
                    onChange={handleInputChange}
                    placeholder="Ej: Dolor de cabeza persistente desde hace 2 días"
                    rows={3}
                    maxLength={500}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">Máximo 500 caracteres</p>
                </div>

                {/* Signos Vitales */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Signos Vitales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Presión Arterial */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Presión Arterial (mmHg) <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          name="presion_arterial_sistolica"
                          value={formData.presion_arterial_sistolica}
                          onChange={handleInputChange}
                          placeholder="Sistólica"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                        />
                        <span className="text-gray-500">/</span>
                        <input
                          type="text"
                          name="presion_arterial_diastolica"
                          value={formData.presion_arterial_diastolica}
                          onChange={handleInputChange}
                          placeholder="Diastólica"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                        />
                      </div>
                    </div>

                    {/* Pulso */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pulso (lpm) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="pulso"
                        value={formData.pulso}
                        onChange={handleInputChange}
                        placeholder="80"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                      />
                    </div>

                    {/* Temperatura */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Temperatura (°C) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="temperatura"
                        value={formData.temperatura}
                        onChange={handleInputChange}
                        placeholder="36.5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                      />
                    </div>

                    {/* Saturación O2 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Saturación O₂ (%) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="saturacion_o2"
                        value={formData.saturacion_o2}
                        onChange={handleInputChange}
                        placeholder="98"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                      />
                    </div>

                    {/* Peso */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Peso (kg) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="peso"
                        value={formData.peso}
                        onChange={handleInputChange}
                        placeholder="70.5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                      />
                    </div>

                    {/* Talla */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Talla (cm) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="talla"
                        value={formData.talla}
                        onChange={handleInputChange}
                        placeholder="170"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Examen Físico */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Examen Físico <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="examen_fisico"
                    value={formData.examen_fisico}
                    onChange={handleInputChange}
                    placeholder="Descripción detallada del examen físico realizado..."
                    rows={4}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">Máximo 500 caracteres</p>
                </div>

                {/* Diagnóstico */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnóstico <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="diagnostico"
                    value={formData.diagnostico}
                    onChange={handleInputChange}
                    placeholder="Diagnóstico principal y diferenciales si aplica"
                    rows={3}
                    maxLength={500}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">Máximo 500 caracteres</p>
                </div>

                {/* Medicamentos Recetados */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medicamentos Recetados <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="medicamentos"
                    value={formData.medicamentos}
                    onChange={handleInputChange}
                    placeholder="Medicamentos con dosis, frecuencia y duración del tratamiento"
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">Máximo 500 caracteres</p>
                </div>

                {/* Indicaciones Adicionales */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Indicaciones Adicionales
                  </label>
                  <textarea
                    name="indicaciones"
                    value={formData.indicaciones}
                    onChange={handleInputChange}
                    placeholder="Recomendaciones, cuidados especiales, dieta, etc."
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">Máximo 500 caracteres</p>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Guardando..." : "Guardar Consulta"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

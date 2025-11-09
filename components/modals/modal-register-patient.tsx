"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { X } from "lucide-react";

type ModalRegisterPatientProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

type PatientData = {
  // Datos Personales
  nombre: string;
  dni: string;
  fecha_nacimiento: string;
  edad: number;
  sexo: "Masculino" | "Femenino" | "";
  raza: string;
  telefono: string;
  estado_civil: "Soltero" | "Casado" | "Divorciado" | "Viudo" | "";
  lugar_nacimiento: string;
  grado_instruccion: "Primaria" | "Secundaria" | "Tecnico" | "Superior" | "";
  domicilio_actual: string;
  lugar_procedencia: string;
  tiempo_procedencia: string;
  tipo_seguro: "SIS" | "EsSalud" | "Privado" | "Ninguno" | "";
};

type ResponsibleData = {
  persona_responsable: string;
  dni_responsable: string;
  celular_responsable: string;
  direccion_responsable: string;
};

type AntecedenteData = {
  ocupacion: string;
  religion: string;
  tabaquismo: "No" | "Ocasional" | "Frecuente" | "";
  alcoholismo: "No" | "Ocasional" | "Frecuente" | "";
  drogas: "No" | "Ocasional" | "Frecuente" | "";
  alimentacion: string;
  actividad_fisica: string;
  inmunizaciones: string;
  diagnostico_previo: string;
  enfermedades_infancia: string;
  cirugias_previas: string;
  alergias: string;
  medicamentos_actuales: string;
  // Campos gineco-obstétricos (solo mujeres)
  menarca: string;
  ritmo_menstrual: string;
  uso_anticonceptivos: string;
  numero_embarazos: string;
};

export default function ModalRegisterPatient({
  isOpen,
  onClose,
  onSuccess,
}: ModalRegisterPatientProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados del formulario
  const [patientData, setPatientData] = useState<PatientData>({
    nombre: "",
    dni: "",
    fecha_nacimiento: "",
    edad: 0,
    sexo: "",
    raza: "",
    telefono: "",
    estado_civil: "",
    lugar_nacimiento: "",
    grado_instruccion: "",
    domicilio_actual: "",
    lugar_procedencia: "",
    tiempo_procedencia: "",
    tipo_seguro: "",
  });

  const [responsibleData, setResponsibleData] = useState<ResponsibleData>({
    persona_responsable: "",
    dni_responsable: "",
    celular_responsable: "",
    direccion_responsable: "",
  });

  const [antecedenteData, setAntecedenteData] = useState<AntecedenteData>({
    ocupacion: "",
    religion: "",
    tabaquismo: "",
    alcoholismo: "",
    drogas: "",
    alimentacion: "",
    actividad_fisica: "",
    inmunizaciones: "",
    diagnostico_previo: "",
    enfermedades_infancia: "",
    cirugias_previas: "",
    alergias: "",
    medicamentos_actuales: "",
    menarca: "",
    ritmo_menstrual: "",
    uso_anticonceptivos: "",
    numero_embarazos: "",
  });

  const handleClose = () => {
    setStep(1);
    setError(null);
    setPatientData({
      nombre: "",
      dni: "",
      fecha_nacimiento: "",
      edad: 0,
      sexo: "",
      raza: "",
      telefono: "",
      estado_civil: "",
      lugar_nacimiento: "",
      grado_instruccion: "",
      domicilio_actual: "",
      lugar_procedencia: "",
      tiempo_procedencia: "",
      tipo_seguro: "",
    });
    setResponsibleData({
      persona_responsable: "",
      dni_responsable: "",
      celular_responsable: "",
      direccion_responsable: "",
    });
    setAntecedenteData({
      ocupacion: "",
      religion: "",
      tabaquismo: "",
      alcoholismo: "",
      drogas: "",
      alimentacion: "",
      actividad_fisica: "",
      inmunizaciones: "",
      diagnostico_previo: "",
      enfermedades_infancia: "",
      cirugias_previas: "",
      alergias: "",
      medicamentos_actuales: "",
      menarca: "",
      ritmo_menstrual: "",
      uso_anticonceptivos: "",
      numero_embarazos: "",
    });
    onClose();
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleDateChange = (date: string) => {
    setPatientData({
      ...patientData,
      fecha_nacimiento: date,
      edad: date ? calculateAge(date) : 0,
    });
  };

  const validateStep1 = () => {
    if (!patientData.nombre || !patientData.dni || !patientData.fecha_nacimiento || !patientData.sexo) {
      setError("Por favor completa todos los campos obligatorios (*)");
      return false;
    }
    if (patientData.dni.length !== 8) {
      setError("El DNI debe tener 8 dígitos");
      return false;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    setStep(step + 1);
  };

  const handlePrevious = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Insertar paciente
      const { data: pacienteInsertado, error: pacienteError } = await supabase
        .from("pacientes")
        .insert([
          {
            nombre: patientData.nombre,
            dni: patientData.dni,
            fecha_nacimiento: patientData.fecha_nacimiento,
            edad: patientData.edad,
            sexo: patientData.sexo,
            raza: patientData.raza || null,
            telefono: patientData.telefono || null,
            estado_civil: patientData.estado_civil || null,
            lugar_nacimiento: patientData.lugar_nacimiento || null,
            grado_instruccion: patientData.grado_instruccion || null,
            domicilio_actual: patientData.domicilio_actual || null,
            lugar_procedencia: patientData.lugar_procedencia || null,
            tiempo_procedencia: patientData.tiempo_procedencia || null,
            tipo_seguro: patientData.tipo_seguro || null,
            persona_responsable: responsibleData.persona_responsable || null,
            dni_responsable: responsibleData.dni_responsable || null,
            celular_responsable: responsibleData.celular_responsable || null,
            direccion_responsable: responsibleData.direccion_responsable || null,
          },
        ])
        .select();

      if (pacienteError) throw pacienteError;

      // 2. Insertar antecedentes
      const idPaciente = pacienteInsertado[0].id_paciente;

      const antecedentesPayload: any = {
        id_paciente: idPaciente,
        ocupacion: antecedenteData.ocupacion || null,
        religion: antecedenteData.religion || null,
        tabaquismo: antecedenteData.tabaquismo || null,
        alcoholismo: antecedenteData.alcoholismo || null,
        drogas: antecedenteData.drogas || null,
        alimentacion: antecedenteData.alimentacion || null,
        actividad_fisica: antecedenteData.actividad_fisica || null,
        inmunizaciones: antecedenteData.inmunizaciones || null,
        diagnostico_previo: antecedenteData.diagnostico_previo || null,
        enfermedades_infancia: antecedenteData.enfermedades_infancia || null,
        cirugias_previas: antecedenteData.cirugias_previas || null,
        alergias: antecedenteData.alergias || null,
        medicamentos_actuales: antecedenteData.medicamentos_actuales || null,
      };

      // Solo incluir campos gineco-obstétricos si es mujer
      if (patientData.sexo === "Femenino") {
        antecedentesPayload.menarca = antecedenteData.menarca || null;
        antecedentesPayload.ritmo_menstrual = antecedenteData.ritmo_menstrual || null;
        antecedentesPayload.uso_anticonceptivos = antecedenteData.uso_anticonceptivos || null;
        antecedentesPayload.numero_embarazos = antecedenteData.numero_embarazos
          ? parseInt(antecedenteData.numero_embarazos)
          : null;
      }

      const { error: antecedenteError } = await supabase
        .from("antecedentes")
        .insert([antecedentesPayload]);

      if (antecedenteError) throw antecedenteError;

      // Éxito
      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || "Error al registrar paciente");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Nuevo Paciente</h2>
            <p className="text-sm text-gray-600">
              Paso {step} de 3:{" "}
              {step === 1
                ? "Datos Personales"
                : step === 2
                ? "Persona Responsable"
                : "Antecedentes"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                1
              </div>
              <span className="text-xs font-medium text-gray-700">
                Datos Personales
              </span>
            </div>

            <div className="flex-1 h-1 bg-gray-200 mx-2">
              <div
                className={`h-full transition-all duration-300 ${
                  step >= 2 ? "bg-blue-600 w-full" : "bg-gray-200 w-0"
                }`}
              />
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= 2
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
              <span className="text-xs font-medium text-gray-700">
                Persona Responsable
              </span>
            </div>

            <div className="flex-1 h-1 bg-gray-200 mx-2">
              <div
                className={`h-full transition-all duration-300 ${
                  step >= 3 ? "bg-blue-600 w-full" : "bg-gray-200 w-0"
                }`}
              />
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= 3
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                3
              </div>
              <span className="text-xs font-medium text-gray-700">
                Antecedentes
              </span>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="px-6 pb-6">
          {/* PASO 1: Datos Personales */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nombres y apellidos completos"
                    value={patientData.nombre}
                    onChange={(e) =>
                      setPatientData({ ...patientData, nombre: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DNI <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Número de DNI"
                    maxLength={8}
                    value={patientData.dni}
                    onChange={(e) =>
                      setPatientData({ ...patientData, dni: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Nacimiento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={patientData.fecha_nacimiento}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Edad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Edad en años"
                    value={patientData.edad || ""}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sexo <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sexo"
                      value="Masculino"
                      checked={patientData.sexo === "Masculino"}
                      onChange={(e) =>
                        setPatientData({
                          ...patientData,
                          sexo: e.target.value as "Masculino",
                        })
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">Masculino</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sexo"
                      value="Femenino"
                      checked={patientData.sexo === "Femenino"}
                      onChange={(e) =>
                        setPatientData({
                          ...patientData,
                          sexo: e.target.value as "Femenino",
                        })
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">Femenino</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Raza
                  </label>
                  <input
                    type="text"
                    placeholder="Mestizo, indígena, etc."
                    value={patientData.raza}
                    onChange={(e) =>
                      setPatientData({ ...patientData, raza: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    placeholder="Número de teléfono"
                    value={patientData.telefono}
                    onChange={(e) =>
                      setPatientData({ ...patientData, telefono: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado Civil
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["Soltero", "Casado", "Divorciado", "Viudo"].map((estado) => (
                    <label
                      key={estado}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="estado_civil"
                        value={estado}
                        checked={patientData.estado_civil === estado}
                        onChange={(e) =>
                          setPatientData({
                            ...patientData,
                            estado_civil: e.target.value as any,
                          })
                        }
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{estado}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lugar de Nacimiento
                  </label>
                  <input
                    type="text"
                    placeholder="Ciudad, provincia"
                    value={patientData.lugar_nacimiento}
                    onChange={(e) =>
                      setPatientData({
                        ...patientData,
                        lugar_nacimiento: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grado de Instrucción
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Primaria", "Secundaria", "Tecnico", "Superior"].map(
                      (grado) => (
                        <label
                          key={grado}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="grado_instruccion"
                            value={grado}
                            checked={patientData.grado_instruccion === grado}
                            onChange={(e) =>
                              setPatientData({
                                ...patientData,
                                grado_instruccion: e.target.value as any,
                              })
                            }
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm text-gray-700">{grado}</span>
                        </label>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domicilio Actual
                </label>
                <textarea
                  placeholder="Dirección completa actual"
                  value={patientData.domicilio_actual}
                  onChange={(e) =>
                    setPatientData({
                      ...patientData,
                      domicilio_actual: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lugar de Procedencia
                  </label>
                  <input
                    type="text"
                    placeholder="De donde viene"
                    value={patientData.lugar_procedencia}
                    onChange={(e) =>
                      setPatientData({
                        ...patientData,
                        lugar_procedencia: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiempo de Procedencia
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 2 años, 6 meses"
                    value={patientData.tiempo_procedencia}
                    onChange={(e) =>
                      setPatientData({
                        ...patientData,
                        tiempo_procedencia: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Seguro
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["SIS", "EsSalud", "Privado", "Ninguno"].map((seguro) => (
                    <label
                      key={seguro}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="tipo_seguro"
                        value={seguro}
                        checked={patientData.tipo_seguro === seguro}
                        onChange={(e) =>
                          setPatientData({
                            ...patientData,
                            tipo_seguro: e.target.value as any,
                          })
                        }
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{seguro}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: Persona Responsable */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Persona Responsable
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre completo del responsable"
                    value={responsibleData.persona_responsable}
                    onChange={(e) =>
                      setResponsibleData({
                        ...responsibleData,
                        persona_responsable: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DNI del Responsable
                  </label>
                  <input
                    type="text"
                    placeholder="DNI del responsable"
                    maxLength={8}
                    value={responsibleData.dni_responsable}
                    onChange={(e) =>
                      setResponsibleData({
                        ...responsibleData,
                        dni_responsable: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Celular del Responsable
                </label>
                <input
                  type="text"
                  placeholder="Número de celular"
                  value={responsibleData.celular_responsable}
                  onChange={(e) =>
                    setResponsibleData({
                      ...responsibleData,
                      celular_responsable: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección del Responsable
                </label>
                <textarea
                  placeholder="Dirección completa del responsable"
                  value={responsibleData.direccion_responsable}
                  onChange={(e) =>
                    setResponsibleData({
                      ...responsibleData,
                      direccion_responsable: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                />
              </div>
            </div>
          )}

          {/* PASO 3: Antecedentes */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ocupación
                  </label>
                  <input
                    type="text"
                    placeholder="Ocupación laboral"
                    value={antecedenteData.ocupacion}
                    onChange={(e) =>
                      setAntecedenteData({
                        ...antecedenteData,
                        ocupacion: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Religión
                  </label>
                  <input
                    type="text"
                    placeholder="Religión"
                    value={antecedenteData.religion}
                    onChange={(e) =>
                      setAntecedenteData({
                        ...antecedenteData,
                        religion: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tabaquismo
                  </label>
                  <select
                    value={antecedenteData.tabaquismo}
                    onChange={(e) =>
                      setAntecedenteData({
                        ...antecedenteData,
                        tabaquismo: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  >
                    <option value="">Seleccionar</option>
                    <option value="No">No</option>
                    <option value="Ocasional">Ocasional</option>
                    <option value="Frecuente">Frecuente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alcoholismo
                  </label>
                  <select
                    value={antecedenteData.alcoholismo}
                    onChange={(e) =>
                      setAntecedenteData({
                        ...antecedenteData,
                        alcoholismo: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  >
                    <option value="">Seleccionar</option>
                    <option value="No">No</option>
                    <option value="Ocasional">Ocasional</option>
                    <option value="Frecuente">Frecuente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Drogas
                  </label>
                  <select
                    value={antecedenteData.drogas}
                    onChange={(e) =>
                      setAntecedenteData({
                        ...antecedenteData,
                        drogas: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  >
                    <option value="">Seleccionar</option>
                    <option value="No">No</option>
                    <option value="Ocasional">Ocasional</option>
                    <option value="Frecuente">Frecuente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alimentación
                  </label>
                  <input
                    type="text"
                    placeholder="Descripción de alimentación"
                    value={antecedenteData.alimentacion}
                    onChange={(e) =>
                      setAntecedenteData({
                        ...antecedenteData,
                        alimentacion: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Actividad Física
                  </label>
                  <input
                    type="text"
                    placeholder="Descripción de actividad física"
                    value={antecedenteData.actividad_fisica}
                    onChange={(e) =>
                      setAntecedenteData({
                        ...antecedenteData,
                        actividad_fisica: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inmunizaciones
                </label>
                <input
                  type="text"
                  placeholder="Vacunas recibidas"
                  value={antecedenteData.inmunizaciones}
                  onChange={(e) =>
                    setAntecedenteData({
                      ...antecedenteData,
                      inmunizaciones: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Diagnóstico Previo
                  </label>
                  <input
                    type="text"
                    placeholder="Diagnósticos anteriores"
                    value={antecedenteData.diagnostico_previo}
                    onChange={(e) =>
                      setAntecedenteData({
                        ...antecedenteData,
                        diagnostico_previo: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enfermedades de la Infancia
                  </label>
                  <input
                    type="text"
                    placeholder="Enfermedades de la infancia"
                    value={antecedenteData.enfermedades_infancia}
                    onChange={(e) =>
                      setAntecedenteData({
                        ...antecedenteData,
                        enfermedades_infancia: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cirugías Previas
                  </label>
                  <input
                    type="text"
                    placeholder="Cirugías anteriores"
                    value={antecedenteData.cirugias_previas}
                    onChange={(e) =>
                      setAntecedenteData({
                        ...antecedenteData,
                        cirugias_previas: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alergias
                  </label>
                  <input
                    type="text"
                    placeholder="Alergias conocidas"
                    value={antecedenteData.alergias}
                    onChange={(e) =>
                      setAntecedenteData({
                        ...antecedenteData,
                        alergias: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medicamentos Actuales
                  </label>
                  <input
                    type="text"
                    placeholder="Medicamentos que toma actualmente"
                    value={antecedenteData.medicamentos_actuales}
                    onChange={(e) =>
                      setAntecedenteData({
                        ...antecedenteData,
                        medicamentos_actuales: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                </div>
              </div>

              {/* Campos exclusivos para MUJERES */}
              {patientData.sexo === "Femenino" && (
                <>
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Antecedentes Gineco-Obstétricos
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Menarca
                        </label>
                        <input
                          type="text"
                          placeholder="Edad de primera menstruación"
                          value={antecedenteData.menarca}
                          onChange={(e) =>
                            setAntecedenteData({
                              ...antecedenteData,
                              menarca: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ritmo Menstrual
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Regular, irregular"
                          value={antecedenteData.ritmo_menstrual}
                          onChange={(e) =>
                            setAntecedenteData({
                              ...antecedenteData,
                              ritmo_menstrual: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Uso de Anticonceptivos
                        </label>
                        <input
                          type="text"
                          placeholder="Tipo de anticonceptivo"
                          value={antecedenteData.uso_anticonceptivos}
                          onChange={(e) =>
                            setAntecedenteData({
                              ...antecedenteData,
                              uso_anticonceptivos: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Número de Embarazos
                        </label>
                        <input
                          type="number"
                          placeholder="Cantidad de embarazos"
                          min="0"
                          value={antecedenteData.numero_embarazos}
                          onChange={(e) =>
                            setAntecedenteData({
                              ...antecedenteData,
                              numero_embarazos: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex items-center justify-between rounded-b-2xl">
          <button
            onClick={step === 1 ? handleClose : handlePrevious}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            {step === 1 ? "Cancelar" : "Anterior"}
          </button>

          {step < 3 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Registrando..." : "Guardar Paciente"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ModalRegisterPatient from "@/components/modals/modal-register-patient";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  UserRound,
  Phone,
  MapPin,
  Shield,
  User,
  Calendar,
  GraduationCap,
  AlertTriangle,
  Pill,
  Wine,
  Stethoscope,
  FileText,
  Plus,
  MoreVertical,
  Eye,
  EyeOff,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Antecedente = {
  ocupacion: string;
  alergias: string;
  alcoholismo: string;
  enfermedades_infancia: string;
  medicamentos_actuales: string;
};

type Paciente = {
  id_paciente: number;
  nombre: string;
  edad: number;
  sexo: string;
  raza: string;
  telefono: string;
  dni: string;
  estado_civil: string;
  lugar_nacimiento: string;
  fecha_nacimiento: string;
  grado_instruccion: string;
  domicilio_actual: string;
  lugar_procedencia: string;
  tiempo_procedencia: string;
  tipo_seguro: string;
  persona_responsable: string;
  celular_responsable: string;
  dni_responsable: string;
  direccion_responsable: string;
  antecedentes: Antecedente[] | null;
};

export default function PacientesPage() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [totalPacientes, setTotalPacientes] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  
  // Estado para controlar la visibilidad de cada columna
  const [columnVisibility, setColumnVisibility] = useState({
    informacion_personal: true,
    datos_basicos: true,
    contacto: true,
    origen_procedencia: true,
    educacion_seguro: true,
    persona_responsable: true,
    antecedentes_medicos: true,
    acciones: true,
  });

  const fetchPacientes = async () => {
    const { data, error } = await supabase
      .from("pacientes")
      .select(`
        id_paciente,
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
        antecedentes (
          ocupacion,
          alergias,
          alcoholismo,
          enfermedades_infancia,
          medicamentos_actuales
        )
      `)
      .order('id_paciente', { ascending: false })
      .limit(10);

    // Obtener el total de pacientes
    const { count } = await supabase
      .from("pacientes")
      .select("*", { count: "exact", head: true });

    if (!error && data) {
      console.log('Pacientes con antecedentes:', data);
      setPacientes(data);
      setTotalPacientes(count || 0);
    } else if (error) {
      console.error('Error al obtener pacientes:', error);
    }
  };

  useEffect(() => {
    fetchPacientes();
  }, []);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showColumnMenu && !(event.target as Element).closest('.column-menu-container')) {
        setShowColumnMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColumnMenu]);

  // Función para alternar visibilidad de columna
  const toggleColumn = (columnKey: keyof typeof columnVisibility) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  // Columnas actualizadas con todos los datos
  const allColumns: ColumnDef<Paciente>[] = [
    {
      id: 'informacion_personal',
      header: "Información Personal",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <UserRound className="text-blue-600" size={18} />
          </div>
          <div>
            <p className="font-semibold">{row.original.nombre}</p>
            <p className="text-xs text-gray-500">DNI: {row.original.dni}</p>
            <p className="text-xs text-gray-400">
              {row.original.sexo} • {row.original.raza || "No especificada"}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'datos_basicos',
      header: "Datos Básicos",
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium">
            {row.original.edad ? `${row.original.edad} años` : "No especificada"}
          </p>
          <p className="text-xs text-gray-500">
            Estado: {row.original.estado_civil || "No especificado"}
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Calendar size={12} />
            {new Date(row.original.fecha_nacimiento).toLocaleDateString()}
          </p>
        </div>
      ),
    },
    {
      id: 'contacto',
      header: "Contacto",
      cell: ({ row }) => (
        <div>
          <p className="flex items-center gap-2 text-sm">
            <Phone size={14} /> {row.original.telefono || "No especificado"}
          </p>
          <p className="flex items-center gap-2 text-xs text-gray-500">
            <MapPin size={14} />
            {row.original.domicilio_actual || "Sin dirección"}
          </p>
        </div>
      ),
    },
    {
      id: 'origen_procedencia',
      header: "Origen y Procedencia",
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium">
            {row.original.lugar_nacimiento || "No especificado"}
          </p>
          <p className="text-xs text-gray-500">
            Procedencia: {row.original.lugar_procedencia || "No especificada"}
          </p>
          <p className="text-xs text-gray-400">
            Tiempo: {row.original.tiempo_procedencia || "No especificado"}
          </p>
        </div>
      ),
    },
    {
      id: 'educacion_seguro',
      header: "Educación y Seguro",
      cell: ({ row }) => (
        <div>
          <p className="flex items-center gap-2 text-sm">
            <GraduationCap size={14} />
            {row.original.grado_instruccion || "No especificado"}
          </p>
          <p className="flex items-center gap-2 text-xs text-gray-500">
            <Shield size={12} />
            {row.original.tipo_seguro || "Sin seguro"}
          </p>
        </div>
      ),
    },
    {
      id: 'persona_responsable',
      header: "Persona Responsable",
      cell: ({ row }) => (
        <div>
          {row.original.persona_responsable ? (
            <>
              <p className="text-sm font-medium flex items-center gap-2">
                <User size={14} />
                {row.original.persona_responsable}
              </p>
              <p className="text-xs text-gray-500">
                DNI: {row.original.dni_responsable || "No especificado"}
              </p>
              <p className="text-xs text-gray-400">
                <Phone size={12} className="inline mr-1" />
                {row.original.celular_responsable || "Sin teléfono"}
              </p>
              {row.original.direccion_responsable && (
                <p className="text-xs text-gray-400">
                  <MapPin size={12} className="inline mr-1" />
                  {row.original.direccion_responsable}
                </p>
              )}
            </>
          ) : (
            <p className="text-xs text-gray-400">Sin responsable asignado</p>
          )}
        </div>
      ),
    },
    {
      id: 'antecedentes_medicos',
      header: "Antecedentes Médicos",
      cell: ({ row }) => {
        const antecedentesArray = row.original.antecedentes;
        // Supabase devuelve un array, tomar el primer elemento
        const antecedentes = antecedentesArray && antecedentesArray.length > 0 ? antecedentesArray[0] : null;
        
        if (!antecedentes) {
          return <p className="text-xs text-gray-400">Sin antecedentes</p>;
        }
        return (
          <div className="space-y-1">
            {antecedentes.ocupacion && (
              <p className="text-xs text-gray-600">
                <span className="font-semibold">Ocupación:</span> {antecedentes.ocupacion}
              </p>
            )}
            {antecedentes.alergias && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle size={12} />
                <span className="font-semibold">Alergias:</span> {antecedentes.alergias}
              </p>
            )}
            {antecedentes.alcoholismo && antecedentes.alcoholismo !== "No" && (
              <p className="text-xs text-orange-600 flex items-center gap-1">
                <Wine size={12} />
                <span className="font-semibold">Alcoholismo:</span> {antecedentes.alcoholismo}
              </p>
            )}
            {antecedentes.enfermedades_infancia && (
              <p className="text-xs text-gray-600">
                <span className="font-semibold">Enfermedades:</span> {antecedentes.enfermedades_infancia}
              </p>
            )}
            {antecedentes.medicamentos_actuales && (
              <p className="text-xs text-blue-600 flex items-center gap-1">
                <Pill size={12} />
                <span className="font-semibold">Medicamentos:</span> {antecedentes.medicamentos_actuales}
              </p>
            )}
          </div>
        );
      },
    },
    {
      id: 'acciones',
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => router.push(`/admin/consultas/nueva/${row.original.id_paciente}`)}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-xs font-medium"
          >
            <Plus size={14} />
            Nueva Consulta
          </button>
          <button
            onClick={() => router.push(`/admin/historiales/histo/${row.original.id_paciente}`)}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-xs font-medium"
          >
            <FileText size={14} />
            Ver Historial
          </button>
        </div>
      ),
    },
  ];

  // Filtrar columnas visibles
  const columns = allColumns.filter(col => {
    const colId = col.id as keyof typeof columnVisibility;
    return columnVisibility[colId];
  });

  const table = useReactTable({
    data: pacientes,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-700">
            Gestión de Pacientes
          </h1>
          <p className="text-gray-600">
            Administra la información de los pacientes
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
        >
          + Nuevo Paciente
        </button>
      </div>

      {/* Card header alineado con la tabla */}
      <div className="bg-white rounded-xl shadow p-6 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-700 mb-2">
              Lista de Pacientes
            </h1>
            <p className="text-gray-600 font-medium">
              Total:{" "}
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {totalPacientes} registrados
              </span>
            </p>
          </div>

          {/* Botón de configuración de columnas */}
          <div className="relative column-menu-container">
            <button
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Configurar columnas"
            >
              <MoreVertical size={20} className="text-gray-600" />
            </button>

            {/* Menú desplegable */}
            {showColumnMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Mostrar/Ocultar Columnas
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={columnVisibility.informacion_personal}
                        onChange={() => toggleColumn('informacion_personal')}
                        className="w-4 h-4 text-blue-600"
                      />
                      {columnVisibility.informacion_personal ? (
                        <Eye size={16} className="text-blue-600" />
                      ) : (
                        <EyeOff size={16} className="text-gray-400" />
                      )}
                      <span className="text-sm text-gray-700">Información Personal</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={columnVisibility.datos_basicos}
                        onChange={() => toggleColumn('datos_basicos')}
                        className="w-4 h-4 text-blue-600"
                      />
                      {columnVisibility.datos_basicos ? (
                        <Eye size={16} className="text-blue-600" />
                      ) : (
                        <EyeOff size={16} className="text-gray-400" />
                      )}
                      <span className="text-sm text-gray-700">Datos Básicos</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={columnVisibility.contacto}
                        onChange={() => toggleColumn('contacto')}
                        className="w-4 h-4 text-blue-600"
                      />
                      {columnVisibility.contacto ? (
                        <Eye size={16} className="text-blue-600" />
                      ) : (
                        <EyeOff size={16} className="text-gray-400" />
                      )}
                      <span className="text-sm text-gray-700">Contacto</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={columnVisibility.origen_procedencia}
                        onChange={() => toggleColumn('origen_procedencia')}
                        className="w-4 h-4 text-blue-600"
                      />
                      {columnVisibility.origen_procedencia ? (
                        <Eye size={16} className="text-blue-600" />
                      ) : (
                        <EyeOff size={16} className="text-gray-400" />
                      )}
                      <span className="text-sm text-gray-700">Origen y Procedencia</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={columnVisibility.educacion_seguro}
                        onChange={() => toggleColumn('educacion_seguro')}
                        className="w-4 h-4 text-blue-600"
                      />
                      {columnVisibility.educacion_seguro ? (
                        <Eye size={16} className="text-blue-600" />
                      ) : (
                        <EyeOff size={16} className="text-gray-400" />
                      )}
                      <span className="text-sm text-gray-700">Educación y Seguro</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={columnVisibility.persona_responsable}
                        onChange={() => toggleColumn('persona_responsable')}
                        className="w-4 h-4 text-blue-600"
                      />
                      {columnVisibility.persona_responsable ? (
                        <Eye size={16} className="text-blue-600" />
                      ) : (
                        <EyeOff size={16} className="text-gray-400" />
                      )}
                      <span className="text-sm text-gray-700">Persona Responsable</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={columnVisibility.antecedentes_medicos}
                        onChange={() => toggleColumn('antecedentes_medicos')}
                        className="w-4 h-4 text-blue-600"
                      />
                      {columnVisibility.antecedentes_medicos ? (
                        <Eye size={16} className="text-blue-600" />
                      ) : (
                        <EyeOff size={16} className="text-gray-400" />
                      )}
                      <span className="text-sm text-gray-700">Antecedentes Médicos</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={columnVisibility.acciones}
                        onChange={() => toggleColumn('acciones')}
                        className="w-4 h-4 text-blue-600"
                      />
                      {columnVisibility.acciones ? (
                        <Eye size={16} className="text-blue-600" />
                      ) : (
                        <EyeOff size={16} className="text-gray-400" />
                      )}
                      <span className="text-sm text-gray-700">Acciones</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABLA para pantallas medianas y grandes */}
      <div className="hidden lg:block bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-4 text-sm text-gray-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VISTA EN CARDS para pantallas pequeñas y medianas */}
      <div className="grid gap-4 lg:hidden">
        {pacientes.map((p) => {
          // Extraer antecedentes del array
          const antecedentes = p.antecedentes && p.antecedentes.length > 0 ? p.antecedentes[0] : null;
          
          return (
          <div
            key={p.id_paciente}
            className="bg-white p-6 rounded-xl shadow border hover:shadow-md transition"
          >
            {/* Información Personal */}
            {columnVisibility.informacion_personal && (
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <UserRound className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-lg text-gray-700">{p.nombre}</p>
                  <p className="text-sm text-gray-500">DNI: {p.dni}</p>
                  <p className="text-sm text-gray-400">
                    {p.sexo} • {p.raza || "No especificada"}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Datos Básicos */}
              {columnVisibility.datos_basicos && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Datos Básicos</h4>
                  <p className="text-sm text-gray-600">Edad: {p.edad || "No especificada"} años</p>
                  <p className="text-sm text-gray-600">Estado Civil: {p.estado_civil || "No especificado"}</p>
                  <p className="text-sm text-gray-600">Nacimiento: {new Date(p.fecha_nacimiento).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600">Lugar: {p.lugar_nacimiento || "No especificado"}</p>
                </div>
              )}

              {/* Contacto */}
              {columnVisibility.contacto && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Contacto</h4>
                  <p className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone size={14} /> {p.telefono || "No especificado"}
                  </p>
                  <p className="flex items-center gap-2 text-sm mt-1 text-gray-700">
                    <MapPin size={14} /> {p.domicilio_actual || "Sin dirección"}
                  </p>
                </div>
              )}

              {/* Procedencia */}
              {columnVisibility.origen_procedencia && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Procedencia</h4>
                  <p className="text-sm text-gray-700">Lugar: {p.lugar_procedencia || "No especificada"}</p>
                  <p className="text-sm text-gray-700">Tiempo: {p.tiempo_procedencia || "No especificado"}</p>
                </div>
              )}

              {/* Educación y Seguro */}
              {columnVisibility.educacion_seguro && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Educación y Seguro</h4>
                  <p className="flex items-center gap-2 text-sm text-gray-700">
                    <GraduationCap size={14} />
                    {p.grado_instruccion || "No especificado"}
                  </p>
                  <p className="flex items-center gap-2 text-sm mt-1 text-gray-700">
                    <Shield size={14} />
                    {p.tipo_seguro || "Sin seguro"}
                  </p>
                </div>
              )}
            </div>

            {/* Persona Responsable */}
            {columnVisibility.persona_responsable && p.persona_responsable && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold text-gray-700 mb-2">Persona Responsable</h4>
                <p className="text-sm font-medium text-gray-700">{p.persona_responsable}</p>
                <p className="text-sm text-gray-500">DNI: {p.dni_responsable || "No especificado"}</p>
                <p className="text-sm text-gray-500">
                  <Phone size={12} className="inline mr-1" />
                  {p.celular_responsable || "Sin teléfono"}
                </p>
                {p.direccion_responsable && (
                  <p className="text-sm text-gray-500">
                    <MapPin size={12} className="inline mr-1" />
                    {p.direccion_responsable}
                  </p>
                )}
              </div>
            )}

            {/* Antecedentes Médicos */}
            {columnVisibility.antecedentes_medicos && antecedentes && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold text-gray-700 mb-2">Antecedentes Médicos</h4>
                <div className="space-y-1">
                  {antecedentes.ocupacion && (
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Ocupación:</span> {antecedentes.ocupacion}
                    </p>
                  )}
                  {antecedentes.alergias && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle size={14} />
                      <span className="font-semibold">Alergias:</span> {antecedentes.alergias}
                    </p>
                  )}
                  {antecedentes.alcoholismo && antecedentes.alcoholismo !== "No" && (
                    <p className="text-sm text-orange-600 flex items-center gap-1">
                      <Wine size={14} />
                      <span className="font-semibold">Alcoholismo:</span> {antecedentes.alcoholismo}
                    </p>
                  )}
                  {antecedentes.enfermedades_infancia && (
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Enfermedades:</span> {antecedentes.enfermedades_infancia}
                    </p>
                  )}
                  {antecedentes.medicamentos_actuales && (
                    <p className="text-sm text-blue-600 flex items-center gap-1">
                      <Pill size={14} />
                      <span className="font-semibold">Medicamentos:</span> {antecedentes.medicamentos_actuales}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Acciones */}
            {columnVisibility.acciones && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold text-gray-700 mb-3">Acciones</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/admin/consultas/nueva/${p.id_paciente}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm font-medium"
                  >
                    <Plus size={16} />
                    Nueva Consulta
                  </button>
                  <button
                    onClick={() => router.push(`/admin/historiales/histo/${p.id_paciente}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
                  >
                    <FileText size={16} />
                    Ver Historial
                  </button>
                </div>
              </div>
            )}
          </div>
          );
        })}
      </div>

      {/* Modal de registro */}
      <ModalRegisterPatient
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchPacientes(); // Recargar la lista
        }}
      />
    </div>
  );
}

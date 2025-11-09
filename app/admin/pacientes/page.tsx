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
} from "lucide-react";

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
};

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [totalPacientes, setTotalPacientes] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        direccion_responsable
      `)
      .limit(10);

    // Obtener el total de pacientes
    const { count } = await supabase
      .from("pacientes")
      .select("*", { count: "exact", head: true });

    if (!error && data) {
      setPacientes(data);
      setTotalPacientes(count || 0);
    }
  };

  useEffect(() => {
    fetchPacientes();
  }, []);

  // Columnas actualizadas con todos los datos
  const columns: ColumnDef<Paciente>[] = [
    {
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
  ];

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
        {pacientes.map((p) => (
          <div
            key={p.id_paciente}
            className="bg-white p-6 rounded-xl shadow border hover:shadow-md transition"
          >
            {/* Información Personal */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Datos Básicos */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2 ">Datos Básicos</h4>
                <p className="text- text-gray-600">Edad: {p.edad || "No especificada"} años</p>
                <p className="text-sm text-gray-600">Estado Civil: {p.estado_civil || "No especificado"}</p>
                <p className="text-sm text-gray-600">Nacimiento: {new Date(p.fecha_nacimiento).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600">Lugar: {p.lugar_nacimiento || "No especificado"}</p>
              </div>

              {/* Contacto */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Contacto</h4>
                <p className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone size={14} /> {p.telefono || "No especificado"}
                </p>
                <p className="flex items-center gap-2 text-sm mt-1 text-gray-700">
                  <MapPin size={14} /> {p.domicilio_actual || "Sin dirección"}
                </p>
              </div>

              {/* Procedencia */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Procedencia</h4>
                <p className="text-sm text-gray-700">Lugar: {p.lugar_procedencia || "No especificada"}</p>
                <p className="text-sm text-gray-700">Tiempo: {p.tiempo_procedencia || "No especificado"}</p>
              </div>

              {/* Educación y Seguro */}
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
            </div>

            {/* Persona Responsable */}
            {p.persona_responsable && (
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
          </div>
        ))}
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

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  UserRound,
  Calendar,
  Clock,
  FileText,
  Eye,
  EyeOff,
  MoreVertical,
  Stethoscope,
  Activity,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Consulta = {
  id_consulta: number;
  id_paciente: number;
  fecha: string;
  hora: string;
  motivo_consulta: string;
  diagnostico: string;
  estado: string;
  paciente: {
    nombre: string;
    dni: string;
  };
};

type ConsultaAgrupada = {
  id_paciente: number;
  paciente_nombre: string;
  paciente_dni: string;
  paciente_edad: number;
  paciente_telefono: string | null;
  paciente_direccion: string | null;
  ultima_consulta: string;
  ultima_hora: string;
  ultimo_motivo: string;
  ultimo_diagnostico: string;
  total_consultas: number;
  id_ultima_consulta: number;
};

export default function ConsultasPage() {
  const router = useRouter();
  const [consultas, setConsultas] = useState<ConsultaAgrupada[]>([]);
  const [loading, setLoading] = useState(true);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  
  // Estadísticas
  const [statsHoy, setStatsHoy] = useState(0);
  const [statsSemana, setStatsSemana] = useState(0);
  const [statsMes, setStatsMes] = useState(0);

  // Estado para controlar la visibilidad de cada columna
  const [columnVisibility, setColumnVisibility] = useState({
    paciente: true,
    fecha_hora: true,
    motivo: true,
    diagnostico: true,
    estado: true,
    acciones: true,
  });

  const fetchConsultas = async () => {
    try {
      setLoading(true);
      
      // Obtener todas las consultas con información del paciente
      const { data: consultasData, error } = await supabase
        .from("consultas")
        .select(`
          id_consulta,
          id_paciente,
          fecha,
          hora,
          motivo_consulta,
          diagnostico,
          pacientes!inner (
            nombre,
            dni,
            edad,
            telefono,
            domicilio_actual
          )
        `)
        .order("fecha", { ascending: false })
        .order("hora", { ascending: false });

      if (error) throw error;

      // Agrupar consultas por paciente
      const consultasMap = new Map<number, ConsultaAgrupada>();
      
      consultasData?.forEach((consulta: any) => {
        const idPaciente = consulta.id_paciente;
        
        if (!consultasMap.has(idPaciente)) {
          consultasMap.set(idPaciente, {
            id_paciente: idPaciente,
            paciente_nombre: consulta.pacientes.nombre,
            paciente_dni: consulta.pacientes.dni,
            paciente_edad: consulta.pacientes.edad,
            paciente_telefono: consulta.pacientes.telefono,
            paciente_direccion: consulta.pacientes.domicilio_actual,
            ultima_consulta: consulta.fecha,
            ultima_hora: consulta.hora,
            ultimo_motivo: consulta.motivo_consulta,
            ultimo_diagnostico: consulta.diagnostico,
            total_consultas: 1,
            id_ultima_consulta: consulta.id_consulta,
          });
        } else {
          const existing = consultasMap.get(idPaciente)!;
          existing.total_consultas++;
        }
      });

      setConsultas(Array.from(consultasMap.values()));

      // Calcular estadísticas
      const hoy = new Date();
      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(hoy.getDate() - 7);
      const inicioMes = new Date(hoy);
      inicioMes.setDate(hoy.getDate() - 30);

      const hoyStr = hoy.toISOString().split("T")[0];

      const consultasHoy = consultasData?.filter(
        (c: any) => c.fecha === hoyStr
      ).length || 0;

      const consultasSemana = consultasData?.filter((c: any) => {
        const fechaConsulta = new Date(c.fecha);
        return fechaConsulta >= inicioSemana;
      }).length || 0;

      const consultasMes = consultasData?.filter((c: any) => {
        const fechaConsulta = new Date(c.fecha);
        return fechaConsulta >= inicioMes;
      }).length || 0;

      setStatsHoy(consultasHoy);
      setStatsSemana(consultasSemana);
      setStatsMes(consultasMes);
    } catch (err) {
      console.error("Error al cargar consultas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultas();
  }, []);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showColumnMenu && !(event.target as Element).closest(".column-menu-container")) {
        setShowColumnMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showColumnMenu]);

  const toggleColumn = (columnKey: keyof typeof columnVisibility) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const allColumns: ColumnDef<ConsultaAgrupada>[] = [
    {
      id: "paciente",
      header: "Paciente",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <UserRound className="text-green-600" size={18} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-800">{row.original.paciente_nombre}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
              <span>DNI: {row.original.paciente_dni}</span>
              <span>• {row.original.paciente_edad} años</span>
              {row.original.paciente_telefono && (
                <span>• {row.original.paciente_telefono}</span>
              )}
            </div>
            {row.original.paciente_direccion && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                {row.original.paciente_direccion}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "fecha_hora",
      header: "Fecha y Hora",
      cell: ({ row }) => (
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-gray-800">
            <Calendar size={14} />
            {new Date(row.original.ultima_consulta).toLocaleDateString("es-PE", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
          </p>
          <p className="flex items-center gap-2 text-xs text-gray-500">
            <Clock size={12} />
            {row.original.ultima_hora.substring(0, 5)}
          </p>
        </div>
      ),
    },
    {
      id: "motivo",
      header: "Motivo de Consulta",
      cell: ({ row }) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-800 line-clamp-2">
            {row.original.ultimo_motivo}
          </p>
        </div>
      ),
    },
    {
      id: "diagnostico",
      header: "Diagnóstico",
      cell: ({ row }) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-800 line-clamp-2">
            {row.original.ultimo_diagnostico}
          </p>
        </div>
      ),
    },
    {
      id: "estado",
      header: "Estado",
      cell: ({ row }) => (
        <div>
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            <CheckCircle size={12} />
            Completada
          </span>
          <p className="text-xs text-gray-500 mt-1">
            {row.original.total_consultas} consulta{row.original.total_consultas > 1 ? "s" : ""}
          </p>
        </div>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <button
          onClick={() => router.push(`/admin/historiales/${row.original.id_paciente}`)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
        >
          <Eye size={14} />
          Ver Detalle
        </button>
      ),
    },
  ];

  const columns = allColumns.filter((col) => {
    const colId = col.id as keyof typeof columnVisibility;
    return columnVisibility[colId];
  });

  const table = useReactTable({
    data: consultas,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando consultas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-700">Consultas Médicas</h1>
        <p className="text-gray-600">Gestiona las consultas y citas médicas</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Consultas Hoy</p>
            <p className="text-3xl font-bold text-blue-600">{statsHoy}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Activity className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Esta Semana</p>
            <p className="text-3xl font-bold text-green-600">{statsSemana}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <Stethoscope className="text-green-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Este Mes</p>
            <p className="text-3xl font-bold text-purple-600">{statsMes}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
            <FileText className="text-purple-600" size={24} />
          </div>
        </div>
      </div>

      {/* Card con tabla */}
      <div className="bg-white rounded-xl shadow p-6 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-700 mb-2">
              Consultas Recientes
            </h1>
            <p className="text-gray-600 text-sm">Últimas consultas realizadas</p>
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
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Mostrar/Ocultar Columnas
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={columnVisibility.paciente}
                        onChange={() => toggleColumn("paciente")}
                        className="w-4 h-4 text-blue-600"
                      />
                      {columnVisibility.paciente ? (
                        <Eye size={16} className="text-blue-600" />
                      ) : (
                        <EyeOff size={16} className="text-gray-400" />
                      )}
                      <span className="text-sm text-gray-700">Paciente</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={columnVisibility.fecha_hora}
                        onChange={() => toggleColumn("fecha_hora")}
                        className="w-4 h-4 text-blue-600"
                      />
                      {columnVisibility.fecha_hora ? (
                        <Eye size={16} className="text-blue-600" />
                      ) : (
                        <EyeOff size={16} className="text-gray-400" />
                      )}
                      <span className="text-sm text-gray-700">Fecha y Hora</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={columnVisibility.motivo}
                        onChange={() => toggleColumn("motivo")}
                        className="w-4 h-4 text-blue-600"
                      />
                      {columnVisibility.motivo ? (
                        <Eye size={16} className="text-blue-600" />
                      ) : (
                        <EyeOff size={16} className="text-gray-400" />
                      )}
                      <span className="text-sm text-gray-700">Motivo de Consulta</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={columnVisibility.diagnostico}
                        onChange={() => toggleColumn("diagnostico")}
                        className="w-4 h-4 text-blue-600"
                      />
                      {columnVisibility.diagnostico ? (
                        <Eye size={16} className="text-blue-600" />
                      ) : (
                        <EyeOff size={16} className="text-gray-400" />
                      )}
                      <span className="text-sm text-gray-700">Diagnóstico</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={columnVisibility.estado}
                        onChange={() => toggleColumn("estado")}
                        className="w-4 h-4 text-blue-600"
                      />
                      {columnVisibility.estado ? (
                        <Eye size={16} className="text-blue-600" />
                      ) : (
                        <EyeOff size={16} className="text-gray-400" />
                      )}
                      <span className="text-sm text-gray-700">Estado</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={columnVisibility.acciones}
                        onChange={() => toggleColumn("acciones")}
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

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
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
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-4 text-sm text-gray-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No hay consultas registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

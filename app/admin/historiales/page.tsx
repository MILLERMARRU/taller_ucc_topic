//historiales
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, UserRound, Calendar, Activity, FileText, Eye, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import ExportWordButton from "@/components/export-word-button";

type PacienteRow = {
  id_paciente: number;
  nombre: string;
  dni: string;
  edad: number | null;
  estado?: string | null;
};

type ConsultaRaw = {
  id_consulta: number;
  id_paciente: number;
  fecha: string; // YYYY-MM-DD
};

type PacienteListado = PacienteRow & {
  total_consultas: number;
  ultima_consulta: string | null;
  estado_calculado: "Activo" | "Inactivo";
};

export default function HistorialesPage() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<PacienteListado[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  // Stats
  const [statsTotalPacientes, setStatsTotalPacientes] = useState(0);
  const [statsActivos, setStatsActivos] = useState(0);
  const [statsTotalConsultas, setStatsTotalConsultas] = useState(0);

  const aggregate = (
    pacs: PacienteRow[],
    consultas: ConsultaRaw[]
  ): PacienteListado[] => {
    const map = new Map<number, { total: number; last: string | null }>();
    for (const c of consultas) {
      const cur = map.get(c.id_paciente) || { total: 0, last: null };
      cur.total += 1;
      if (!cur.last || new Date(c.fecha) > new Date(cur.last)) cur.last = c.fecha;
      map.set(c.id_paciente, cur);
    }
    const today = new Date();
    return pacs.map((p) => {
      const agg = map.get(p.id_paciente) || { total: 0, last: null };
      const lastDate = agg.last ? new Date(agg.last) : null;
      const daysDiff = lastDate ? Math.floor((+today - +lastDate) / (1000 * 60 * 60 * 24)) : Infinity;
      const estadoCalc = daysDiff <= 90 ? "Activo" : "Inactivo";
      return {
        ...p,
        total_consultas: agg.total,
        ultima_consulta: agg.last,
        estado_calculado: estadoCalc,
      };
    });
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [{ data: pacientesData, error: pErr }, { data: consData, error: cErr } ] = await Promise.all([
        supabase.from("pacientes").select("id_paciente, nombre, dni, edad, estado"),
        supabase.from("consultas").select("id_consulta, id_paciente, fecha"),
      ]);
      if (pErr) throw pErr;
      if (cErr) throw cErr;

      const list = aggregate(pacientesData as any, consData as any);
      setPacientes(list);

      // Stats
      setStatsTotalPacientes(pacientesData?.length || 0);
      setStatsTotalConsultas(consData?.length || 0);
      setStatsActivos(list.filter((p) => p.estado_calculado === "Activo").length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchFiltered = async (term: string) => {
    if (!term.trim()) {
      await fetchAll();
      return;
    }
    setLoading(true);
    try {
      const { data: pacs, error } = await supabase
        .from("pacientes")
        .select("id_paciente, nombre, dni, edad, estado")
        .or(`nombre.ilike.%${term}%,dni.ilike.%${term}%`);
      if (error) throw error;

      const ids = (pacs || []).map((p) => p.id_paciente);
      const { data: cons } = await supabase
        .from("consultas")
        .select("id_consulta, id_paciente, fecha")
        .in("id_paciente", ids.length ? ids : [-1]);

      const list = aggregate((pacs || []) as any, (cons || []) as any);
      setPacientes(list);

      setStatsTotalPacientes(pacs?.length || 0);
      setStatsTotalConsultas(cons?.length || 0);
      setStatsActivos(list.filter((p) => p.estado_calculado === "Activo").length);
    } finally {
      setLoading(false);
    }
  };

  // Búsqueda automática (debounce)
  useEffect(() => {
    const t = setTimeout(() => {
      fetchFiltered(query);
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  const promedioPorPaciente = useMemo(() => {
    return statsTotalPacientes ? Math.round(statsTotalConsultas / statsTotalPacientes) : 0;
  }, [statsTotalConsultas, statsTotalPacientes]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Historiales Clínicos</h1>
        <p className="text-gray-600">Consulta y exporta historiales médicos completos</p>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o DNI..."
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 text-gray-800"
            />
          </div>
          <button onClick={() => fetchFiltered(query)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Buscar
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Paciente</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">DNI</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Consultas</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Última Consulta</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">Cargando...</td>
              </tr>
            ) : pacientes.length ? (
              pacientes.map((p) => (
                <tr key={p.id_paciente} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <UserRound className="text-purple-600" size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{p.nombre}</p>
                        <p className="text-xs text-gray-500">{p.edad ?? "-"} años</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">{p.dni}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">{p.total_consultas}</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {p.ultima_consulta ? new Date(p.ultima_consulta).toLocaleDateString("es-PE", { year: "numeric", month: "2-digit", day: "2-digit" }) : "-"}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${p.estado_calculado === "Activo" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                      {p.estado_calculado}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/admin/historiales/histo/${p.id_paciente}`)}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-xs font-medium"
                      >
                        <Eye size={14} /> Ver Historial
                      </button>
                      <ExportWordButton
                        pacienteId={p.id_paciente}
                        className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-xs font-medium"
                        label="Exportar"
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">Sin resultados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white rounded-xl shadow p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Total Pacientes</p>
            <p className="text-3xl font-bold text-gray-800">{statsTotalPacientes}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <UserRound className="text-blue-600" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Pacientes Activos</p>
            <p className="text-3xl font-bold text-green-600">{statsActivos}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <Activity className="text-green-600" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Total Consultas</p>
            <p className="text-3xl font-bold text-purple-600">{statsTotalConsultas}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
            <FileText className="text-purple-600" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Promedio/Paciente</p>
            <p className="text-3xl font-bold text-orange-600">{promedioPorPaciente}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
            <Calendar className="text-orange-600" size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useParams } from "next/navigation";
import DetailHistorial from "@/components/detail-historial";

export default function HistorialHistoByIdPage() {
  const params = useParams();
  const id = parseInt(params.id as string);

  if (!id || Number.isNaN(id)) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <div className="text-5xl mb-2">⚠️</div>
          <p className="text-gray-700">ID de paciente inválido</p>
        </div>
      </div>
    );
  }

  return <DetailHistorial pacienteId={id} />;
}

"use client"

import { UserRound, Stethoscope, FileText, ClipboardCheck, Activity, FileDown } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="px-6 py-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Sistema de Historial Clínico</h1>
        <p className="text-gray-600">
          Gestiona historiales médicos de manera eficiente y segura con seguimiento completo de consultas
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-16 mt-24">
        <Link href="/admin/pacientes" className="group p-6 bg-white rounded-xl shadow hover:shadow-lg transition h-56 flex flex-col justify-between">
          <div className="flex items-center justify-center h-12 w-12 rounded-full text-blue-600  bg-blue-100 group-hover:bg-blue-200 transition-colors duration-300 mb-2">
            <UserRound size={24} />
          </div>
          <h3 className="font-semibold text-lg mb-1 text-gray-700 ">Gestión de Pacientes</h3>
          <p className="text-gray-600 text-sm">Registra y administra la información<br></br> completa de los pacientes</p>
        </Link>

        <Link href="/admin/consultas" className="group p-6 bg-white rounded-xl shadow hover:shadow-lg transition h-56 flex flex-col justify-between">
          <div className="flex items-center justify-center h-12 w-12 rounded-full  text-green-600  bg-green-100 group-hover:bg-green-200 transition-colors duration-300 mb-2">
            <Stethoscope size={24} />
          </div>
          <h3 className="font-semibold text-lg mb-1 text-gray-700 ">Nueva Consulta</h3>
          <p className="text-gray-600 text-sm">Registra consultas médicas con <br></br>diagnósticos y tratamientos</p>
        </Link>

        <Link href="/admin/historiales" className="group p-6 bg-white rounded-xl shadow hover:shadow-lg transition h-56 flex flex-col justify-between">
          <div className="flex items-center justify-center h-12 w-12 rounded-full  text-purple-600  bg-purple-100 group-hover:bg-purple-200 transition-colors duration-300 mb-2">
            <FileText size={24} />
          </div>
          <h3 className="font-semibold text-lg mb-1 text-gray-700 ">Ver Historiales</h3>
          <p className="text-gray-600 text-sm">Consulta historiales completos y exporta <br></br>reportes</p>
        </Link>
      </div>

      {/* Features */}
      <div className="bg-white p-8 rounded-xl shadow max-w-5xl mx-auto">
        <h2 className="text-xl font-bold mb-6 text-gray-700">Características del Sistema</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <ClipboardCheck size={16} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-600">Registro Completo</h4>
              <p className="text-gray-600 text-sm mt-4">Datos personales, antecedentes médicos y gineco-<br></br>obstétricos</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-600">
              <Activity size={16} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-600">Signos Vitales</h4>
              <p className="text-gray-600 text-sm mt-4">Registro completo de presión, pulso, temperatura y más</p>
            </div>
          </div>

          <div className="flex items-start gap-3 mt-4">
            <div className="h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600">
              <ClipboardCheck size={16} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-600">Seguimiento Histórico</h4>
              <p className="text-gray-600 text-sm mt-4">Ve consultas anteriores para mejor diagnóstico</p>
            </div>
          </div>

          <div className="flex items-start gap-3 mt-4">
            <div className="h-6 w-6 flex items-center justify-center rounded-full bg-orange-100 text-orange-600">
              <FileDown size={16} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-600">Exportación PDF/Word</h4>
              <p className="text-gray-600 text-sm mt-4">Genera reportes completos en formato profesional</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

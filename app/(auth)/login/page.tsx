"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Hospital, MessageCircle } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setError(error.message);
    } else {
      router.push("/admin");
    }
    setIsLoading(false);
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent("Hola, necesito ayuda con el acceso al sistema médico.");
    window.open(`https://wa.me/51930535560?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Hospital className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Bienvenido de nuevo
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Accede a tu sistema de gestión médica
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </div>

            {/* Small fixed WhatsApp support widget (bottom-right) */}
            <div className="fixed bottom-6 right-6 z-50">
            <div className="bg-white rounded-xl shadow-lg p-2 flex items-center space-x-3 w-auto">
              <button
              onClick={openWhatsApp}
              className="relative group flex items-center gap-2 p-1 rounded-md focus:outline-none"
              aria-label="Contactar por WhatsApp"
              type="button"
              >
              <Image
                src="/img/miller2.jpg"
                alt="Soporte Técnico"
                width={52}
                height={52}
                className="rounded-full border-2 border-gray-200 shadow-sm transform transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 shadow">
                <MessageCircle className="h-3 w-3 text-white" />
              </div>

              {/* Tooltip (appear on hover) */}
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-[11px] rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
                Contactar por WhatsApp
              </div>
              </button>

              {/* Small labels (hidden on very small screens) */}
              <div className="hidden sm:flex flex-col">
              <span className="text-sm font-medium text-gray-800 leading-none">Soporte</span>
              <span className="text-[11px] text-gray-500 leading-none">WhatsApp</span>
              </div>
            </div>
            </div>
        </form>
      </div>
    </div>
  );
}
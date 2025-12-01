"use client";

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Navbar from "@/components/navbar";
import { useAutoLogout } from "@/hooks/useAutoLogout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) { 
  // Estados para verificación de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Tu hook existente
  useAutoLogout();

  // Verificación de autenticación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 Verificando autenticación en layout...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          console.log('❌ Sin sesión válida, redirigiendo a login')
          router.push('/login')
          return
        }
        
        console.log('✅ Usuario autenticado:', session.user.email)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('🚨 Error verificando autenticación:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Cambio en estado de autenticación:', event)
      
      if (event === 'SIGNED_OUT' || !session) {
        console.log('👋 Usuario deslogueado, redirigiendo')
        setIsAuthenticated(false)
        router.push('/login')
      } else {
        console.log('👤 Usuario logueado:', session.user.email)
        setIsAuthenticated(true)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Verificando acceso</h3>
          <p className="text-gray-500">Validando credenciales...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, no mostrar nada (ya redirigió)
  if (!isAuthenticated) {
    return null
  }

  // Tu layout original - SIN CAMBIOS
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-6">{children}</div>
      </main>
    </div>
  );
}
import { NextResponse } from 'next/server'

export async function middleware() {
  // MIDDLEWARE COMPLETAMENTE DESACTIVADO
  return NextResponse.next()
}

// Comentar el config
// export const config = {
//   matcher: ['/admin/:path*']
// }
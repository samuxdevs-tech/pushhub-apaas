import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';

export default async function LandingPage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans overflow-hidden">
      {/* Navbar */}
      <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-10">
        <div className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
          IPTPush
        </div>
        <div>
          <Link href="/docs" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors mr-6">
            Documentación
          </Link>
          {userId ? (
            <Link href="/dashboard" className="text-sm font-bold bg-white text-black px-6 py-2.5 rounded-full hover:bg-gray-200 transition-colors">
              Ir al Dashboard
            </Link>
          ) : (
            <SignInButton mode="modal">
              <button className="text-sm font-bold bg-white text-black px-6 py-2.5 rounded-full hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                Iniciar Sesión
              </button>
            </SignInButton>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 lg:pb-32 px-6 flex flex-col items-center text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-[120px] rounded-full pointer-events-none"></div>
        
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8 z-10 max-w-4xl">
          Notificaciones Push <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
            Sin el dolor de cabeza.
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mb-12 z-10">
          La primera plataforma (aPaaS) que te permite integrar, enviar y programar notificaciones push en tus apps en menos de 3 minutos. Olvídate de Firebase Admin.
        </p>

        <div className="flex gap-4 z-10">
          {userId ? (
            <Link href="/dashboard" className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-indigo-500/25">
              Abrir mi Consola
            </Link>
          ) : (
            <SignUpButton mode="modal">
              <button className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-indigo-500/25">
                Empezar Gratis
              </button>
            </SignUpButton>
          )}
          <Link href="/docs" className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-full font-bold text-lg border border-gray-700 transition-colors flex items-center gap-2">
            Ver Documentación
          </Link>
        </div>
      </div>

      {/* Code Showcase Section */}
      <div className="max-w-4xl mx-auto px-6 z-10 relative mt-10 mb-20">
        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"></div>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-2 text-sm text-gray-500 font-mono">backend.js</span>
          </div>
          <pre className="text-gray-300 font-mono text-sm sm:text-base overflow-x-auto">
            <code>
              <span className="text-purple-400">import</span> IPTPush <span className="text-purple-400">from</span> <span className="text-green-400">'iptpush-sdk'</span>;<br/><br/>
              <span className="text-gray-500">// 1. Inicializa con tu API Key</span><br/>
              IPTPush.<span className="text-blue-400">init</span>(<span className="text-green-400">'pk_live_tu_api_key'</span>);<br/><br/>
              <span className="text-gray-500">// 2. Envía notificaciones masivas o programadas en 1 línea</span><br/>
              <span className="text-purple-400">await</span> IPTPush.<span className="text-blue-400">sendPush</span>({'{'}<br/>
              {'  '}title: <span className="text-green-400">'¡Hola Mundo!'</span>,<br/>
              {'  '}message: <span className="text-green-400">'Esta es una notificación real'</span><br/>
              {'}'});
            </code>
          </pre>
        </div>
      </div>

    </div>
  );
}

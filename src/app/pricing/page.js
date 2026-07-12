import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';

export default async function PricingPage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 font-sans selection:bg-indigo-500/30">
      
      {/* Navbar */}
      <nav className="sticky top-0 w-full p-4 border-b border-gray-800/60 bg-[#0a0a0a]/80 backdrop-blur-md z-50 flex justify-between items-center">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
          IPTPush
        </Link>
        <div className="flex gap-4">
          <Link href="/dashboard" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors py-2">
            Consola
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-400">Precios Transparentes</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Elige el plan ideal para tu app
          </p>
        </div>
        
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 sm:mt-20 lg:max-w-4xl lg:grid-cols-2 lg:gap-x-8">
          
          {/* Plan Hobby */}
          <div className="rounded-3xl p-8 ring-1 ring-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <h3 className="text-lg font-semibold leading-8 text-white">Plan Hobby</h3>
            <p className="mt-4 text-sm leading-6 text-gray-400">Perfecto para proyectos personales y pruebas.</p>
            <p className="mt-6 flex items-baseline gap-x-1">
              <span className="text-4xl font-bold tracking-tight text-white">$0</span>
              <span className="text-sm font-semibold leading-6 text-gray-400">/mes</span>
            </p>
            <ul className="mt-8 space-y-3 text-sm leading-6 text-gray-400">
              <li className="flex gap-x-3"><span className="text-indigo-400">✓</span> Hasta 100 notificaciones mensuales</li>
              <li className="flex gap-x-3"><span className="text-indigo-400">✓</span> 1 Aplicación conectada</li>
              <li className="flex gap-x-3"><span className="text-indigo-400">✓</span> Soporte en comunidad</li>
            </ul>
            <Link
              href={userId ? "/dashboard" : "/"}
              className="mt-8 block rounded-xl bg-gray-800 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
            >
              Comenzar Gratis
            </Link>
          </div>

          {/* Plan Pro */}
          <div className="rounded-3xl p-8 ring-2 ring-indigo-500 bg-gray-900 shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-indigo-500 blur-3xl opacity-50"></div>
            <h3 className="text-lg font-semibold leading-8 text-indigo-400">Plan Pro</h3>
            <p className="mt-4 text-sm leading-6 text-gray-400">Para startups y aplicaciones en producción.</p>
            <p className="mt-6 flex items-baseline gap-x-1">
              <span className="text-4xl font-bold tracking-tight text-white">$15</span>
              <span className="text-sm font-semibold leading-6 text-gray-400">/mes</span>
            </p>
            <ul className="mt-8 space-y-3 text-sm leading-6 text-gray-300">
              <li className="flex gap-x-3"><span className="text-indigo-400">✓</span> Notificaciones <strong>Ilimitadas</strong></li>
              <li className="flex gap-x-3"><span className="text-indigo-400">✓</span> Aplicaciones <strong>Ilimitadas</strong></li>
              <li className="flex gap-x-3"><span className="text-indigo-400">✓</span> Notificaciones Programadas (Cron)</li>
              <li className="flex gap-x-3"><span className="text-indigo-400">✓</span> Encriptación AES-256</li>
              <li className="flex gap-x-3"><span className="text-indigo-400">✓</span> Soporte Prioritario 24/7</li>
            </ul>
            <form action="/api/stripe/checkout" method="POST" className="mt-8">
              <button
                type="submit"
                className="w-full block rounded-xl bg-indigo-600 px-3 py-2.5 text-center text-sm font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5"
              >
                Actualizar a Pro (Modo Prueba)
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

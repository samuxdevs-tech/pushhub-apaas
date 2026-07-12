import dbConnect from '@/lib/mongodb';
import AppModel from '@/models/App';
import CreateAppButton from '@/components/CreateAppButton';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }

  await dbConnect();
  
  const apps = await AppModel.find({ userId }).sort({ createdAt: -1 });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-2">
              PushHub
            </h1>
            <p className="text-gray-400 font-medium">Tu centro de control de notificaciones push</p>
          </div>
          <div className="flex items-center gap-4">
            <CreateAppButton />
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-gray-900/50 rounded-3xl border border-gray-800/60 border-dashed backdrop-blur-sm">
              <div className="w-16 h-16 bg-gray-800 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-bold text-gray-200 mb-2">Aún no hay aplicaciones</h3>
              <p className="text-gray-500">Crea tu primera app para empezar a enviar notificaciones.</p>
            </div>
          ) : (
            apps.map((app) => (
              <Link href={`/apps/${app._id}`} key={app._id.toString()}>
                <div className="bg-gray-900/40 backdrop-blur-md p-6 rounded-3xl border border-gray-800/60 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_32px_-8px_rgba(99,102,241,0.2)] hover:border-indigo-500/30 transition-all duration-300 cursor-pointer group h-full flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center text-indigo-400 font-bold text-2xl group-hover:scale-110 group-hover:from-indigo-500/40 group-hover:to-cyan-500/40 transition-all duration-300 border border-indigo-500/10">
                        {app.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-100 group-hover:text-indigo-300 transition-colors">{app.name}</h3>
                  </div>
                  <div className="mt-6 flex items-center text-xs text-gray-500 font-medium">
                    <svg className="w-4 h-4 mr-1.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    Creada el {new Date(app.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

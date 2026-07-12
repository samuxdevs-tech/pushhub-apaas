import dbConnect from '@/lib/mongodb';
import AppModel from '@/models/App';
import NotificationLogModel from '@/models/NotificationLog';
import DeviceModel from '@/models/Device';
import CopyApiKey from '@/components/CopyApiKey';
import SendNotificationForm from '@/components/SendNotificationForm';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AppDetail({ params }) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  const { id } = await params;

  await dbConnect();

  // Find app AND ensure it belongs to the logged in user
  const app = await AppModel.findById(id);
  if (!app || app.userId !== userId) {
    return <div className="p-8 text-white min-h-screen bg-[#0a0a0a]">Aplicación no encontrada.</div>;
  }

  const deviceCount = await DeviceModel.countDocuments({ appId: app._id });
  const logs = await NotificationLogModel.find({ appId: app._id }).sort({ createdAt: -1 }).limit(20);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 flex items-center transition-colors font-medium mb-6">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Volver al Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center text-indigo-400 font-bold text-xl border border-indigo-500/20">
                  {app.name.charAt(0).toUpperCase()}
                </div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">{app.name}</h1>
              </div>
              <p className="text-gray-500 font-medium ml-16">Registrada el {new Date(app.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="bg-gray-900/60 backdrop-blur-sm px-6 py-4 rounded-2xl border border-gray-800 shadow-lg">
              <span className="text-sm text-gray-400 block mb-1 font-medium">Dispositivos Conectados</span>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">{deviceCount}</span>
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="bg-gray-900/40 backdrop-blur-md p-8 rounded-3xl border border-gray-800/60 shadow-[0_8px_30px_rgba(0,0,0,0.5)] mb-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-cyan-400"></div>
          <h2 className="text-xl font-bold text-gray-100 mb-2">Credenciales de API</h2>
          <p className="text-sm text-gray-400 mb-6">Usa este API Key en los headers de tus peticiones HTTP (<code className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-300">Authorization: Bearer KEY</code>).</p>
          <CopyApiKey apiKey={app.apiKey} />
        </div>

        {/* Console to send test pushes */}
        <SendNotificationForm apiKey={app.apiKey} />

        <div className="bg-gray-900/40 backdrop-blur-md rounded-3xl border border-gray-800/60 shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-800/60 bg-gray-900/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-100">Flujo de Notificaciones</h2>
            <span className="text-xs font-medium bg-gray-800 text-gray-400 px-3 py-1.5 rounded-full">Últimas 20</span>
          </div>
          
          {logs.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center opacity-50">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              </div>
              <p className="text-gray-500 font-medium">Aún no se han enviado notificaciones desde esta app.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-800/60">
              {logs.map((log) => (
                <li key={log._id.toString()} className="p-8 hover:bg-gray-800/30 transition-colors group">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${log.status === 'sent' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      {log.status === 'sent' ? 'ENVIADA' : 'FALLIDA'}
                    </span>
                    <span className="text-xs font-medium text-gray-500">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                  <h4 className="font-bold text-gray-200 text-lg">{log.title}</h4>
                  <p className="text-sm text-gray-400 mt-2 leading-relaxed">{log.body}</p>
                  
                  <div className="mt-5 flex flex-wrap gap-4">
                    <div className="flex items-center text-xs font-medium bg-gray-800/80 rounded-lg px-3 py-1.5 text-gray-300 border border-gray-700/50">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                      <span className="text-gray-500 mr-1">Para:</span> {log.receiverId}
                    </div>
                    {log.senderId && (
                      <div className="flex items-center text-xs font-medium bg-gray-800/80 rounded-lg px-3 py-1.5 text-gray-300 border border-gray-700/50">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        <span className="text-gray-500 mr-1">De:</span> {log.senderId}
                      </div>
                    )}
                  </div>
                  
                  {log.error && (
                    <div className="mt-4 text-xs text-red-400 bg-red-950/40 p-4 rounded-xl border border-red-900/50 flex items-start">
                      <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <span className="font-mono">{log.error}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

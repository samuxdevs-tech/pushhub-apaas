'use client';
import { useState } from 'react';

export default function SendNotificationForm({ apiKey }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', text: '' }
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const body = {
      senderId: 'Dashboard_Admin',
      title,
      message,
    };

    if (receiverId.trim() !== '') body.receiverId = receiverId.trim();
    
    if (scheduledFor) {
      const date = new Date(scheduledFor);
      body.scheduledFor = date.toISOString();
    }

    try {
      const res = await fetch('/api/v1/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ 
          type: 'success', 
          text: data.scheduledId 
            ? 'Notificación programada correctamente.' 
            : 'Notificación enviada con éxito.' 
        });
        setTitle('');
        setMessage('');
        setReceiverId('');
        setScheduledFor('');
        
        // Refresh page after 2 seconds to see logs if not scheduled
        if (!data.scheduledId) {
          setTimeout(() => window.location.reload(), 2000);
        }
      } else {
        setStatus({ type: 'error', text: data.error || 'Ocurrió un error al enviar.' });
      }
    } catch (err) {
      setStatus({ type: 'error', text: 'Error de red o servidor inaccesible.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900/40 backdrop-blur-md rounded-3xl border border-gray-800/60 shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden mb-10 relative">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-pink-500"></div>
      
      <div className="px-8 py-6 border-b border-gray-800/60 bg-gray-900/50">
        <h2 className="text-xl font-bold text-gray-100 flex items-center">
          <svg className="w-5 h-5 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
          Consola de Envíos (Test Sender)
        </h2>
        <p className="text-sm text-gray-400 mt-1">Envía o programa notificaciones directamente desde el Dashboard.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Título de la Notificación *</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. ¡Oferta especial!"
                className="w-full bg-gray-950/50 border border-gray-800 text-gray-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all placeholder-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Mensaje *</label>
              <textarea 
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe el contenido aquí..."
                rows="3"
                className="w-full bg-gray-950/50 border border-gray-800 text-gray-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all placeholder-gray-600 resize-none"
              ></textarea>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Receptor (Opcional)</label>
              <input 
                type="text"
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                placeholder="Dejar vacío para Broadcast a todos"
                className="w-full bg-gray-950/50 border border-gray-800 text-gray-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all placeholder-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Programar para (Opcional)</label>
              <input 
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                className="w-full bg-gray-950/50 border border-gray-800 text-gray-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm color-scheme-dark"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>
        </div>

        {status && (
          <div className={`p-4 rounded-xl border flex items-start ${
            status.type === 'success' 
              ? 'bg-green-950/30 border-green-900/50 text-green-400' 
              : 'bg-red-950/30 border-red-900/50 text-red-400'
          }`}>
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {status.type === 'success' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              )}
            </svg>
            <span className="font-medium">{status.text}</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-purple-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Enviando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                Disparar Notificación
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';
import { useState } from 'react';

export default function FirebaseConfigForm({ appId, hasCredentials }) {
  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch(`/api/v1/apps/${appId}/firebase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceAccountJson: jsonText })
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', text: data.message });
        setJsonText('');
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setStatus({ type: 'error', text: data.error });
      }
    } catch (err) {
      setStatus({ type: 'error', text: 'Error de red al subir las credenciales.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900/40 backdrop-blur-md p-8 rounded-3xl border border-gray-800/60 shadow-[0_8px_30px_rgba(0,0,0,0.5)] mb-10 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-yellow-500 to-orange-500"></div>
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-100 flex items-center mb-2">
            <svg className="w-5 h-5 mr-3 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M11.69 3.25l-8.08 15.6a1 1 0 00.86 1.48h15.06a1 1 0 00.86-1.48l-8.08-15.6a1 1 0 00-1.62 0zm-.69 13.5a1 1 0 112 0 1 1 0 01-2 0zm1-8.5a1 1 0 011 1v4a1 1 0 11-2 0v-4a1 1 0 011-1z"></path></svg>
            Conexión a Firebase (Obligatorio)
          </h2>
          <p className="text-sm text-gray-400">
            Para aislar tus datos, IPTPush necesita tu archivo <code className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-300">service-account.json</code>.
          </p>
        </div>
        {hasCredentials ? (
          <div className="flex items-center text-green-400 bg-green-900/30 px-3 py-1.5 rounded-full text-sm font-medium border border-green-800">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Conectado
          </div>
        ) : (
          <div className="flex items-center text-orange-400 bg-orange-900/30 px-3 py-1.5 rounded-full text-sm font-medium border border-orange-800">
            Desconectado
          </div>
        )}
      </div>

      <div className="bg-yellow-950/20 border border-yellow-900/30 rounded-xl p-4 mb-6 flex items-start">
        <span className="text-xl mr-3">🔒</span>
        <div className="text-sm text-yellow-200/80">
          <strong>Cifrado AES-256 Activo:</strong> Tu llave privada se encripta automáticamente en cuanto haces clic en Guardar. Jamás se guarda en texto plano, garantizando seguridad de grado militar para tus proyectos.
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Pega el contenido completo de tu Service Account JSON:</label>
          <textarea 
            required
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder="{"
            rows="6"
            className="w-full bg-gray-950/80 border border-gray-800 text-green-400 font-mono text-xs rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all resize-y"
          ></textarea>
        </div>

        {status && (
          <div className={`mb-4 p-3 rounded-xl border text-sm flex items-start ${
            status.type === 'success' 
              ? 'bg-green-950/30 border-green-900/50 text-green-400' 
              : 'bg-red-950/30 border-red-900/50 text-red-400'
          }`}>
            <span className="font-medium">{status.text}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !jsonText.trim()}
            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? 'Encriptando y Guardando...' : (hasCredentials ? 'Actualizar Credenciales' : 'Conectar Proyecto')}
          </button>
        </div>
      </form>
    </div>
  );
}

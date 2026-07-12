'use client';
import { useState, useRef } from 'react';

export default function FirebaseConfigForm({ appId, hasCredentials }) {
  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!jsonText.trim()) return;
    
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

  // --- Drag and Drop Handlers ---
  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setJsonText(e.target.result);
    };
    reader.readAsText(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className={`bg-gray-900/40 backdrop-blur-md p-8 rounded-3xl border ${hasCredentials ? 'border-gray-800/60 shadow-[0_8px_30px_rgba(0,0,0,0.5)]' : 'border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.2)]'} mb-10 relative overflow-hidden transition-all duration-500`}>
      <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${hasCredentials ? 'from-yellow-500 to-orange-500' : 'from-red-500 to-orange-500'}`}></div>
      
      {!hasCredentials && (
        <div className="absolute top-4 right-4 sm:top-8 sm:right-8 animate-bounce text-4xl" title="¡Acción Requerida!">
          🚨
        </div>
      )}

      <div className="flex justify-between items-start mb-6 pr-12">
        <div>
          <h2 className={`text-xl font-bold flex items-center mb-2 ${hasCredentials ? 'text-gray-100' : 'text-orange-400'}`}>
            <svg className={`w-5 h-5 mr-3 ${hasCredentials ? 'text-yellow-500' : 'text-orange-500'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M11.69 3.25l-8.08 15.6a1 1 0 00.86 1.48h15.06a1 1 0 00.86-1.48l-8.08-15.6a1 1 0 00-1.62 0zm-.69 13.5a1 1 0 112 0 1 1 0 01-2 0zm1-8.5a1 1 0 011 1v4a1 1 0 11-2 0v-4a1 1 0 011-1z"></path></svg>
            Conexión a Firebase (Obligatorio)
          </h2>
          <p className="text-sm text-gray-400">
            {!hasCredentials ? (
              <span className="text-orange-300/80 font-medium">¡Falta configurar Firebase! Sube tu archivo JSON para poder enviar notificaciones.</span>
            ) : (
              <>Para aislar tus datos, IPTPush necesita tu archivo <code className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-300">service-account.json</code>.</>
            )}
          </p>
        </div>
        {hasCredentials && (
          <div className="flex items-center text-green-400 bg-green-900/30 px-3 py-1.5 rounded-full text-sm font-medium border border-green-800">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Conectado
          </div>
        )}
      </div>

      <div className="bg-yellow-950/20 border border-yellow-900/30 rounded-xl p-4 mb-6 flex items-start">
        <span className="text-xl mr-3">🔒</span>
        <div className="text-sm text-yellow-200/80">
          <strong>Cifrado AES-256 Activo:</strong> Tu llave privada se encripta automáticamente. Jamás se guarda en texto plano, garantizando seguridad de grado militar.
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Arrastra tu archivo JSON aquí, pégalo, o haz clic para subir:</label>
          
          <div 
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`relative rounded-xl overflow-hidden border-2 border-dashed transition-all duration-300 ${isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-700 hover:border-gray-500 bg-gray-950/80'}`}
          >
            <textarea 
              required
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="Arrastra tu service-account.json aquí o pega el contenido..."
              rows="6"
              className="w-full bg-transparent text-green-400 font-mono text-xs px-4 py-3 focus:outline-none resize-y relative z-10"
            ></textarea>
            
            {!jsonText && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-50">
                <svg className="w-10 h-10 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                <span className="text-sm font-medium">Arrastra el archivo JSON aquí</span>
              </div>
            )}
          </div>
          
          <div className="mt-3 flex justify-between items-center">
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileSelect}
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 py-1.5 px-3 rounded-lg transition-colors border border-gray-700"
            >
              📂 Seleccionar archivo
            </button>
          </div>
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

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={loading || !jsonText.trim()}
            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-lg"
          >
            {loading ? 'Encriptando...' : (hasCredentials ? 'Actualizar Credenciales' : 'Conectar Proyecto Ahora')}
          </button>
        </div>
      </form>
    </div>
  );
}

import Link from 'next/link';

export const metadata = {
  title: "Documentación | IPTPush",
  description: "Aprende a integrar IPTPush en tu aplicación en 3 sencillos pasos.",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 font-sans selection:bg-indigo-500/30">
      
      {/* Navbar Minimalista */}
      <nav className="sticky top-0 w-full p-4 border-b border-gray-800/60 bg-[#0a0a0a]/80 backdrop-blur-md z-50 flex justify-between items-center">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
          IPTPush
        </Link>
        <div className="flex gap-4">
          <Link href="/dashboard" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors py-2">
            Consola
          </Link>
          <a href="https://www.npmjs.com/package/iptpush-sdk" target="_blank" rel="noreferrer" className="text-sm font-bold bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded-full hover:bg-indigo-600/40 transition-colors">
            Ver NPM
          </a>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 p-6 md:h-[calc(100vh-70px)] md:sticky md:top-[70px] md:overflow-y-auto border-r border-gray-800/60 hidden md:block">
          <nav className="space-y-8">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Empezando</h3>
              <ul className="space-y-2">
                <li><a href="#intro" className="text-sm text-gray-300 hover:text-indigo-400 transition-colors block">Introducción</a></li>
                <li><a href="#firebase" className="text-sm text-gray-300 hover:text-indigo-400 transition-colors block">1. Conectar Firebase</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">La App Móvil (Frontend)</h3>
              <ul className="space-y-2">
                <li><a href="#frontend-tokens" className="text-sm text-gray-300 hover:text-indigo-400 transition-colors block">2. Registrar Dispositivos</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Tu Servidor (Backend)</h3>
              <ul className="space-y-2">
                <li><a href="#backend-sdk" className="text-sm text-gray-300 hover:text-indigo-400 transition-colors block">3. Instalación SDK</a></li>
                <li><a href="#backend-send" className="text-sm text-gray-300 hover:text-indigo-400 transition-colors block">Enviar Notificación</a></li>
                <li><a href="#backend-schedule" className="text-sm text-gray-300 hover:text-indigo-400 transition-colors block">Programar Notificación</a></li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-12 md:max-w-4xl pb-32">
          
          <section id="intro" className="mb-16">
            <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Documentación Oficial</h1>
            <p className="text-lg text-gray-400 leading-relaxed mb-6">
              Bienvenido a IPTPush, la plataforma de Notificaciones Push como Servicio (aPaaS) diseñada para quitarte el dolor de cabeza de configurar Firebase Admin. 
              En solo 3 pasos, tu aplicación estará lista para enviar notificaciones masivas o programadas.
            </p>
          </section>

          <hr className="border-gray-800/60 mb-16" />

          {/* PASO 1 */}
          <section id="firebase" className="mb-16 scroll-mt-24">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xl border border-indigo-500/30">1</div>
              <h2 className="text-3xl font-bold text-white">Conecta tu Proyecto de Firebase</h2>
            </div>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Por reglas de Google y Apple, tu aplicación móvil debe estar ligada a un proyecto de Firebase en el frontend. IPTPush actuará como tu servidor backend para enviar las notificaciones a ese proyecto.
            </p>
            <ol className="list-decimal list-inside space-y-3 text-gray-400 ml-2 mb-6">
              <li>Crea un proyecto en <a href="https://console.firebase.google.com/" target="_blank" className="text-indigo-400 hover:underline">Firebase Console</a>.</li>
              <li>Ve a Configuración del Proyecto {'>'} Cuentas de Servicio.</li>
              <li>Haz clic en <strong>Generar nueva clave privada</strong>. Se descargará un archivo <code className="bg-gray-800 text-gray-200 px-1.5 py-0.5 rounded text-sm">service-account.json</code>.</li>
              <li>Entra a tu <Link href="/dashboard" className="text-indigo-400 hover:underline">Consola de IPTPush</Link>, entra a tu App, y sube ese archivo.</li>
            </ol>
            <div className="bg-yellow-900/20 border border-yellow-700/50 p-4 rounded-xl text-yellow-200/80 text-sm flex items-start gap-3">
              <span className="text-xl">🔒</span>
              <p>Tu archivo se <strong>encriptará usando AES-256</strong> en nuestra base de datos. Jamás guardamos llaves en texto plano. Ni siquiera nosotros podemos leerlas.</p>
            </div>
          </section>

          <hr className="border-gray-800/60 mb-16" />

          {/* PASO 2 */}
          <section id="frontend-tokens" className="mb-16 scroll-mt-24">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xl border border-cyan-500/30">2</div>
              <h2 className="text-3xl font-bold text-white">Registrar Dispositivos (Frontend)</h2>
            </div>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Tu aplicación móvil (React Native, Flutter, Swift, etc.) debe generar el <strong>FCM Token</strong> usando el SDK cliente de Firebase. 
              Una vez que tu app obtenga ese token, envíalo a nuestra API REST para que IPTPush sepa a qué celular enviar los mensajes.
            </p>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden mb-6">
              <div className="bg-gray-950 px-4 py-2 border-b border-gray-800 flex items-center gap-2">
                <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">POST</span>
                <span className="text-sm font-mono text-gray-300">https://tu-dominio.com/api/v1/devices</span>
              </div>
              <div className="p-4 overflow-x-auto">
<pre className="text-sm font-mono text-gray-300">
<code><span className="text-purple-400">await</span> <span className="text-blue-400">fetch</span>(<span className="text-green-400">'https://tu-dominio.com/api/v1/devices'</span>, {'{'}
  <span className="text-blue-300">method</span>: <span className="text-green-400">'POST'</span>,
  <span className="text-blue-300">headers</span>: {'{'}
    <span className="text-green-400">'Content-Type'</span>: <span className="text-green-400">'application/json'</span>,
    <span className="text-green-400">'Authorization'</span>: <span className="text-green-400">'Bearer pk_live_tu_api_key'</span>
  {'}'},
  <span className="text-blue-300">body</span>: JSON.<span className="text-blue-400">stringify</span>({'{'}
    <span className="text-blue-300">userId</span>: <span className="text-green-400">'user_12345'</span>, <span className="text-gray-500">// Opcional: ID de tu usuario en tu base de datos</span>
    <span className="text-blue-300">pushToken</span>: <span className="text-green-400">'eXb2...TUw'</span>, <span className="text-gray-500">// El token que te dio Firebase en el celular</span>
    <span className="text-blue-300">platform</span>: <span className="text-green-400">'android'</span> <span className="text-gray-500">// 'android', 'ios' o 'web'</span>
  {'}'})
{'}'});</code>
</pre>
              </div>
            </div>
            <p className="text-sm text-gray-500 italic">
              * El <code className="text-gray-400">userId</code> es importante si quieres enviar mensajes específicos a una persona. Si no lo envías, igual podrás enviarle notificaciones masivas (Broadcast).
            </p>
          </section>

          <hr className="border-gray-800/60 mb-16" />

          {/* PASO 3 */}
          <section id="backend-sdk" className="mb-16 scroll-mt-24">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xl border border-purple-500/30">3</div>
              <h2 className="text-3xl font-bold text-white">Enviar Mensajes (Backend)</h2>
            </div>
            
            <p className="text-gray-400 mb-6 leading-relaxed">
              Ya tienes la app configurada. Ahora, desde el backend de tu empresa (Node.js, Next.js, Express), instala el SDK oficial de IPTPush para enviar mensajes en 1 línea de código.
            </p>

            <h3 className="text-xl font-bold text-gray-200 mb-3">1. Instalación</h3>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-8 flex justify-between items-center group">
              <code className="text-sm font-mono text-pink-400">npm install iptpush-sdk</code>
            </div>

            <h3 id="backend-send" className="text-xl font-bold text-gray-200 mb-3 scroll-mt-24">2. Envío a un Usuario Específico</h3>
            <p className="text-gray-400 mb-4">Si registraste al dispositivo con un <code className="text-gray-300">userId</code>, puedes apuntarle directamente sin preocuparte por los tokens.</p>
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden mb-8">
              <div className="p-4 overflow-x-auto">
<pre className="text-sm font-mono text-gray-300">
<code><span className="text-purple-400">const</span> IPTPush = <span className="text-blue-400">require</span>(<span className="text-green-400">'iptpush-sdk'</span>);

<span className="text-gray-500">// Inicializa con tu llave de la consola</span>
IPTPush.<span className="text-blue-400">init</span>(<span className="text-green-400">'pk_live_tu_api_key'</span>);

<span className="text-purple-400">async function</span> <span className="text-blue-400">notificarUsuario</span>() {'{'}
  <span className="text-purple-400">const</span> response = <span className="text-purple-400">await</span> IPTPush.<span className="text-blue-400">sendPush</span>({'{'}
    <span className="text-blue-300">receiverId</span>: <span className="text-green-400">'user_12345'</span>,
    <span className="text-blue-300">title</span>: <span className="text-green-400">'¡Tu pedido está en camino!'</span>,
    <span className="text-blue-300">message</span>: <span className="text-green-400">'Llegaremos en 15 minutos.'</span>,
    <span className="text-blue-300">data</span>: {'{'} orderId: <span className="text-green-400">'893'</span> {'}'} <span className="text-gray-500">// Opcional: data oculta</span>
  {'}'});
  
  <span className="text-blue-400">console</span>.<span className="text-blue-400">log</span>(response);
{'}'}</code>
</pre>
              </div>
            </div>

            <h3 id="backend-schedule" className="text-xl font-bold text-gray-200 mb-3 scroll-mt-24">3. Notificaciones Programadas (Cron Jobs)</h3>
            <p className="text-gray-400 mb-4">
              En lugar de programar tareas en tu servidor, déjale el trabajo a IPTPush. Simplemente envía el parámetro <code className="text-gray-300">scheduledFor</code> (en formato ISO o un objeto Date) y nosotros la entregaremos en el momento exacto.
            </p>
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden mb-8">
              <div className="p-4 overflow-x-auto">
<pre className="text-sm font-mono text-gray-300">
<code><span className="text-gray-500">// Programa un mensaje masivo para mañana a las 8:00 AM</span>
<span className="text-purple-400">const</span> manana = <span className="text-purple-400">new</span> <span className="text-blue-400">Date</span>();
manana.<span className="text-blue-400">setDate</span>(manana.<span className="text-blue-400">getDate</span>() + 1);
manana.<span className="text-blue-400">setHours</span>(8, 0, 0);

<span className="text-purple-400">await</span> IPTPush.<span className="text-blue-400">sendPush</span>({'{'}
  <span className="text-gray-500">// Al omitir receiverId, se envía a TODOS los dispositivos de tu app</span>
  <span className="text-blue-300">title</span>: <span className="text-green-400">'¡Buenos días! Oferta Flash ⚡'</span>,
  <span className="text-blue-300">message</span>: <span className="text-green-400">'Toda la tienda con 50% de descuento.'</span>,
  <span className="text-blue-300">scheduledFor</span>: manana.<span className="text-blue-400">toISOString</span>()
{'}'});</code>
</pre>
              </div>
            </div>

          </section>

        </main>
      </div>
    </div>
  );
}

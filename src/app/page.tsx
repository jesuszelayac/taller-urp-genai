// src/app/page.tsx
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, FormEvent, ReactNode, useRef, useEffect } from 'react';

type Mensaje = { de: 'usuario' | 'bot'; texto: string };

// --- CORRECCIÓN CLAVE: Agregar el tipo de retorno explícito (: ReactNode) ---
const renderizarConLinks = (texto: string): ReactNode => {
  // Regex simple para encontrar URLs que comienzan con http:// o https://
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Dividir el texto por las URLs y mapear cada parte
  const partes = texto.split(urlRegex);

  return partes.map((parte, index) => {
    // Si la parte coincide con una URL, la convertimos en un enlace
    if (parte.match(urlRegex)) {
      return (
        <a 
          key={index} 
          href={parte} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-300 hover:text-blue-200 underline" 
        >
          {parte}
        </a>
      );
    }
    // Si no es una URL, lo devolvemos como texto normal
    return parte;
  });
};
// --- FIN DE LA FUNCIÓN ---

export default function Page() {
  const { data: session } = useSession();
  const [chat, setChat] = useState<Mensaje[]>([]);
  const [msg, setMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  // Si no hay sesión, mostramos botón de login
  if (!session) {
    return (
      <div className="h-full flex items-center justify-center relative z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 border border-slate-200/50">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 21v-7.5a.75.75 0 01 .75-.75h3a.75.75 0 01 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72l1.189-1.19A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75Z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">OnBoard AI</h1>
            <p className="text-slate-600 text-lg">Tu guía interna para empezar a aportar desde el día uno</p>
          </div>
          
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-slate-800 mb-2">Bienvenido</h2>
              <p className="text-slate-600 text-sm">Inicia sesión para acceder a tu asesor especializado</p>
            </div>
            
            <button
              onClick={() => signIn('google')}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 border border-slate-300 rounded-lg shadow-sm transition-all duration-300 flex items-center justify-center gap-3 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar con Google
            </button>
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Acceso exclusivo para personal autorizado
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Función para enviar mensaje
  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!msg) return;
    setLoading(true);

    const userEmail = session.user?.email ?? '';
    const res = await fetch(
      `/api/agent?idagente=${encodeURIComponent(userEmail)}&msg=${encodeURIComponent(msg)}`
    );
    const texto = await res.text();

    // Actualizar historial
    setChat((c) => [
      ...c,
      { de: 'usuario', texto: msg },
      { de: 'bot',     texto }
    ]);

    setMsg('');
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col p-4 relative z-10">
      {/* Header elegante */}
      <header className="mb-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 21v-7.5a.75.75 0 01 .75-.75h3a.75.75 0 01 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72l1.189-1.19A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Onboard AI</h1>
              <p className="text-slate-600 text-sm">¡Hola, {session.user?.name || session.user?.email}!</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>En línea</span>
            </div>
            <button
              onClick={() => signOut()}
              className="text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 px-3 py-2 rounded-lg transition-all duration-300 hover:shadow-md"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 px-2">
        {chat.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-pulse">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">¡Bienvenido a Onboard AI!</h2>
              <p className="text-slate-600 leading-relaxed">
                Tu compañero de onboarding: respuestas rápidas, conocimiento al instante.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Cronograma Pagos</span>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">Plan de Salud</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-sm font-medium">Beneficios</span>
              </div>
            </div>
          </div>
        )}
        
        {chat.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.de === 'usuario' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className={`flex items-start gap-3 max-w-[80%] ${m.de === 'usuario' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 ${
                m.de === 'usuario' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600' 
                  : 'bg-gradient-to-r from-slate-600 to-slate-700'
              }`}>
                {m.de === 'usuario' ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 21v-7.5a.75.75 0 01 .75-.75h3a.75.75 0 01 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72l1.189-1.19A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75Z" />
                  </svg>
                )}
              </div>
              
              {/* Message Bubble */}
              <div className={`p-4 rounded-2xl shadow-lg backdrop-blur-sm border transition-all duration-300 hover:shadow-xl ${
                m.de === 'usuario'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-200/50 rounded-br-md'
                  : 'bg-white/90 text-slate-800 border-slate-200/50 rounded-bl-md'
              }`}>
                <div className={`text-sm leading-relaxed ${m.de === 'usuario' ? 'text-blue-50' : 'text-slate-700'}`}>
                  {m.de === 'bot' && (
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200">
                      <span className="font-semibold text-slate-800">Onboard AI</span>
                      <span className="text-xs text-slate-500">• Especialista GDH</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{renderizarConLinks(m.texto)}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex items-start gap-3 max-w-[80%]">
              <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 21v-7.5a.75.75 0 01 .75-.75h3a.75.75 0 01 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72l1.189-1.19A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75Z" />
                </svg>
              </div>
              <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl rounded-bl-md shadow-lg border border-slate-200/50">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200">
                  <span className="font-semibold text-slate-800">Onboard AI</span>
                  <span className="text-xs text-slate-500">• Analizando...</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm text-slate-600">Procesando consulta...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={enviar} className="mt-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <div className="relative">
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 bg-white/90 backdrop-blur-sm
                          text-slate-900 caret-indigo-600
                          placeholder-slate-400
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          transition-all duration-300"
                placeholder="Pregúntame sobre procesos, personas o proyectos de la empresa..."
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                disabled={loading}
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <div className="flex gap-2">
                <span className="text-xs text-slate-500">Ejemplos:</span>
                <button
                  type="button"
                  onClick={() => setMsg('¿Cuál es el cronograma de pagos?')}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  disabled={loading}
                >
                  Cronograma Pagos
                </button>
                <button
                  type="button"
                  onClick={() => setMsg('¿Cuál es el plan de salud?')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                  disabled={loading}
                >
                  Plan de Salud
                </button>
              </div>
              <span className="text-xs text-slate-400">{msg.length}/500</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !msg.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white p-3 rounded-xl disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:scale-105 transform flex items-center justify-center min-w-[48px]"
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

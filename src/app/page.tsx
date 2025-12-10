// src/app/page.tsx
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, FormEvent, ReactNode } from 'react';

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

  // Si no hay sesión, mostramos botón de login
  if (!session) {
    return (
      <div className="h-full flex items-center justify-center">
         <button
          onClick={() => signIn('google')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2"
        >
          
          Login con Google
        </button>
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
    <div className="h-full flex flex-col p-4">
      <header className="mb-4 flex justify-between items-center text-gray-800">
        <div>
          <span className="font-medium text-gray-800">¡Hola, {session.user?.email}!</span>
        </div>
        <button
          onClick={() => signOut()}
          className="text-sm text-gray-800 hover:underline"
        >
          Cerrar sesión
        </button>
      </header>

      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {chat.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded max-w-[70%] ${
              m.de === 'usuario'
                ? 'ml-auto bg-blue-100 text-gray-900 text-right'
                : 'mr-auto bg-gray-700 text-white'
            }`}
          >
            {renderizarConLinks(m.texto)}
          </div>
        ))}
      </div>

      <form onSubmit={enviar} className="mt-2 flex gap-2">
        <input
          className="flex-1 rounded border px-3 py-2 bg-white text-gray-900"
          placeholder="Escribe tu mensaje…"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          disabled={loading}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? '…' : 'Enviar'}
        </button>
      </form>
    </div>
);
}

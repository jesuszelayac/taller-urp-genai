// src/app/layout.tsx
import './globals.css';
import type { ReactNode } from 'react';
import AuthProvider from './AuthProvider';

export const metadata = {
  title: 'Onboard AI',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="flex h-screen bg-gray-50 antialiased">
        <AuthProvider>
          <aside className="w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white p-6 shadow-xl border-r border-slate-700">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 21v-7.5a.75.75 0 01 .75-.75h3a.75.75 0 01 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72l1.189-1.19A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75Z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold">Onboard AI</h1>
                <p className="text-gray-400 text-sm">Tu acompañante de ingreso</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-blue-300 text-sm font-medium mb-4">Acerca del Proyecto</div>
              <div className="text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  <strong className="text-white">Onboard AI</strong>  es tu compañero digital que te ayuda a navegar la empresa y empezar a aportar valor desde el inicio.
                </p>
              </div>
            </div>
          </aside>

          <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-blue-50 relative">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-slate-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
"use client"

/**
 * Header.jsx - Encabezado Global
 * Muestra nombre de usuario y botón de logout
 */

import { LogOut } from "lucide-react"

export default function Header({ nombreUsuario, onLogout }) {
  return (
    <header className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-6 px-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <span className="text-4xl">🐾</span> InfoVet
          </h1>
          <p className="text-indigo-100 text-sm mt-1">Ficha Médica Veterinaria Digital</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm text-indigo-100">Bienvenido,</p>
            <p className="font-semibold">{nombreUsuario}</p>
          </div>

          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  )
}

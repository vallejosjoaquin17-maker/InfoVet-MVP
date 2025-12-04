"use client"

/**
 * Dashboard.jsx - Vista Principal de Mascotas
 * Muestra grilla de mascotas del usuario y controles
 * Eliminado boton "Buscar por Chip" - ahora solo "Agregar Mascota"
 */

import { useState } from "react"
import { Plus } from "lucide-react"
import TarjetaMascota from "./TarjetaMascota"
import AgregarMascotaModal from "./AgregarMascotaModal"
import Header from "./Header"

export default function Dashboard({ mascotas, onSelectMascota, nombreUsuario, usuarioId, onLogout, onMascotaCreada }) {
  const [mostrarModal, setMostrarModal] = useState(false)

  const handleMascotaCreada = (mascota) => {
    setMostrarModal(false)
    if (onMascotaCreada) {
      onMascotaCreada(mascota)
    }
  }

  const handleVerDetalle = (mascota) => {
    setMostrarModal(false)
    onSelectMascota(mascota)
  }

  return (
    <div className="min-h-screen pb-8">
      <Header nombreUsuario={nombreUsuario} onLogout={onLogout} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Mis Mascotas</h2>
            <p className="text-gray-600">Gestiona el historial medico de tus mascotas</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setMostrarModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Agregar Mascota</span>
            </button>
          </div>
        </div>

        {mascotas && mascotas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mascotas.map((mascota) => (
              <TarjetaMascota key={mascota.id} mascota={mascota} onClick={() => onSelectMascota(mascota)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <p className="text-gray-600 text-lg mb-4">No hay mascotas registradas</p>
            <p className="text-gray-500 mb-6">
              Agrega tu primera mascota para comenzar a gestionar su historial medico
            </p>
            <button
              onClick={() => setMostrarModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium mx-auto"
            >
              <Plus className="w-5 h-5" />
              Agregar Primera Mascota
            </button>
          </div>
        )}
      </main>

      {/* Modal Agregar Mascota */}
      {mostrarModal && (
        <AgregarMascotaModal
          onClose={() => setMostrarModal(false)}
          onMascotaCreada={handleMascotaCreada}
          onVerDetalle={handleVerDetalle}
        />
      )}
    </div>
  )
}

"use client"

/**
 * AgregarMascotaModal.jsx - Modal Principal de Agregar Mascota
 * Contiene dos opciones: Buscar por Chip o Buscar por ID
 * Si no encuentra, permite crear nueva mascota
 */

import { useState } from "react"
import { X, Search, Hash, Plus, PawPrint } from "lucide-react"
import BusquedaChip from "./BusquedaChip"
import BusquedaId from "./BusquedaId"
import FormularioMascota from "./FormularioMascota"

export default function AgregarMascotaModal({ onClose, onMascotaCreada, onVerDetalle }) {
  const [opcionActiva, setOpcionActiva] = useState(null) // 'chip' | 'id' | 'crear'
  const [chipParaCrear, setChipParaCrear] = useState("")

  const handleCrearConChip = (chip) => {
    setChipParaCrear(chip)
    setOpcionActiva("crear")
  }

  const handleMascotaCreada = (mascota) => {
    onMascotaCreada(mascota)
  }

  const handleVolver = () => {
    setOpcionActiva(null)
    setChipParaCrear("")
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PawPrint className="w-6 h-6" />
            <h2 className="text-xl font-bold">
              {opcionActiva === "crear"
                ? "Registrar Nueva Mascota"
                : opcionActiva === "chip"
                  ? "Buscar por Chip"
                  : opcionActiva === "id"
                    ? "Buscar por ID"
                    : "Agregar Mascota"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Selector de opciones */}
          {!opcionActiva && (
            <div className="space-y-6">
              <p className="text-gray-600 text-center">Selecciona una opcion para buscar o registrar una mascota</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Opcion Buscar por Chip */}
                <button
                  onClick={() => setOpcionActiva("chip")}
                  className="group p-6 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                      <Search className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold text-gray-800 text-lg mb-1">Buscar por Chip</h3>
                      <p className="text-gray-500 text-sm">
                        Ingresa el numero de chip para buscar una mascota registrada
                      </p>
                    </div>
                  </div>
                </button>

                {/* Opcion Buscar por ID */}
                <button
                  onClick={() => setOpcionActiva("id")}
                  className="group p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Hash className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold text-gray-800 text-lg mb-1">Buscar por ID</h3>
                      <p className="text-gray-500 text-sm">Ingresa el ID unico del sistema (MAS-XXXX-XXXX)</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Boton crear directamente */}
              <div className="border-t pt-6">
                <button
                  onClick={() => setOpcionActiva("crear")}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Registrar Nueva Mascota Directamente
                </button>
              </div>
            </div>
          )}

          {/* Vista de Busqueda por Chip */}
          {opcionActiva === "chip" && (
            <BusquedaChip onVolver={handleVolver} onCrearConChip={handleCrearConChip} onVerDetalle={onVerDetalle} />
          )}

          {/* Vista de Busqueda por ID */}
          {opcionActiva === "id" && <BusquedaId onVolver={handleVolver} onVerDetalle={onVerDetalle} />}

          {/* Vista de Formulario Crear */}
          {opcionActiva === "crear" && (
            <FormularioMascota
              onVolver={handleVolver}
              onMascotaCreada={handleMascotaCreada}
              chipInicial={chipParaCrear}
            />
          )}
        </div>
      </div>
    </div>
  )
}

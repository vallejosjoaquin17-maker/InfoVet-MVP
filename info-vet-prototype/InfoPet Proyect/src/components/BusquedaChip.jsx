"use client"

/**
 * BusquedaChip.jsx - Componente de busqueda por numero de chip
 * Si encuentra: muestra ficha con opcion Ver Detalle
 * Si no encuentra: permite crear con ese chip
 */

import { useState } from "react"
import { ArrowLeft, Search, Loader2, AlertCircle, CheckCircle, User, MapPin, Phone } from "lucide-react"
import { buscarMascotaPorChip } from "../services/api"

export default function BusquedaChip({ onVolver, onCrearConChip, onVerDetalle }) {
  const [chip, setChip] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resultado, setResultado] = useState(null)
  const [noExiste, setNoExiste] = useState(false)

  const handleBuscar = async (e) => {
    e.preventDefault()

    if (!chip.trim()) {
      setError("Ingresa un numero de chip")
      return
    }

    setLoading(true)
    setError("")
    setResultado(null)
    setNoExiste(false)

    try {
      const res = await buscarMascotaPorChip(chip)

      if (res.success) {
        setResultado(res.data)
      } else if (res.noExiste) {
        setNoExiste(true)
      } else {
        setError(res.error || "Error en la busqueda")
      }
    } catch (err) {
      setError("Error al buscar mascota")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onVolver}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a opciones
      </button>

      <form onSubmit={handleBuscar} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Numero de Chip</label>
          <div className="relative">
            <input
              type="text"
              value={chip}
              onChange={(e) => setChip(e.target.value.toUpperCase())}
              placeholder="Ej: CL-0042456789-10"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
              disabled={loading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Buscando...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Buscar por Chip
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {noExiste && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-800">Chip no encontrado</h3>
              <p className="text-amber-700 text-sm mt-1">
                El chip <strong>{chip}</strong> no esta registrado en el sistema.
              </p>
            </div>
          </div>
          <button
            onClick={() => onCrearConChip(chip)}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Crear Nueva Mascota con este Chip
          </button>
        </div>
      )}

      {resultado && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Mascota encontrada</span>
          </div>

          <div className="flex gap-4">
            <img
              src={resultado.foto || "/placeholder.svg?height=100&width=100&query=pet"}
              alt={resultado.nombre}
              className="w-24 h-24 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-xl">{resultado.nombre}</h3>
              <p className="text-gray-600">
                {resultado.especie} - {resultado.raza}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                ID: <span className="font-mono">{resultado.idInterno}</span>
              </p>
            </div>
          </div>

          {resultado.dueno && (
            <div className="bg-white rounded-lg p-4 border border-green-100">
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Dueno Registrado
              </h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <strong>Nombre:</strong> {resultado.dueno.nombre}
                </p>
                <p className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {resultado.dueno.direccion}
                </p>
                <p className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {resultado.dueno.telefono}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => onVerDetalle(resultado)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Ver Ficha Completa
          </button>
        </div>
      )}
    </div>
  )
}

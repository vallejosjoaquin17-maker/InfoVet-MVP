"use client"

/**
 * DetallesMascota.jsx - Vista Detallada de Ficha Medica
 * Muestra informacion completa y historial clinico
 */

import { ArrowLeft, Heart, Calendar, Syringe, Stethoscope, Scissors, Download, Loader2 } from "lucide-react"
import { useState } from "react"
import DatoVital from "./atomic/DatoVital"
import { descargarFichaPorChip } from "../services/api"

export default function DetallesMascota({ mascota, onVolver, usuarioId }) {
  const [descargando, setDescargando] = useState(false)
  const [errorDescarga, setErrorDescarga] = useState("")

  if (!mascota) return null

  const iconoPorTipo = {
    Vacuna: {
      icon: Syringe,
      color: "text-green-600",
      bg: "bg-green-100",
      border: "border-l-4 border-green-600",
    },
    Consulta: {
      icon: Stethoscope,
      color: "text-blue-600",
      bg: "bg-blue-100",
      border: "border-l-4 border-blue-600",
    },
    Cirugia: {
      icon: Scissors,
      color: "text-red-600",
      bg: "bg-red-100",
      border: "border-l-4 border-red-600",
    },
  }

  const historialOrdenado = mascota.historialMedico
    ? [...mascota.historialMedico].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    : []

  const emoji = mascota.especie === "Perro" ? "dog" : "cat"

  const handleDescargar = async () => {
    setErrorDescarga("")
    setDescargando(true)

    try {
      const resultado = await descargarFichaPorChip(mascota.chip)

      if (!resultado.success) {
        setErrorDescarga(resultado.error || "Error al descargar")
      }
    } catch (err) {
      setErrorDescarga("Error en la descarga")
      console.error("[DetallesMascota] Error:", err)
    } finally {
      setDescargando(false)
    }
  }

  return (
    <div className="min-h-screen pb-8">
      <header className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-6 px-4 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onVolver}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Volver"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <span>{mascota.especie === "Perro" ? "🐕" : "🐱"}</span>
              {mascota.nombre}
            </h1>
          </div>

          <button
            onClick={handleDescargar}
            disabled={descargando}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
          >
            {descargando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            {descargando ? "Descargando..." : "Descargar Ficha"}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {errorDescarga && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{errorDescarga}</div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-1">
              <img
                src={mascota.foto || "/placeholder.svg?height=256&width=256&query=pet"}
                alt={mascota.nombre}
                className="w-full h-64 object-cover rounded-lg shadow-md"
              />
            </div>

            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500" />
                Datos Vitales
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DatoVital label="Especie" valor={mascota.especie} />
                <DatoVital label="Raza" valor={mascota.raza} />
                <DatoVital label="Edad" valor={`${mascota.edad} anios`} />
                <DatoVital label="Peso" valor={`${mascota.peso} kg`} />
                <DatoVital label="Sexo" valor={mascota.sexo} />
                <DatoVital label="Chip" valor={mascota.chip} />
              </div>
              {mascota.idInterno && (
                <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-indigo-600">
                    <strong>ID Sistema:</strong> <span className="font-mono">{mascota.idInterno}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            Historial Clinico
          </h2>

          {historialOrdenado.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay registros medicos</p>
          ) : (
            <div className="space-y-4">
              {historialOrdenado.map((registro) => {
                const config = iconoPorTipo[registro.tipo] || iconoPorTipo["Consulta"]
                const IconComponent = config.icon

                return (
                  <div key={registro.id} className={`p-5 rounded-lg ${config.bg} ${config.border}`}>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <IconComponent className={`w-5 h-5 ${config.color}`} />
                      </div>

                      <div className="flex-grow">
                        <div className="mb-2">
                          <h3 className="font-bold text-gray-800 text-lg">{registro.tipo}</h3>
                          <p className="text-sm text-gray-700">
                            {new Date(registro.fecha).toLocaleDateString("es-CL", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <p className="text-gray-700 mb-3">{registro.descripcion}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <p className="text-gray-700">
                            <span className="font-semibold">Veterinario:</span> {registro.veterinario}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-semibold">Clinica:</span> {registro.clinica}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <button
          onClick={onVolver}
          className="fixed bottom-8 right-8 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 md:hidden"
          aria-label="Volver"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </main>
    </div>
  )
}

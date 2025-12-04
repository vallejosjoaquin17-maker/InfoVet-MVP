/**
 * Componente - TarjetaMascota
 * Tarjeta individual de mascota para el dashboard
 *
 * Props:
 * @param {Object} mascota - Datos de la mascota
 * @param {Function} onClick - Callback al hacer click
 */

"use client"

export default function TarjetaMascota({ mascota, onClick }) {
  if (!mascota) return null

  const emoji = mascota.especie === "Perro" ? "🐕" : "🐱"

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:scale-105"
      role="button"
      tabIndex={0}
      aria-label={`Ver detalles de ${mascota.nombre}`}
    >
      {/* Foto */}
      <div className="h-48 overflow-hidden bg-gray-200">
        <img src={mascota.foto || "/placeholder.svg"} alt={mascota.nombre} className="w-full h-full object-cover" />
      </div>

      {/* Contenido */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{mascota.nombre}</h3>
            <p className="text-sm text-gray-600">{mascota.raza}</p>
          </div>
          <span className="text-2xl">{emoji}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-blue-50 p-2 rounded">
            <p className="text-gray-600">Edad</p>
            <p className="font-semibold text-gray-800">{mascota.edad} años</p>
          </div>
          <div className="bg-green-50 p-2 rounded">
            <p className="text-gray-600">Peso</p>
            <p className="font-semibold text-gray-800">{mascota.peso} kg</p>
          </div>
        </div>

        <button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors">
          Ver Ficha Médica
        </button>
      </div>
    </div>
  )
}

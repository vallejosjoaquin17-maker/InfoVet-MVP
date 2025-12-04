/**
 * Componente Atómico - DatoVital
 * Muestra un dato vital en formato label/valor
 *
 * Props:
 * @param {string} label - Etiqueta del dato
 * @param {string} valor - Valor a mostrar
 * @param {string} icon - Icono opcional
 */

export default function DatoVital({ label, valor, icon: Icon = null }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-600">
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className="w-4 h-4 text-indigo-600" />}
        <p className="text-gray-600 text-sm font-medium">{label}</p>
      </div>
      <p className="text-gray-800 font-bold text-lg mt-1">{valor}</p>
    </div>
  )
}

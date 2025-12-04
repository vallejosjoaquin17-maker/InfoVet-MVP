"use client"

/**
 * FormularioMascota.jsx - Formulario completo para registrar nueva mascota
 * Incluye: datos de mascota, seleccion de dueno existente, validacion de chip
 */

import { useState, useEffect } from "react"
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, User, MapPin, Phone, PawPrint, Save } from "lucide-react"
import { crearMascota, getUsuarios, validarChipUnico } from "../services/api"

export default function FormularioMascota({ onVolver, onMascotaCreada, chipInicial = "" }) {
  const [formData, setFormData] = useState({
    nombre: "",
    especie: "",
    raza: "",
    edad: "",
    peso: "",
    sexo: "",
    chip: chipInicial,
    observaciones: "",
  })

  const [usuarios, setUsuarios] = useState([])
  const [loadingUsuarios, setLoadingUsuarios] = useState(true)
  const [duenoSeleccionado, setDuenoSeleccionado] = useState(null)

  const [validandoChip, setValidandoChip] = useState(false)
  const [chipValido, setChipValido] = useState(null)
  const [chipError, setChipError] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [mascotaCreada, setMascotaCreada] = useState(null)

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const res = await getUsuarios()
        if (res.success) {
          setUsuarios(res.data)
        }
      } catch (err) {
        console.error("Error cargando usuarios:", err)
      } finally {
        setLoadingUsuarios(false)
      }
    }
    cargarUsuarios()
  }, [])

  useEffect(() => {
    const validar = async () => {
      if (!formData.chip || formData.chip.length < 5) {
        setChipValido(null)
        setChipError("")
        return
      }

      setValidandoChip(true)
      try {
        const res = await validarChipUnico(formData.chip)
        if (res.success) {
          setChipValido(!res.existe)
          setChipError(res.existe ? res.mensaje : "")
        }
      } catch (err) {
        setChipError("Error al validar chip")
      } finally {
        setValidandoChip(false)
      }
    }

    const timeout = setTimeout(validar, 500)
    return () => clearTimeout(timeout)
  }, [formData.chip])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSeleccionarDueno = (usuario) => {
    setDuenoSeleccionado(usuario)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!formData.nombre.trim()) {
      setError("El nombre es obligatorio")
      return
    }
    if (!formData.especie) {
      setError("Selecciona una especie")
      return
    }
    if (!formData.raza.trim()) {
      setError("La raza es obligatoria")
      return
    }
    if (!formData.edad || Number(formData.edad) < 0) {
      setError("Ingresa una edad valida")
      return
    }
    if (!formData.peso || Number(formData.peso) <= 0) {
      setError("Ingresa un peso valido")
      return
    }
    if (!formData.chip.trim()) {
      setError("El numero de chip es obligatorio")
      return
    }
    if (chipValido === false) {
      setError("El chip ya esta registrado en el sistema")
      return
    }
    if (!duenoSeleccionado) {
      setError("Debes seleccionar un dueno")
      return
    }

    setLoading(true)

    try {
      const res = await crearMascota({
        ...formData,
        duenioId: duenoSeleccionado.id,
      })

      if (res.success) {
        setSuccess(true)
        setMascotaCreada(res.data)
        setTimeout(() => {
          onMascotaCreada(res.data)
        }, 2000)
      } else {
        setError(res.error || "Error al registrar mascota")
      }
    } catch (err) {
      setError("Error al registrar mascota")
    } finally {
      setLoading(false)
    }
  }

  if (success && mascotaCreada) {
    return (
      <div className="space-y-6 text-center py-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Mascota Registrada</h3>
          <p className="text-gray-600 mt-2">
            <strong>{mascotaCreada.nombre}</strong> ha sido registrado exitosamente
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 inline-block">
          <p className="text-sm text-gray-500">ID Unico del Sistema</p>
          <p className="font-mono text-lg font-bold text-indigo-600">{mascotaCreada.idInterno}</p>
        </div>
        <p className="text-sm text-gray-500">Redirigiendo al dashboard...</p>
      </div>
    )
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
            <PawPrint className="w-5 h-5 text-indigo-600" />
            Datos de la Mascota
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej: Thor"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especie <span className="text-red-500">*</span>
              </label>
              <select
                name="especie"
                value={formData.especie}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
              >
                <option value="">Seleccionar...</option>
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Raza <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="raza"
                value={formData.raza}
                onChange={handleInputChange}
                placeholder="Ej: Golden Retriever"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
              <select
                name="sexo"
                value={formData.sexo}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
              >
                <option value="">Seleccionar...</option>
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Edad (anios) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="edad"
                value={formData.edad}
                onChange={handleInputChange}
                placeholder="Ej: 3"
                min="0"
                max="30"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peso (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="peso"
                value={formData.peso}
                onChange={handleInputChange}
                placeholder="Ej: 25"
                min="0"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numero de Chip <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="chip"
                value={formData.chip}
                onChange={handleInputChange}
                placeholder="Ej: CL-0042456789-10"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent text-gray-800 pr-10 ${
                  chipValido === true
                    ? "border-green-500 focus:ring-green-500"
                    : chipValido === false
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-indigo-500"
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {validandoChip && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
                {!validandoChip && chipValido === true && <CheckCircle className="w-5 h-5 text-green-500" />}
                {!validandoChip && chipValido === false && <AlertCircle className="w-5 h-5 text-red-500" />}
              </div>
            </div>
            {chipError && <p className="text-red-500 text-sm mt-1">{chipError}</p>}
            {chipValido === true && <p className="text-green-600 text-sm mt-1">Chip disponible</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones Medicas</label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
              placeholder="Alergias, condiciones especiales, dieta, etc."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 resize-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
            <User className="w-5 h-5 text-indigo-600" />
            Asociar a Dueno <span className="text-red-500">*</span>
          </h3>

          {loadingUsuarios ? (
            <div className="flex items-center gap-2 text-gray-500 py-4">
              <Loader2 className="w-5 h-5 animate-spin" />
              Cargando usuarios...
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {usuarios.map((usuario) => (
                <button
                  key={usuario.id}
                  type="button"
                  onClick={() => handleSeleccionarDueno(usuario)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    duenoSeleccionado?.id === usuario.id
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <p className="font-medium text-gray-800">{usuario.nombre}</p>
                  <p className="text-sm text-gray-500">{usuario.email}</p>
                </button>
              ))}
            </div>
          )}

          {duenoSeleccionado && (
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <h4 className="font-semibold text-indigo-800 mb-2">Dueno Seleccionado</h4>
              <div className="space-y-1 text-sm text-indigo-700">
                <p>
                  <strong>Nombre:</strong> {duenoSeleccionado.nombre}
                </p>
                <p className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {duenoSeleccionado.direccion}
                </p>
                <p className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {duenoSeleccionado.telefono}
                </p>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || chipValido === false}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Registrando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Registrar Mascota
            </>
          )}
        </button>
      </form>
    </div>
  )
}

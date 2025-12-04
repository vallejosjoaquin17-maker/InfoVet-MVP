"use client"

/**
 * Login.jsx - Formulario de Inicio de Sesión
 * Permite a usuarios existentes autenticarse
 */

import { useState } from "react"
import { Mail, Lock, Loader2 } from "lucide-react"
import { useAuth } from "../context/AuthContext"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [cargando, setCargando] = useState(false)
  const [mostrarRegistro, setMostrarRegistro] = useState(false)
  const { login } = useAuth()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setCargando(true)

    if (!email || !password) {
      setError("Email y contraseña son requeridos")
      setCargando(false)
      return
    }

    const result = await login(email, password)
    if (!result.success) {
      setError(result.error || "Error al iniciar sesión")
    }
    setCargando(false)
  }

  if (mostrarRegistro) {
    return <Register onVolver={() => setMostrarRegistro(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">InfoPet</h1>
        <p className="text-gray-500 text-center mb-8">Fichas médicas para mascotas</p>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="tu@email.com"
              disabled={cargando}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
              disabled={cargando}
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            {cargando ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <button
          onClick={() => setMostrarRegistro(true)}
          className="w-full mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
        >
          ¿No tienes cuenta? Regístrate
        </button>
      </div>
    </div>
  )
}

function Register({ onVolver }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nombre, setNombre] = useState("")
  const [telefono, setTelefono] = useState("")
  const [direccion, setDireccion] = useState("")
  const [error, setError] = useState("")
  const [cargando, setCargando] = useState(false)
  const { register } = useAuth()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError("")
    setCargando(true)

    if (!email || !password || !nombre) {
      setError("Email, contraseña y nombre son requeridos")
      setCargando(false)
      return
    }

    const result = await register(email, password, nombre, telefono, direccion)
    if (!result.success) {
      setError(result.error || "Error al registrarse")
    }
    setCargando(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Registrarse</h1>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre completo"
            disabled={cargando}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            disabled={cargando}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña (mín. 6 caracteres)"
            disabled={cargando}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Teléfono (opcional)"
            disabled={cargando}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Dirección (opcional)"
            disabled={cargando}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            {cargando ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <button
          onClick={onVolver}
          className="w-full mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Volver a iniciar sesión
        </button>
      </div>
    </div>
  )
}

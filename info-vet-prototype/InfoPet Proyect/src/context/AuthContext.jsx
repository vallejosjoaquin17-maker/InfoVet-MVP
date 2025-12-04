"use client"

/**
 * AuthContext.jsx - Contexto de Autenticacion
 * Gestiona estado global del usuario autenticado
 * SOLO llama funciones de services/api.js - NUNCA Firebase directamente
 */

import { createContext, useContext, useEffect, useState } from "react"
import * as api from "../services/api"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [logueado, setLogueado] = useState(false)

  useEffect(() => {
    const desuscribir = api.observarAutenticacion((estado) => {
      setLogueado(estado.logueado)
      setUsuario(estado.usuario)
      setCargando(estado.cargando)
    })

    return () => desuscribir()
  }, [])

  const login = async (email, password) => {
    const resultado = await api.login(email, password)
    if (resultado.success) {
      setUsuario(resultado.usuario)
      setLogueado(true)
    }
    return resultado
  }

  const register = async (email, password, nombre, telefono, direccion) => {
    const resultado = await api.register(email, password, nombre, telefono, direccion)
    if (resultado.success) {
      setUsuario(resultado.usuario)
      setLogueado(true)
    }
    return resultado
  }

  const logout = async () => {
    const resultado = await api.logout()
    if (resultado.success) {
      setUsuario(null)
      setLogueado(false)
    }
    return resultado
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, logueado, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) {
    throw new Error("useAuth debe usarse dentro de AuthProvider")
  }
  return contexto
}

import { useState } from "react"
import { useAuth } from "./context/AuthContext"
import Login from "./components/Login"
import Dashboard from "./components/Dashboard"
import DetallesMascota from "./components/DetallesMascota"

export default function App() {
  const [vista, setVista] = useState("dashboard")
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState(null)
  const { usuario, cargando, logueado } = useAuth()

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="font-medium">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!logueado) {
    return <Login />
  }

  const handleSelectMascota = (mascota) => {
    setMascotaSeleccionada(mascota)
    setVista("detalle")
  }

  const handleVolver = () => {
    setMascotaSeleccionada(null)
    setVista("dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {vista === "dashboard" && (
        <Dashboard
          onSelectMascota={handleSelectMascota}
          nombreUsuario={usuario?.nombre}
          usuarioId={usuario?.id}
        />
      )}
      {vista === "detalle" && (
        <DetallesMascota mascota={mascotaSeleccionada} onVolver={handleVolver} />
      )}
    </div>
  )
}

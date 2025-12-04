/**
 * API Service Layer - UNICO punto de acceso a Firebase
 *
 * PRINCIPIO ARQUITECTONICO:
 * - Ningun componente puede importar Firebase directamente
 * - Todo acceso a datos pasa por este archivo
 * - Facilita migracion futura a AWS sin cambiar frontend
 *
 * Para migrar a AWS:
 * 1. Reemplazar imports de Firebase por AWS SDK
 * 2. Cambiar implementacion interna de funciones
 * 3. Frontend permanece intacto
 */

import { v4 as uuidv4 } from "uuid"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth"
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  serverTimestamp,
  addDoc,
} from "firebase/firestore"
import { ref, uploadBytes, getBytes } from "firebase/storage"
import { auth, db, storage } from "../firebase/firebaseConfig"

// Flag para usar mock data cuando Firebase no esta configurado
const USE_MOCK =
  !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "demo-api-key"

/* ================================================================
   UTILIDADES
   ================================================================ */

export function generarUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function generarIdInternoMascota() {
  const year = new Date().getFullYear()
  const uuid = generarUUID().substring(0, 8)
  return `MAS-${year}-${uuid}`
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/* ================================================================
   AUTENTICACION
   ================================================================ */

export async function login(email, password) {
  try {
    if (USE_MOCK) {
      await delay(500)
      const usuario = usuariosData.find((u) => u.email === email && u.password === password)
      if (!usuario) {
        return { success: false, error: "Correo o contrasena invalidos" }
      }
      const userData = {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        direccion: usuario.direccion,
        rol: usuario.rol,
      }
      return { success: true, data: userData }
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid))

    if (!userDoc.exists()) {
      return { success: false, error: "Usuario no encontrado en base de datos" }
    }

    const userData = {
      id: userCredential.user.uid,
      ...userDoc.data(),
    }

    return { success: true, data: userData }
  } catch (error) {
    console.error("[API] Error en login:", error)
    return { success: false, error: error.message || "Error al iniciar sesion" }
  }
}

export async function register(nombre, email, password, telefono = "", direccion = "") {
  try {
    if (USE_MOCK) {
      await delay(800)
      if (usuariosData.some((u) => u.email === email)) {
        return { success: false, error: "El correo ya esta registrado" }
      }
      const nuevoUsuario = {
        id: `user-${Date.now()}`,
        nombre,
        email,
        telefono,
        direccion,
        rol: "dueno",
        createdAt: new Date().toISOString(),
      }
      usuariosData.push({ ...nuevoUsuario, password })
      return { success: true, data: nuevoUsuario }
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password)

    const userData = {
      nombre,
      email,
      telefono,
      direccion,
      rol: "dueno",
      createdAt: serverTimestamp(),
    }

    await addDoc(collection(db, "users"), {
      ...userData,
      uid: userCredential.user.uid,
    })

    return {
      success: true,
      data: { id: userCredential.user.uid, ...userData },
    }
  } catch (error) {
    console.error("[API] Error en register:", error)
    return { success: false, error: error.message || "Error al registrarse" }
  }
}

export async function logout() {
  try {
    if (!USE_MOCK) {
      await signOut(auth)
    }
    return { success: true }
  } catch (error) {
    console.error("[API] Error en logout:", error)
    return { success: false, error: "Error al cerrar sesion" }
  }
}

export function onAuthChange(callback) {
  if (USE_MOCK) {
    return () => {}
  }
  return onAuthStateChanged(auth, callback)
}

/* ================================================================
   USUARIOS
   ================================================================ */

export async function getUsuarios() {
  try {
    if (USE_MOCK) {
      await delay(300)
      const usuarios = usuariosData.map((u) => ({
        id: u.id,
        nombre: u.nombre,
        email: u.email,
        telefono: u.telefono,
        direccion: u.direccion,
        rol: u.rol,
      }))
      return { success: true, data: usuarios }
    }

    const querySnapshot = await getDocs(collection(db, "users"))
    const usuarios = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return { success: true, data: usuarios }
  } catch (error) {
    console.error("[API] Error al obtener usuarios:", error)
    return { success: false, error: "Error al cargar usuarios", data: [] }
  }
}

export async function getUsuarioById(userId) {
  try {
    const userQuery = query(collection(db, "users"), where("id", "==", userId))
    const userSnapshot = await getDocs(userQuery)

    if (userSnapshot.empty) {
      return {
        success: false,
        error: "Usuario no encontrado",
      }
    }

    const userData = userSnapshot.docs[0].data()

    return {
      success: true,
      data: userData,
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/* ================================================================
   MASCOTAS
   ================================================================ */

export async function getMascotasByUser(userId) {
  try {
    if (!userId) {
      return { success: false, error: "Usuario no autenticado", data: [] }
    }

    if (USE_MOCK) {
      await delay(300)
      const mascotas = mascotasData
        .filter((m) => m.duenioId === userId)
        .map((m) => ({
          ...m,
          historialMedico: historialesData.filter((h) => h.mascotaId === m.id),
        }))
      return { success: true, data: mascotas }
    }

    const q = query(collection(db, "mascotas"), where("duenioId", "==", userId), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)
    const mascotas = await Promise.all(
      querySnapshot.docs.map(async (docSnap) => {
        const mascotaData = { id: docSnap.id, ...docSnap.data() }

        const historialQuery = query(
          collection(db, "historiales"),
          where("mascotaId", "==", docSnap.id),
          orderBy("fecha", "desc"),
        )
        const historialSnapshot = await getDocs(historialQuery)
        mascotaData.historialMedico = historialSnapshot.docs.map((h) => ({
          id: h.id,
          ...h.data(),
        }))

        return mascotaData
      }),
    )

    return { success: true, data: mascotas }
  } catch (error) {
    console.error("[API] Error al obtener mascotas:", error)
    return { success: false, error: "Error al cargar mascotas", data: [] }
  }
}

export async function getMascotaById(mascotaId) {
  try {
    if (USE_MOCK) {
      await delay(200)
      const mascota = mascotasData.find((m) => m.id === mascotaId)
      if (!mascota) {
        return { success: false, error: "Mascota no encontrada" }
      }
      return {
        success: true,
        data: {
          ...mascota,
          historialMedico: historialesData.filter((h) => h.mascotaId === mascota.id),
        },
      }
    }

    const docSnap = await getDoc(doc(db, "mascotas", mascotaId))
    if (!docSnap.exists()) {
      return { success: false, error: "Mascota no encontrada" }
    }

    const mascotaData = { id: docSnap.id, ...docSnap.data() }

    const historialQuery = query(
      collection(db, "historiales"),
      where("mascotaId", "==", mascotaId),
      orderBy("fecha", "desc"),
    )
    const historialSnapshot = await getDocs(historialQuery)
    mascotaData.historialMedico = historialSnapshot.docs.map((h) => ({
      id: h.id,
      ...h.data(),
    }))

    return { success: true, data: mascotaData }
  } catch (error) {
    console.error("[API] Error al obtener mascota:", error)
    return { success: false, error: "Error al cargar mascota" }
  }
}

export async function buscarMascotaPorChip(chip) {
  try {
    if (!chip || chip.trim() === "") {
      return { success: false, error: "Ingresa un codigo de chip valido" }
    }

    const chipLimpio = chip.toUpperCase().trim()

    if (USE_MOCK) {
      await delay(400)
      const mascota = mascotasData.find((m) => m.chip.toUpperCase() === chipLimpio)

      if (!mascota) {
        return {
          success: false,
          error: `Chip ${chip} no encontrado en el sistema`,
          noExiste: true,
        }
      }

      const dueno = usuariosData.find((u) => u.id === mascota.duenioId)

      return {
        success: true,
        data: {
          ...mascota,
          historialMedico: historialesData.filter((h) => h.mascotaId === mascota.id),
          dueno: dueno
            ? {
                id: dueno.id,
                nombre: dueno.nombre,
                email: dueno.email,
                telefono: dueno.telefono,
                direccion: dueno.direccion,
              }
            : null,
        },
      }
    }

    const q = query(collection(db, "mascotas"), where("chip", "==", chipLimpio))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return {
        success: false,
        error: `Chip ${chip} no encontrado en el sistema`,
        noExiste: true,
      }
    }

    const mascotaDoc = querySnapshot.docs[0]
    const mascotaData = { id: mascotaDoc.id, ...mascotaDoc.data() }

    const duenoDoc = await getDoc(doc(db, "users", mascotaData.duenioId))
    if (duenoDoc.exists()) {
      mascotaData.dueno = { id: duenoDoc.id, ...duenoDoc.data() }
    }

    const historialQuery = query(
      collection(db, "historiales"),
      where("mascotaId", "==", mascotaDoc.id),
      orderBy("fecha", "desc"),
    )
    const historialSnapshot = await getDocs(historialQuery)
    mascotaData.historialMedico = historialSnapshot.docs.map((h) => ({
      id: h.id,
      ...h.data(),
    }))

    return { success: true, data: mascotaData }
  } catch (error) {
    console.error("[API] Error en busqueda por chip:", error)
    return { success: false, error: "Error al buscar por chip" }
  }
}

export async function buscarMascotaPorId(idInterno) {
  try {
    if (!idInterno || idInterno.trim() === "") {
      return { success: false, error: "Ingresa un ID valido" }
    }

    const idLimpio = idInterno.toUpperCase().trim()

    if (USE_MOCK) {
      await delay(400)
      const mascota = mascotasData.find((m) => m.idInterno.toUpperCase() === idLimpio)

      if (!mascota) {
        return {
          success: false,
          error: `ID ${idInterno} no encontrado en el sistema`,
          noExiste: true,
        }
      }

      const dueno = usuariosData.find((u) => u.id === mascota.duenioId)

      return {
        success: true,
        data: {
          ...mascota,
          historialMedico: historialesData.filter((h) => h.mascotaId === mascota.id),
          dueno: dueno
            ? {
                id: dueno.id,
                nombre: dueno.nombre,
                email: dueno.email,
                telefono: dueno.telefono,
                direccion: dueno.direccion,
              }
            : null,
        },
      }
    }

    const q = query(collection(db, "mascotas"), where("idInterno", "==", idLimpio))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return {
        success: false,
        error: `ID ${idInterno} no encontrado en el sistema`,
        noExiste: true,
      }
    }

    const mascotaDoc = querySnapshot.docs[0]
    const mascotaData = { id: mascotaDoc.id, ...mascotaDoc.data() }

    const duenoDoc = await getDoc(doc(db, "users", mascotaData.duenioId))
    if (duenoDoc.exists()) {
      mascotaData.dueno = { id: duenoDoc.id, ...duenoDoc.data() }
    }

    return { success: true, data: mascotaData }
  } catch (error) {
    console.error("[API] Error en busqueda por ID:", error)
    return { success: false, error: "Error al buscar por ID" }
  }
}

export async function validarChipUnico(chip) {
  try {
    if (!chip || chip.trim() === "") {
      return { success: false, error: "Chip invalido" }
    }

    const chipLimpio = chip.toUpperCase().trim()

    if (USE_MOCK) {
      await delay(200)
      const existe = mascotasData.some((m) => m.chip.toUpperCase() === chipLimpio)
      return {
        success: true,
        existe,
        mensaje: existe ? "Este chip ya esta registrado en el sistema" : "Chip disponible",
      }
    }

    const q = query(collection(db, "mascotas"), where("chip", "==", chipLimpio))
    const querySnapshot = await getDocs(q)
    const existe = !querySnapshot.empty

    return {
      success: true,
      existe,
      mensaje: existe ? "Este chip ya esta registrado en el sistema" : "Chip disponible",
    }
  } catch (error) {
    console.error("[API] Error al validar chip:", error)
    return { success: false, error: "Error al validar chip" }
  }
}

export async function crearMascota(dataMascota) {
  try {
    const camposRequeridos = ["nombre", "especie", "raza", "edad", "peso", "chip", "duenioId"]
    for (const campo of camposRequeridos) {
      if (!dataMascota[campo]) {
        return { success: false, error: `El campo ${campo} es obligatorio` }
      }
    }

    const validacionChip = await validarChipUnico(dataMascota.chip)
    if (validacionChip.existe) {
      return { success: false, error: "Este chip ya esta registrado en el sistema" }
    }

    const idInterno = generarIdInternoMascota()

    if (USE_MOCK) {
      await delay(600)

      const nuevaMascota = {
        id: `mascota-${Date.now()}`,
        idInterno,
        duenioId: dataMascota.duenioId,
        nombre: dataMascota.nombre.trim(),
        especie: dataMascota.especie,
        raza: dataMascota.raza.trim(),
        edad: Number(dataMascota.edad),
        peso: Number(dataMascota.peso),
        sexo: dataMascota.sexo || "No especificado",
        chip: dataMascota.chip.toUpperCase().trim(),
        observaciones: dataMascota.observaciones || "",
        foto: dataMascota.foto || "/a-cute-pet.png",
        createdAt: new Date().toISOString(),
        historialMedico: [],
      }

      mascotasData.push(nuevaMascota)

      return {
        success: true,
        data: nuevaMascota,
        mensaje: `Mascota ${nuevaMascota.nombre} registrada con ID: ${idInterno}`,
      }
    }

    const nuevaMascotaData = {
      idInterno,
      duenioId: dataMascota.duenioId,
      nombre: dataMascota.nombre.trim(),
      especie: dataMascota.especie,
      raza: dataMascota.raza.trim(),
      edad: Number(dataMascota.edad),
      peso: Number(dataMascota.peso),
      sexo: dataMascota.sexo || "No especificado",
      chip: dataMascota.chip.toUpperCase().trim(),
      observaciones: dataMascota.observaciones || "",
      foto: dataMascota.foto || "/a-cute-pet.png",
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, "mascotas"), nuevaMascotaData)

    return {
      success: true,
      data: { id: docRef.id, ...nuevaMascotaData, historialMedico: [] },
      mensaje: `Mascota ${nuevaMascotaData.nombre} registrada con ID: ${idInterno}`,
    }
  } catch (error) {
    console.error("[API] Error al crear mascota:", error)
    return { success: false, error: "Error al registrar mascota" }
  }
}

/* ================================================================
   HISTORIAL MEDICO
   ================================================================ */

export async function agregarHistorial(mascotaId, registro) {
  try {
    if (!registro.fecha || !registro.tipo || !registro.descripcion) {
      return { success: false, error: "Datos incompletos" }
    }

    if (USE_MOCK) {
      await delay(400)
      const nuevoRegistro = {
        id: `hist-${Date.now()}`,
        mascotaId,
        ...registro,
        createdAt: new Date().toISOString(),
      }
      historialesData.push(nuevoRegistro)
      return { success: true, data: nuevoRegistro }
    }

    const nuevoRegistro = {
      mascotaId,
      ...registro,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, "historiales"), nuevoRegistro)

    return { success: true, data: { id: docRef.id, ...nuevoRegistro } }
  } catch (error) {
    console.error("[API] Error al agregar historial:", error)
    return { success: false, error: "Error al agregar registro medico" }
  }
}

/* ================================================================
   DESCARGA DE FICHAS
   ================================================================ */

export async function descargarFichaPorId(idInterno) {
  try {
    const resultado = await buscarMascotaPorId(idInterno)

    if (!resultado.success) {
      return resultado
    }

    const mascota = resultado.data
    const contenido = generarContenidoFicha(mascota)

    descargarArchivo(contenido, `ficha-medica-${mascota.nombre}-${mascota.idInterno}.txt`)

    return { success: true, mensaje: "Ficha descargada correctamente" }
  } catch (error) {
    console.error("[API] Error al descargar ficha:", error)
    return { success: false, error: "Error al descargar ficha medica" }
  }
}

export async function descargarFichaPorChip(chip) {
  try {
    const resultado = await buscarMascotaPorChip(chip)

    if (!resultado.success) {
      return resultado
    }

    const mascota = resultado.data
    const contenido = generarContenidoFicha(mascota)

    descargarArchivo(contenido, `ficha-medica-${mascota.nombre}-${mascota.chip}.txt`)

    return { success: true, mensaje: "Ficha descargada correctamente" }
  } catch (error) {
    console.error("[API] Error al descargar ficha:", error)
    return { success: false, error: "Error al descargar ficha medica" }
  }
}

function generarContenidoFicha(mascota) {
  const fecha = new Date().toLocaleDateString("es-CL")

  let contenido = `
════════════════════════════════════════════════════════════════
                    FICHA MEDICA VETERINARIA
                          InfoVet
════════════════════════════════════════════════════════════════

DATOS DEL ANIMAL
────────────────────────────────────────────────────────────────
ID Sistema:          ${mascota.idInterno || "N/A"}
Nombre:              ${mascota.nombre}
Especie:             ${mascota.especie}
Raza:                ${mascota.raza}
Edad:                ${mascota.edad} anios
Peso:                ${mascota.peso} kg
Sexo:                ${mascota.sexo}
Codigo de Chip:      ${mascota.chip}
Observaciones:       ${mascota.observaciones || "Sin observaciones"}

`

  if (mascota.dueno) {
    contenido += `DATOS DEL DUENIO
────────────────────────────────────────────────────────────────
Nombre:              ${mascota.dueno.nombre}
Telefono:            ${mascota.dueno.telefono || "N/A"}
Direccion:           ${mascota.dueno.direccion || "N/A"}
Email:               ${mascota.dueno.email}

`
  }

  contenido += `HISTORIAL CLINICO
────────────────────────────────────────────────────────────────
`

  if (mascota.historialMedico && mascota.historialMedico.length > 0) {
    mascota.historialMedico
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .forEach((registro) => {
        contenido += `
Fecha:               ${new Date(registro.fecha).toLocaleDateString("es-CL")}
Tipo de Atencion:    ${registro.tipo}
Descripcion:         ${registro.descripcion}
Veterinario:         ${registro.veterinario}
Clinica/Lugar:       ${registro.clinica}
────────────────────────────────────────────────────────────────
`
      })
  } else {
    contenido += "\nSin registros medicos.\n"
  }

  contenido += `

GENERADO POR: InfoVet
FECHA DE DESCARGA: ${fecha}

════════════════════════════════════════════════════════════════
  Este documento es una copia de la ficha medica registrada en
  el sistema InfoVet. Para cambios, contacta a tu veterinario.
════════════════════════════════════════════════════════════════
`

  return contenido
}

function descargarArchivo(contenido, nombreArchivo) {
  const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = nombreArchivo
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

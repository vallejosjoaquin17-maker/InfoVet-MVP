# Arquitectura InfoVet - Documentacion Tecnica

## Principio Arquitectonico Fundamental

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  (React Components - Dashboard, Login, DetallesMascota, etc.)   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ SOLO llama funciones de api.js
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    services/api.js                               │
│         (Capa de abstraccion - UNICO punto de acceso)           │
│                                                                  │
│  Funciones expuestas:                                           │
│  - login(), register(), logout()                                │
│  - getUsuarios(), getMascotasByUser()                           │
│  - buscarMascotaPorChip(), buscarMascotaPorId()                 │
│  - crearMascota(), validarChipUnico()                           │
│  - descargarFichaPorId(), descargarFichaPorChip()               │
│  - generarUUID(), generarIdInternoMascota()                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Implementacion interna
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Firebase SDK                                  │
│        (Auth, Firestore) - SOLO usado dentro de api.js          │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

## Por que esta arquitectura permite migrar a AWS sin rehacer el frontend

### Paso 1: Estado Actual (Firebase)
\`\`\`javascript
// services/api.js - Implementacion Firebase
import { signInWithEmailAndPassword } from "firebase/auth"
import { collection, getDocs } from "firebase/firestore"

export async function login(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  // ...
}
\`\`\`

### Paso 2: Migracion a AWS (Cambio SOLO en api.js)
\`\`\`javascript
// services/api.js - Implementacion AWS
import { CognitoIdentityProviderClient, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider"
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb"

export async function login(email, password) {
  const client = new CognitoIdentityProviderClient({ region: "us-east-1" })
  const command = new InitiateAuthCommand({ ... })
  // ...
}
\`\`\`

### Resultado: Frontend INTACTO
- Ningun componente cambia
- Mismas funciones, mismos parametros, mismos retornos
- Solo se reemplaza la implementacion interna de api.js

## Estructura de Carpetas

\`\`\`
src/
├── data/
│   └── mockData.js           # Datos de respaldo/desarrollo
│
├── firebase/
│   └── firebaseConfig.js     # Configuracion Firebase (SOLO importado por api.js)
│
├── services/
│   └── api.js                # UNICO punto de acceso a datos
│
├── context/
│   └── AuthContext.jsx       # Estado global de autenticacion
│
├── components/
│   ├── atomic/
│   │   └── DatoVital.jsx     # Componentes atomicos
│   ├── Header.jsx
│   ├── TarjetaMascota.jsx
│   ├── Dashboard.jsx
│   ├── DetallesMascota.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── AgregarMascotaModal.jsx
│   ├── BusquedaChip.jsx
│   ├── BusquedaId.jsx
│   └── FormularioMascota.jsx
│
└── App.jsx                   # Orquestador principal

docs/
└── ARQUITECTURA.md           # Este archivo

firestore.rules               # Reglas de seguridad Firestore
\`\`\`

## Modelo de Datos

### Coleccion: users
\`\`\`javascript
{
  id: "user-xxx",           // UID de Firebase Auth
  nombre: "Juan Perez",
  email: "juan@example.com",
  telefono: "+56 9 1234 5678",
  direccion: "Av. Providencia 1234",
  rol: "dueno",             // dueno | veterinario | admin
  createdAt: Timestamp
}
\`\`\`

### Coleccion: mascotas
\`\`\`javascript
{
  id: "mascota-xxx",        // ID documento Firestore
  idInterno: "MAS-2024-a1b2c3d4",  // UUID generado
  duenioId: "user-xxx",     // Referencia a users
  nombre: "Thor",
  especie: "Perro",
  raza: "Golden Retriever",
  edad: 5,
  peso: 32,
  sexo: "Macho",
  chip: "CL-0042456789-10", // UNICO
  observaciones: "Alergico al pollo",
  foto: "https://...",
  createdAt: Timestamp
}
\`\`\`

### Coleccion: historiales
\`\`\`javascript
{
  id: "hist-xxx",
  mascotaId: "mascota-xxx", // Referencia a mascotas
  fecha: "2025-11-15",
  tipo: "Consulta",         // Consulta | Vacuna | Cirugia
  descripcion: "Revision general",
  veterinario: "Dra. Sandra Morales",
  clinica: "Clinica Veterinaria San Jose",
  createdAt: Timestamp
}
\`\`\`

## Flujo de Datos: Agregar Mascota

\`\`\`
Usuario hace clic en "Agregar Mascota"
            │
            ▼
┌─────────────────────────────┐
│   AgregarMascotaModal.jsx   │
│   - Buscar por Chip         │
│   - Buscar por ID           │
│   - Crear Directamente      │
└─────────────────────────────┘
            │
            ▼ (si elige crear)
┌─────────────────────────────┐
│   FormularioMascota.jsx     │
│   1. Ingresa datos mascota  │
│   2. Valida chip (api.js)   │
│   3. Selecciona dueno       │
│   4. Submit                 │
└─────────────────────────────┘
            │
            ▼
┌─────────────────────────────┐
│      services/api.js        │
│   crearMascota({...})       │
│   - Valida campos           │
│   - Genera idInterno UUID   │
│   - Guarda en Firestore     │
└─────────────────────────────┘
            │
            ▼
┌─────────────────────────────┐
│        Firestore            │
│   mascotas/{id}             │
└─────────────────────────────┘
\`\`\`

## Seguridad (firestore.rules)

1. **Usuarios**: Solo pueden leer su propio perfil (o admin/veterinario)
2. **Mascotas**: Solo el dueno puede ver sus mascotas (o admin/veterinario)
3. **Historiales**: Solo veterinarios/admin pueden crear registros medicos
4. **Unicidad de chip**: Validada en api.js antes de crear

## Configuracion Firebase

Variables de entorno requeridas:
\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
\`\`\`

## Modo Demo (Mock Data)

Cuando `NEXT_PUBLIC_FIREBASE_API_KEY` no esta configurado o es "demo-api-key":
- El sistema usa datos locales de `mockData.js`
- Perfecto para desarrollo y demos
- Credenciales demo: `juan@example.com` / `password123`

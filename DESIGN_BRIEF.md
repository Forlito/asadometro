# Asadometro — Brief de Diseño Completo

## 1. Qué es Asadometro

Asadometro es una app web (PWA mobile-first) para grupos de amigos en Argentina que quieren trackear la asistencia a los asados. Pensalo como un **Splitwise pero en vez de gastos, se trackean asados**.

Creás grupos (familia, amigos, oficina), registrás cada asado con sus datos, y tus amigos hacen check-in escaneando un QR o ingresando una palabra secreta. La app lleva el ranking de quién va a más asados, quién cocina más, quién pone más la casa, y quién siempre se ratea.

**URL en vivo:** https://asadometro.xyz
**Repo:** https://github.com/Forlito/asadometro
**Inspiración UX:** Splitwise / Tricount (pero para trackear asados, no gastos)

---

## 2. Arquitectura de la App

### Mapa de pantallas completo

```
Landing Page (/)
│
├── Login con Google ──→ Home (/home)
│
├── Join Group (/join/[code]) ──→ Login ──→ Grupo
├── Check-in (/checkin/[id]) ──→ Login ──→ Resultado
│
└── App autenticada (con bottom tab bar)
    │
    ├── TAB: Inicio (/home)
    │   ├── Próximo asado (card destacada)
    │   ├── Último asado (card destacada)
    │   └── Mis Grupos (lista)
    │
    ├── TAB: Calendario (/calendar)
    │   ├── Calendario mensual (círculos de color por grupo)
    │   ├── Leyenda de colores
    │   └── Lista de asados del día seleccionado
    │
    ├── TAB: Grupos (/groups)
    │   ├── Lista de grupos
    │   ├── Crear grupo (/groups/new)
    │   │   └── Formulario: nombre, descripción, foto, color
    │   │
    │   └── Detalle de grupo (/groups/[id])
    │       │
    │       ├── TAB: Asados (/groups/[id])
    │       │   ├── Lista de eventos
    │       │   ├── Crear asado (/groups/[id]/events/new)
    │       │   │   └── Formulario con "Más detalles" expandible
    │       │   │
    │       │   └── Detalle del asado (/groups/[id]/events/[eventId])
    │       │       ├── Info: fecha, anfitrión, asador, sede, comensales
    │       │       ├── Costos: ARS, USD blue, por persona
    │       │       ├── QR + Palabra secreta (solo creador)
    │       │       ├── Lista de asistencia (presente/ausente)
    │       │       ├── Notas del organizador
    │       │       ├── Galería de fotos
    │       │       └── Comentarios
    │       │
    │       ├── TAB: Ranking (/groups/[id]/ranking)
    │       │   ├── Ranking Anfitrión (quién pone más la casa)
    │       │   ├── Ranking Asador (quién cocina más)
    │       │   ├── Ranking Asistencia (quién va a más asados)
    │       │   └── Los que más se ratearon
    │       │
    │       └── TAB: Miembros (/groups/[id]/members)
    │           ├── Lista de miembros (avatar, nombre, rol)
    │           └── Compartir link de invitación
    │
    └── TAB: Perfil (/profile)
        ├── Avatar, nombre, email
        ├── Stats: asistidos, anfitrión, asador, grupos
        └── Cerrar sesión
```

### Flujos principales del usuario

**Flujo 1: Crear grupo e invitar amigos**
```
Home → Grupos → + Nuevo → Formulario → Grupo creado
→ Miembros → Compartir link → Amigo abre link → Login → Se une al grupo
```

**Flujo 2: Crear asado y registrar asistencia**
```
Grupo → + Nuevo asado → Formulario (titulo, fecha, sede, asador, costo...)
→ Asado creado → Mostrar QR + palabra secreta
→ Amigos escanean QR o ingresan palabra → Check-in registrado
→ Creador puede marcar/desmarcar asistencia manualmente
```

**Flujo 3: Ver rankings**
```
Grupo → Tab Ranking → Ver quién es más anfitrión, asador, asistente
→ Ver quién se ratea más
```

**Flujo 4: Ver calendario global**
```
Tab Calendario → Ver todos los asados de todos los grupos en un calendario
→ Cada grupo tiene un color distinto → Tocar día → Ver asados de ese día
```

---

## 3. Navegación

### Bottom Tab Bar (siempre visible en pantallas autenticadas)

| Tab | Icono | Ruta | Descripción |
|-----|-------|------|-------------|
| Inicio | Casa | `/home` | Dashboard con próximo/último asado y grupos |
| Calendario | Calendario | `/calendar` | Calendario global de todos los grupos |
| Grupos | Personas | `/groups` | Lista de todos mis grupos |
| Perfil | Usuario | `/profile` | Mi perfil, stats y logout |

### Tabs dentro de un grupo (en el header del grupo)

| Tab | Ruta | Descripción |
|-----|------|-------------|
| Asados | `/groups/[id]` | Lista de eventos del grupo |
| Ranking | `/groups/[id]/ranking` | Rankings de asistencia, anfitrión, asador |
| Miembros | `/groups/[id]/members` | Lista de miembros + invitar |

### Navegación de profundidad (con flecha de volver)
- Grupo → Crear asado → (volver a grupo)
- Grupo → Detalle asado → (volver a grupo)
- Grupos → Crear grupo → (volver a lista)

---

## 4. Pantallas a diseñar (detalle)

### 4.1. Landing Page (`/`)
- **Header:** Logo 🔥 + "Asadometro" | Links: "Iniciar sesión" (texto) + "Registrarse" (botón)
- **Hero:** Headline grande + descripción + CTA "Registrarse" + mockup de celular mostrando la app
- **Features:** 3 cards con fondo de color (QR check-in, Rankings, Calendario)
- **Footer CTA:** "Empezá a medir tus asados" + botón
- **Referencia:** Splitwise.com landing page
- **Nota:** Ambos botones ("Iniciar sesión" y "Registrarse") llevan a Google OAuth

### 4.2. Home / Dashboard (`/home`)
- **Saludo:** "Hola, [nombre]!"
- **Próximo asado:** Card grande destacada con: grupo (color dot + nombre), título, fecha, sede, asador, cantidad de confirmados. Si hay más, lista chica debajo (max 3).
- **Último asado:** Igual formato. Card grande del más reciente + lista chica.
- **Mis Grupos:** Cards horizontales con: color, inicial/foto, nombre, descripción, miembros. Botón "+ Nuevo".
- **Estado vacío:** Si no hay grupos: emoji 🥩 + "No tenés grupos" + botón crear.

### 4.3. Calendario Global (`/calendar`)
- **Calendario mensual:** Grilla de días
  - Día con 1 asado: **círculo relleno** con el color del grupo
  - Día con 2+ asados de grupos distintos: **círculo partido** en los colores de cada grupo
  - Número del día en blanco cuando tiene fondo de color
- **Leyenda:** Debajo del calendario. Dot de color + nombre del grupo.
- **Detalle del día:** Al tocar un día, lista de asados de ese día debajo con: título, grupo, asador.

### 4.4. Lista de Grupos (`/groups`)
- Cards de grupo con: color (franja lateral o avatar con color), nombre, descripción, cantidad de miembros
- Botón "+ Nuevo grupo"

### 4.5. Crear Grupo (`/groups/new`)
- **Campos:** Nombre (obligatorio), Descripción (opcional)
- **Futuro:** Foto de grupo, selector de color

### 4.6. Detalle de Grupo (`/groups/[id]`)
- **Header:** Flecha volver + nombre del grupo (con acento de color)
- **Tabs:** Asados | Ranking | Miembros

#### Tab: Asados
- Lista de eventos ordenados por fecha (más reciente primero)
- Cada card: icono fuego + título + fecha + asador + cantidad asistentes
- Botón "+ Nuevo asado"
- Estado vacío: emoji 🔥 + "No hay asados todavía"

#### Tab: Ranking
- **Ranking Anfitrión** (icono Corona 👑): Lista ordenada de quién creó más eventos. Medallas 🥇🥈🥉.
- **Ranking Asador** (icono Fuego 🔥): Lista de quién cocinó más asados.
- **Ranking Asistencia** (icono Trofeo 🏆): Lista con barra de progreso y %. Muestra X/total asados y porcentaje.
- **Los que más se ratearon** (icono Tendencia abajo 📉): Top 5 de faltas.

#### Tab: Miembros
- Lista: avatar + nombre + rol (badge "Admin" o "Miembro")
- Sección "Invitar amigos": botones "Copiar link" + "Compartir" (usa share nativo del celular)

### 4.7. Crear Asado (`/groups/[id]/events/new`)
- **Campos visibles:**
  - Título (opcional, placeholder "Ej: Asado de cumple")
  - Fecha (date picker)
  - Descripción (opcional, placeholder "Ej: Traer bebida")
- **Sección expandible "Más detalles"** (toggle con chevron ▼/▲):
  - Sede (texto, "¿Dónde se hace?")
  - Asador (dropdown de miembros del grupo, default: el creador)
  - Comensales (número, "Cantidad estimada")
  - Costo (número en ARS, "$ Costo total en pesos")
  - Notas (textarea, "Notas del asado...")
- **Botón:** "Crear asado 🔥"
- **Comportamiento:** El creador se auto-setea como Anfitrión Y Asador por default

### 4.8. Detalle del Asado (`/groups/[id]/events/[eventId]`)

**Card de información principal:**
- 📅 Fecha completa (ej: "Miércoles, 18 de marzo de 2026")
- 👤 Anfitrión: [nombre] (quien creó el evento = pone la casa)
- 🔥 Asador: [nombre] (quien cocina, por default = anfitrión)
- 📍 Sede: [lugar] (si fue completado)
- 👥 Comensales: [número] (si fue completado)
- 📝 Descripción (si existe)

**Card de costos** (si se cargó costo):
- Total: $X.XXX ARS (~$XX.XX USD)
- Por persona (N): $X.XXX ARS (~$XX.XX USD)
- Nota chica: "Dólar blue: $X.XXX al momento del asado"

**QR + Palabra secreta** (solo visible para el creador):
- QR code grande (color naranja)
- Palabra secreta en texto grande y bold (ej: "CHORIPAN")
- Botones: "Copiar link" + "Compartir"

**Lista de asistencia:**
- Cada miembro del grupo con: avatar + nombre + badge "Presente" (verde) o "Ausente" (gris)
- El creador ve un botón de toggle (✓/✗) al lado de cada miembro para marcar manualmente

**Notas del organizador** (si existen):
- Card con icono de nota + texto

**Galería de fotos:**
- Grid de 3 columnas, fotos cuadradas
- Botón "Agregar foto" (cualquier miembro del grupo puede subir)
- Tap en foto = ver en tamaño completo

**Comentarios:**
- Feed estilo social: avatar + nombre + texto + "hace X min/horas/días"
- Input de texto + botón enviar abajo de todo
- Cualquier miembro puede comentar

### 4.9. Check-in (`/checkin/[eventId]`)
- **Si viene del QR:** Auto-intenta el check-in. Muestra éxito o error.
- **Si entra manualmente:** Input para la palabra secreta (grande, centrado, uppercase)
- **Si no está logueado:** Botón "Entrar con Google"
- **Estado éxito:** Check verde grande ✅ + "Check-in exitoso!" + botón "Ir al inicio"

### 4.10. Unirse a Grupo (`/join/[inviteCode]`)
- Card centrada con: icono del grupo, nombre, descripción
- "Te invitaron a unirte a este grupo"
- Botón "Unirme al grupo" (o "Entrar con Google" si no está logueado)

### 4.11. Perfil (`/profile`)
- Avatar grande (de Google) + nombre + email
- **4 stat cards:**
  - 🔥 Asados asistidos (cantidad)
  - 👑 Veces anfitrión (cantidad)
  - 🥩 Veces asador (cantidad)
  - 👥 Grupos (cantidad)
- Botón "Cerrar sesión"

---

## 5. Modelo de Datos

### Entidades principales

**Usuario (Profile)**
- Nombre, avatar (de Google), email

**Grupo**
- Nombre, descripción, color (de paleta), foto (opcional), código de invitación
- Miembros con roles (admin/miembro)

**Evento (Asado)**
- Título, fecha, descripción
- Anfitrión (quien crea = pone la casa)
- Asador (quien cocina, default = anfitrión)
- Sede (lugar)
- Comensales (número manual, override)
- Costo en ARS + tipo de cambio USD blue
- Palabra secreta (auto-generada, argentina: "choripan", "morcilla", etc.)
- Notas del organizador

**Asistencia**
- Usuario + evento + método (QR, palabra secreta, manual)

**Fotos del evento**
- Múltiples por evento, cualquier miembro sube

**Comentarios del evento**
- Feed de texto, cualquier miembro comenta

### Relaciones
```
Usuario ──┬── pertenece a ──→ Grupo (muchos-a-muchos via Miembros)
           ├── crea ──→ Evento (como anfitrión)
           ├── cocina ──→ Evento (como asador)
           ├── asiste a ──→ Evento (via Asistencia)
           ├── sube ──→ Fotos
           └── escribe ──→ Comentarios

Grupo ──── contiene ──→ Eventos

Evento ──┬── tiene ──→ Asistencias
          ├── tiene ──→ Fotos
          └── tiene ──→ Comentarios
```

---

## 6. Lógica de Negocio

### Check-in (asistencia)
- El creador del asado genera un QR y una palabra secreta
- Los amigos escanean el QR (que contiene un link con la palabra) o ingresan la palabra manualmente
- Si el usuario no es miembro del grupo, se une automáticamente al hacer check-in
- El creador puede marcar/desmarcar asistencia manualmente

### Rankings (por grupo)
- **Anfitrión:** Cuenta cuántos asados creó cada miembro (created_by)
- **Asador:** Cuenta cuántos asados cocinó cada miembro (asador_id)
- **Asistencia:** Cuenta asados asistidos / total asados del grupo = %
- **Rateadas:** Total asados - asistidos = faltas

### Costos
- El organizador carga el costo total en ARS
- Se trae el dólar blue automáticamente de DolarAPI.com al crear
- Se calcula: total USD = total ARS / tasa blue
- Comensales efectivos = guest_count manual (si existe) o cantidad de check-ins
- Por persona = total / comensales efectivos

### Colores de grupos
- Cada grupo tiene un color asignado de una paleta predefinida
- El color se usa en: cards de grupo, calendario, event cards

---

## 7. Estilo Visual Actual (para referencia o para cambiar)

- **Tema:** Cálido y divertido (fire theme)
- **Colores primarios:** Naranja/ámbar (`#e67e22`), rojos cálidos
- **Background:** Off-white cálido
- **Cards:** Blancas con bordes suaves, esquinas muy redondeadas
- **Tipografía:** Nunito (Google Fonts) — amigable, redondeada
- **Iconos:** Lucide (similares a Feather icons)
- **Paleta de colores de grupos:**
  ```
  #e67e22  (naranja)     #e74c3c  (rojo)
  #9b59b6  (violeta)     #3498db  (azul)
  #1abc9c  (turquesa)    #2ecc71  (verde)
  #f1c40f  (amarillo)    #e91e63  (rosa)
  #00bcd4  (cyan)        #ff5722  (naranja oscuro)
  #795548  (marrón)      #607d8b  (gris azulado)
  ```
- **Inspiración:** Splitwise / Tricount pero temática asado

---

## 8. Stack Técnico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16 (React), Tailwind CSS, shadcn/ui |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Auth | Google OAuth via Supabase |
| Fotos | Supabase Storage |
| Dólar blue | DolarAPI.com |
| Deploy | Vercel |
| Dominio | asadometro.xyz |
| PWA | manifest.json, installable en home screen |

---

## 9. Notas para el diseñador

- **Mobile-first:** Toda la app se diseña primero para celular (375px). Desktop es secondary.
- **PWA:** La app se puede instalar en el home screen del celular. Diseñar sin barra de navegador.
- **Bottom tab bar:** Siempre visible, 4 tabs. Dentro de un grupo se usan tabs en el header (no bottom).
- **Gestos:** Pensar en swipe, pull-to-refresh, etc.
- **Estados vacíos:** Cada lista necesita un estado vacío amigable con emoji + CTA.
- **Loading:** Skeletons (shimmers) en cada pantalla mientras carga.
- **Tema abierto:** El diseñador puede proponer otra paleta/estilo. Lo actual es funcional pero no está pulido.
- **El QR y la palabra secreta son centrales:** Es el feature principal para check-in. Tiene que ser muy visible y fácil de usar.

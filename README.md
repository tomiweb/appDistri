# Sistema de Gestión de Consignación - Giommetti

Aplicación web fullstack para gestionar exhibidores de mercadería en consignación en distintos comercios.

## 🚀 Stack Tecnológico

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + API REST automática)
- **Routing**: React Router DOM
- **Hosting**: Vercel/Netlify (gratis)

## ✨ Características

- ✅ Gestión de comercios y artículos
- ✅ Control de stock automático por comercio
- ✅ Registro de visitas con cálculos en tiempo real
- ✅ Sistema de cobros y saldos
- ✅ Dashboard con estadísticas
- ✅ Diseño responsive (mobile-first)
- ✅ Autenticación con Supabase Auth
- ✅ Impresión de comprobantes

## 📋 Prerrequisitos

- Node.js 18+ y npm
- Cuenta en [Supabase](https://supabase.com) (gratis)
- Git

## 🔧 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd appDistri
npm install
```

### 2. Configurar Supabase

#### 2.1. Crear proyecto en Supabase

1. Ve a [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Espera a que se complete la configuración

#### 2.2. Ejecutar el schema SQL

1. En Supabase, ve a **SQL Editor**
2. Copia y pega el contenido del archivo `supabase-schema.sql`
3. Ejecuta el script (botón "Run")

Esto creará:
- Todas las tablas necesarias
- Relaciones entre tablas
- Índices para optimizar consultas
- Triggers para updated_at automático
- Políticas RLS (Row Level Security)
- Datos de ejemplo (comercios y artículos)

#### 2.3. Crear usuario administrador

En el SQL Editor de Supabase, ejecuta:

```sql
-- Crear usuario admin
-- El password será: admin123
-- Cambiar el email si lo deseas
```

O puedes crear el usuario desde:
1. Supabase Dashboard → Authentication → Users
2. Click en "Add user"
3. Email: `admin@giommetti.com`
4. Password: `admin123` (o el que prefieras)
5. Auto-confirm user: ✅

#### 2.4. Obtener las credenciales

1. Ve a **Settings** → **API**
2. Copia:
   - `Project URL` (algo como `https://xxxxx.supabase.co`)
   - `anon public` key

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Edita el archivo `.env` y completa con tus credenciales:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 5. Credenciales de acceso

- Email: `admin@giommetti.com`
- Password: `admin123`

## 📦 Despliegue en Vercel

### Opción 1: Desde la interfaz web

1. Ve a [Vercel](https://vercel.com)
2. Importa tu repositorio de GitHub
3. Configura las variables de entorno:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

### Opción 2: Desde la CLI

```bash
npm install -g vercel
vercel login
vercel
```

Sigue las instrucciones y agrega las variables de entorno cuando te lo pida.

## 📦 Despliegue en Netlify

```bash
npm run build
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

O conecta tu repo desde [Netlify](https://netlify.com) y configura las variables de entorno.

## 🗂️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Layout.jsx      # Layout principal con navbar
│   └── ProtectedRoute.jsx  # HOC para rutas protegidas
├── contexts/           # Contextos de React
│   └── AuthContext.jsx # Manejo de autenticación
├── lib/                # Configuraciones y utilidades
│   └── supabase.js     # Cliente de Supabase
├── pages/              # Páginas de la aplicación
│   ├── Login.jsx       # Pantalla de login
│   ├── Dashboard.jsx   # Dashboard principal
│   ├── Comercios.jsx   # Lista de comercios
│   ├── ComercioForm.jsx    # Formulario de comercio
│   ├── ComercioDetalle.jsx # Detalle del comercio
│   ├── Articulos.jsx   # Lista de artículos
│   ├── ArticuloForm.jsx    # Formulario de artículo
│   ├── Visitas.jsx     # Lista de visitas
│   ├── VisitaForm.jsx  # Formulario de nueva visita
│   └── VisitaDetalle.jsx   # Detalle de la visita
├── App.jsx             # Configuración de rutas
├── main.jsx            # Entry point
└── index.css           # Estilos globales (Tailwind)
```

## 🎯 Flujo de Uso

### 1. Registrar Comercios

- Ir a **Comercios** → **+ Nuevo Comercio**
- Completar: nombre, dirección, contacto, teléfono
- Guardar

### 2. Registrar Artículos

- Ir a **Artículos** → **+ Nuevo Artículo**
- Completar: nombre, marca, categoría, precios
- El sistema calcula el margen automáticamente
- Guardar

### 3. Realizar una Visita

- Ir a **Visitas** → **+ Nueva Visita**
- Seleccionar comercio
- Para cada artículo:
  - El **stock anterior** se carga automáticamente
  - Ingresar **stock actual** (lo que encontraste)
  - Ingresar **reposición** (lo que dejaste)
  - El sistema calcula automáticamente:
    - Ventas = stock_anterior - stock_actual
    - Stock final = stock_actual + reposición
    - Importe = ventas × precio_gio
- Guardar visita
- El sistema actualiza el stock del comercio automáticamente

### 4. Registrar un Cobro

- Ir al detalle del comercio
- Click en **+ Registrar Cobro**
- Completar monto, fecha, método de pago
- El saldo se actualiza automáticamente

### 5. Ver Estadísticas

- El Dashboard muestra:
  - Total vendido del mes
  - Total cobrado del mes
  - Saldo pendiente
  - Top 5 artículos más vendidos
  - Top 5 comercios con más ventas

## 🔐 Seguridad

- Row Level Security (RLS) habilitado en todas las tablas
- Solo usuarios autenticados pueden acceder a los datos
- Las contraseñas se almacenan hasheadas por Supabase Auth
- Variables de entorno para credenciales sensibles

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Desarrollo con hot reload
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Linter
```

## 📱 Responsive Design

La aplicación está optimizada para:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)

El menú de navegación se adapta automáticamente al tamaño de pantalla.

## 🐛 Troubleshooting

### Error: "Invalid API key"

Verificá que las variables de entorno estén correctamente configuradas en `.env`

### Error al ejecutar el schema SQL

Asegurate de:
1. Ejecutar todo el script `supabase-schema.sql` completo
2. Verificar que no haya errores en el SQL Editor
3. Refrescar el navegador

### No puedo hacer login

1. Verificá que hayas creado el usuario en Supabase
2. Confirmá que el email y password sean correctos
3. Revisá la consola del navegador para ver errores

### Los cálculos no funcionan en las visitas

Verificá que:
1. Los artículos tengan `precio_gio` configurado
2. El comercio esté activo
3. Los artículos estén activos

## 📝 Licencia

MIT

## 👤 Autor

Giommetti - Sistema de Consignación

## 🙏 Agradecimientos

- [Supabase](https://supabase.com) por el backend gratuito
- [Vercel](https://vercel.com) por el hosting
- [Tailwind CSS](https://tailwindcss.com) por los estilos

---

**¿Necesitás ayuda?** Abrí un issue en el repositorio.

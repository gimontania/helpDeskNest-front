
# HelpDeskNest - Frontend

Frontend del sistema interno de gestión de tickets HelpDeskNest.

## 1. Tecnologías

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- React Router
- Axios
- Zustand
- React Hook Form
- Zod

## 2. Requisitos

- Node.js
- pnpm

## 3. Instalación

Clonar el repositorio:

```bash
git clone https://github.com/gimontania/helpDeskNest-front.git
cd helpDeskNest-front
```

Instalar dependencias:

```bash
pnpm install --frozen-lockfile
```

## 4. Variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:3000
```

`VITE_API_URL` indica la dirección base del backend.

Si se modifica esta variable, reiniciar el servidor de desarrollo.

No subir archivos `.env.local` ni credenciales al repositorio.

## 5. Ejecución

Iniciar el servidor de desarrollo:

```bash
pnpm dev
```

Por defecto, Vite utiliza:

```text
http://localhost:5173
```

Generar una compilación de producción:

```bash
pnpm build
```

Ejecutar el análisis estático:

```bash
pnpm lint
```

## 6. Arquitectura de servicios API

Las peticiones HTTP se centralizan en:

```text
src/
├── services/
│   ├── api.ts
│   ├── apiErrors.ts
│   └── categories.ts
├── session.ts
└── components/
    └── Login.tsx
```

### Axios

`src/services/api.ts` configura una instancia centralizada de Axios con:

- URL base mediante `VITE_API_URL`.
- Tiempo máximo de espera de 15 segundos.
- Encabezado `Content-Type: application/json`.
- Interceptor para adjuntar automáticamente el JWT.
- Interceptor para gestionar respuestas HTTP 401.

### Autenticación JWT

El inicio de sesión utiliza:

```http
POST /auth/login
```

Envía las credenciales de usuario y recibe un token de acceso.

Las peticiones autenticadas incluyen:

```http
Authorization: Bearer <token>
```

El token se almacena en `sessionStorage` y se elimina al cerrar sesión o cuando se detecta una respuesta 401 con una sesión activa.

La sesión se administra mediante Zustand.

### Manejo de errores

`src/services/apiErrors.ts` centraliza la interpretación de errores:

| Código o situación | Comportamiento |
|---|---|
| 400 | Datos de solicitud inválidos |
| 401 | Credenciales o sesión no válidas |
| 403 | Acceso no autorizado por permisos |
| 404 | Recurso no encontrado |
| 409 | Conflicto en la operación |
| 5xx | Problema del servidor |
| Sin respuesta | Error de conexión o timeout |

Los errores se presentan en los componentes mediante mensajes comprensibles para el usuario.

## 7. CORS

El backend debe permitir el origen desde el que se ejecuta el frontend.

En la configuración actual de desarrollo, el backend utiliza:

```typescript
app.enableCors({
  origin: 'http://localhost:5173',
});
```

Si cambia el dominio o puerto del frontend, se debe actualizar la configuración CORS del backend.

Para producción se debe permitir únicamente el origen real del frontend desplegado.

CORS no sustituye la autenticación ni la autorización del backend.

## 8. Seguridad

- No almacenar contraseñas en el frontend.
- No incluir secretos en variables `VITE_*`.
- No subir archivos de entorno con credenciales.
- El backend debe validar los JWT y los permisos de cada operación.
- La validación de roles en el frontend sirve para controlar la navegación, pero no reemplaza las restricciones del servidor.

## 9. Estado del proyecto

El proyecto incluye:

- Inicio de sesión.
- Gestión de sesión mediante JWT.
- Navegación protegida por roles.
- Catálogo de categorías de soporte.
- Servicios API centralizados.
- Manejo centralizado de errores HTTP y de conexión.

Las secciones pendientes se integrarán progresivamente durante el desarrollo del proyecto.

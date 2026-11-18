# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
## Navegación por rol (US-03)

Instala las dependencias con `pnpm install --frozen-lockfile` y ejecuta `pnpm dev`. Configura
`VITE_API_URL` en `.env.local` para apuntar a la API de HelpDeskNest. Si la API tiene
un origen distinto, habilita CORS para el origen del frontend o sirve la API mediante un proxy del mismo origen.

El inicio de sesión consume `POST /auth/login`. El menú utiliza el rol del JWT y
el cierre de sesión elimina la sesión de la pestaña. La API aplica sus propios
permisos. Las rutas de tickets y métricas muestran el título y el estado pendiente
hasta que se integren sus pantallas.

| Rol | Secciones |
| --- | --- |
| Empleado | Inicio, Mis tickets |
| Agente | Inicio, Tickets asignados |
| Administrador | Inicio, Todos los tickets, Métricas |

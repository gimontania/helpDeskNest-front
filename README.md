# HelpDeskNest

SPA de soporte interno con React, TypeScript y Vite. Permite iniciar sesión, consultar y gestionar categorías, crear y consultar tickets, asignar responsables, cambiar estados y consultar métricas según el rol autenticado.

## Instalación de la SPA

Se verificó con Node.js 24 y pnpm 11.22.0.

```powershell
git clone https://github.com/gimontania/helpDeskNest-front.git
cd helpDeskNest-front
pnpm install --frozen-lockfile
Copy-Item .env.example .env.local
pnpm dev --host localhost --port 5173 --strictPort
```

Abre [la SPA local](http://localhost:5173). Reinicia Vite cuando cambies las variables de entorno.

| Variable | Ejemplo | Uso |
| --- | --- | --- |
| VITE_API_URL | http://localhost:3000 | URL HTTP o HTTPS de la API, sin el sufijo de un endpoint |

Vite incorpora las variables `VITE_*` al código que recibe el navegador. Configura los secretos del servidor en el backend.

## API y datos locales

La SPA necesita el [backend HelpDeskNest](https://github.com/gimontania/helpDeskNest). Su README contiene la instalación y el seed de demostración. El servidor debe tener PostgreSQL, el cliente de Prisma generado y las migraciones aplicadas antes de iniciar.

| Variable del backend | Valor de desarrollo | Uso |
| --- | --- | --- |
| DATABASE_URL | postgresql://usuario:clave@localhost:5432/help_desk | Conexión a PostgreSQL |
| JWT_SECRET | Una cadena privada generada para tu entorno | Firma del JWT |
| JWT_EXPIRES_IN | 8h | Vigencia de la sesión |
| PORT | 3000 | Puerto de la API |
| CORS_ORIGIN | http://localhost:5173 | Orígenes permitidos, separados por comas |

Para una base local de demostración, desde el backend ya instalado y configurado se ejecutan estos comandos.

```powershell
pnpm exec prisma generate
pnpm exec prisma migrate deploy
pnpm exec prisma db seed
pnpm start:dev
```

El seed crea y actualiza usuarios, categorías y tickets de demostración. Usa una base dedicada a desarrollo. Swagger queda disponible en [la documentación de la API](http://localhost:3000/docs).

| Rol | Correo de demostración | Contraseña del seed |
| --- | --- | --- |
| ADMIN | admin@helpdesk.test | Password123 |
| AGENTE | agente@helpdesk.test | Password123 |
| EMPLEADO | empleado@helpdesk.test | Password123 |

## Contrato e integración

Axios agrega `Authorization: Bearer <token>` a las solicitudes autenticadas. El token se conserva en `sessionStorage` y se elimina al cerrar sesión. Un 401 con sesión activa cierra la sesión y dirige al inicio de sesión. La API valida los permisos de cada operación.

| Operación | Endpoint |
| --- | --- |
| Inicio de sesión | POST /auth/login |
| Catálogo y gestión de categorías | GET y POST /categorias, PATCH y DELETE /categorias/:id |
| Agentes elegibles | GET /usuarios?rol=AGENTE |
| Bandeja, creación y detalle | GET y POST /tareas, GET /tareas/:id |
| Asignación | PATCH /tareas/:id/agente con agenteId |
| Cambio de estado | PATCH /tareas/:id/estado con estado |
| Métricas | GET /tareas/metricas |

El backend permite asignar a ADMIN y AGENTE. El destinatario debe tener rol AGENTE. Si frontend y backend se sirven desde orígenes distintos, `CORS_ORIGIN` debe incluir el origen exacto de la SPA. En un despliegue, configura el servidor web para devolver `index.html` al acceder directamente a rutas de React Router.

## Validación

```powershell
pnpm lint
pnpm build
pnpm preview --host localhost --port 4173 --strictPort
```

La compilación genera `dist/`. Para probar operaciones desde la vista previa, agrega `http://localhost:4173` a `CORS_ORIGIN` y reinicia la API.

El repositorio frontend todavía carece de un script `test`. Las comprobaciones de TypeScript, lint y producción se complementan con la prueba manual del flujo usado por el cambio. Las pruebas del backend se ejecutan desde su repositorio con `pnpm test --runInBand`.

El workflow `QA SPA` ejecuta la instalación reproducible, el lint y la compilación en los PR hacia `main` o `develop`. El resultado queda visible en GitHub. Para exigirlo antes de fusionar, el administrador debe configurarlo como check requerido en las reglas de la rama.

## Colaboración y entrega

Inicia cada tarea con una copia de trabajo limpia y una rama principal actualizada.

```powershell
git switch main
git pull --ff-only origin main
git switch -c feat/nombre-de-la-tarea
```

Guarda commits con cambios relacionados, publica la rama y abre un PR hacia `main` o la rama de integración acordada. Incluye el objetivo, los pasos de prueba y las limitaciones. Otro integrante revisa y registra su aprobación antes de fusionar. Cuando haya conflictos, integra la rama base en la rama de trabajo, resuélvelos y repite las validaciones.

El [informe de QA](docs/QA-colaboracion.md) registra los commits, PR, resultados y pendientes observados. La [documentación general del equipo](docs/documentacion_general_efrain.md) conserva el contexto de las funcionalidades.

## Problemas de arranque

- Si falta `VITE_API_URL` o tiene un formato inválido, revisa `.env.local` y reinicia Vite.
- Si no hay respuesta de la API, verifica que PostgreSQL y el backend estén iniciados y que la URL configurada corresponda al servidor.
- Si el navegador informa un error de CORS, revisa el puerto de Vite y `CORS_ORIGIN`.
- Si aparece un 403, verifica el rol y la propiedad del ticket según el contrato del endpoint.
- Si pnpm informa una restricción de instalación, conserva el mensaje y revisa la versión fijada en el lockfile antes de cambiar la configuración.

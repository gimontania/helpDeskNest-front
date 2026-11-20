Fecha de verificación 20 de noviembre de 2026, zona America/Guatemala.

Revisiones base del frontend cc7cec06fecb954b8e1d8a4a61b5bceb88227d2e y del backend b629bcff83c7bd43cf679b703221a1c39590d846.

# QA de colaboración e integración

Auditoría del 20 de noviembre de 2026, con fechas de trabajo en America/Guatemala. Se revisaron los repositorios públicos y el historial local actualizado.

| Repositorio | Commit de main validado |
| --- | --- |
| Frontend | cc7cec06fecb954b8e1d8a4a61b5bceb88227d2e |
| Backend | b629bcff83c7bd43cf679b703221a1c39590d846 |

## Participación y ramas

Los cuatro autores de PR detectados tienen contribuciones en el historial. La lista de integrantes esperada debe contrastarse con esta evidencia para confirmar el criterio de participación de todo el equipo.

| Autor de PR | Evidencia de trabajo en frontend | Evidencia en backend |
| --- | --- | --- |
| dariomartinez2014 | PR #1, #3 y #6. Commit 87a3b3a | PR #23. Commit 7f8b6f0 |
| gimontania | PR #4, #8 y #9. Commit 38055d5 | PR #6 y #19 |
| noeldiven | PR #7 y #10. Commit 0c54485 | PR #2, #3 y #7 a #9 |
| AntripZone | PR #2 y #5. Commit 2a87360, autor AdrianAlvaT | PR #1, #4 y otros |

Los nombres de autor de Git y las cuentas de GitHub pueden diferir. Se muestran el autor del PR y un commit contenido en su trabajo, sin atribuir cuentas adicionales a personas sin confirmación del equipo.

Se observaron ramas de funcionalidad y 10 PR fusionados en frontend, además de 23 PR fusionados en backend. El PR #11 del frontend seguía abierto al auditar. Todos estos PR tienen main como destino.

El historial principal del frontend también contiene commits individuales como cc7cec0, 756cb9e y 86221e6 que no corresponden a los commits de integración de los PR enumerados. El proceso observado todavía necesita asegurar que los cambios futuros pasen por PR.

Fuentes del historial y las entregas. [Commits del frontend](https://github.com/gimontania/helpDeskNest-front/commits/main/), [PR del frontend](https://github.com/gimontania/helpDeskNest-front/pulls?q=is%3Apr), [commits del backend](https://github.com/gimontania/helpDeskNest/commits/main/), [PR del backend](https://github.com/gimontania/helpDeskNest/pulls?q=is%3Apr).

## Revisiones y comprobaciones históricas

Se consultaron las revisiones formales, los check-runs y los estados del commit de cabecera de los 11 PR del frontend y los 23 PR del backend.

- Los endpoints de revisiones devolvieron cero revisiones para los PR auditados.
- Los commits de cabecera consultados tienen cero check-runs y cero estados publicados.
- Las descripciones de algunos PR documentan validaciones locales. Los resultados actuales no acreditan retrospectivamente cuándo se ejecutaron las pruebas antes de cada merge.
- El PR #11 sigue pendiente de revisión y fusión. Sus cambios de estados de interfaz y comentarios todavía no forman parte del main auditado.

Por tanto, los criterios de PR revisados y pruebas registradas antes de cada integración quedan pendientes de evidencia. Una conversación de revisión fuera de GitHub puede complementarse con un enlace o registro del equipo.

Ejemplos comprobables. [Frontend #6](https://github.com/gimontania/helpDeskNest-front/pull/6), [frontend #10](https://github.com/gimontania/helpDeskNest-front/pull/10), [frontend #11](https://github.com/gimontania/helpDeskNest-front/pull/11), [backend #23](https://github.com/gimontania/helpDeskNest/pull/23).

## Validaciones ejecutadas

| Comprobación | Resultado |
| --- | --- |
| Instalación frontend con pnpm install --frozen-lockfile | Correcta |
| pnpm build del frontend | Correcta |
| Arranque de Vite y login en Edge a 360 px | Correctos, con redirección desde una ruta protegida |
| pnpm lint del frontend | Sin errores, con tres advertencias |
| Generación de Prisma y compilación del backend | Correctas |
| Suite del backend | 11 suites y 103 pruebas aprobadas |
| Lint con información de tipos del backend | Sin errores, con una advertencia |
| Actualización desde origin/main | Fast-forward, sin conflictos |

El frontend conserva advertencias de React en AppLayout.tsx y Categorias.tsx, una dependencia inestable de useMemo en TicketList.tsx y el aviso de bundle superior a 500 kB. El backend conserva un import sin usar en crear-tarea.dto.ts.

El frontend no tiene un script test en package.json. Las pruebas manuales y de integración deben registrarse en cada PR hasta incorporar una suite reproducible a este repositorio.

## Configuración y deuda atendida en esta entrega

- El README raíz explica cómo instalar e iniciar la SPA, las versiones utilizadas, las variables, la API requerida, CORS, los usuarios de demostración y las validaciones.
- .env.example contiene VITE_API_URL para copiarlo a .env.local.
- Se reemplazó la descripción obsoleta que presentaba tickets y métricas como pantallas pendientes.
- El workflow QA SPA ejecuta instalación con lockfile congelado, lint y build en los PR hacia main o develop.
- Se documentó la diferencia entre las validaciones ejecutadas ahora y la evidencia histórica de revisión y CI.

El workflow usa las acciones oficiales. [Checkout](https://github.com/actions/checkout), [setup-node](https://github.com/actions/setup-node).

## Pendientes para cerrar el ticket

1. Contrastar los cuatro autores detectados con la lista definitiva de integrantes.
2. Registrar la revisión de otro integrante en los PR pendientes.
3. Exigir PR y el check de compilación y lint mediante las reglas de la rama, configuradas por el administrador.
4. Conservar evidencia de las pruebas del backend en sus PR y mantener una suite de frontend reproducible.
5. Revisar y aprobar esta entrega antes de fusionarla.

El porcentaje del checklist debe corresponder a la evidencia disponible. La auditoría encontró pendientes en revisión y trazabilidad de las validaciones.

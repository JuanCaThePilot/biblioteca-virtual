# API Contracts

Base path is `/api`. Frontend helpers prepend the API base from `services/api.js`.

## Auth Endpoints

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/auth/register` | Public | `{ nombre, email, password }` | `{ mensaje, token, usuario }` |
| POST | `/auth/login` | Public | `{ email, password }` | `{ mensaje, token, usuario }` |
| GET | `/auth/perfil` | Bearer token | None | `{ usuario }` |
| POST | `/auth/solicitar-reset` | Public | `{ email }` | `{ mensaje }` generic |
| POST | `/auth/forgot-password` | Public | `{ email }` | Alias of solicitar-reset |
| POST | `/auth/confirmar-reset` | Public | `{ token, nueva_password }` or `{ token, password }` | `{ mensaje }` |
| POST | `/auth/reset-password` | Public | `{ token, nueva_password/password }` | Alias of confirmar-reset |

## Resource Endpoints

| Method | Path | Auth | Query/Body | Response |
|---|---|---|---|---|
| GET | `/recursos` | Public | Query: `categoria`, `buscar`, `orden`, `pagina` | `{ recursos, total, pagina, porPagina }` |
| GET | `/recursos/estadisticas` | Public | None | `{ totalRecursos, totalUsuarios, totalDescargas }` |
| GET | `/recursos/:id` | Public | Resource id | `{ recurso }` for approved resource |
| GET | `/recursos/:id/descargar` | Public | Resource id | `{ url, nombre }`, increments downloads |
| POST | `/recursos` | Bearer token | Multipart `archivo`, `nombre`, `descripcion`, `categoria`, `tags` | `{ mensaje, recurso }` |
| DELETE | `/recursos/:id` | Bearer token | Resource id | `{ mensaje }` if owner or admin |

## Admin Endpoints

All `/admin/*` routes pass `requireAdmin`; role must be `admin` or `superadmin` unless noted.

| Method | Path | Extra Auth | Body | Response |
|---|---|---|---|---|
| GET | `/admin/estadisticas` | Admin | None | `{ totalRecursos, pendientesCount, totalUsuarios, topRecursos }` |
| GET | `/admin/pendientes` | Admin | None | `{ pendientes }` |
| GET | `/admin/recursos` | Admin | None | `{ recursos }` approved resources |
| PATCH | `/admin/recursos/:id/aprobar` | Admin | `{}` | `{ mensaje }` |
| PATCH | `/admin/recursos/:id/descripcion` | Admin | `{ descripcion }` | `{ mensaje, recurso }` |
| DELETE | `/admin/recursos/:id` | Admin | None | `{ mensaje }` |
| DELETE | `/admin/recursos/:id/rechazar` | Admin | None | `{ mensaje }` |
| GET | `/admin/usuarios` | Admin | None | `{ usuarios }` |
| PATCH | `/admin/usuarios/:id/rol` | Superadmin | `{ rol: 'usuario'|'admin' }` | `{ mensaje }` |

## Error Format

Controllers generally return `{ error: string }` with relevant HTTP status. Frontend `parseJson()` throws `new Error(data.error || HTTP status)` for non-2xx responses.

## Notes

- Public resource reads only return `aprobado = true` resources.
- Resource list searches only `nombre` with `ilike`; descriptions/tags are not searched.
- `pagina` is supported by the backend but the current React UI does not expose pagination controls.

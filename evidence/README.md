# Evidencias (Módulo de cursos)

En esta carpeta deben incluirse las capturas solicitadas para la entrega en Moodle:

- Captura de Swagger mostrando el endpoint `/api/courses/`.
- Captura del frontend con el listado de cursos en `/dashboard/courses`.
- Captura del formulario de creación o edición de un curso.

## Funcionalidades implementadas

API REST con Django REST Framework para cursos (crear, listar, detalle, actualizar con PUT/PATCH y eliminar con DELETE), con filtros por nivel y estado activo, búsqueda por nombre y descripción, y ordenación por precio, duración y fecha de creación. Validaciones en el serializer para nombre no vacío, duración mayor que cero y precio mayor o igual a cero. Documentación OpenAPI mediante drf-spectacular en `/api/docs/`. Frontend en Next.js con la ruta `/dashboard/courses`, listado consumiendo `GET /api/courses/`, formulario con React Hook Form y validaciones visibles, creación con `POST`, edición con `PATCH`, eliminación con `DELETE` y confirmación previa al borrar.

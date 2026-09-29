# Suni

Suni fabrica productos de limpieza y sanitización para mantener limpios hogares y empresas.

Este repositorio contiene el sistema interno de operaciones de Suni, que controla el inventario, los pedidos, la producción y el resto de las operaciones diarias de la empresa. Más adelante también incluirá la landing page pública de la empresa.

## Usuarios y roles

El sistema da servicio a cuatro áreas de la empresa. El acceso por roles permite que cada área vea solo la parte que le corresponde:

- **Administración**
- **Producción** (planta)
- **Almacén**
- **Ventas**

## Stack tecnológico

- **TypeScript**: tipado seguro y mejor experiencia de desarrollo
- **TanStack Router**: enrutamiento basado en archivos con tipado completo
- **TailwindCSS**: CSS utilitario para desarrollar interfaces con rapidez
- **Paquete de UI compartido**: los componentes base de shadcn/ui viven en `packages/ui`
- **Hono**: framework de servidor ligero y eficiente
- **oRPC**: APIs con tipado de extremo a extremo e integración con OpenAPI
- **Bun**: entorno de ejecución
- **Drizzle**: ORM pensado para TypeScript
- **PostgreSQL**: motor de base de datos
- **Autenticación**: Better Auth
- **Turborepo**: sistema de build optimizado para monorepos

## Primeros pasos

Primero, instala las dependencias:

```bash
pnpm install
```

## Configuración de la base de datos

Este proyecto usa PostgreSQL con Drizzle ORM.

1. Asegúrate de tener una base de datos PostgreSQL disponible.
2. Actualiza el archivo `apps/server/.env` con los datos de conexión de PostgreSQL.
3. Aplica el esquema a la base de datos:

```bash
pnpm run db:push
```

Levanta los contenedores de desarrollo local (Postgres y Mailpit, definidos en `docker-compose.dev.yml` y separados del stack de despliegue) con:

```bash
pnpm run services:up
```

Los correos salientes se pueden revisar en http://localhost:8025. Configura el SMTP en `localhost:1025` (sin autenticación ni TLS). Para detenerlos, usa `pnpm run services:down`.

Después, inicia el servidor de desarrollo:

```bash
pnpm run dev
```

Portless asigna URLs estables: la aplicación web corre en https://suni.localhost y la API en https://api.suni.localhost. En desarrollo, esas URLs son los valores por defecto de `.env.schema` (`VITE_SERVER_URL`, `BETTER_AUTH_URL`, `CORS_ORIGIN`); en producción debes definirlos. Si los defines en `.env`, ese valor tiene prioridad, así que elimina cualquier `localhost:3000` o `localhost:3001` anterior. La primera vez, portless pide sudo para el puerto 443 y para confiar en su CA local. Para saltarte portless, usa `PORTLESS=0 pnpm run dev` (web en `:3001`, API en `:3000`).

## Personalización de la UI

Las aplicaciones web con React de este stack comparten los componentes base de shadcn/ui a través de `packages/ui`.

- Cambia los design tokens y los estilos globales en `packages/ui/src/styles/globals.css`
- Actualiza los componentes base compartidos en `packages/ui/src/components/*`
- Ajusta los alias o la configuración de estilos de shadcn en `packages/ui/components.json` y `apps/web/components.json`

### Agregar más componentes compartidos

Ejecuta esto desde la raíz del proyecto para agregar más componentes base al paquete de UI compartido:

```bash
npx shadcn@latest add accordion dialog popover sheet table -c packages/ui
```

Importa los componentes compartidos así:

```tsx
import { Button } from "@suni/ui/components/button";
```

### Agregar bloques específicos de la aplicación

Si quieres agregar bloques propios de la aplicación en lugar de componentes base compartidos, ejecuta el CLI de shadcn desde `apps/web`.

## Configuración del entorno

Cada aplicación define su esquema de entorno en `.env.schema`. Varlock genera `src/env.ts` durante la instalación; ejecuta `pnpm run env:generate` después de cambiar un esquema. Haz commit de los esquemas y guarda los secretos en archivos env ignorados por git o en tu plataforma de despliegue.

En el código de la aplicación, importa el accesor `ENV` generado. Los paquetes compartidos de base de datos y autenticación reciben la configuración o los clientes ya inicializados desde la aplicación. Consulta la [guía de monorepos de Varlock](https://varlock.dev/guides/monorepos/).

La carga automática de variables de entorno de Bun está desactivada en `bunfig.toml`; Varlock se carga desde la integración del framework o desde el arranque del servidor. Los despliegues con Node deben incluir Varlock y sus dependencias junto con el esquema de la aplicación.

Ejecuta las herramientas independientes de Node o Bun que usan Varlock desde el directorio de la aplicación correspondiente, para que carguen su esquema y sus archivos env. `env:generate` solo genera archivos de TypeScript; no inicializa las variables de entorno para comandos posteriores.

## Despliegue

### Docker Compose

- Destino: web + server
- Configuración: `docker-compose.yml` (los Dockerfiles de cada aplicación están en `apps/*/Dockerfile`)
- Construir imágenes: `pnpm run docker:build`
- Iniciar: `pnpm run docker:up`
- Logs: `pnpm run docker:logs`
- Detener: `pnpm run docker:down`

Las variables de entorno se leen del archivo `.env` de cada aplicación (las variables públicas quedan incluidas en el build de web) y se sobrescriben en `docker-compose.yml` para la red de contenedores.

Para más detalles, consulta la guía [Deploying with Docker Compose](https://www.better-t-stack.dev/docs/guides/docker).

## Estructura del proyecto

```
suni/
├── apps/
│   ├── web/         # Aplicación frontend (React + TanStack Router)
│   └── server/      # API backend (Hono, oRPC)
├── packages/
│   ├── ui/          # Componentes y estilos compartidos de shadcn/ui
│   ├── api/         # Capa de API / lógica de negocio
│   ├── auth/        # Configuración y lógica de autenticación
│   └── db/          # Esquema y consultas de la base de datos
```

## Scripts disponibles

- `pnpm run dev`: inicia todas las aplicaciones en modo desarrollo
- `pnpm run build`: compila todas las aplicaciones
- `pnpm run dev:web`: inicia solo la aplicación web
- `pnpm run dev:server`: inicia solo el servidor
- `pnpm run check-types`: revisa los tipos de TypeScript en todas las aplicaciones
- `pnpm run db:push`: aplica los cambios del esquema a la base de datos
- `pnpm run db:generate`: genera el cliente y los tipos de la base de datos
- `pnpm run db:migrate`: ejecuta las migraciones de la base de datos
- `pnpm run db:studio`: abre la interfaz de Drizzle Studio
- `pnpm run services:up`: inicia Postgres y Mailpit de desarrollo local (`docker-compose.dev.yml`)
- `pnpm run services:down`: los detiene
- `pnpm run services:logs`: muestra sus logs en tiempo real
- `pnpm run docker:build`: construye las imágenes de Docker Compose
- `pnpm run docker:up`: construye e inicia el stack de Docker Compose
- `pnpm run docker:logs`: muestra en tiempo real los logs del stack de Docker Compose
- `pnpm run docker:down`: detiene el stack de Docker Compose

## Generación del esquema de Better Auth

Después de cambiar los plugins o las opciones de esquema de autenticación, ejecuta `pnpm run auth:generate` desde la raíz del proyecto. El script ejecuta el CLI de Better Auth mediante `varlock run` desde el directorio de la aplicación correspondiente y carga la instancia de autenticación desde `src/services.ts`. Revisa los cambios del esquema y luego aplícalos con el flujo de migraciones de tu ORM.

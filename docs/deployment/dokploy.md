# Desplegar Suni con Dokploy e Infisical

Esta guía configura el Compose de producción en Dokploy, obtiene los secretos desde Infisical y publica la web y la API detrás de dominios HTTPS.

## Requisitos

- Dokploy 0.30.0 o posterior, con un servidor y dominios que apunten a él.
- Un proyecto de Infisical con los secretos de producción.
- Un repositorio Git accesible desde Dokploy.

Dokploy resuelve las referencias de proveedores de secretos al desplegar. La rotación de un secreto requiere otro despliegue. Consulta la [documentación de proveedores de secretos](https://docs.dokploy.com/docs/core/secrets-providers) y la [guía de Infisical](https://docs.dokploy.com/docs/core/secrets-providers/infisical).

## Conectar el repositorio

1. En Dokploy, crea una aplicación Docker Compose y conecta el repositorio de Suni.
2. Selecciona la rama que quieres desplegar y `docker-compose.yml` como archivo Compose.
3. Usa el modo Docker Compose, no Docker Stack. Este despliegue construye las imágenes desde el repositorio.
4. Activa **Isolated Deployment** para que web, server y PostgreSQL compartan una red y los dominios sigan llegando a los servicios seleccionados. Revisa la topología en **Preview Compose** antes de desplegar.

Consulta la documentación de [dominios de Docker Compose en Dokploy](https://docs.dokploy.com/docs/core/docker-compose/domains) para ver cómo cambia la red cuando no activas Isolated Deployment.

## Conectar Infisical

1. En Infisical, crea una Machine Identity con Universal Auth y dale acceso de solo lectura al proyecto de producción.
2. En Dokploy, abre **Settings → Secrets → Add Provider** y elige Infisical.
3. Configura el nombre `infisical-prod`, la URL del sitio, el Client ID y el Client Secret, el Project ID, el entorno `prod` y la ruta de secretos `/`.
4. Prueba la conexión y asigna el proveedor al proyecto y al entorno de Dokploy que despliega producción.
5. Guarda las claves de Universal Auth en el formulario del proveedor. No las añadas a las variables del Compose ni al repositorio.

Dokploy usa referencias con esta forma en sus editores de variables:

```text
${{vault.infisical-prod.BETTER_AUTH_SECRET}}
```

Los nombres después del proveedor deben coincidir con las claves de Infisical.

## Configurar las variables

En el editor **Environment** de la aplicación Docker Compose, define las variables requeridas. Dokploy las usa para interpolar las variables declaradas en `docker-compose.yml`.

| Variable | Valor |
| --- | --- |
| `BETTER_AUTH_SECRET` | Referencia a un secreto aleatorio de al menos 32 caracteres. |
| `BETTER_AUTH_URL` | URL HTTPS pública de la API, por ejemplo `https://api.example.com`. |
| `CORS_ORIGIN` | URL HTTPS pública de la web, por ejemplo `https://app.example.com`. |
| `DATABASE_URL` | URL PostgreSQL para `postgres:5432/suni`, con usuario `postgres` y la misma contraseña de `POSTGRES_PASSWORD`. |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL. |
| `SMTP_FROM` | Remitente de correo, por ejemplo `Suni <no-reply@example.com>`. |
| `SMTP_HOST` | Host del servicio SMTP. |
| `VITE_SERVER_URL` | URL HTTPS pública de la API. Dokploy la usa al construir la web. |

Guarda los valores secretos en Infisical y pega referencias como `${{vault.infisical-prod.POSTGRES_PASSWORD}}` en el editor de Dokploy. Los valores públicos, como las URLs y `SMTP_FROM`, pueden escribirse directamente allí.

`DATABASE_URL` y `POSTGRES_PASSWORD` son variables separadas. No construyas `DATABASE_URL` interpolando directamente la contraseña de PostgreSQL: caracteres como `@`, `:`, `/` y `%` deben codificarse para URL. Guarda en Infisical la URL completa con la contraseña codificada y la contraseña original para `POSTGRES_PASSWORD`.

El Compose usa `SMTP_PORT=587` y `SMTP_SECURE=false` si no defines esas variables. `SMTP_USER`, `SMTP_PASS` y `LOGO_URL` son opcionales. Añade referencias a Infisical para usuario y contraseña SMTP si el servidor de correo requiere autenticación.

## Asignar dominios

Antes del primer despliegue, configura los dominios en Dokploy para que enruten a estos servicios y puertos internos:

| Servicio | Puerto interno |
| -------- | -------------: |
| `web`    |           `80` |
| `server` |         `3000` |

Usa el mismo dominio de API en `BETTER_AUTH_URL` y `VITE_SERVER_URL`. Configura `CORS_ORIGIN` con el dominio de la web. Activa HTTPS para ambos dominios. Después de guardar los dominios y las variables, despliega la aplicación. Si cambias los dominios después, vuelve a desplegar para que Dokploy aplique las rutas.

## Respaldar PostgreSQL

El servicio `postgres` conserva sus datos en el volumen nombrado `suni_postgres_data`, montado en `/var/lib/postgresql`. Configura y verifica un respaldo del volumen en Dokploy antes de depender de esta instancia.

Cambiar `POSTGRES_PASSWORD` en Infisical no cambia la contraseña de una base PostgreSQL ya inicializada en el volumen. Coordina cualquier cambio con una rotación dentro de PostgreSQL y actualiza `DATABASE_URL` al mismo tiempo. No elimines el volumen para cambiar la contraseña.

El despliegue no crea ni aplica el esquema de la base de datos y no ejecuta datos iniciales. Antes de usar la aplicación, provisiona el esquema y cualquier cuenta de administración mediante el procedimiento operativo aprobado para el entorno.

## Cambiar variables

Los cambios en variables de ejecución surten efecto al desplegar de nuevo. Los cambios en `VITE_SERVER_URL` requieren reconstruir la imagen web, algo que el despliegue Compose hace al construir el repositorio.

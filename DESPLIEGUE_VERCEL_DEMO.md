# Despliegue de la demostración en Vercel

Esta guía corresponde exclusivamente a la rama `demo-vercel`. La demostración conserva las pantallas y el estilo del panel, pero usa datos ficticios en memoria y no se conecta a PostgreSQL, Mercado Pago, WhatsApp, S3 ni otros servicios externos.

## Separación y seguridad

- No existe una variable `DEMO_MODE` ni un interruptor que pueda activarse en producción.
- El código de demostración vive en la rama independiente `demo-vercel` y bajo las rutas `/demo/*`.
- `src/proxy.ts` aplica una lista positiva: sólo permite `/demo/*`, `/api/demo/*`, la raíz y recursos internos de Next.js. Las páginas, APIs, webhooks e integraciones productivas responden `404`.
- El acceso usa `DEMO_ACCESS_CODE`, una sesión HMAC distinta de producción y una cookie `HttpOnly`, `Secure` en Vercel, `SameSite=Strict`, limitada a `/demo` y con vencimiento de 12 horas.
- Los dos secretos se usan únicamente en el servidor. No deben llevar el prefijo `NEXT_PUBLIC_`.
- Los formularios actualizan solamente el estado de la pestaña abierta. Cada acción se identifica como simulada y se pierde al recargar.
- La carga de documentos no transmite ni guarda el archivo: sólo representa su nombre en la tabla local.
- No se modificaron Prisma, el esquema, las migraciones, el worker, Docker ni las reglas del backend productivo.

## Variables necesarias

Crear sólo estas dos variables para la demo:

| Variable | Uso | Requisito |
| --- | --- | --- |
| `DEMO_ACCESS_CODE` | Código que se comparte con quienes recorrerán la demo | Aleatorio, exclusivo para demo y de al menos 10 caracteres; se recomiendan 20 o más |
| `DEMO_SESSION_SECRET` | Firma de la cookie de sesión | Aleatorio y de al menos 32 caracteres |

Generar valores sin guardarlos en el repositorio:

```powershell
node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Usar el primer resultado como `DEMO_ACCESS_CODE` y el segundo como `DEMO_SESSION_SECRET`. No configurar `DATABASE_URL`, credenciales de Mercado Pago, WhatsApp, S3 ni secretos productivos en este proyecto de Vercel.

## Configuración exacta en Vercel

1. En Vercel, elegir **Add New → Project** e importar `juanmoli99/Saas-Satisfy` desde GitHub.
2. Usar estos valores:
   - **Framework Preset:** `Next.js` (detección automática).
   - **Root Directory:** `./`.
   - **Install Command:** `npm install` o dejar el valor automático.
   - **Build Command:** `npm run build` o dejar el valor automático.
   - **Output Directory:** dejar vacío/automático; no escribir `public` ni `.next`.
   - **Node.js Version:** `22.x`.
3. En **Environment Variables**, agregar `DEMO_ACCESS_CODE` y `DEMO_SESSION_SECRET`. Seleccionar los entornos **Production** y **Preview** si se desea probar ambos.
4. Importante: Vercel selecciona `main` inicialmente cuando esa rama existe. Una vez creado el proyecto, abrir **Settings → Environments → Production → Branch Tracking**, cambiar la rama a `demo-vercel` y guardar.
5. Abrir **Deployments → Create Deployment**, seleccionar o pegar la referencia completa de la rama `demo-vercel` y crear el despliegue. Si se creó antes un despliegue de `main`, no usarlo como demo.
6. Para que cualquier invitado pueda abrir la URL, revisar **Settings → Deployment Protection** y seleccionar **None** para este proyecto. La aplicación seguirá protegida por su propio código de acceso DEMO. Si se deja activada la autenticación de Vercel, sólo integrantes autorizados de la cuenta podrán llegar al formulario.
7. Verificar que el despliegue de `demo-vercel` esté promovido a Production. La URL estable será `https://NOMBRE-DEL-PROYECTO.vercel.app` y redirigirá a `/demo`.
8. Ingresar con el valor de `DEMO_ACCESS_CODE`. Ese valor no aparece en el repositorio ni en el navegador.

Si se cambia alguna variable en Vercel, hay que volver a desplegar para que el nuevo valor se aplique.

## Prueba local opcional

Crear un archivo `.env.local` no versionado con:

```dotenv
DEMO_ACCESS_CODE=un-codigo-local-aleatorio-de-prueba
DEMO_SESSION_SECRET=un-secreto-local-de-al-menos-treinta-y-dos-caracteres
```

Luego:

```powershell
npm install
npm run dev
```

Abrir `http://localhost:3000`. No hace falta Docker ni PostgreSQL.

## Verificaciones antes de publicar

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

Pruebas de humo recomendadas en la URL pública:

1. `/` redirige a `/demo`.
2. Sin sesión, `/demo/dashboard` redirige a `/demo/ingresar`.
3. Un código incorrecto es rechazado y el correcto permite navegar.
4. `/dashboard`, `/login`, `/api/clients`, `/api/settings` y `/api/webhooks/mercadopago` responden `404`.
5. Formularios, suspensión de servicios y liquidaciones muestran el aviso **Simulación** y no persisten luego de recargar.

## Actualizaciones futuras

Trabajar y desplegar siempre desde `demo-vercel`. No fusionar esta rama en `main`: la separación por rama y la lista positiva de rutas son parte del límite de seguridad de la demostración.

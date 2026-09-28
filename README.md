# matildefacetdds.com — Sitio web + panel de administración

Sitio web moderno, bilingüe (inglés/español), 100 % responsive, con panel de administración
oculto y base de datos en Firebase. Construido desde cero en HTML, CSS y JavaScript puros:
**no queda ningún rastro de Wix**, no hay dependencias de frameworks y funciona en cualquier
hosting estático (cPanel, Vercel, Netlify, Firebase Hosting…).

---

## 1. Qué incluye

### Sitio público
| Página | Archivo | Contenido |
|--------|---------|-----------|
| Inicio | `index.html` | Carrusel de imágenes, servicios, sobre la doctora, reseñas, horarios + mapa, formularios, preguntas frecuentes |
| Agendar cita | `appointment.html` | Asistente de 4 pasos (motivo → fecha y hora → datos → confirmación) |
| Contacto | `contact.html` | Formulario de mensaje + solicitud de historial dental |
| Administración | `admin.html` | Panel privado (no está enlazado desde el sitio público) |

### Funciones destacadas
- **Selector de idioma EN/ES** en la cabecera. Cambia todo el contenido y se recuerda en el navegador.
- **Carrusel de inicio** con autoplay, flechas, puntos indicadores, gestos táctiles y respeto por `prefers-reduced-motion`.
- **Formularios web reales** (no textos planos): validación campo a campo, asistente por pasos, resumen previo al envío y mensajes de error/éxito.
- **Panel de administración** que controla *todo*: textos, imágenes, servicios, horarios, contacto, colores, reseñas, preguntas y formularios, además de citas, pacientes, seguimiento y mensajes.
- **SEO técnico**: títulos y descripciones por página, datos estructurados `Dentist` (schema.org), Open Graph, `sitemap`-friendly, `lang` dinámico.
- **Accesibilidad**: navegación por teclado, `aria-*`, foco visible, enlace «saltar al contenido», textos alternativos.
- **Sin rastro de Wix**: ninguna imagen, enlace ni script apunta a Wix. Todas las imágenes son locales.

---

## 2. Estructura de archivos

```
matildefacetdds/
├── index.html              ← página principal
├── appointment.html        ← agendar cita (asistente)
├── contact.html            ← contacto + historial dental
├── admin.html              ← PANEL DE ADMINISTRACIÓN (oculto)
├── firestore.rules         ← reglas de seguridad de la base de datos
├── storage.rules           ← reglas de seguridad de las imágenes
├── README.md               ← este archivo
└── assets/
    ├── css/
    │   ├── styles.css      ← diseño del sitio público
    │   └── admin.css       ← diseño del panel
    ├── js/
    │   ├── icons.js        ← set de iconos SVG propios
    │   ├── content.js      ← contenido por defecto (semilla) EN/ES
    │   ├── i18n.js         ← traducciones de la interfaz
    │   ├── firebase-config.js  ← 🔑 AQUÍ VAN TUS CLAVES DE FIREBASE
    │   ├── fb.js           ← conexión con Firebase
    │   ├── site.js         ← motor: idioma, tema, renderizado
    │   ├── main.js         ← carrusel, menú, animaciones, modales
    │   ├── forms.js        ← lógica de todos los formularios
    │   └── admin.js        ← lógica del panel
    └── img/
        ├── hero-1.jpg · hero-2.jpg · hero-3.jpg   ← carrusel
        ├── about.jpg       ← foto de la doctora
        └── favicon.svg     ← icono del sitio
```

---

## 3. Probar el sitio ahora mismo (sin configurar nada)

El sitio funciona **en modo demostración** desde el primer momento: se muestra el contenido por
defecto y el panel permite editar todo, guardando los cambios solo en tu navegador.

```bash
cd matildefacetdds
python -m http.server 8080
```

Luego abre:

- Sitio público → http://localhost:8080
- Panel → http://localhost:8080/admin.html

> Abrir `index.html` con doble clic también funciona, pero **la conexión con Firebase requiere
> un servidor** (no funciona con `file://`).

---

## 4. Paso 2 · Crear el proyecto en Firebase (guía paso a paso)

Tiempo estimado: 10–15 minutos. Todo con el plan gratuito (Spark).

### 4.1 Crear el proyecto

1. Entra en <https://console.firebase.google.com> con la cuenta de Google del consultorio.
2. **Crear proyecto** → nombre, por ejemplo `facet-dental`.
3. Puedes desactivar Google Analytics (no es necesario).

### 4.2 Activar la base de datos (Firestore)

1. Menú lateral → **Compilación → Firestore Database** → **Crear base de datos**.
2. Elige **Modo de producción** (las reglas las pegamos en el paso 4.5).
3. Ubicación: la más cercana a Maryland — **`us-east4` (N. Virginia)** o `nam5 (United States)`.
4. Crear.

### 4.3 Crear el usuario administrador (login del panel)

1. Menú lateral → **Compilación → Authentication** → **Comenzar**.
2. Pestaña **Sign-in method** → activa **Correo electrónico/contraseña** → Guardar.
3. Pestaña **Users** → **Add user**.
4. Escribe el correo y la contraseña que usará el personal, por ejemplo
   `admin@matildefacetdds.com` con una contraseña fuerte.
5. Guarda esas credenciales: son las que se usan en `admin.html`.

> Consejo: **no** dejes el registro público abierto. Crea los usuarios tú a mano desde aquí.

### 4.4 Activar Storage (para subir imágenes desde el panel)

1. Menú lateral → **Compilación → Storage** → **Comenzar** → modo producción → crear.
2. Se usará la carpeta `site/` para las imágenes del sitio.

### 4.5 Pegar las reglas de seguridad

1. **Firestore Database → pestaña Reglas** → borra el contenido → pega el contenido completo de
   `firestore.rules` → **Publicar**.
2. **Storage → pestaña Reglas** → borra el contenido → pega el contenido completo de
   `storage.rules` → **Publicar**.

Estas reglas permiten que cualquiera envíe una cita o un mensaje, pero que **solo el personal
con sesión iniciada** los lea o los edite. Los datos de pacientes son siempre privados.

### 4.6 Obtener las claves de configuración web

1. **Configuración del proyecto** (rueda dentada, arriba a la izquierda) → pestaña **General**.
2. Baja hasta **Tus apps** → pulsa el icono **`</>`** (Web) → dale un apodo → **Registrar app**.
3. Aparecerá un bloque `firebaseConfig`. Copia esos valores.

---

## 5. Paso 3 · Pegar tus claves

Abre `assets/js/firebase-config.js` y reemplaza los valores de ejemplo:

```js
window.FIREBASE_CONFIG = {
  apiKey:            "AIza…",
  authDomain:        "facet-dental.firebaseapp.com",
  projectId:         "facet-dental",
  storageBucket:     "facet-dental.appspot.com",
  messagingSenderId: "1234567890",
  appId:             "1:1234567890:web:abc123…"
};
```

Guarda, recarga el sitio y comprueba la consola del navegador. Debe aparecer:

```
[matildefacetdds.com] Firebase connected → facet-dental
```

> **¿Son secretas estas claves?** No. Las claves web de Firebase son públicas por diseño: la
> seguridad real la dan las **reglas** del paso 4.5. Nunca compartas en su lugar una clave de
> servicio (`serviceAccount.json`).

### Primera carga del contenido en la base de datos

1. Entra a `admin.html` e inicia sesión.
2. Ve a la pestaña **Contenido del sitio** y pulsa **Guardar cambios** una vez.
3. Eso copia todo el contenido inicial a Firestore. A partir de ahí, los cambios se ven en el
   sitio público para todos los visitantes.

---

## 6. Paso 4 · Publicar en tu hosting

El sitio es 100 % estático + Firebase, así que funciona en cualquier hosting.

### cPanel / hosting tradicional
1. Comprime el contenido del proyecto (los archivos, no la carpeta contenedora) en un `.zip`.
2. cPanel → **Administrador de archivos** → entra en `public_html` → **Cargar** → sube el zip → **Extraer**.
3. Listo. El sitio queda en `tudominio.com`.

### Vercel / Netlify
- Arrastra la carpeta del proyecto al panel de la plataforma, o conecta el repositorio.
- No hace falta comando de compilación ni carpeta de salida.

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
cd matildefacetdds
firebase init hosting        # public: .   (JS y HTML estáticos)
firebase deploy
```

### Conectar el dominio `matildefacetdds.com`
1. En el panel de tu hosting, apunta el dominio (o los DNS) a la carpeta donde subiste el sitio.
2. **Actualiza los enlaces canónicos**: en `index.html`, `appointment.html` y `contact.html`
   cambia las etiquetas `<link rel="canonical">` y `<meta property="og:url">` si el dominio final
   cambia.
3. En Firebase → **Authentication → Settings → Dominios autorizados**, añade tu dominio
   (`matildefacetdds.com` y `www.matildefacetdds.com`). **Paso obligatorio** para que el login
   del panel funcione en producción.

---

## 7. El panel de administración

**Dirección:** `https://tudominio.com/admin.html`

No está enlazado desde ninguna parte del sitio público y lleva `noindex`, así que no aparece en
Google. Aun así, la protección real es el usuario y la contraseña de Firebase.

### Qué puedes hacer

| Sección | Para qué sirve |
|---------|----------------|
| **Panel** | Resumen: citas nuevas, pacientes, mensajes sin leer, seguimientos pendientes |
| **Citas** | Ver todas las solicitudes, cambiar estado (nueva / confirmada / atendida / cancelada), nota interna, responder por correo o llamar, exportar a CSV |
| **Pacientes** | Crear y editar fichas, con datos de contacto, seguro, nacimiento y notas clínicas |
| **Seguimiento** | Recordatorios y contactos: canal, fecha objetivo, nota, marcar como completado |
| **Mensajes** | Mensajes de contacto y solicitudes de historial dental; marcar como leído/respondido |
| **Contenido del sitio** | **Todo** lo que se ve en la web: marca, colores, contacto, horarios, carrusel, servicios, sobre la doctora, ventajas, cifras, reseñas, preguntas, formularios, enlaces, redes y SEO |
| **Avanzado** | Editor JSON del documento completo, descargar copia de seguridad y restaurar valores de fábrica |

### Cómo editar texto e imágenes
1. **Contenido del sitio** → elige la pestaña (por ejemplo *Carrusel*).
2. Cada campo bilingüe tiene dos cajas: **EN** (inglés) y **ES** (español).
3. Para las imágenes puedes **pegar una URL** o pulsar **Subir** y elegir un archivo del equipo.
4. Pulsa **Guardar cambios**. Los cambios aparecen de inmediato en el sitio público.

### Colores
Pestaña **Colores**: cambia el color principal y todo el sitio (botones, iconos, degradados) se
actualiza automáticamente.

---

## 8. Cómo se guarda la información (Firestore)

| Colección | Contenido | Quién puede leer |
|-----------|-----------|------------------|
| `site/config` | Todo el contenido del sitio (documento único) | Público |
| `appointments` | Solicitudes de cita | Solo personal |
| `messages` | Mensajes de contacto y solicitudes de historial | Solo personal |
| `patients` | Fichas de pacientes | Solo personal |
| `followups` | Seguimiento de pacientes | Solo personal |

Ejemplo de documento en `appointments`:

```json
{
  "type": "appointment",
  "reason": "new-patient",
  "reasonLabel": "Soy paciente nuevo",
  "preferredDate": "2026-10-01",
  "preferredTime": "9:45 am",
  "firstName": "Ana",
  "lastName": "García",
  "email": "ana@example.com",
  "phone": "(301) 555-0199",
  "newPatient": true,
  "insurance": "yes",
  "preferredContact": "phone",
  "notes": "",
  "status": "new",
  "lang": "es",
  "createdAt": "…"
}
```

---

## 9. Seguridad y privacidad

- Las contraseñas las gestiona Firebase Authentication; el sitio nunca las almacena.
- Las reglas de `firestore.rules` bloquean por defecto todo lo que no esté permitido explícitamente.
- Los formularios públicos incluyen un campo trampa (*honeypot*) antispam y límite de tamaño.
- Los datos de pacientes son siempre privados: ningún visitante puede leerlos.

**Recomendaciones**
1. Crea una cuenta por persona del personal (no compartas una sola).
2. Activa la verificación en dos pasos en la cuenta de Google que administra Firebase.
3. En **Authentication → Settings**, deja activada la protección contra enumeración de correos.
4. Revisa los usuarios de Authentication una vez al año y elimina los que ya no trabajen allí.

---

## 10. Pendientes antes de publicar (importante)

1. **Reseñas**: las tres tarjetas de la sección *Reviews* son **marcadores de posición**.
   Sustitúyelas por reseñas reales de pacientes desde *Contenido del sitio → Reseñas*.
   No publiques testimonios inventados.
2. **Fotos reales**: las imágenes actuales son de referencia. Reemplázalas por fotografías
   reales del consultorio y de la doctora (*Contenido del sitio → Carrusel* y *Sobre la doctora*).
3. **Redes sociales**: la lista está vacía a propósito. Añade las cuentas reales en
   *Contenido del sitio → Redes sociales* (o déjala vacía; la sección se oculta sola).
4. **WhatsApp**: vacío por defecto. Si el consultorio tiene número de WhatsApp, escríbelo en
   *Contacto → WhatsApp* (solo números, con código de país, ejemplo `13015550199`). Mientras esté
   vacío, el botón flotante llama por teléfono.
5. **Correo de contacto**: hoy es `drfacet@verizon.net`. Si más adelante crean un correo con el
   dominio propio, actualízalo en *Contenido del sitio → Contacto*.
6. **Aviso de privacidad (HIPAA)**: si el sitio va a recopilar datos de salud, conviene publicar
   una página de aviso de privacidad y un consentimiento explícito. Hoy el formulario incluye una
   casilla de consentimiento genérica; hazla revisar por un asesor legal.
7. **Confirmación por correo**: cuando llegue una cita, el panel no envía correos automáticos.
   Si quieres avisos por correo, se puede añadir una Cloud Function (te lo puedo preparar).

---

## 11. Copias de seguridad

Desde **Avanzado → Descargar copia** obtienes un archivo `facet-dental-contenido.json` con todo
el contenido del sitio. Guárdalo antes de hacer cambios grandes; para restaurarlo, pégalo en el
editor JSON y pulsa **Guardar JSON**.

Para los datos de citas, pacientes y mensajes, usa los botones **Exportar CSV** de cada sección.

---

## 12. Notas técnicas

- Sin frameworks ni proceso de compilación: se edita un archivo, se sube y ya.
- Firebase se carga como módulo ES desde el CDN oficial (`gstatic.com`), siempre con versión fija.
- Si Firebase no está configurado, el sitio entra en **modo demostración** y sigue funcionando.
- El idioma se guarda en `localStorage` (`fd_lang`) y se detecta del navegador la primera vez.
- Tema claro, tipografías *Plus Jakarta Sans* + *Inter* desde Google Fonts.

---

*Última actualización: septiembre 2026.*

# Revisión detallada — matildefacetdds.com

**Sitio:** Facet Dental, PC — Dra. Matilde E. Facet, DDS
**URL:** https://www.matildefacetdds.com
**Plataforma:** Wix (Website Builder)
**Fecha de la revisión:** 27/09/2026
**Alcance:** 6 páginas públicas, HTML crudo, metadatos, SEO, accesibilidad, recursos y formularios.

---

## 1. Resumen ejecutivo

Es un sitio **pequeño y funcional de tipo folleto** (6 páginas), correcto en lo básico (HTTPS, responsive, contenido claro, horarios, formularios PDF), pero **desactualizado y con varios errores concretos que afectan la captación de pacientes**.

Los tres problemas más urgentes:

| # | Problema | Impacto | Severidad |
|---|----------|---------|-----------|
| 1 | Email de contacto roto en el inicio: el enlace apunta a `drfacet@verizon.netm` (sobra la "m") | El correo al hacer clic no llega a ningún lado | 🔴 Crítico |
| 2 | Iconos de redes sociales apuntan a las cuentas de Wix (`facebook.com/wix`, `twitter.com/wix`) e incluyen **Google+** (red cerrada en 2019) | Confusión y pérdida de credibilidad | 🔴 Crítico |
| 3 | Se anuncia un sitio bilingüe **inglés–español**, pero **el sitio está 100% en inglés** (sin versión ES) | Se pierde el público hispanohablante, que es un segmento explícitamente buscado | 🔴 Crítico |

Además, el sitio no se actualiza desde **el 15 de mayo de 2022**, no tiene SEO local (schema de negocio), le faltan metadescripciones en 5 de 6 páginas y no ofrece reserva de cita en línea.

---

## 2. Inventario del sitio

| Página | URL | Título (`<title>`) | Meta description |
|--------|-----|--------------------|------------------|
| Inicio | `/` | Matilde E Facet DDS \| Cosmetic&General Dentistry \| Silver Spring \|MD (72 car.) | Sí (débil) |
| About | `/about` | About Us \| matildefacetdds (26 car.) | ❌ Falta |
| Treatments | `/treatments` | Treatments \| matildefacetdds (28 car.) | ❌ Falta |
| Visit Us | `/visit-us` | Visit Us \| matildefacetdds (26 car.) | ❌ Falta |
| Opportunities | `/opportunities` | Patient Forms \| matildefacetdds (31 car.) | ❌ Falta |
| Links | `/links` | Links \| matildefacetdds (23 car.) | ❌ Falta |

Datos de contacto verificados (consistentes con los directorios externos Healthgrades y CareCredit):

- **Dirección:** 11161 New Hampshire Ave., Suite 205, Silver Spring, MD 20904
- **Teléfono:** (301) 593-5477 — **Fax:** (301) 593-5472 — **Emergencias fuera de horario:** (301) 807-1876
- **Email:** drfacet@verizon.net
- **Horario:** Lun–Jue 9:00am–4:00pm; Vie 9:00am–1:00pm (la doctora atiende el 1.er viernes de cada mes)

---

## 3. Bugs y errores concretos (corregir primero)

### 3.1 Email roto en el inicio 🔴
En la portada, el enlace visible dice `drfacet@verizon.net`, pero el `href` real es:

```
mailto:drfacet@verizon.netm    ← "m" sobrante
```

Al hacer clic se abre una dirección inválida. En la página `/visit-us` el mismo enlace está **correcto**, así que es un error aislado de la portada, fácil de corregir.

### 3.2 Redes sociales apuntando a Wix 🔴
Los iconos sociales del pie enlazan a:

```
http://www.facebook.com/wix
http://www.twitter.com/wix
```

Son los enlaces por defecto de la **plantilla de Wix**, no cuentas del consultorio. Además el tercer icono es **Google+**, red social descontinuada en 2019 (enlace muerto). Deben eliminarse o reemplazarse por redes reales del negocio (Facebook, Instagram, Google Business Profile).

### 3.3 Errores de contenido / ortografía
- "**Venners**" → debe ser "**Veneers**" (en Cosmetic Dentistry).
- "Dr. Facet was **indicted** into the Gamma Phi Delta" → debe ser "**inducted**" (en About).
- "**Advance** Procedures" → "**Advanced** Procedures".
- Bajo "Cosmetic Dentistry" aparece un subtítulo "**Cosmetic Surgery**", que clínicamente no corresponde a odontología estética.
- El color de marca de los titulares es inconsistente (`#5B5FBD` en el H1 y `#1C25ED` en un H2).

### 3.4 Metadatos de redes sociales incompletos
- `twitter:card` está declarado como `summary_large_image`, **pero no existe `og:image`**. Al compartir el enlace, no se mostrará ninguna imagen de vista previa.
- Faltan `og:image` y una imagen social (ideal 1200×630 px).

---

## 4. SEO

**Lo que está bien:**
- Título de la portada con keywords relevantes ("Cosmetic & General Dentistry", "Silver Spring, MD").
- `robots.txt` correcto y `sitemap.xml` válido.
- URL canónica definida en todas las páginas.
- `html lang="en"`, viewport correcto.

**Problemas y oportunidades:**

| Hallazgo | Detalle |
|----------|---------|
| 5 de 6 páginas sin meta description | Google genera snippets automáticos y pobres. |
| Títulos genéricos | "About Us \| matildefacetdds" no aporta keywords locales. Deberían incluir "Dentist / Silver Spring, MD". |
| Sin datos estructurados de negocio | Solo hay un `WebSite` genérico. **Falta `LocalBusiness`/`Dentist`** con dirección, teléfono, horarios y geo → pierde rich results y posicionamiento local. |
| Sin páginas de servicio individuales | Todo el contenido de tratamientos vive en una sola URL (`/treatments`) sin anclas indexables → menos superficie de posicionamiento (p. ej. "implantes dentales Silver Spring"). |
| Sin NAP estructurado | El nombre/dirección/teléfono aparecen como texto suelto, sin datos estructurados que los validen. |
| Sin enlace a Google Business Profile | No hay CTA a reseñas ni ficha de Google. |
| Imágenes sin texto alternativo | En la portada, **7 de 10 imágenes tienen `alt=""`**; los únicos alt con texto son de los iconos sociales ("b-facebook", "b-googleplus"). |
| Contenido duplicado en la navegación | El menú "Dental Health / Cosmetic Dentistry / Advance Procedures / FAQ" lleva todo a la misma página `/treatments`. |
| Última actualización: 2022-05-15 | Contenido sin refrescar en más de 4 años. |

---

## 5. Rendimiento y aspectos técnicos

**Bien:**
- HTTPS con `Strict-Transport-Security` (HSTS), `X-Content-Type-Options: nosniff`, CDN (Cloudflare) y buena caché.
- Tiempo de respuesta inicial ≈ **1,2 s** (aceptable).

**Mejorable (propio de Wix, pero relevante):**
- El HTML inicial pesa **≈ 376 KB** para un sitio de folleto — muy alto.
- **62 etiquetas `<script>`** y **11 archivos JS externos**; 14 bloques `<style>` inline y 0 hojas de estilo separadas.
- Imágenes servidas sin `loading="lazy"` generalizado y con `alt` vacío.

> Recomendación: si en algún momento se evalúa migrar, un sitio estático ligero cargaría en una fracción del peso. Mientras se use Wix, conviene comprimir imágenes y revisar qué apps/embeds generan scripts innecesarios.

---

## 6. Experiencia de usuario y conversión

| Punto | Situación | Recomendación |
|-------|-----------|---------------|
| Reserva de cita | **No existe** sistema de agendado en línea; solo un formulario y el teléfono | Añadir botón "Book Appointment" (Wix Bookings o link a agenda) |
| Teléfono | Aparece como texto, **sin enlace `tel:`** | Envolver en `tel:+13015935477` para llamada con un toque en móvil |
| Email | `drfacet@verizon.net` es poco profesional | Considerar dominio propio (`info@matildefacetdds.com`) |
| Formulario de contacto | Mensaje estático "Your details were sent successfully!" | **Probar** que los envíos lleguen realmente a una bandeja revisada |
| Mapa | Solo una **imagen estática** de Google Maps | Insertar mapa interactivo embebido + botón "Get Directions" |
| Horario | Detallado solo en `/visit-us` | Mostrarlo también en la portada |
| CTA en portada | No hay llamada a la acción clara | Añadir "Call now" / "Book online" visible arriba |

---

## 7. Contenido y confianza

- El texto de tratamientos es **denso y clínico**, copiado de plantillas genéricas (el FAQ parece adaptado de material estándar de asociaciones dentales). Conviene reescribirlo con lenguaje cercano y orientado al paciente.
- **Falta contenido que genera confianza:** fotos reales del consultorio y del equipo (hay pocas), testimonios de pacientes, lista de **seguros aceptados**, y mención a **financiamiento** (CareCredit ya lo lista en su directorio, pero el sitio no lo menciona).
- Se destaca que "Dr. Facet and her staff are english-spanish bilingual", pero **no hay versión en español del sitio** — contradicción que conviene resolver con una versión ES o al menos páginas clave traducidas.
- La biografía de la doctora está bien estructurada (formación en University of Maryland, práctica propia desde 2012), pero contiene el error "indicted".

---

## 8. Plan de acción priorizado

**Inmediato (esta semana)**
1. Corregir el email roto de la portada (`netm` → `net`).
2. Eliminar / reemplazar los iconos sociales de Wix y el icono de Google+.
3. Añadir `og:image` (1200×630) para que los enlaces compartidos muestren imagen.
4. Corregir las erratas: "Venners" → "Veneers", "indicted" → "inducted", "Advance" → "Advanced".

**Corto plazo (1–2 semanas)**
5. Escribir meta description única para las 5 páginas faltantes y mejorar los títulos con "Dentist | Silver Spring, MD".
6. Añadir `alt` descriptivo a todas las imágenes de contenido.
7. Convertir el teléfono en enlace `tel:` y añadir CTA "Call / Book" en la portada.
8. Implementar schema **`Dentist` / `LocalBusiness`** con dirección, horario y teléfono.

**Mediano plazo (1 mes)**
9. Crear una página por servicio (implantes, blanqueamiento, coronas, etc.) para SEO.
10. Añadir sistema de reserva en línea y mapa interactivo.
11. Crear versión en español del sitio (o al menos de Home, About y Contact).
12. Añadir testimonios, lista de seguros aceptados y mención a financiamiento.

---

## 9. Notas metodológicas

- Contenido y metadatos obtenidos vía HTTP directo del sitio (`/`, `/about`, `/treatments`, `/visit-us`, `/opportunities`, `/links`) y su `sitemap.xml` / `pages-sitemap.xml`.
- Verificado que los 4 PDF de formularios descargan correctamente (HTTP 200).
- Datos de contacto contrastados con directorios públicos (Healthgrades, CareCredit).
- No se accedió al panel de Wix ni a analíticas internas; las mediciones de rendimiento son de la respuesta HTTP inicial, no de una auditoría Lighthouse completa.

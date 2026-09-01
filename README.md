# 🌌 Cielo de cumpleaños

Un sitio estático para juntar mensajes, audios, videos y fotos de cumpleaños de varias personas, y mostrarlos como un cielo de estrellas — cada quien deja su estrella donde quiere, y las de una misma persona se conectan formando su propia constelación.

No tiene servidor propio: es HTML/CSS/JS puro, con [Supabase](https://supabase.com) como backend (base de datos + almacenamiento de archivos), así que se puede publicar en GitHub Pages, Netlify o cualquier hosting estático.

## Las dos páginas

- **`enviar.html`** — la página pública, sin clave. Cualquiera con el link toca el punto del cielo donde quiere dejar su estrella, elige qué dejar (mensaje, audio, video o foto) y la envía. Puede dejar varias estrellas, pero nunca ve las de los demás — solo las suyas.
- **`index.html`** — el "cielo final", protegido con una clave. Muestra todas las estrellas de todas las personas, agrupadas por quien las envió y conectadas con líneas formando constelaciones. Es la que se le revela a la persona que cumple años.

## Cómo funciona el cielo

El cielo se arma por capas:

1. `assets/fondo.png` — el fondo (mapa estelar).
2. `assets/capa-efectos.png` — efectos encima del fondo (galaxia, estrella fugaz, lunas).
3. Las estrellas — cada una es uno de tres diseños (`assets/estrella-1.png`, `estrella-2.png`, `estrella-3.png`), asignado al azar, ubicado en el punto exacto donde la persona tocó.

Reglas al colocar una estrella nueva (en `enviar.html`):

- **Zona de seguridad**: no se puede poner una estrella encima de otra ya existente.
- **Radio de constelación**: si la persona ya dejó una estrella antes, las siguientes deben quedar cerca de la primera, para que se forme una constelación con líneas entre ellas.
- El **nombre y correo** se piden una sola vez y quedan guardados en el navegador; el correo es lo que identifica a cada persona entre visitas (para agrupar sus estrellas), pero nunca se muestra a nadie.

## Estructura del proyecto

```
├── index.html               # Cielo final (con clave)
├── enviar.html               # Formulario público para dejar una estrella
├── config.js                  # Único archivo que se edita normalmente (Supabase, clave, textos, límites)
├── comun.js                   # Funciones compartidas entre las dos páginas
├── estilos.css                 # Estilos de ambas páginas
├── supabase-setup.sql        # Script para crear la tabla, la vista y los permisos en Supabase
├── GUIA-DE-INSTALACION.md   # Guía paso a paso (sin tecnicismos) para publicarlo
└── assets/                    # Imágenes: capas del cielo, diseños de estrella, título, etc.
```

## Puesta en marcha

La guía completa, pensada para alguien sin experiencia técnica, está en [`GUIA-DE-INSTALACION.md`](./GUIA-DE-INSTALACION.md). En resumen:

1. Crear un proyecto en Supabase y correr `supabase-setup.sql` en su SQL Editor (crea la tabla `estrellas`, la vista `estrellas_publicas` y los permisos).
2. Crear los buckets privados `imagenes`, `audios` y `videos` en Supabase Storage (el sitio genera links firmados temporales para mostrarlos, no usa links públicos fijos).
3. Completar `config.js` con la URL y la llave "anon" del proyecto de Supabase, la clave de acceso y el nombre de quien cumple años.
4. Publicar la carpeta completa en GitHub Pages, Netlify o el hosting que prefieras.

## Personalizar

- **Colores y tipografías**: en `estilos.css`, dentro de `:root{ ... }`.
- **Textos, clave de acceso, límites de archivo**: en `config.js`.
- **Qué tan separadas deben quedar las estrellas / qué tan grande puede ser una constelación**: `ZONA_SEGURIDAD_PX` y `RADIO_CONSTELACION_PX` en `config.js`.
- **Cuánto dura activo el link de una foto/audio/video**: `URL_FIRMADA_SEGUNDOS` en `config.js`.

## Privacidad

Quien deja un mensaje en `enviar.html` ve las estrellas de los demás como puntos genéricos (sin nombre ni contenido, solo para no ubicar la suya encima) y solo puede abrir las que él mismo envió. Al igual que la clave de `index.html`, esto es una protección a nivel de la página pensada para una sorpresa entre amigos y familia — no es una seguridad de nivel productivo, ya que el proyecto usa una sola llave pública de Supabase para todo el sitio.

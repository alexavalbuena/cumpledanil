# Guía: Cielo de cumpleaños 🌌✨

Esta guía te lleva paso a paso desde lo que tienes ahora mismo hasta tener el sitio publicado con un link que puedas compartir. No necesitas saber programar: son clics y copiar/pegar.

Tiempo estimado: 20-30 minutos, una sola vez.

## Cómo funciona ahora (cielo por capas + estrellas a mano)

El cielo ya no es una sola imagen con estrellas dibujadas: ahora son varias capas independientes:

- **assets/fondo.png** — el cielo de fondo (el mapa estelar azul).
- **assets/capa-efectos.png** — los efectos que van encima (la galaxia, la estrella fugaz, las lunas).
- **assets/estrella-1.png, estrella-2.png, estrella-3.png** — los 3 diseños de estrella. Cada vez que alguien deja un mensaje, el sitio le asigna uno de los tres al azar (la persona no elige el diseño).

En `enviar.html`, la persona ya no toca una estrella decorativa fija: **toca el punto exacto del cielo donde quiere dejar su estrella**. El sitio no deja poner una estrella encima de otra (hay una "zona de seguridad" alrededor de cada estrella existente) y, si esa persona ya dejó una estrella antes, las siguientes tienen que quedar cerca de la primera (aparece un círculo dorado punteado como guía) para que se forme una constelación con líneas conectándolas — igual que antes, pero ahora la posición la elige la persona, no el sitio.

Para identificar a cada persona (y que sus estrellas se agrupen entre sí aunque vuelva otro día a dejar más), `enviar.html` ahora pide **nombre y correo** la primera vez, y los recuerda en ese navegador para la próxima vez.

> **Sobre la privacidad en `enviar.html`:** quien deja un mensaje ve en el cielo las estrellas de los demás como puntitos genéricos (para saber dónde no puede poner la suya), pero nunca ve el nombre ni el contenido de esas estrellas — solo puede abrir las suyas. Esto es una restricción a nivel de la página, no una seguridad a prueba de todo (como ya pasaba con la clave de `index.html`, que tampoco es de nivel bancario): alguien muy técnico que abra las herramientas de desarrollador de su navegador podría llegar a ver más. Para una sorpresa de cumpleaños entre amigos y familia, es un nivel de cuidado más que razonable.

## Qué archivos tienes

El sitio son **dos páginas separadas**, para que quien deja un mensaje no vea la sorpresa:

- **enviar.html** — la página que le compartes a todas las personas que van a dejar un mensaje. No pide ninguna clave: quien tenga el link entra directo, toca el cielo para elegir dónde dejar su estrella, y puede dejar varias (mensaje, audio, video o foto) sin ver lo que dejaron los demás.
- **index.html** — el "cielo final", con todas las estrellas de todas las personas, agrupadas y conectadas por constelaciones. Esta sí pide una clave, para que quede oculta hasta que tú se la reveles a la cumpleañera.
- **config.js** — el único archivo que vas a editar (ahí van tu clave, el nombre de la cumpleañera y los datos de Supabase). Lo usan las dos páginas, así que solo lo cambias una vez.
- **comun.js** y **estilos.css** — el motor y el diseño detrás de ambas páginas. No necesitas tocarlos.
- **assets/** — las imágenes: el fondo, la capa de efectos, los 3 diseños de estrella, el título de bienvenida, etc.
- **supabase-setup.sql** — el script que crea la "base de datos" donde se guardan los mensajes.
- **Esta guía.**

Puedes abrir `enviar.html` o `index.html` haciendo doble clic ahora mismo para ver cómo se ven. Van a funcionar en "modo de vista previa" (verás un aviso amarillo arriba) porque todavía no está conectado a Supabase — en ese modo, lo que agregues solo se guarda en tu propio navegador, no se comparte con nadie más. Eso es normal y esperado en este punto.

Solo `index.html` (el cielo final) pide clave — esa la usas tú para revisar el resultado y la que le compartes a la cumpleañera el día de la sorpresa. `enviar.html` es de acceso libre, para que sea fácil compartirlo con todos los invitados.

---

## Paso 1 — Crear tu proyecto en Supabase

1. Entra a **supabase.com** y crea una cuenta gratis (con Google o correo).
2. Clic en **"New project"**.
   - Nombre: por ejemplo `cielo-cumple`
   - Contraseña de base de datos: elige una y guárdala en un lugar seguro (no me la compartas a mí, no la necesito).
   - Región: la más cercana a ti.
3. Espera 1-2 minutos mientras Supabase prepara el proyecto.

## Paso 2 — Crear la tabla de mensajes

1. En el menú lateral, ve a **SQL Editor** → **New query**.
2. Abre el archivo `supabase-setup.sql` (que te dejé aquí), copia todo su contenido y pégalo en el editor.
3. Dale clic a **Run** (▶). Deberías ver "Success. No rows returned".

Si ya habías creado el proyecto antes de este cambio (con la versión anterior del sitio), no pasa nada: vuelve a pegar el `supabase-setup.sql` nuevo y corre el script de nuevo. Es seguro correrlo más de una vez — solo agrega las columnas y la vista que faltan (correo, posición en el cielo, diseño de estrella), no borra ningún mensaje que ya tengas guardado.

## Paso 3 — Crear los buckets de almacenamiento (para fotos, audios y videos)

1. En el menú lateral, ve a **Storage**.
2. Clic en **New bucket** → nombre `imagenes` → activa **"Public bucket"** → crear.
3. Repite: **New bucket** → nombre `audios` → activa **"Public bucket"** → crear.
4. Repite otra vez: **New bucket** → nombre `videos` → activa **"Public bucket"** → crear.
5. Si pegaste el archivo `supabase-setup.sql` completo en el paso 2, las políticas para estos tres buckets ya quedaron creadas y no necesitas hacer nada más aquí. Si no, vuelve al **SQL Editor** y ejecuta de nuevo el archivo completo — es seguro correrlo más de una vez.

## Paso 4 — Copiar tus llaves de conexión

1. En el menú lateral, ve a **Project Settings** (ícono de engranaje) → **API**.
2. Vas a ver dos datos que necesitas:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon public** key (una llave larga de letras y números)
3. Cópialos, los vas a necesitar en el paso siguiente.

> Estos datos son seguros para usar en el sitio web público: la llave "anon" está diseñada para eso, y las reglas que creamos en el paso 2 controlan exactamente qué puede hacer cualquier visitante (leer y agregar estrellas, nada más).

## Paso 5 — Conectar el sitio con Supabase

1. Abre el archivo **`config.js`** con un editor de texto simple (en Windows: clic derecho → Abrir con → Bloc de notas; en Mac: clic derecho → Abrir con → TextEdit, o mejor con una app como VS Code o Notepad++ si tienes).
2. Reemplaza:
   - `SUPABASE_URL` por tu Project URL (entre comillas).
   - `SUPABASE_ANON_KEY` por tu anon public key (entre comillas).
   - `ACCESS_PASSWORD` por la clave que quieras compartir con la gente (por ejemplo `"cumpleluna25"`). Esta misma clave sirve para las dos páginas.
   - `BIRTHDAY_NAME` por el nombre de la persona, si quieres que aparezca en los títulos (por ejemplo `"Vale"`).
3. Guarda el archivo.
4. Abre `enviar.html` o `index.html` de nuevo con doble clic: el aviso amarillo de "vista previa" ya no debería aparecer, y ahora los mensajes se guardan de verdad para todo el mundo.

   Aprovecha y revisa también estos otros valores del mismo archivo:
   - `ACCESS_PASSWORD`: la clave para entrar a `index.html` (el cielo final). `enviar.html` no la pide.
   - `MAX_VIDEO_MB`: el tamaño máximo de video que se puede subir (por defecto 40 MB, pensado para clips cortos de ~30 segundos).
   - `ZONA_SEGURIDAD_PX`: qué tan separadas deben quedar dos estrellas en pantalla para que no se encimen (por defecto 64).
   - `RADIO_CONSTELACION_PX`: qué tan lejos de su primera estrella puede alguien poner las siguientes (por defecto 240). Si quieres constelaciones más grandes o más juntas, sube o baja este número.

Como `config.js` es un solo archivo compartido, con editarlo una vez ya quedan conectadas las dos páginas.

Si me pasas la URL y la anon key en el chat, yo mismo puedo dejarte el archivo ya conectado y probado — como prefieras.

---

## Paso 6 — Publicarlo con un link (Netlify o GitHub Pages)

Como todo el sitio es HTML/CSS/JS sin servidor propio, puedes publicarlo con cualquiera de las dos opciones:

**Netlify** (más simple):
1. Entra a **netlify.com** y crea una cuenta gratis (o entra directo a **app.netlify.com/drop** para publicar sin cuenta).
2. Arrastra la carpeta completa del proyecto (con `index.html`, `enviar.html`, `config.js`, `comun.js`, `estilos.css` y la carpeta `assets` adentro) a la zona de "arrastra tu carpeta aquí".
3. En unos segundos te da un link público, algo como `https://nombre-al-azar.netlify.app`.

**GitHub Pages** (si prefieres tenerlo en un repositorio):
1. Sube la carpeta del proyecto a un repositorio de GitHub.
2. Ve a **Settings → Pages**, elige la rama (`main`) y la carpeta raíz.
3. GitHub te da un link como `https://tu-usuario.github.io/tu-repositorio/`.

Con cualquiera de las dos, vas a tener **dos links** dentro del mismo sitio:
   - `.../enviar.html` → para las personas que van a dejar un mensaje (sin clave, para que sea fácil de compartir).
   - `.../` (o `/index.html`) → el cielo final, protegido con clave, para revelar el día de la sorpresa.

## Cómo compartir cada link

A la gente que va a dejar un mensaje:

> "Entra a https://tu-sitio/enviar.html y déjale una estrella a Dani 🌟 Toca el cielo donde quieras ponerla. Puede ser un mensaje, un audio, un video o una foto. ¡Es una sorpresa, no se lo cuentes!"

A la cumpleañera, el día de la sorpresa:

> "Entra a https://tu-sitio y usa la clave `cumpleluna25` para ver tu cielo de mensajes ✨"

## Si necesitas borrar o corregir un mensaje

1. Entra a tu proyecto en Supabase → **Table Editor** → tabla `estrellas`.
2. Ahí ves todas las filas (nombre, correo, mensaje, posición en el cielo, etc.). Puedes editar o borrar directamente desde ahí con clic derecho sobre la fila.

## Actualizar el sitio después de publicado

Si cambias algo en `config.js` (por ejemplo la clave, o el nombre), vuelve a subir la carpeta completa (arrástrala de nuevo a Netlify, o sube el cambio a GitHub) y se actualiza sola.

---

## Preguntas frecuentes

**¿Es 100% segura la clave de acceso?**
No es una seguridad de nivel bancario — es una pantalla simple para desalentar que alguien entre por accidente o curiosidad. Para una sorpresa de cumpleaños entre amigos y familia es más que suficiente.

**¿Cuánta gente puede usarlo / cuántos mensajes soporta?**
El plan gratuito de Supabase y Netlify soporta tranquilamente cientos de mensajes con fotos y audios cortos para un evento como este.

**¿Puedo cambiar colores o textos?**
Sí. Dentro de `estilos.css`, cerca del inicio, hay una sección `:root{ ... }` con los colores en formato `--nombre: #codigo;`. Puedes cambiarlos con cuidado. Si prefieres, dime qué quieres cambiar y te dejo el archivo ya ajustado.

**¿Por qué son dos páginas y no una sola?**
Para que la sorpresa quede intacta: quienes dejan un mensaje en `enviar.html` nunca ven el cielo completo, y la cumpleañera solo ve el resultado final en `index.html` el día que tú decidas compartírselo.

**¿Por qué `enviar.html` no pide clave?**
Fue un ajuste a tu pedido, para que compartir el link con muchos invitados sea más simple. Como esa página nunca muestra los mensajes de los demás, no hay sorpresa que cuidar ahí — solo `index.html` (el cielo final) queda protegido.

**¿Para qué se pide el correo, si nunca se muestra?**
Para identificar a cada persona entre visitas: así, si alguien vuelve otro día a dejar una segunda estrella, el sitio sabe que es la misma persona y la agrupa junto a la primera, formando su constelación. El correo no se muestra a nadie más, solo se usa internamente para agrupar.

**¿Cómo se agrupan las estrellas en el cielo?**
Todas las estrellas de la misma persona aparecen juntas, formando su propia pequeña constelación, con su nombre y una flechita (→) señalándolas — así se ve fácilmente quién dejó qué, aunque haya enviado varias. En `enviar.html`, la persona elige dónde va cada estrella tocando el cielo; el sitio solo la obliga a dejarlas cerca de la primera que puso, para que la constelación se vea bien formada.

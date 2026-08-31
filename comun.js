/* =========================================================================
   COMUN.JS — funciones compartidas entre enviar.html y index.html (cielo).
   No necesitas editar este archivo: los ajustes se hacen en config.js
   ========================================================================= */

// Tamaño real (en px) de assets/fondo-estrellas.jpg. El cielo se muestra a
// pantalla completa, así que casi nunca tiene las mismas proporciones que
// la imagen — mapearPuntoAFondo() usa este tamaño para calcular qué parte
// de la imagen recorta background-size:cover en cada pantalla.
const IMG_FONDO_ANCHO = 2360, IMG_FONDO_ALTO = 1640;

// Coordenadas (en % de ancho/alto de la IMAGEN, no de la pantalla) de los
// 32 elementos clickeables dibujados en assets/fondo-estrellas.jpg: 29
// estrellas (id 1-29) y 3 planetas/lunas (id 30-32, los círculos con
// textura de cráteres). Se tratan exactamente igual — se usan para que
// las estrellas clickeables (tanto las decorativas de enviar.html como
// las reales de index.html) queden exactamente sobre los dibujos de la
// ilustración — siempre pasadas por mapearPuntoAFondo() antes de
// dibujarlas, para corregir el recorte de pantalla completa.
const COORDENADAS_ESTRELLAS_FONDO = [
  { id: 1, x: 17.5, y: 8.0 },
  { id: 2, x: 54.6, y: 10.2 },
  { id: 3, x: 26.4, y: 14.6 },
  { id: 4, x: 78.3, y: 21.4 },
  { id: 5, x: 95.3, y: 20.7 },
  { id: 6, x: 97.2, y: 21.0 },
  { id: 7, x: 21.0, y: 27.3 },
  { id: 8, x: 33.0, y: 24.4 },
  { id: 9, x: 40.4, y: 25.7 },
  { id: 10, x: 94.6, y: 22.9 },
  { id: 11, x: 31.9, y: 29.6 },
  { id: 12, x: 90.6, y: 28.0 },
  { id: 13, x: 17.9, y: 34.5 },
  { id: 14, x: 52.9, y: 35.0 },
  { id: 15, x: 40.3, y: 39.1 },
  { id: 16, x: 65.1, y: 40.9 },
  { id: 17, x: 37.3, y: 46.9 },
  { id: 18, x: 49.7, y: 42.7 },
  { id: 19, x: 44.2, y: 50.8 },
  { id: 20, x: 60.2, y: 50.5 },
  { id: 21, x: 45.0, y: 61.5 },
  { id: 22, x: 11.2, y: 66.9 },
  { id: 23, x: 82.6, y: 64.8 },
  { id: 24, x: 7.9, y: 70.1 },
  { id: 25, x: 81.2, y: 71.4 },
  { id: 26, x: 67.9, y: 76.1 },
  { id: 27, x: 82.6, y: 73.3 },
  { id: 28, x: 43.8, y: 84.5 },
  { id: 29, x: 11.7, y: 91.9 },
  { id: 30, x: 55.2, y: 79.1 },
  { id: 31, x: 62.2, y: 88.6 },
  { id: 32, x: 70.4, y: 92.4 },
];

// Convierte un punto en % de la IMAGEN original (fondo-estrellas.jpg,
// 2360x1640) a un punto en % del CONTENEDOR donde se muestra esa imagen
// como fondo con background-size:cover. Cuando el contenedor es pantalla
// completa, sus proporciones casi nunca son iguales a las de la imagen,
// así que "cover" recorta una parte — esta función calcula exactamente
// qué parte se recorta, para que la estrella siga cayendo sobre el mismo
// lugar de la imagen sin importar el tamaño de pantalla.
function mapearPuntoAFondo(xImgPct, yImgPct, contenedorAncho, contenedorAlto){
  if (!contenedorAncho || !contenedorAlto) return { x: xImgPct, y: yImgPct };
  const escala = Math.max(contenedorAncho / IMG_FONDO_ANCHO, contenedorAlto / IMG_FONDO_ALTO);
  const anchoEscalado = IMG_FONDO_ANCHO * escala;
  const altoEscalado = IMG_FONDO_ALTO * escala;
  const offsetX = (contenedorAncho - anchoEscalado) / 2;
  const offsetY = (contenedorAlto - altoEscalado) / 2;
  const px = offsetX + (xImgPct / 100) * anchoEscalado;
  const py = offsetY + (yImgPct / 100) * altoEscalado;
  return {
    x: (px / contenedorAncho) * 100,
    y: (py / contenedorAlto) * 100,
  };
}

const SUPABASE_CONFIGURADO =
  typeof CONFIG !== 'undefined' &&
  CONFIG.SUPABASE_URL && !CONFIG.SUPABASE_URL.startsWith("PEGA_AQUI") &&
  CONFIG.SUPABASE_ANON_KEY && !CONFIG.SUPABASE_ANON_KEY.startsWith("PEGA_AQUI");

let sb = null;
if (SUPABASE_CONFIGURADO && window.supabase) {
  sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
}

/* ============================= Utilidades ============================= */
function mostrarToast(texto, duracionMs = 2600){
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = texto;
  toast.classList.add('mostrar');
  clearTimeout(mostrarToast._t);
  mostrarToast._t = setTimeout(() => toast.classList.remove('mostrar'), duracionMs);
}

function formatearFecha(iso){
  try{
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' });
  }catch(e){ return ''; }
}

// Generador pseudoaleatorio con semilla, para que cada estrella siempre
// caiga en la misma posición aunque se recargue la página.
function prngDesdeTexto(texto){
  let h = 1779033703 ^ texto.length;
  for (let i = 0; i < texto.length; i++){
    h = Math.imul(h ^ texto.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function(){
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

async function subirArchivo(bucket, archivoOBlob, nombreSugerido){
  const ext = (nombreSugerido && nombreSugerido.includes('.')) ? nombreSugerido.split('.').pop() : (archivoOBlob.type && archivoOBlob.type.includes('webm') ? 'webm' : 'dat');
  const ruta = `${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage.from(bucket).upload(ruta, archivoOBlob);
  if (error) throw error;
  const { data } = sb.storage.from(bucket).getPublicUrl(ruta);
  return data.publicUrl;
}

/* ============================= Modales genéricos ============================= */
function abrirModal(id){ document.getElementById(id).classList.remove('oculto'); document.body.style.overflow='hidden'; }
function cerrarModal(id){
  document.getElementById(id).classList.add('oculto');
  document.body.style.overflow='';
  const audio = document.getElementById('ver-audio');
  if (audio) audio.pause();
  const video = document.getElementById('ver-video');
  if (video) video.pause();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-cerrar]').forEach(btn => {
    btn.addEventListener('click', () => cerrarModal(btn.dataset.cerrar));
  });
  document.querySelectorAll('.modal-fondo').forEach(fondo => {
    fondo.addEventListener('click', (e) => { if (e.target === fondo) cerrarModal(fondo.id); });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape'){
      document.querySelectorAll('.modal-fondo:not(.oculto)').forEach(f => cerrarModal(f.id));
    }
  });
});

/* ============================= Pantalla de acceso (contraseña) =============================
   Ambas páginas (enviar.html e index.html) usan la misma pantalla de acceso.
   Cada página llama a configurarPantallaAcceso(callback) y el callback se
   ejecuta solo si la clave es correcta. */
function configurarPantallaAcceso(alEntrar){
  const pantallaAcceso = document.getElementById('pantalla-acceso');
  const inputClave = document.getElementById('input-clave');
  const errorClave = document.getElementById('error-clave');
  const tarjetaAcceso = document.getElementById('tarjeta-acceso');

  function intentarEntrar(){
    const valor = (inputClave.value || '').trim();
    if (valor.toLowerCase() === CONFIG.ACCESS_PASSWORD.trim().toLowerCase() && valor.length > 0){
      pantallaAcceso.style.display = 'none';
      alEntrar();
    } else {
      errorClave.textContent = 'Esa clave no es correcta. Intenta de nuevo.';
      tarjetaAcceso.classList.remove('shake');
      void tarjetaAcceso.offsetWidth;
      tarjetaAcceso.classList.add('shake');
    }
  }
  document.getElementById('boton-entrar').addEventListener('click', intentarEntrar);
  inputClave.addEventListener('keydown', (e) => { if (e.key === 'Enter') intentarEntrar(); });
}

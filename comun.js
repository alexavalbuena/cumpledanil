const IMG_FONDO_ANCHO = 2360, IMG_FONDO_ALTO = 1640;

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

function mapearClickAImagen(clickXpx, clickYpx, contenedorAncho, contenedorAlto){
  if (!contenedorAncho || !contenedorAlto) return { x: 50, y: 50 };
  const escala = Math.max(contenedorAncho / IMG_FONDO_ANCHO, contenedorAlto / IMG_FONDO_ALTO);
  const anchoEscalado = IMG_FONDO_ANCHO * escala;
  const altoEscalado = IMG_FONDO_ALTO * escala;
  const offsetX = (contenedorAncho - anchoEscalado) / 2;
  const offsetY = (contenedorAlto - altoEscalado) / 2;
  const x = ((clickXpx - offsetX) / anchoEscalado) * 100;
  const y = ((clickYpx - offsetY) / altoEscalado) * 100;
  return {
    x: Math.min(100, Math.max(0, x)),
    y: Math.min(100, Math.max(0, y)),
  };
}

function puntoEstrellaAPx(estrella, contenedorAncho, contenedorAlto){
  const m = mapearPuntoAFondo(estrella.x, estrella.y, contenedorAncho, contenedorAlto);
  return { x: (m.x / 100) * contenedorAncho, y: (m.y / 100) * contenedorAlto };
}

function elegirDisenoAleatorio(){
  return Math.floor(Math.random() * 3) + 1;
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

function esCorreoValido(valor){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((valor || '').trim());
}

const CLAVE_IDENTIDAD_GUARDADA = 'cielo_identidad_v1';

function obtenerIdentidadGuardada(){
  try{
    const bruto = localStorage.getItem(CLAVE_IDENTIDAD_GUARDADA);
    if (!bruto) return null;
    const datos = JSON.parse(bruto);
    if (datos && datos.nombre && datos.correo) return datos;
  }catch(e){}
  return null;
}

function guardarIdentidad(nombre, correo){
  try{ localStorage.setItem(CLAVE_IDENTIDAD_GUARDADA, JSON.stringify({ nombre, correo })); }catch(e){}
}

function limpiarIdentidadGuardada(){
  try{ localStorage.removeItem(CLAVE_IDENTIDAD_GUARDADA); }catch(e){}
}

async function subirArchivo(bucket, archivoOBlob, nombreSugerido){
  const ext = (nombreSugerido && nombreSugerido.includes('.')) ? nombreSugerido.split('.').pop() : (archivoOBlob.type && archivoOBlob.type.includes('webm') ? 'webm' : 'dat');
  const ruta = `${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage.from(bucket).upload(ruta, archivoOBlob);
  if (error) throw error;
  return ruta;
}

function extraerRutaStorage(valor){
  const marcador = '/object/public/';
  const idx = valor.indexOf(marcador);
  if (idx === -1) return valor;
  const resto = valor.slice(idx + marcador.length);
  const barra = resto.indexOf('/');
  return barra === -1 ? resto : resto.slice(barra + 1);
}

async function resolverUrlFirmada(bucket, valor){
  if (!valor) return null;
  if (!sb) return valor;
  const ruta = extraerRutaStorage(valor);
  const segundos = (typeof CONFIG !== 'undefined' && CONFIG.URL_FIRMADA_SEGUNDOS) || 3600;
  const { data, error } = await sb.storage.from(bucket).createSignedUrl(ruta, segundos);
  if (error){ console.error(error); return null; }
  return data.signedUrl;
}

function agruparPorCorreo(estrellas){
  const grupos = [];
  const indice = new Map();
  estrellas.forEach((estrella) => {
    const clave = (estrella.email || '').trim().toLowerCase();
    if (!indice.has(clave)){
      indice.set(clave, grupos.length);
      grupos.push({ correo: clave, nombre: estrella.nombre || '?', estrellas: [] });
    }
    grupos[indice.get(clave)].estrellas.push(estrella);
  });
  return grupos;
}

function dibujarLineasEnSvg(svgEl, estrellas, anchoPx, altoPx){
  svgEl.setAttribute('viewBox', `0 0 ${anchoPx} ${altoPx}`);
  svgEl.innerHTML = '';
  if (!estrellas || estrellas.length < 2) return;

  const grupos = agruparPorCorreo(estrellas);
  grupos.forEach((grupo) => {
    const lista = grupo.estrellas;
    if (lista.length < 2) return;
    for (let i = 0; i < lista.length; i++){
      const distancias = [];
      for (let j = 0; j < lista.length; j++){
        if (i === j) continue;
        const dx = lista[i].x - lista[j].x, dy = lista[i].y - lista[j].y;
        distancias.push({ j, d: Math.sqrt(dx*dx + dy*dy) });
      }
      distancias.sort((a, b) => a.d - b.d);
      distancias.slice(0, 2).forEach((v) => {
        if (v.j < i) return;
        const p1 = puntoEstrellaAPx(lista[i], anchoPx, altoPx);
        const p2 = puntoEstrellaAPx(lista[v.j], anchoPx, altoPx);
        const linea = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        linea.setAttribute('x1', p1.x); linea.setAttribute('y1', p1.y);
        linea.setAttribute('x2', p2.x); linea.setAttribute('y2', p2.y);
        svgEl.appendChild(linea);
      });
    }
  });
}

async function mostrarEstrellaEnModal(estrella){
  document.getElementById('ver-remitente').textContent = estrella.nombre;
  document.getElementById('ver-fecha').textContent = formatearFecha(estrella.created_at);

  const mensajeEl = document.getElementById('ver-mensaje');
  if (estrella.mensaje){ mensajeEl.textContent = estrella.mensaje; mensajeEl.hidden = false; } else { mensajeEl.hidden = true; mensajeEl.textContent = ''; }

  const img = document.getElementById('ver-foto');
  const video = document.getElementById('ver-video');
  const audio = document.getElementById('ver-audio');
  img.hidden = true; img.src = '';
  video.hidden = true; video.pause(); video.src = '';
  audio.hidden = true; audio.pause(); audio.src = '';

  abrirModal('modal-ver-fondo');

  if (estrella.imagen_url){
    const url = await resolverUrlFirmada(CONFIG.BUCKET_IMAGENES, estrella.imagen_url);
    if (url){ img.src = url; img.hidden = false; }
  }
  if (estrella.video_url){
    const url = await resolverUrlFirmada(CONFIG.BUCKET_VIDEOS, estrella.video_url);
    if (url){ video.src = url; video.hidden = false; }
  }
  if (estrella.audio_url){
    const url = await resolverUrlFirmada(CONFIG.BUCKET_AUDIOS, estrella.audio_url);
    if (url){ audio.src = url; audio.hidden = false; }
  }
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

/* ============================= Pantalla de acceso (contraseña) ============================= */
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

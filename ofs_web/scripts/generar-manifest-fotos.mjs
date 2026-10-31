/**
 * Genera el manifiesto de la galería de fotos.
 *
 * Lee todas las subcarpetas de `src/assets/img/fotos` y crea `fotos.json`
 * con la lista de imágenes y el título/descripción de cada carpeta.
 * El título se toma del primer archivo `nota*.txt` o `nota*.md` que haya
 * dentro de la carpeta; si no existe, se usa el nombre de la carpeta.
 *
 * Uso:
 *   node scripts/generar-manifest-fotos.mjs          -> genera una vez
 *   node scripts/generar-manifest-fotos.mjs --watch  -> regenera al cambiar fotos
 */
import { existsSync, readdirSync, readFileSync, watch, writeFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const CARPETA_FOTOS = join(RAIZ, 'src', 'assets', 'img', 'fotos');
export const ARCHIVO_MANIFIESTO = join(CARPETA_FOTOS, 'fotos.json');

const EXTENSIONES_IMAGEN = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg']);
const EXTENSIONES_NOTA = new Set(['.txt', '.md']);

/* Nombres bonitos para las carpetas que ya existen. Las nuevas se generan
   automáticamente a partir del nombre (guiones y guiones bajos -> espacios). */
const NOMBRES_CARPETA = {
  cupula: 'Cúpula',
  observaciones: 'Observaciones',
  'poster-imdea': 'Póster IMDEA',
  'semana-ciencia-25-26': 'Semana de la Ciencia 25/26'
};

function capitalizar(texto) {
  const limpio = texto.trim();
  if (!limpio) return limpio;
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

function limpiarTexto(texto) {
  return texto
    .replace(/^\uFEFF/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** "Poster-imdea" -> "Poster imdea" (o el nombre bonito del diccionario). */
function nombreCarpeta(id) {
  const clave = id.toLowerCase();
  if (NOMBRES_CARPETA[clave]) return NOMBRES_CARPETA[clave];

  return capitalizar(id.replace(/[-_]+/g, ' ').replace(/\s+/g, ' '));
}

/** Lee la primera nota de la carpeta: título (primera línea) y descripción. */
function leerNota(rutaCarpeta) {
  const archivos = readdirSync(rutaCarpeta, { withFileTypes: true })
    .filter((entrada) => entrada.isFile())
    .map((entrada) => entrada.name)
    .filter((nombre) => {
      const minusculas = nombre.toLowerCase();
      return minusculas.startsWith('nota') && EXTENSIONES_NOTA.has(extname(minusculas));
    })
    .sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));

  if (!archivos.length) return { titulo: '', descripcion: '' };

  let contenido = '';
  try {
    contenido = readFileSync(join(rutaCarpeta, archivos[0]), 'utf8');
  } catch {
    return { titulo: '', descripcion: '' };
  }

  const lineas = contenido
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((linea) => linea.trim())
    .filter(Boolean);

  const titulo = limpiarTexto(lineas[0] ?? '');
  const descripcion = limpiarTexto(lineas.join(' '));

  return { titulo, descripcion };
}

/** Codifica cada segmento de la ruta para que espacios y paréntesis funcionen. */
function urlAsset(segmentos) {
  return ['assets', 'img', 'fotos', ...segmentos].map(encodeURIComponent).join('/');
}

function compararNombres(a, b) {
  return a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' });
}

export function generarManifest({ silencio = false } = {}) {
  if (!existsSync(CARPETA_FOTOS)) {
    if (!silencio) {
      console.warn(`[fotos] No existe la carpeta ${CARPETA_FOTOS}`);
    }
    return null;
  }

  const entradas = readdirSync(CARPETA_FOTOS, { withFileTypes: true })
    .filter((entrada) => entrada.isDirectory() && !entrada.name.startsWith('.'))
    .sort((a, b) => compararNombres(a.name, b.name));

  const carpetas = [];
  const fotos = [];

  for (const entrada of entradas) {
    const rutaCarpeta = join(CARPETA_FOTOS, entrada.name);
    const nota = leerNota(rutaCarpeta);
    const nombre = nombreCarpeta(entrada.name);
    const titulo = capitalizar(nota.titulo) || nombre;
    const descripcion = capitalizar(nota.descripcion) || `Imágenes de ${nombre.toLowerCase()}`;

    const archivos = readdirSync(rutaCarpeta, { withFileTypes: true })
      .filter((archivo) => archivo.isFile())
      .map((archivo) => archivo.name)
      .filter((nombreArchivo) => EXTENSIONES_IMAGEN.has(extname(nombreArchivo).toLowerCase()))
      .sort(compararNombres);

    if (!archivos.length) continue;

    carpetas.push({
      id: entrada.name,
      nombre,
      titulo,
      descripcion,
      total: archivos.length
    });

    for (const archivo of archivos) {
      fotos.push({
        src: urlAsset([entrada.name, archivo]),
        carpeta: nombre,
        carpetaId: entrada.name,
        titulo,
        descripcion,
        alt: `${titulo} — ${nombre}`
      });
    }
  }

  const manifiesto = {
    generado: new Date().toISOString(),
    total: fotos.length,
    carpetas,
    fotos
  };

  let anterior = null;
  try {
    anterior = JSON.parse(readFileSync(ARCHIVO_MANIFIESTO, 'utf8'));
  } catch {
    /* Primera generación */
  }

  // No reescribimos si solo cambiaría la fecha: evita bucles con --watch.
  const sinCambios =
    anterior &&
    JSON.stringify(anterior.carpetas) === JSON.stringify(carpetas) &&
    JSON.stringify(anterior.fotos) === JSON.stringify(fotos);

  if (!sinCambios) {
    const json = `${JSON.stringify(manifiesto, null, 2)}\n`;
    writeFileSync(ARCHIVO_MANIFIESTO, json, 'utf8');
    if (!silencio) {
      console.log(
        `[fotos] Manifiesto actualizado: ${fotos.length} fotos en ${carpetas.length} carpetas.`
      );
    }
  } else if (!silencio) {
    console.log(`[fotos] Sin cambios: ${fotos.length} fotos en ${carpetas.length} carpetas.`);
  }

  return manifiesto;
}

const ejecutadoDirectamente =
  process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (ejecutadoDirectamente) {
  generarManifest();

  if (process.argv.includes('--watch')) {
    let temporizador;
    console.log('[fotos] Vigilando cambios en las carpetas de fotos...');
    watch(CARPETA_FOTOS, { recursive: true }, () => {
      clearTimeout(temporizador);
      temporizador = setTimeout(() => generarManifest(), 200);
    });
  }
}

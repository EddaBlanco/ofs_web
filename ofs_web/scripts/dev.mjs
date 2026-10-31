/**
 * Arranca `ng serve` y mantiene actualizado el manifiesto de la galería.
 * Así, al añadir o quitar fotos/carpetas con el servidor en marcha, la web
 * recibe el nuevo `fotos.json` sin tener que reiniciar manualmente.
 */
import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CARPETA_FOTOS, generarManifest } from './generar-manifest-fotos.mjs';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');

generarManifest();

let temporizador;
const vigilante = watch(CARPETA_FOTOS, { recursive: true }, () => {
  clearTimeout(temporizador);
  temporizador = setTimeout(() => generarManifest(), 200);
});

const cliAngular = join(RAIZ, 'node_modules', '@angular', 'cli', 'bin', 'ng.js');
const servidor = spawn(process.execPath, [cliAngular, 'serve', ...process.argv.slice(2)], {
  cwd: RAIZ,
  stdio: 'inherit'
});

let cerrando = false;
function cerrar(codigo = 0) {
  if (cerrando) return;
  cerrando = true;
  clearTimeout(temporizador);
  vigilante.close();
  if (!servidor.killed) servidor.kill();
  process.exit(codigo);
}

servidor.on('error', (error) => {
  console.error('[fotos] No se pudo arrancar ng serve:', error);
  cerrar(1);
});

servidor.on('exit', (codigo) => cerrar(codigo ?? 0));
process.on('SIGINT', () => cerrar(0));
process.on('SIGTERM', () => cerrar(0));

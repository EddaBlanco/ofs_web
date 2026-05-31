import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Observacion } from '../models/observacion';
import manifestData from '../../assets/observaciones/manifest.json';

const MANIFEST_ITEMS: Observacion[] = manifestData as Observacion[];

@Injectable({
  providedIn: 'root'
})
export class ObservacionService {

  private readonly STORAGE_KEY = 'observaciones_radiotelescopio';
  private observacionesCache: Observacion[] | null = null;

  constructor(private http: HttpClient) { }

  private assetUrl(relativePath: string): string {
    const baseElement = document.querySelector('base');
    const baseHref = baseElement?.getAttribute('href') || '/';
    const normalizedBase = baseHref.endsWith('/') ? baseHref : `${baseHref}/`;
    return `${normalizedBase}${relativePath.replace(/^\/+/, '')}`;
  }

  private normalizeObservaciones(items: Observacion[]): Observacion[] {
    return items.map(item => {
      const csvUrl = item.csv_url
        ? this.assetUrl(item.csv_url)
        : item.archivo_nombre
          ? this.assetUrl(`assets/observaciones/${item.archivo_nombre}`)
          : undefined;

      return {
        ...item,
        csv_url: csvUrl,
        csv_data: item.csv_data ?? undefined
      };
    });
  }

  /**
   * Obtiene TODAS las observaciones desde manifest.json.
   */
  listarObservaciones(): Observable<Observacion[]> {
    if (this.observacionesCache) {
      console.log('[ObservacionService] usando cache de observaciones:', this.observacionesCache.length);
      return of(this.observacionesCache);
    }

    const items = this.normalizeObservaciones(MANIFEST_ITEMS);
    console.log('[ObservacionService] manifest cargado en build-time, filas:', items.length);
    this.observacionesCache = items;
    return of(items);
  }

  /**
   * Obtiene el CSV completo de una observación desde el archivo referenciado en manifest.json.
   */
  obtenerCsv(observacion: Observacion): Observable<Observacion> {
    if (observacion.csv_data) {
      return of(observacion);
    }

    if (!observacion.csv_url) {
      return of(observacion);
    }

    return this.http.get(observacion.csv_url, { responseType: 'text' }).pipe(
      map(csv_data => ({ ...observacion, csv_data })),
      catchError(error => {
        console.error('Error cargando CSV:', error);
        return of(observacion);
      })
    );
  }

  // Guardar una nueva observación
  guardarObservacion(observacion: Observacion): Observable<boolean> {
    const observaciones = this.obtenerTodas();
    observacion.id = Date.now().toString();
    observaciones.push(observacion);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(observaciones));
    return of(true);
  }

  // Obtener todas las observaciones (síncrono)
  obtenerTodas(): Observacion[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  }

  // Obtener una observación por ID
  obtenerPorId(id: string): Observacion | null {
    const observaciones = this.obtenerTodas();
    return observaciones.find(obs => obs.id === id) || null;
  }

  // Eliminar una observación
  eliminarObservacion(id: string): Observable<boolean> {
    let observaciones = this.obtenerTodas();
    observaciones = observaciones.filter(obs => obs.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(observaciones));
    return of(true);
  }

  // Actualizar una observación
  actualizarObservacion(observacion: Observacion): Observable<boolean> {
    let observaciones = this.obtenerTodas();
    const index = observaciones.findIndex(obs => obs.id === observacion.id);
    if (index !== -1) {
      observaciones[index] = observacion;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(observaciones));
    }
    return of(true);
  }
}
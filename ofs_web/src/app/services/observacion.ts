import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Observacion } from '../models/observacion';

@Injectable({
  providedIn: 'root'
})
export class ObservacionService {

  private readonly STORAGE_KEY = 'observaciones_radiotelescopio';

  constructor() { }

  /**
   * Obtiene TODAS las observaciones como Observable
   * (necesario para el componente con subscribe)
   */
  listarObservaciones(): Observable<Observacion[]> {
    const observaciones = this.obtenerTodas();
    return of(observaciones);
  }

  /**
   * Obtiene el CSV completo de una observación
   * Como tú guardas el CSV dentro de la propia observación (csv_data),
   * simplemente devolvemos la misma observación.
   */
  obtenerCsv(observacion: Observacion): Observable<Observacion> {
    // Si por casualidad no tuviera csv_data, intentamos recuperarlo desde localStorage
    if (!observacion.csv_data && observacion.id) {
      const completa = this.obtenerPorId(observacion.id);
      if (completa) {
        return of(completa);
      }
    }
    return of(observacion);
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
export interface Observacion {
  id: string;              // ID único
  fecha: string;           // 2026-05-24
  hora: string;            // 19:52:58
  localizacion: string;    // "Anytown"
  azimut: number;          // grados
  elevacion: number;       // grados
  frecuencia_centro: number; // MHz
  archivo_nombre: string;   // nombre del CSV
  csv_data: string;         // contenido del CSV
  pico_frecuencia?: number; // para mostrar después
  pico_intensidad?: number;
  notas?: string;
}

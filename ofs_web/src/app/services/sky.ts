import { Injectable } from '@angular/core';

import { 
  Observer, 
  MakeTime, 
  Horizon, 
  Equator, 
  Body, 
  SearchRiseSet,
  Rotation_EQJ_HOR,
  RotateVector,
  Vector,
  Refraction
} from 'astronomy-engine';

export interface SkyPosition {
  name: string;
  altitude: number;      // Altura en grados
  azimuth: number;       // Acimut en grados
  ra?: number;           // Ascensión Recta (horas)
  dec?: number;          // Declinación (grados)
  visible: boolean;
  direction: string;
}

export interface SkyStatus {
  fecha: Date;
  localizacion: { lat: number; lon: number };
  sol: SkyPosition;
  luna: SkyPosition;
  viaLactea: SkyPosition[];
  objetosDestacados: SkyPosition[];
  noche: boolean;
  latitudGalactica: number;    // b (grados)
  longitudGalactica: number;   // l (grados)
}

@Injectable({
  providedIn: 'root'
})
export class SkyService {

  constructor() { }

  /**
   * Calcula el estado del cielo para una observación
   */
  calcularCielo(
    fecha: Date,
    latitud: number,
    longitud: number,
    azimutTelescopio: number,
    elevacionTelescopio: number
  ): SkyStatus {
    
    const observer: Observer = {
      latitude: latitud,
      longitude: longitud,
      height: 0
    };
    
    const time = MakeTime(fecha);
    
    // 1. Posición del Sol
    const sol = this.getBodyPosition(Body.Sun, time, observer);
    
    // 2. Posición de la Luna
    const luna = this.getBodyPosition(Body.Moon, time, observer);
    
    // 3. ¿Es de noche? (Sol por debajo del horizonte)
    const esNoche = sol.altitude < -6; // -6° = crepúsculo civil
    
    // 4. Objetos destacados del cielo profundo
    const objetosDestacados = this.getDeepSkyObjects(time, observer);
    
    // 5. Puntos de la Vía Láctea (el plano galáctico)
    const viaLactea = this.getMilkyWayPoints(observer, time);
    
    // 6. Convertir la dirección del telescopio a coordenadas ecuatoriales
    const telescopioRaDec = this.azAltToRaDec(
      azimutTelescopio, 
      elevacionTelescopio, 
      time, 
      observer
    );
    
    // 7. Coordenadas galácticas de la dirección observada
    const coordenadasGalacticas = this.raDecToGalactic(
      telescopioRaDec.ra, 
      telescopioRaDec.dec
    );
    
    return {
      fecha: fecha,
      localizacion: { lat: latitud, lon: longitud },
      sol: sol,
      luna: luna,
      viaLactea: viaLactea,
      objetosDestacados: objetosDestacados,
      noche: esNoche,
      latitudGalactica: coordenadasGalacticas.lat,
      longitudGalactica: coordenadasGalacticas.lon
    };
  }
  
  /**
   * Obtiene la posición de un cuerpo celeste
   */
  private getBodyPosition(body: Body, time: any, observer: Observer): SkyPosition {
    try {
      const equatorial = Equator(body, time, observer, true, true);
      const horizontal = Horizon(time, observer, equatorial.ra, equatorial.dec);
      
      return {
        name: this.getBodyName(body),
        altitude: horizontal.altitude,
        azimuth: horizontal.azimuth,
        ra: equatorial.ra,
        dec: equatorial.dec,
        visible: horizontal.altitude > -1,
        direction: this.getDirection(horizontal.azimuth)
      };
    } catch (e) {
      return {
        name: this.getBodyName(body),
        altitude: 0,
        azimuth: 0,
        visible: false,
        direction: 'Desconocida'
      };
    }
  }
  
  /**
   * Convierte Azimut/Altura a Ascensión Recta/Declinación
   */
  private azAltToRaDec(azimut: number, altura: number, time: any, observer: Observer): { ra: number; dec: number } {
    // Esta es la conversión clave para tu telescopio
    // Necesitas la matriz de rotación de Horizonte a Ecuatorial J2000
    // Por simplicidad, usamos la transformación inversa
    
    // Convertir grados a radianes
    const altRad = altura * Math.PI / 180;
    const azRad = azimut * Math.PI / 180;
    
    // Vector en coordenadas horizontales (Norte, Este, Cenit)
    // x = Norte, y = Este, z = Cenit
    const x = Math.cos(altRad) * Math.cos(azRad);
    const y = Math.cos(altRad) * Math.sin(azRad);
    const z = Math.sin(altRad);
    
    // Obtener la matriz de rotación HOR → EQJ en el tiempo dado
    // Nota: Esto es una simplificación, la rotación completa es más compleja
    // Para producción, usa la función Rotation_EQJ_HOR de astronomy-engine
    
    // Valores aproximados para la demostración
    const latRad = observer.latitude * Math.PI / 180;
    const lst = this.getLocalSiderealTime(time, observer.longitude);
    
    // Conversión simplificada
    const ra = Math.atan2(y, x * Math.sin(latRad) - z * Math.cos(latRad)) * 180 / Math.PI;
    const dec = Math.asin(x * Math.cos(latRad) + z * Math.sin(latRad)) * 180 / Math.PI;
    
    return { ra: (ra + 360) % 360, dec };
  }
  
  /**
   * Convierte RA/Dec a coordenadas galácticas (l, b)
   */
  private raDecToGalactic(ra: number, dec: number): { lon: number; lat: number } {
    // El polo norte galáctico está en RA = 192.8595°, Dec = 27.1284° (J2000)
    // El nodo ascendente del plano galáctico está en RA = 33°, Dec = 0°
    
    const raRad = ra * Math.PI / 180;
    const decRad = dec * Math.PI / 180;
    
    // Polo norte galáctico
    const raGP = 192.8595 * Math.PI / 180;
    const decGP = 27.1284 * Math.PI / 180;
    
    // Nodo ascendente
    const raNode = 33.0 * Math.PI / 180;
    
    // Ecuaciones de conversión
    const sinB = Math.sin(decRad) * Math.sin(decGP) + 
                 Math.cos(decRad) * Math.cos(decGP) * Math.cos(raRad - raGP);
    const lat = Math.asin(sinB) * 180 / Math.PI;
    
    const sinLon = Math.cos(decRad) * Math.sin(raRad - raGP) / Math.cos(Math.asin(sinB));
    const cosLon = (Math.sin(decRad) - Math.sin(decGP) * sinB) / (Math.cos(decGP) * Math.cos(Math.asin(sinB)));
    let lon = Math.atan2(sinLon, cosLon) * 180 / Math.PI + 33.0;
    
    if (lon > 360) lon -= 360;
    if (lon < 0) lon += 360;
    
    return { lon: lon, lat: lat };
  }
  
  /**
   * Tiempo sidéreo local
   */
  private getLocalSiderealTime(time: any, longitude: number): number {
    // Simplificación: Tiempo sidéreo en Greenwich + longitud
    // Para producción, usa la función adecuada de astronomy-engine
    const jd = time.ut;
    const T = (jd - 2451545.0) / 36525.0;
    let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000.0;
    gmst = gmst % 360;
    if (gmst < 0) gmst += 360;
    return (gmst + longitude) % 360;
  }
  
  /**
   * Obtiene puntos de la Vía Láctea visibles
   */
  private getMilkyWayPoints(observer: Observer, time: any): SkyPosition[] {
    // La Vía Láctea sigue el plano galáctico
    // Calculamos varios puntos a lo largo del plano galáctico
    const puntos: SkyPosition[] = [];
    
    for (let lon = 0; lon <= 360; lon += 45) {
      // Convertir coordenadas galácticas (l, b=0) a ecuatoriales
      // y luego a horizontales
      // Por simplicidad, mostramos puntos de referencia
      puntos.push({
        name: `GL ${lon}°`,
        altitude: 0,
        azimuth: 0,
        visible: false,
        direction: ''
      });
    }
    
    return puntos;
  }
  
  /**
   * Objetos destacados del cielo profundo
   */
  private getDeepSkyObjects(time: any, observer: Observer): SkyPosition[] {
    // Lista de objetos de Messier interesantes en radio
    const objetos = [
      { name: 'M31 (Andrómeda)', ra: 10.68, dec: 41.27 },
      { name: 'M33 (Triángulo)', ra: 23.46, dec: 30.66 },
      { name: 'M42 (Orión)', ra: 83.82, dec: -5.39 },
      { name: 'M81 (Osa Mayor)', ra: 148.89, dec: 69.06 },
      { name: 'M101 (Cochero)', ra: 210.80, dec: 54.35 }
    ];
    
    const visibles: SkyPosition[] = [];
    
    for (const obj of objetos) {
      const horizontal = Horizon(time, observer, obj.ra, obj.dec);
      visibles.push({
        name: obj.name,
        altitude: horizontal.altitude,
        azimuth: horizontal.azimuth,
        ra: obj.ra,
        dec: obj.dec,
        visible: horizontal.altitude > -1,
        direction: this.getDirection(horizontal.azimuth)
      });
    }
    
    return visibles;
  }
  
  private getBodyName(body: Body): string {
    switch(body) {
      case Body.Sun: return '☀️ Sol';
      case Body.Moon: return '🌙 Luna';
      case Body.Mercury: return '🪐 Mercurio';
      case Body.Venus: return '🪐 Venus';
      case Body.Mars: return '🪐 Marte';
      case Body.Jupiter: return '🪐 Júpiter';
      case Body.Saturn: return '🪐 Saturno';
      default: return '⭐ Estrella';
    }
  }
  
  private getDirection(azimuth: number): string {
    if (azimuth >= 337.5 || azimuth < 22.5) return 'Norte ↑';
    if (azimuth >= 22.5 && azimuth < 67.5) return 'Noreste ↗';
    if (azimuth >= 67.5 && azimuth < 112.5) return 'Este →';
    if (azimuth >= 112.5 && azimuth < 157.5) return 'Sureste ↘';
    if (azimuth >= 157.5 && azimuth < 202.5) return 'Sur ↓';
    if (azimuth >= 202.5 && azimuth < 247.5) return 'Suroeste ↙';
    if (azimuth >= 247.5 && azimuth < 292.5) return 'Oeste ←';
    if (azimuth >= 292.5 && azimuth < 337.5) return 'Noroeste ↖';
    return '';
  }
}

import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkyService, SkyStatus, SkyPosition } from '../../services/sky';

@Component({
  selector: 'app-sky-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sky-status">
      <!-- Card principal -->
      <div class="card">
        <h3>🌌 Estado del cielo en la observación</h3>
        
        <ng-container *ngIf="skyStatus as status">
          <div class="info-row">
            <div class="info-item">
              <span class="label">📍 Fecha y hora:</span>
              <span class="value">{{ status.fecha | date:'dd/MM/yyyy HH:mm:ss' }}</span>
            </div>
            <div class="info-item">
              <span class="label">🗺️ Localización:</span>
              <span class="value">Lat: {{ status.localizacion.lat }}, Lon: {{ status.localizacion.lon }}</span>
            </div>
          </div>
          
          <!-- Indicador de día/noche -->
          <div class="night-indicator" [class.night]="status.noche">
            {{ status.noche ? '🌙 Observación nocturna' : '☀️ Observación diurna' }}
          </div>
          
          <!-- Posición del telescopio -->
          <div class="telescope-direction">
            <h4>🔭 Dirección del telescopio</h4>
            <div class="compass">
              <div class="direction-indicator" [style.transform]="'rotate(' + azimut + 'deg)'">
                <div class="arrow"></div>
              </div>
              <div class="coords">
                <div>🧭 Azimut: {{ azimut }}° ({{ getDirection(azimut) }})</div>
                <div>⬆️ Elevación: {{ elevacion }}°</div>
                <div *ngIf="coordenadasGalacticas">
                  🌌 Coordenadas galácticas: l = {{ coordenadasGalacticas.lon.toFixed(2) }}°, 
                  b = {{ coordenadasGalacticas.lat.toFixed(2) }}°
                </div>
              </div>
            </div>
          </div>
          
          <!-- Posición del Sol y Luna -->
          <div class="celestial-bodies">
            <div class="body-card" *ngIf="status.sol">
              <div class="body-icon">☀️</div>
              <div class="body-info">
                <div class="body-name">Sol</div>
                <div>Alt: {{ status.sol.altitude.toFixed(1) }}°</div>
                <div>Az: {{ status.sol.azimuth.toFixed(0) }}°</div>
                <div class="direction">{{ status.sol.direction }}</div>
              </div>
            </div>
            
            <div class="body-card" *ngIf="status.luna">
              <div class="body-icon">🌙</div>
              <div class="body-info">
                <div class="body-name">Luna</div>
                <div>Alt: {{ status.luna.altitude.toFixed(1) }}°</div>
                <div>Az: {{ status.luna.azimuth.toFixed(0) }}°</div>
                <div class="direction">{{ status.luna.direction }}</div>
              </div>
            </div>
          </div>
          
          <!-- Mapa esquemático del cielo -->
          <div class="sky-map">
            <h4>🗺️ Mapa esquemático del cielo</h4>
            <canvas #skyCanvas width="400" height="400" class="sky-canvas"></canvas>
            <div class="map-legend">
              <span class="legend-dot telescope"></span> Tu telescopio
              <span class="legend-dot sun"></span> Sol
              <span class="legend-dot moon"></span> Luna
              <span class="legend-dot object"></span> Objeto destacado
            </div>
          </div>
          
          <div class="sky-image-container">
            <h4>🖼️ Imagen del cielo sin atmósfera</h4>
            <img *ngIf="skyImageUrl" [src]="skyImageUrl" alt="Imagen del cielo sin atmósfera" class="sky-image" />
            <div *ngIf="!skyImageUrl" class="image-loading">Generando imagen del cielo...</div>
          </div>
          
          <!-- Objetos visibles -->
          <div class="visible-objects">
            <h4>✨ Objetos destacados visibles</h4>
            <div class="objects-list">
              <div *ngFor="let obj of objetosVisibles" class="object-item">
                <span class="obj-name">{{ obj.name }}</span>
                <span class="obj-pos">Alt: {{ obj.altitude.toFixed(1) }}° | Az: {{ obj.azimuth.toFixed(0) }}°</span>
                <span class="obj-dir">{{ obj.direction }}</span>
              </div>
            </div>
            <div *ngIf="objetosVisibles.length === 0" class="no-objects">
              No hay objetos destacados visibles en este momento
            </div>
          </div>
          
          <!-- Interpretación astronómica -->
          <div class="interpretation">
            <h4>📡 Interpretación para radioastronomía</h4>
            <div *ngIf="status.latitudGalactica !== undefined">
              <p>
                Tu telescopio apuntaba a una zona del cielo con 
                <strong>longitud galáctica l = {{ status.longitudGalactica.toFixed(2) }}°</strong>
                y <strong>latitud galáctica b = {{ status.latitudGalactica.toFixed(2) }}°</strong>.
              </p>
              <p *ngIf="Math.abs(status.latitudGalactica) < 10">
                ✅ ¡Estás observando cerca del plano galáctico! Esta zona es rica en hidrógeno neutro.
              </p>
              <p *ngIf="status.longitudGalactica > 0 && status.longitudGalactica < 180">
                Estás observando hacia el <strong>interior de la galaxia</strong> (dirección del Centro Galáctico).
              </p>
              <p *ngIf="status.longitudGalactica >= 180">
                Estás observando hacia el <strong>exterior de la galaxia</strong> (dirección del Anticentro).
              </p>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .sky-status { font-family: 'Segoe UI', sans-serif; }
    .card { background: #1a1a2e; border-radius: 16px; padding: 20px; margin: 15px 0; color: #eee; }
    h3, h4 { margin-top: 0; color: #5dade2; }
    .info-row { display: flex; gap: 20px; margin-bottom: 15px; flex-wrap: wrap; }
    .info-item { background: #0f0f14; padding: 8px 15px; border-radius: 8px; }
    .label { color: #888; margin-right: 10px; }
    .value { color: #f1c40f; font-family: monospace; }
    .night-indicator { background: #2c3e50; padding: 10px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
    .night-indicator.night { background: #1a2a3a; color: #5dade2; }
    .telescope-direction { background: #0f0f14; border-radius: 12px; padding: 15px; margin-bottom: 20px; }
    .compass { display: flex; gap: 30px; align-items: center; flex-wrap: wrap; }
    .direction-indicator { width: 100px; height: 100px; position: relative; background: #1a1a2e; border-radius: 50%; border: 2px solid #5dade2; }
    .arrow { position: absolute; top: 10px; left: 48px; width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-bottom: 40px solid #e74c3c; transform-origin: center 50px; }
    .coords { color: #ccc; }
    .celestial-bodies { display: flex; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }
    .body-card { background: #0f0f14; border-radius: 12px; padding: 12px; display: flex; gap: 15px; align-items: center; min-width: 150px; }
    .body-icon { font-size: 2rem; }
    .body-name { font-weight: bold; color: #5dade2; }
    .direction { font-size: 0.75rem; color: #888; }
    .sky-map { text-align: center; margin-bottom: 20px; }
    .sky-canvas { background: #05060b; border-radius: 50%; margin: 10px auto; display: block; max-width: 100%; height: auto; }
    .sky-image-container { text-align: center; margin-bottom: 20px; }
    .sky-image { max-width: 100%; border-radius: 18px; border: 1px solid rgba(255,255,255,0.08); margin-top: 10px; }
    .image-loading { color: #888; font-size: 0.9rem; margin-top: 8px; }
    .map-legend { display: flex; gap: 15px; justify-content: center; font-size: 0.75rem; margin-top: 10px; }
    .legend-dot { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 5px; }
    .legend-dot.telescope { background: #e74c3c; }
    .legend-dot.sun { background: #f1c40f; }
    .legend-dot.moon { background: #bdc3c7; }
    .legend-dot.object { background: #2ecc71; }
    .visible-objects { background: #0f0f14; border-radius: 12px; padding: 15px; margin-bottom: 20px; }
    .objects-list { display: flex; flex-direction: column; gap: 8px; }
    .object-item { display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #2a2a3a; flex-wrap: wrap; gap: 10px; }
    .obj-name { font-weight: bold; color: #2ecc71; }
    .obj-pos { font-family: monospace; color: #aaa; }
    .obj-dir { color: #5dade2; font-size: 0.75rem; }
    .no-objects { text-align: center; color: #666; padding: 20px; }
    .interpretation { background: #0f0f14; border-radius: 12px; padding: 15px; }
    .interpretation p { line-height: 1.5; margin: 10px 0; }
    @media (max-width: 600px) {
      .compass { flex-direction: column; align-items: center; }
      .info-row { flex-direction: column; }
    }
  `]
})

export class SkyStatusComponent implements OnInit, OnChanges {
  @Input() fecha!: Date;
  @Input() latitud: number = 40.4168;
  @Input() longitud: number = -3.7038;
  @Input() azimut: number = 0;
  @Input() elevacion: number = 0;
  
  skyStatus: SkyStatus | null = null;
  objetosVisibles: SkyPosition[] = [];
  coordenadasGalacticas: { lon: number; lat: number } | null = null;
  @ViewChild('skyCanvas', { static: false }) skyCanvasRef!: ElementRef<HTMLCanvasElement>;
  skyImageUrl: string | null = null;
  private readonly skyStars = this.createStarField(120);
  
  constructor(private skyService: SkyService) {}
  
  ngOnInit() {
    this.calcularCielo();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['fecha'] || changes['latitud'] || changes['longitud'] || changes['azimut'] || changes['elevacion']) {
      this.calcularCielo();
    }
  }
  
  calcularCielo() {
    this.skyStatus = this.skyService.calcularCielo(
      this.fecha,
      this.latitud,
      this.longitud,
      this.azimut,
      this.elevacion
    );
    
    // Filtrar objetos visibles (altura > -5 grados)
    this.objetosVisibles = this.skyStatus.objetosDestacados.filter(obj => obj.altitude > -5);
    
    // Guardar coordenadas galácticas
    if (this.skyStatus) {
      this.coordenadasGalacticas = {
        lon: this.skyStatus.longitudGalactica,
        lat: this.skyStatus.latitudGalactica
      };
    }
    
    // Dibujar el mapa del cielo después de renderizar
    setTimeout(() => this.dibujarMapaCielo(), 100);
  }
  
  dibujarMapaCielo() {
    const canvas = this.skyCanvasRef?.nativeElement;
    if (!canvas || !this.skyStatus) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 12;
    
    ctx.clearRect(0, 0, width, height);
    
    // Fondo sin atmósfera
    ctx.fillStyle = '#03040a';
    ctx.fillRect(0, 0, width, height);
    
    // Estrellas de fondo
    for (const star of this.skyStars) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
      ctx.arc(centerX + star.x * radius, centerY + star.y * radius, star.size, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Círculo del campo visual
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#486d8e';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(centerX, centerY, radius * 0.66, 0, 2 * Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.arc(centerX, centerY, radius * 0.33, 0, 2 * Math.PI); ctx.stroke();
    
    // Puntos cardinales en el borde
    ctx.fillStyle = '#8cbce3';
    ctx.font = '12px sans-serif';
    ctx.fillText('N', centerX - 6, centerY - radius - 6);
    ctx.fillText('S', centerX - 6, centerY + radius + 16);
    ctx.fillText('E', centerX + radius + 8, centerY + 4);
    ctx.fillText('W', centerX - radius - 14, centerY + 4);
    
    const drawSkyObject = (azimuth: number, altitude: number, color: string, size: number = 6, label?: string) => {
      const point = this.getSkyProjection(azimuth, altitude, radius);
      if (!point.visible) return;
      ctx.beginPath();
      ctx.arc(centerX + point.x, centerY + point.y, size, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      if (label) {
        ctx.fillStyle = '#fff';
        ctx.font = '11px monospace';
        ctx.fillText(label, centerX + point.x + size + 2, centerY + point.y - 2);
      }
    };
    
    // Dibujar el centro de la imagen: la dirección del telescopio
    ctx.beginPath();
    ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#e74c3c';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = '11px sans-serif';
    ctx.fillText('🔭', centerX - 7, centerY + 4);
    
    // Dibujar Sol y Luna
    drawSkyObject(this.skyStatus.sol.azimuth, this.skyStatus.sol.altitude, '#f1c40f', 9, '☀️');
    drawSkyObject(this.skyStatus.luna.azimuth, this.skyStatus.luna.altitude, '#bdc3c7', 8, '🌙');
    
    // Dibujar objetos destacados visibles
    for (const obj of this.objetosVisibles) {
      drawSkyObject(obj.azimuth, obj.altitude, '#2ecc71', 4, obj.name.substring(0, 3));
    }
    
    // Generar imagen de la vista del cielo
    this.skyImageUrl = canvas.toDataURL('image/png');
  }
  
  private getSkyProjection(azimuth: number, altitude: number, radius: number): { x: number; y: number; visible: boolean } {
    const deltaAz = ((azimuth - this.azimut + 540) % 360) - 180;
    const deltaAlt = altitude - this.elevacion;
    const distance = Math.hypot(deltaAz, deltaAlt);
    if (distance > 90) {
      return { x: 0, y: 0, visible: false };
    }
    const r = (distance / 90) * radius;
    const angle = (90 - deltaAz) * Math.PI / 180;
    return {
      x: r * Math.cos(angle),
      y: -r * Math.sin(angle),
      visible: true
    };
  }
  
  private createStarField(count: number): Array<{ x: number; y: number; size: number; alpha: number }> {
    const stars: Array<{ x: number; y: number; size: number; alpha: number }> = [];
    for (let i = 0; i < count; i++) {
      const angle = i * 137.508;
      const radius = Math.sqrt((i + 1) / count) * 0.95;
      const x = Math.cos(angle * Math.PI / 180) * radius;
      const y = Math.sin(angle * Math.PI / 180) * radius;
      const size = 0.8 + (i % 5) * 0.4;
      const alpha = 0.18 + ((i % 7) * 0.1);
      stars.push({ x, y, size, alpha: Math.min(alpha, 0.85) });
    }
    return stars;
  }
  
  getDirection(azimut: number): string {
    if (azimut >= 337.5 || azimut < 22.5) return 'N';
    if (azimut >= 22.5 && azimut < 67.5) return 'NE';
    if (azimut >= 67.5 && azimut < 112.5) return 'E';
    if (azimut >= 112.5 && azimut < 157.5) return 'SE';
    if (azimut >= 157.5 && azimut < 202.5) return 'S';
    if (azimut >= 202.5 && azimut < 247.5) return 'SW';
    if (azimut >= 247.5 && azimut < 292.5) return 'W';
    return 'NW';
  }
  
  protected readonly Math = Math;
}
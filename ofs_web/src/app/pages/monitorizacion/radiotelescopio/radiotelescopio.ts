import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ObservacionService } from '../../../services/observacion';
import { Observacion } from '../../../models/observacion';

@Component({
  selector: 'app-radiotelescopio',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, FormsModule],
  templateUrl: './radiotelescopio.html',
  styleUrls: ['./radiotelescopio.scss']
})
export class Radiotelescopio implements OnInit, AfterViewInit {
  
  @ViewChild('espectroCanvas') espectroCanvas!: ElementRef<HTMLCanvasElement>;
  
  // Lista de observaciones
  observaciones: Observacion[] = [];
  observacionesFiltradas: Observacion[] = [];
  observacionSeleccionada: Observacion | null = null;
  
  // Datos del espectro
  datosEspectro: Array<{ frecuencia: number; intensidad: number }> = [];
  picoInfo: { frecuencia: number; intensidad: number } | null = null;
  hoverInfo: { frecuencia: number; intensidad: number } | null = null;
  puntoSeleccionado: { frecuencia: number; intensidad: number } | null = null;
  
  // Estados de UI
  cargando: boolean = false;
  busqueda: string = '';
  ordenAscendente: boolean = true;
  tipoOrden: 'fecha' | 'localizacion' | 'pico' = 'fecha';
  
  constructor(private obsService: ObservacionService) {}
  
  ngOnInit() {
    this.cargarObservaciones();
  }
  
  ngAfterViewInit() {
    // El canvas se inicializa cuando se selecciona una observación
  }
  
  // ==================== CARGA DE DATOS ====================
  
  cargarObservaciones() {
    this.cargando = true;
    this.obsService.listarObservaciones().subscribe({
      next: (items) => {
        this.observaciones = items;
        this.filtrarYOrdenar();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando observaciones:', err);
        this.cargando = false;
      }
    });
  }
  
  // ==================== FILTRADO Y ORDENACIÓN ====================
  
  filtrarYOrdenar() {
    // Filtrar por búsqueda
    let filtradas = [...this.observaciones];
    
    if (this.busqueda.trim()) {
      const term = this.busqueda.toLowerCase();
      filtradas = filtradas.filter(obs => 
        obs.localizacion?.toLowerCase().includes(term) ||
        obs.fecha?.includes(term) ||
        obs.archivo_nombre?.toLowerCase().includes(term)
      );
    }
    
    // Ordenar
    filtradas.sort((a, b) => {
      let comparison = 0;
      switch (this.tipoOrden) {
        case 'fecha':
          comparison = new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
          break;
        case 'localizacion':
          comparison = (a.localizacion || '').localeCompare(b.localizacion || '');
          break;
        case 'pico':
          comparison = (b.pico_frecuencia || 0) - (a.pico_frecuencia || 0);
          break;
      }
      return this.ordenAscendente ? comparison : -comparison;
    });
    
    this.observacionesFiltradas = filtradas;
  }
  
  onBuscar() {
    this.filtrarYOrdenar();
  }
  
  cambiarOrden(tipo: 'fecha' | 'localizacion' | 'pico') {
    if (this.tipoOrden === tipo) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.tipoOrden = tipo;
      this.ordenAscendente = true;
    }
    this.filtrarYOrdenar();
  }
  
  // ==================== SELECCIÓN DE OBSERVACIÓN ====================
  
  seleccionarObservacion(obs: Observacion) {
    if (this.observacionSeleccionada?.id === obs.id) return;
    
    this.cargando = true;
    this.observacionSeleccionada = obs;
    this.hoverInfo = null;
    this.picoInfo = null;
    
    this.obsService.obtenerCsv(obs).subscribe({
      next: (fullObs) => {
        this.observacionSeleccionada = fullObs;
        if (fullObs.csv_data) {
          this.procesarCSV(fullObs.csv_data);
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando CSV:', err);
        this.cargando = false;
      }
    });
  }
  
  // ==================== PROCESAMIENTO DE CSV ====================
  
  procesarCSV(csvContent: string) {
    // Parsear CSV
    const lines = csvContent.trim().split('\n');
    const step = Math.max(1, Math.floor(lines.length / 800));
    const datosTemp: Array<{ frecuencia: number; intensidad: number }> = [];
    
    for (let i = 0; i < lines.length; i += step) {
      const [freqStr, intStr] = lines[i].split(',');
      if (freqStr && intStr) {
        datosTemp.push({
          frecuencia: parseFloat(freqStr), // CSV already in MHz
          intensidad: parseFloat(intStr)
        });
      }
    }
    
    this.datosEspectro = datosTemp;
    
    // Encontrar pico
    this.picoInfo = this.encontrarPico(datosTemp);
    
    // Actualizar la observación con los datos del pico
    if (this.picoInfo && this.observacionSeleccionada) {
      this.observacionSeleccionada.pico_frecuencia = this.picoInfo.frecuencia;
      this.observacionSeleccionada.pico_intensidad = this.picoInfo.intensidad;
      // Opcional: guardar automáticamente
      // this.obsService.actualizarObservacion(this.observacionSeleccionada).subscribe();
    }
    
    // Dibujar gráfica
    setTimeout(() => this.dibujarGrafico(), 50);
  }
  
  encontrarPico(datos: Array<{ frecuencia: number; intensidad: number }>): { frecuencia: number; intensidad: number } {
    let maxIntensidad = 0;
    let freqMax = 0;
    
    for (const punto of datos) {
      if (punto.intensidad > maxIntensidad) {
        maxIntensidad = punto.intensidad;
        freqMax = punto.frecuencia;
      }
    }
    
    return { frecuencia: freqMax, intensidad: maxIntensidad };
  }
  
  // ==================== GRÁFICA ====================
  
  dibujarGrafico() {
    const canvas = this.espectroCanvas?.nativeElement;
    if (!canvas || this.datosEspectro.length === 0) return;
    
    // Ajustar tamaño del canvas con devicePixelRatio para mejor nitidez
    const container = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    if (container) {
      canvas.width = (container.clientWidth - 32) * dpr;
      canvas.height = 400 * dpr;
      canvas.style.width = (container.clientWidth - 32) + 'px';
      canvas.style.height = 400 + 'px';
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Aplicar escala al contexto para compensar devicePixelRatio
    ctx.scale(dpr, dpr);
    
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    ctx.clearRect(0, 0, width, height);
    
    // Márgenes
    const padding = { top: 30, right: 50, bottom: 50, left: 60 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    
    const freqs = this.datosEspectro.map(p => p.frecuencia);
    const ints = this.datosEspectro.map(p => p.intensidad);
    const minX = Math.min(...freqs);
    const maxX = Math.max(...freqs);
    const minY = 0;
    const maxY = Math.max(...ints) * 1.1;
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    
    // Fondo
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);
    
    // Grid horizontal
    ctx.strokeStyle = '#2a2a3a';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (i / 5) * plotHeight;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      
      // Etiquetas Y
      const value = maxY - (i / 5) * rangeY;
      ctx.fillStyle = '#666';
      ctx.font = '10px monospace';
      ctx.fillText(value.toFixed(0), padding.left - 45, y + 3);
    }
    
    // Ejes
    ctx.strokeStyle = '#5dade2';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();
    
    // Línea del espectro
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    
    this.datosEspectro.forEach((p, index) => {
      const x = padding.left + ((p.frecuencia - minX) / rangeX) * plotWidth;
      const y = height - padding.bottom - ((p.intensidad - minY) / rangeY) * plotHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    // Relleno bajo la curva
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = 'rgba(231, 76, 60, 0.1)';
    ctx.fill();
    
    // Línea de referencia HI (1420.4 MHz)
    const hiX = padding.left + ((1420.405751 - minX) / rangeX) * plotWidth;
    if (hiX >= padding.left && hiX <= width - padding.right) {
      ctx.strokeStyle = '#2ecc71';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(hiX, padding.top);
      ctx.lineTo(hiX, height - padding.bottom);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = '#2ecc71';
      ctx.font = '10px monospace';
      ctx.fillText('HI 1420.4 MHz', hiX + 5, padding.top + 15);
    }
    
    // Etiquetas X
    ctx.fillStyle = '#aaa';
    ctx.font = '10px monospace';
    for (let i = 0; i <= 5; i++) {
      const x = padding.left + (i / 5) * plotWidth;
      const freq = minX + (i / 5) * rangeX;
      ctx.fillText(freq.toFixed(1), x - 20, height - padding.bottom + 20);
    }
    
    // Títulos de ejes
    ctx.fillStyle = '#ccc';
    ctx.font = '12px sans-serif';
    ctx.fillText('Frecuencia (MHz)', width / 2 - 50, height - 10);
    
    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Intensidad', -20, 0);
    ctx.restore();
    
    // Tooltip en hover
    if (this.hoverInfo) {
      const hoverX = padding.left + ((this.hoverInfo.frecuencia - minX) / rangeX) * plotWidth;
      const hoverY = height - padding.bottom - ((this.hoverInfo.intensidad - minY) / rangeY) * plotHeight;
      
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillRect(hoverX - 60, hoverY - 30, 120, 28);
      
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.fillText(`${this.hoverInfo.frecuencia.toFixed(3)} MHz`, hoverX - 55, hoverY - 12);
      ctx.fillStyle = '#e74c3c';
      ctx.fillText(`${this.hoverInfo.intensidad.toFixed(1)}`, hoverX - 55, hoverY);
    }
    
    // Mostrar punto seleccionado
    if (this.puntoSeleccionado) {
      const selX = padding.left + ((this.puntoSeleccionado.frecuencia - minX) / rangeX) * plotWidth;
      const selY = height - padding.bottom - ((this.puntoSeleccionado.intensidad - minY) / rangeY) * plotHeight;
      
      // Círculo de selección
      ctx.fillStyle = '#3498db';
      ctx.beginPath();
      ctx.arc(selX, selY, 7, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Info del punto
      ctx.fillStyle = 'rgba(0,0,0,0.9)';
      ctx.fillRect(selX - 70, selY - 40, 140, 35);
      
      ctx.fillStyle = '#3498db';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`${this.puntoSeleccionado.frecuencia.toFixed(3)} MHz`, selX - 65, selY - 22);
      ctx.fillStyle = '#fff';
      ctx.fillText(`Intensidad: ${this.puntoSeleccionado.intensidad.toFixed(1)}`, selX - 65, selY - 8);
    }
  }
  
  // ==================== EVENTOS DEL MOUSE ====================
  
  onCanvasMouseMove(event: MouseEvent) {
    const canvas = this.espectroCanvas?.nativeElement;
    if (!canvas || this.datosEspectro.length === 0) {
      this.hoverInfo = null;
      return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const x = (event.clientX - rect.left) * scaleX;
    
    const padding = { left: 60, right: 50 };
    const width = canvas.width;
    const plotWidth = width - padding.left - padding.right;
    
    if (x < padding.left || x > width - padding.right) {
      this.hoverInfo = null;
      this.dibujarGrafico();
      return;
    }
    
    const freqs = this.datosEspectro.map(p => p.frecuencia);
    const minX = Math.min(...freqs);
    const maxX = Math.max(...freqs);
    const rangeX = maxX - minX || 1;
    
    const targetFreq = minX + ((x - padding.left) / plotWidth) * rangeX;
    let closest = this.datosEspectro[0];
    let bestDist = Math.abs(closest.frecuencia - targetFreq);
    
    for (const point of this.datosEspectro) {
      const dist = Math.abs(point.frecuencia - targetFreq);
      if (dist < bestDist) {
        bestDist = dist;
        closest = point;
      }
    }
    
    if (Math.abs(closest.frecuencia - targetFreq) < (rangeX / plotWidth) * 20) {
      this.hoverInfo = { frecuencia: closest.frecuencia, intensidad: closest.intensidad };
      this.dibujarGrafico();
    } else {
      this.hoverInfo = null;
      this.dibujarGrafico();
    }
  }
  
  onCanvasMouseLeave() {
    this.hoverInfo = null;
    this.dibujarGrafico();
  }
  
  onCanvasClick(event: MouseEvent) {
    const canvas = this.espectroCanvas?.nativeElement;
    if (!canvas || this.datosEspectro.length === 0) return;
    
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const scaleX = canvas.width / rect.width / dpr;
    const scaleY = canvas.height / rect.height / dpr;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    
    const padding = { left: 60, right: 50, top: 30, bottom: 50 };
    const width = canvas.width / dpr;
    const plotWidth = width - padding.left - padding.right;
    const height = canvas.height / dpr;
    const plotHeight = height - padding.top - padding.bottom;
    
    // Verificar que el click está dentro del área del gráfico
    if (x < padding.left || x > width - padding.right || 
        y < padding.top || y > height - padding.bottom) {
      this.puntoSeleccionado = null;
      this.dibujarGrafico();
      return;
    }
    
    const freqs = this.datosEspectro.map(p => p.frecuencia);
    const minX = Math.min(...freqs);
    const maxX = Math.max(...freqs);
    const rangeX = maxX - minX || 1;
    
    const targetFreq = minX + ((x - padding.left) / plotWidth) * rangeX;
    let closest = this.datosEspectro[0];
    let bestDist = Math.abs(closest.frecuencia - targetFreq);
    
    for (const point of this.datosEspectro) {
      const dist = Math.abs(point.frecuencia - targetFreq);
      if (dist < bestDist) {
        bestDist = dist;
        closest = point;
      }
    }
    
    this.puntoSeleccionado = { frecuencia: closest.frecuencia, intensidad: closest.intensidad };
    this.dibujarGrafico();
  }
  
  // Wrappers para la plantilla
  verObservacion(obs: Observacion) {
    this.seleccionarObservacion(obs);
  }

  handleChartHover(event: MouseEvent) {
    this.onCanvasMouseMove(event);
  }

  clearHover() {
    this.onCanvasMouseLeave();
  }
  
  handleCanvasClick(event: MouseEvent) {
    this.onCanvasClick(event);
  }

  // ==================== UTILIDADES ====================
  
  descargarCSV(obs: Observacion) {
    if (!obs.csv_data) return;
    
    const blob = new Blob([obs.csv_data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${obs.fecha}_${obs.localizacion}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  getIconoOrden(tipo: 'fecha' | 'localizacion' | 'pico'): string {
    if (this.tipoOrden !== tipo) return '↕️';
    return this.ordenAscendente ? '↓' : '↑';
  }
}
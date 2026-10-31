import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface EquipoPropiedad {
  name: string;
  value: string;
}

interface Equipo {
  name: string;
  model: string;
  description: string;
  image: string;
  type: string;
  properties: EquipoPropiedad[];
}

interface TipoEquipo {
  type: string;
  label: string;
  accent: string;
}

@Component({
  selector: 'app-equipamiento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './equipamiento.html',
  styleUrls: ['./equipamiento.scss']
})
export class Equipamiento {
  equipment: Equipo[] = [];
  showingEquipment: Equipo[] = [];
  selectedType = 'all';

  readonly types: TipoEquipo[] = [
    { type: 'all', label: 'Todos', accent: '#13d8f5' },
    { type: 'sensor', label: 'Sensores', accent: '#4fd1a5' },
    { type: 'telescope', label: 'Telescopios', accent: '#f5c91a' },
    { type: 'camera', label: 'Cámaras', accent: '#9b8cff' }
  ];

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.equipment = [
      {
        name: 'Telescopio Meade',
        model: 'MEADE LX200-ACF',
        description:
          'Telescopio comercial utilizado para observación planetaria y lunar en el observatorio.',
        image: 'assets/img/equipment/meade-lx200.jpg',
        type: 'telescope',
        properties: [
          { name: 'Apertura', value: '245 mm (10")' },
          { name: 'Distancia focal', value: '2500 mm' },
          { name: 'Relación focal', value: 'f/10' }
        ]
      },
      {
        name: 'Estación Meteorológica',
        model: 'Estación Meteorológica',
        description:
          'Estación meteorológica de construcción propia, empleada para la recuperación de datos climáticos en el observatorio que serán publicados en la web. Está construida sobre la API y el software desarrollados para el proyecto picoWeather, disponible en GitHub: https://github.com/ljn0099',
        image: 'assets/img/equipment/estacion_meteorologica_nueva.jpeg',
        type: 'sensor',
        properties: [
          {
            name: 'Sensores',
            value: 'Temperatura, humedad, presión, viento y lluvia.'
          }
        ]
      },
      {
        name: 'Cámara ZWO ASI',
        model: 'ZWO ASI 678MC',
        description:
          'Cámara astronómica planetaria en color, sin refrigerar, de última generación.',
        image: 'assets/img/equipment/ZWO.jfif',
        type: 'camera',
        properties: [
          { name: 'Resolución', value: '3840 × 2160 píxeles' },
          { name: 'Sensor', value: 'CMOS Sony IMX678 de 1/1,8"' },
          { name: 'Frecuencia de imagen', value: '47 FPS' },
          { name: 'Velocidad de captura máxima', value: '47 fps a 12 bits' }
        ]
      },
      {
        name: 'Mobotix M10',
        model: 'Mobotix M10 AllaroundDual',
        description: 'Cámara de videovigilancia dual, resistente a la intemperie.',
        image: 'assets/img/equipment/mobotix-m16.jpg',
        type: 'camera',
        properties: [
          {
            name: 'Sensor',
            value: '1/1,8" CMOS, 6 MP (3072 × 2048), Progressive Scan.'
          }
        ]
      },
      {
        name: 'Mobotix Allsky',
        model: 'Mobotix Q25 Hemisférica',
        description:
          'Cámara profesional hemisférica para exteriores con lente de ojo de pez.',
        image: 'assets/img/equipment/mobotix-q25.jpg',
        type: 'camera',
        properties: [
          { name: 'Lente', value: 'MX-B016' },
          {
            name: 'Sensor',
            value: '1/1,8" CMOS, 6 MP (3072 × 2048), Progressive Scan.'
          }
        ]
      }
    ];

    this.showingEquipment = this.equipment;
  }

  get totalEquipos(): number {
    return this.equipment.length;
  }

  getTypeCount(type: string): number {
    if (type === 'all') return this.equipment.length;
    return this.equipment.filter((device) => device.type === type).length;
  }

  getTypeLabel(type: string): string {
    return this.types.find((elem) => elem.type === type)?.label ?? type;
  }

  getTypeAccent(type: string): string {
    return this.types.find((elem) => elem.type === type)?.accent ?? 'var(--ofs-cyan)';
  }

  // Convierte URLs en la descripción a enlaces clicables y sanitiza el HTML
  getDescriptionHtml(desc: string): SafeHtml {
    if (!desc) return '' as unknown as SafeHtml;
    // Buscar URLs (http/https) y reemplazarlas por enlaces
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const html = desc.replace(urlRegex, (url: string) => {
      const safeUrl = url;
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeUrl}</a>`;
    });
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  filterEquipment(type: string) {
    this.selectedType = type;
    if (type === 'all') {
      this.showingEquipment = this.equipment;
    } else {
      this.showingEquipment = this.equipment.filter((device) => device.type === type);
    }
  }
}

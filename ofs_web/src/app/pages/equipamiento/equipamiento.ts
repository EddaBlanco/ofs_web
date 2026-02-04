import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
	selector: 'app-equipamiento',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './equipamiento.html',
	styleUrls: ['./equipamiento.scss']
})
export class Equipamiento {
	equipment: Array<any> = [];
	showingEquipment: Array<any> = [];
	selectedType = 'all';
	types = [
		{ type: 'all', label: 'Todos' },
		{ type: 'sensor', label: 'Sensores' },
		{ type: 'telescope', label: 'Telescopios' },
		{ type: 'camera', label: 'Cámaras' }
	];

  constructor(private sanitizer: DomSanitizer) {}

	// Para pruebas se incluye un listado de ejemplo. Sustituye por tu servicio real si lo deseas.
	ngOnInit() {
		this.equipment = [
			{
				name: 'Telescopio Meade',
			model: 'MEADE LX200-ACF',
			description: 'Telescopio comercial más utilizado en investigación.',
			image: 'assets/img/equipment/meade-lx200.jpg',
			type: 'telescope',
			properties: [
				{
					name: 'Apertura',
					value: '245mm (10")'
				},
				{
					name: 'Distancia focal',
					value: '2500mm'
				},
				{
					name: 'Relación focal',
					value: 'f/10'
				}
			]
			},
			/*{
			name: 'Meteo Watcher',
			model: 'Meteo Watcher II',
			description: 'Monitor de condiciones medioambientales para observatorios astronómicos.',
			image: 'assets/img/equipment/meteowatcher.jpg',
			type: 'sensor',
			properties: []
		},*/
    {
			name: 'Estación Meteorológica',
			model: 'Estación Meteorológica',
			description:
				'Estación meteorloógica de construcción propia, empleada para la recuperación de datos climáticos en el observatorio que serán publicados en la web. Esta estacion meteorológica está construida sobre la API y software desarrollada para el proyecto picoWeather, disponible en GitHub: https://github.com/ljn0099',
			image: 'assets/img/equipment/estacion_meteorologica_nueva.jpeg',
			type: 'sensor',
			properties: [
				{
					name: 'Sensores',
					value: 'Temperatura, humedad, presión, viento, lluvia.'
				}
			]
		},
    { 
			name: 'Cámara ZWO ASI',
			model: 'ZWO ASI 678MC',
			description: 'Cámara astronómica planetaria en color sin refrigerar de última generación',
			image: 'assets/img/equipment/ZWO.jfif',
			type: 'camera',
			properties: [
				{
					name: 'Resolución',
					value: '3840 X 2160 píxels'
				},
				{
					name: 'Frame Rate',
					value: '47 FPS'
				},
				{
					name: 'Sensor',
					value: ' CMOS SONY IMX678 de 1/1,8"'
				},
				{
					name: 'Velocidad de captura máxima',
					value: '  47 fps a 12 bits'
				}
			]
		},
			{
				name: 'Mobotix M10',
			model: 'Mobotix M10 AllaroundDual',
			description: 'Cámara de videovigilancia Dual, resistente a la intemperie.',
			image: 'assets/img/equipment/mobotix-m16.jpg',
			type: 'camera',
			properties: [
				{
					name: 'Sensor',
					value: '1/1.8“ CMOS, 6MP (3072 x 2048), Progressive Scan.'
				}
			]
			},
      {
			name: 'Mobotix Allsky',
			model: 'Mobotix Q25 Hemisferic',
			description: 'Cámara profesional hemisférica para exteriores con lente de ojo de pez.',
			image: 'assets/img/equipment/mobotix-q25.jpg',
			type: 'camera',
			properties: [
				{
					name: 'Lente',
					value: 'MX-B016'
				},
				{
					name: 'Sensor',
					value: '1/1.8“ CMOS, 6MP (3072 x 2048), Progressive Scan'
				}
			]
		},
    /*{
			name: 'Webcam',
			model: 'Philips ToUcam PRO',
			description: '',
			image: 'assets/img/equipment/philips-toucam.jpg',
			type: 'camera',
			properties: [
				{
					name: 'Resolución',
					value: '1280x960 píxels'
				},
				{
					name: 'Frame Rate',
					value: '60 FPS'
				},
				{
					name: 'Sensor',
					value: 'CCD'
				}
			]
		},*/
		];

		this.showingEquipment = this.equipment;
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

import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeatherService } from '../../../services/weather.service';

// Mapeo de granularidad → Categorías → Campos disponibles
type FieldsMap = {
  [key: string]: { [category: string]: string[] };
};

const FIELDS_BY_GRANULARITY: FieldsMap = {
  raw: {
    Temperature: ['temperature'],
    Humidity: ['humidity'],
    Pressure: ['pressure'],
    Light: ['lux'],
    UV: ['uvi'],
    Wind: ['wind_speed', 'wind_direction'],
    Gust: ['gust_speed', 'gust_direction'],
    Rainfall: ['rainfall'],
    Solar: ['solar_irradiance']
  },
  hour: {
    Temperature: ['avg_temperature'],
    Humidity: ['avg_humidity'],
    Pressure: ['avg_pressure'],
    Rainfall: ['sum_rainfall', 'stddev_rainfall'],
    Wind: ['avg_wind_speed', 'avg_wind_direction', 'stddev_wind_speed'],
    Gust: ['max_gust_speed', 'max_gust_direction'],
    Light: ['avg_lux'],
    UV: ['avg_uvi'],
    Solar: ['avg_solar_irradiance']
  },
  day: {
    Temperature: ['max_temperature', 'min_temperature', 'avg_temperature', 'stddev_temperature'],
    Humidity: ['max_humidity', 'min_humidity', 'avg_humidity', 'stddev_humidity'],
    Pressure: ['max_pressure', 'min_pressure', 'avg_pressure'],
    Rainfall: ['sum_rainfall', 'stddev_rainfall'],
    Wind: ['avg_wind_speed', 'avg_wind_direction', 'stddev_wind_speed'],
    Gust: ['max_gust_speed', 'max_gust_direction'],
    Light: ['max_lux', 'avg_lux'],
    UV: ['max_uvi', 'avg_uvi'],
    Solar: ['avg_solar_irradiance'],
    Misc: ['wind_run']
  },
  month: {
    Temperature: ['max_temperature', 'min_temperature', 'avg_temperature', 'stddev_temperature'],
    Humidity: ['max_humidity', 'min_humidity', 'avg_humidity', 'stddev_humidity'],
    Pressure: ['max_pressure', 'min_pressure', 'avg_pressure'],
    Rainfall: ['sum_rainfall', 'stddev_rainfall'],
    Wind: ['avg_wind_speed', 'avg_wind_direction', 'stddev_wind_speed'],
    Gust: ['max_gust_speed', 'max_gust_direction'],
    Light: ['max_lux', 'avg_lux'],
    UV: ['max_uvi', 'avg_uvi'],
    Solar: ['avg_solar_irradiance']
  },
  year: {
    Temperature: ['max_temperature', 'min_temperature', 'avg_temperature', 'stddev_temperature'],
    Humidity: ['max_humidity', 'min_humidity', 'avg_humidity', 'stddev_humidity'],
    Pressure: ['max_pressure', 'min_pressure', 'avg_pressure'],
    Rainfall: ['sum_rainfall', 'stddev_rainfall'],
    Wind: ['avg_wind_speed', 'avg_wind_direction', 'stddev_wind_speed'],
    Gust: ['max_gust_speed', 'max_gust_direction'],
    Light: ['max_lux', 'avg_lux'],
    UV: ['max_uvi', 'avg_uvi'],
    Solar: ['avg_solar_irradiance']
  }
};

@Component({
  selector: 'app-estacion-meteorologica',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estacion-meteorologica.html',
  styleUrls: ['./estacion-meteorologica.scss']
})
export class EstacionMeteorologica {
  private readonly stationId = 'dee0666d-25c8-4e18-8b3e-ad191c1b07e8';
  timezone = 'Europe/Madrid';
  startTime = new Date().toISOString().slice(0, 19);
  endTime = new Date().toISOString().slice(0, 19);
  granularity = 'hour';
  fields = 'avg_temperature,avg_humidity';
  selectedFields: string[] = [];

  loading = false;
  error: string | null = null;
  data: any[] = [];

  // Obtener categorías disponibles para la granularidad actual
  get availableCategories(): string[] {
    return Object.keys(FIELDS_BY_GRANULARITY[this.granularity] || {});
  }

  // Obtener todos los campos disponibles para la granularidad actual
  get availableFieldsFlat(): string[] {
    const categories = FIELDS_BY_GRANULARITY[this.granularity] || {};
    const fields: string[] = [];
    Object.values(categories).forEach(categoryFields => {
      fields.push(...categoryFields);
    });
    return fields;
  }

  // Obtener campos disponibles de una categoría específica
  getFieldsByCategory(category: string): string[] {
    return FIELDS_BY_GRANULARITY[this.granularity]?.[category] || [];
  }

  // Mejor manejar la lógica de separación de campos en TypeScript
  get fieldsArray(): string[] {
    return this.selectedFields;
  }

  // Sincronizar campos string con selectedFields
  updateFieldsFromString(): void {
    const raw: string[] = (this.fields ?? '').split(',');
    const trimmed: string[] = raw.map((f: string) => (f ?? '').trim());
    this.selectedFields = trimmed.filter((f: string) => f.length > 0);
  }

  // Sincronizar selectedFields con campos string
  updateFieldsToString(): void {
    this.fields = this.selectedFields.join(',');
  }

  // Toggle un campo en la selección
  toggleField(fieldName: string): void {
    const index = this.selectedFields.indexOf(fieldName);
    if (index > -1) {
      this.selectedFields.splice(index, 1);
    } else {
      this.selectedFields.push(fieldName);
    }
    this.updateFieldsToString();
  }

  // Toggle todos los campos de una categoría
  toggleAllInCategory(category: string): void {
    const fields = this.getFieldsByCategory(category);
    const allSelected = fields.every(f => this.selectedFields.includes(f));
    if (allSelected) {
      fields.forEach(f => {
        const idx = this.selectedFields.indexOf(f);
        if (idx > -1) this.selectedFields.splice(idx, 1);
      });
    } else {
      fields.forEach(f => {
        if (!this.selectedFields.includes(f)) this.selectedFields.push(f);
      });
    }
    this.updateFieldsToString();
  }

  // Verificar si todos los campos de una categoría están seleccionados
  isCategoryFullySelected(category: string): boolean {
    const fields = this.getFieldsByCategory(category);
    return fields.length > 0 && fields.every(f => this.selectedFields.includes(f));
  }

  // Seleccionar TODOS los campos disponibles para la granularidad actual
  selectAllFields(): void {
    const allFields = this.availableFieldsFlat;
    allFields.forEach(f => {
      if (!this.selectedFields.includes(f)) this.selectedFields.push(f);
    });
    this.updateFieldsToString();
  }

  // Deseleccionar TODOS los campos
  clearAllFields(): void {
    this.selectedFields = [];
    this.updateFieldsToString();
  }

  // Verificar si TODOS los campos están seleccionados
  areAllFieldsSelected(): boolean {
    const allFields = this.availableFieldsFlat;
    return allFields.length > 0 && allFields.every(f => this.selectedFields.includes(f));
  }

  // Cuando cambia granularidad, preseleccionar campos por defecto
  onGranularityChange(): void {
    this.selectedFields = [];
    this.fields = '';
    // Preseleccionar automáticamente los primeros 2 campos de cada categoría de la nueva granularidad
    const categories = this.availableCategories;
    if (categories.length > 0) {
      for (let i = 0; i < Math.min(2, categories.length); i++) {
        const categoryFields = this.getFieldsByCategory(categories[i]);
        if (categoryFields.length > 0) {
          this.selectedFields.push(categoryFields[0]);
        }
      }
      this.updateFieldsToString();
    }
  }

  constructor(private weatherService: WeatherService, private cdr: ChangeDetectorRef) {
    // Inicializar selectedFields desde fields
    this.updateFieldsFromString();
    console.log('Constructor: selectedFields inicializado:', this.selectedFields);
    console.log('Constructor: fields inicializado:', this.fields);
  }

  queryData() {
    // Asegurar que fields esté sincronizado con selectedFields
    this.updateFieldsToString();

    console.log('Iniciando query con:', {
      stationId: this.stationId,
      timezone: this.timezone,
      startTime: this.startTime,
      endTime: this.endTime,
      granularity: this.granularity,
      fields: this.fields,
      selectedFields: this.selectedFields
    });

    // Validación: verificar que hay campos seleccionados
    if (!this.fields || this.fields.trim() === '') {
      this.error = 'Por favor selecciona al menos un campo';
      this.loading = false;
      console.error('Error: no hay campos seleccionados');
      return;
    }

    this.error = null;
    this.loading = true;
    this.data = [];

    this.weatherService
      .getStationData(this.stationId, this.timezone, this.startTime, this.endTime, this.granularity, this.fields)
      .subscribe({
        next: (res) => {
          console.log('Respuesta recibida:', res);
          this.data = res || [];
          this.loading = false;
          // Forzar detección de cambios para actualizar la vista
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error en la consulta:', err);
          this.error = err?.message || 'Error al solicitar datos';
          this.loading = false;
          // Forzar detección de cambios para mostrar error
          this.cdr.detectChanges();
        }
      });
  }
}

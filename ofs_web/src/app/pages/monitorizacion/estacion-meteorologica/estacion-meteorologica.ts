import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
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
  private readonly stationId = '83b2635b-2f70-4137-8e3b-ff7e907a10f9';
  timezone = 'Europe/Madrid';
  // Inicializar endTime a ahora y startTime 3 horas antes al cargar
  endTime = this.getDateHoursAgo(0);
  startTime = this.getDateHoursAgo(3);
  granularity = 'hour';
  fields = 'avg_temperature,avg_humidity';
  selectedFields: string[] = [];
  // UI
  showFilters = false;
  // Widget lateral
  latestData: any = null;
  loadingWidget = false;

  loading = false;
  error: string | null = null;
  data: any[] = [];
  expandedIndex: number | null = null;

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

  // Toggle para expandir/contraer un item
  toggleExpanded(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  // Obtener las claves de datos de un row (excluyendo start_time y end_time)
  getDataKeys(row: any): string[] {
    return Object.keys(row).filter(key => key !== 'start_time' && key !== 'end_time');
  }

  // Calcular una fecha N horas atrás desde ahora y devolver en HORA LOCAL
  private getDateHoursAgo(hours: number): string {
    const date = new Date();
    date.setHours(date.getHours() - hours);
    return this.formatLocalDateTime(date);
  }

  // Formatear Date a 'YYYY-MM-DDTHH:MM:SS' en hora local (compatible con datetime-local y la API)
  private formatLocalDateTime(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
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

  constructor(private weatherService: WeatherService, private cdr: ChangeDetectorRef, private ngZone: NgZone) {
    // Inicializar selectedFields desde fields
    this.updateFieldsFromString();
    console.log('Constructor: selectedFields inicializado:', this.selectedFields);
    console.log('Constructor: fields inicializado:', this.fields);
    // Inicializar widget y tiempos (end ahora, start 3h antes)
    this.refreshTimesToNow();
    // Cargar datos actuales para widget
    this.fetchLatestWidgetData();
  }

  // Establecer endTime a ahora y startTime a N horas antes
  refreshTimesToNow(hoursBack: number = 3): void {
    this.endTime = this.getDateHoursAgo(0);
    this.startTime = this.getDateHoursAgo(hoursBack);
    // Asegurar que el template vea los cambios inmediatamente
    try { this.cdr.detectChanges(); } catch (e) { /* noop */ }
  }

  // Buscar datos recientes para el widget lateral (última hora)
  fetchLatestWidgetData(): void {
    this.loadingWidget = true;
    const widgetEnd = this.getDateHoursAgo(0);
    const widgetStart = this.getDateHoursAgo(1);
    // Elegir campos comunes para el widget
    const widgetFields = 'temperature,humidity,pressure,wind_speed,wind_direction,rainfall';
    this.weatherService.getStationData(this.stationId, this.timezone, widgetStart, widgetEnd, 'raw', widgetFields)
      .subscribe({
        next: (res) => {
          // Respuesta esperada: array de mediciones; usar la última
          if (Array.isArray(res) && res.length > 0) {
            this.latestData = res[res.length - 1];
          } else if (res && typeof res === 'object') {
            // Si API devuelve objeto con 'data' array
            const arr = res.data || [];
            this.latestData = arr.length > 0 ? arr[arr.length - 1] : res;
          } else {
            this.latestData = null;
          }
          this.loadingWidget = false;
          // Forzar detección de cambios para que el widget se muestre sin necesidad de otras interacciones
          try { this.cdr.detectChanges(); } catch (e) { /* noop */ }
        },
        error: (err) => {
          console.error('Error widget datos recientes:', err);
          this.latestData = null;
          this.loadingWidget = false;
          try { this.cdr.detectChanges(); } catch (e) { /* noop */ }
        }
      });
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
    this.expandedIndex = null;

    this.weatherService
      .getStationData(this.stationId, this.timezone, this.startTime, this.endTime, this.granularity, this.fields)
      .subscribe({
        next: (res) => {
          console.log('Respuesta recibida:', res);
          this.data = res || [];
          this.loading = false;
          this.expandedIndex = this.data.length > 0 ? 0 : null;
          // Forzar detección de cambios inmediatamente
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error en la consulta:', err);
          // Mostrar información más útil al usuario cuando la estación no existe
          const status = err?.status;
          if (status === 404) {
            this.error = `Estación no encontrada (404). Verifica que el stationId ${this.stationId} es correcto.`;
          } else if (status) {
            // Si hay un status distinto, mostrarlo
            const serverMsg = err?.error?.message || err?.message || JSON.stringify(err?.error || err);
            this.error = `Error ${status}: ${serverMsg}`;
          } else {
            this.error = err?.message || 'Error al solicitar datos';
          }
          this.loading = false;
          this.expandedIndex = null;
          // Forzar detección de cambios inmediatamente
          this.cdr.markForCheck();
        }
      });
  }
}

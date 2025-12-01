import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeatherService } from '../../../services/weather.service';

@Component({
  selector: 'app-estacion-meteorologica',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estacion-meteorologica.html',
  styleUrls: ['./estacion-meteorologica.scss']
})
export class EstacionMeteorologica {
  stationId = 'default_station';
  timezone = 'Europe/Madrid';
  startTime = new Date().toISOString().slice(0, 19);
  endTime = new Date().toISOString().slice(0, 19);
  granularity = 'hour';
  fields = 'avg_temperature,avg_humidity';

  loading = false;
  error: string | null = null;
  data: any[] = [];

  constructor(private weatherService: WeatherService) {}

  queryData() {
    this.error = null;
    this.loading = true;
    this.data = [];

    this.weatherService
      .getStationData(this.stationId, this.timezone, this.startTime, this.endTime, this.granularity, this.fields)
      .subscribe({
        next: (res) => {
          this.data = res || [];
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.error = err?.message || 'Error al solicitar datos';
          this.loading = false;
        }
      });
  }
}

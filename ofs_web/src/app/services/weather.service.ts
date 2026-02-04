import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  // Usar el host de producción/aplicación: api.picoweather.net
  private baseUrl = 'https://api.picoweather.net';

  constructor(private http: HttpClient) {}

  /**
   * Llama al endpoint /stations/{station_id}/data con los parámetros indicados
   */
  getStationData(
    stationId: string,
    timezone: string,
    startTime: string,
    endTime: string,
    granularity: string,
    fields: string
  ): Observable<any> {
    const url = `${this.baseUrl}/stations/${encodeURIComponent(stationId)}/data`;

    let params = new HttpParams()
      .set('timezone', timezone)
      .set('start_time', startTime)
      .set('end_time', endTime)
      .set('granularity', granularity)
      .set('fields', fields);

    return this.http.get<any>(url, { params });
  }
}

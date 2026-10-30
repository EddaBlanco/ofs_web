import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Estrella {
  cx: number;
  cy: number;
  r: number;
  retraso: number;
}

@Component({
  selector: 'app-animacion-radiotelescopio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './animacion-radiotelescopio.html',
  styleUrls: ['./animacion-radiotelescopio.scss']
})
export class AnimacionRadiotelescopio {
  // La animación se puede pausar para leerla con calma o por accesibilidad
  pausada = false;

  // Paquetes de onda que viajan del átomo a la antena (retrasos en segundos)
  readonly fotones = [0, 1.1, 2.2, 3.3];

  readonly estrellas: Estrella[] = [
    { cx: 38, cy: 64, r: 1.2, retraso: 0 },
    { cx: 78, cy: 214, r: 1, retraso: 0.6 },
    { cx: 104, cy: 42, r: 1.4, retraso: 1.2 },
    { cx: 132, cy: 250, r: 1.1, retraso: 1.8 },
    { cx: 176, cy: 78, r: 0.9, retraso: 0.3 },
    { cx: 196, cy: 196, r: 1.3, retraso: 2.1 },
    { cx: 232, cy: 56, r: 1, retraso: 1.5 },
    { cx: 258, cy: 236, r: 0.9, retraso: 0.9 },
    { cx: 286, cy: 128, r: 1.2, retraso: 2.4 },
    { cx: 312, cy: 44, r: 0.8, retraso: 0.2 },
    { cx: 338, cy: 208, r: 1.1, retraso: 1.7 },
    { cx: 366, cy: 96, r: 1.3, retraso: 2.7 },
    { cx: 392, cy: 250, r: 0.9, retraso: 1.1 },
    { cx: 412, cy: 62, r: 1, retraso: 0.5 },
    { cx: 58, cy: 148, r: 0.8, retraso: 2.9 },
    { cx: 246, cy: 292, r: 1, retraso: 2.2 },
    { cx: 330, cy: 288, r: 0.8, retraso: 1.4 },
    { cx: 152, cy: 306, r: 0.9, retraso: 0.8 }
  ];

  alternarAnimacion(): void {
    this.pausada = !this.pausada;
  }
}

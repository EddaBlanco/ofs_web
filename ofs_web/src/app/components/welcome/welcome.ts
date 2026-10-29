import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  imports: [CommonModule],
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss'
})
export class Welcome {
  readonly small = this.multipleBoxShadow(700);
  readonly medium = this.multipleBoxShadow(200);
  readonly big = this.multipleBoxShadow(100);

  /**
   * Genera una capa de estrellas con box-shadow.
   * Usamos un rango amplio para cubrir también pantallas grandes.
   */
  private multipleBoxShadow(count: number): string {
    const randomPosition = () => Math.floor(Math.random() * 2600);
    const shadows: string[] = [];

    for (let index = 0; index < count; index++) {
      shadows.push(`${randomPosition()}px ${randomPosition()}px #ffffff`);
    }

    return shadows.join(', ');
  }
}

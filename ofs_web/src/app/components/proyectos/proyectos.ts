import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBinoculars,
  faSatelliteDish,
  faMicrochip,
  faLandmarkDome,
  faLaptopCode
} from '@fortawesome/free-solid-svg-icons';

interface Proyecto {
  title: string;
  description: string;
  icon: IconDefinition;
  accent: string;
  accentSoft: string;
  route?: string;
  linkLabel?: string;
}

@Component({
  selector: 'app-proyectos',
  imports: [RouterModule, FontAwesomeModule],
  templateUrl: './proyectos.html',
  styleUrl: './proyectos.scss'
})
export class Proyectos {
  readonly projects: Proyecto[] = [
    {
      title: 'Telescopio',
      description:
        'Restauración del MEADE LX200-ACF de 245 mm para observación planetaria y lunar.',
      icon: faBinoculars,
      accent: '#f5c91a',
      accentSoft: 'rgba(245, 201, 26, 0.16)'
    },
    {
      title: 'Radiotelescopio',
      description:
        'Recepción de espectros de radiofrecuencia de la línea de 21 cm y publicación de las observaciones.',
      icon: faSatelliteDish,
      accent: '#13d8f5',
      accentSoft: 'rgba(19, 216, 245, 0.16)',
      route: '/pages/monitorizacion/radiotelescopio',
      linkLabel: 'Ver radiotelescopio'
    },
    {
      title: 'Hardware',
      description:
        'Cámara ZWO, Allsky, Estación meteorológica y piranómetro para medir el cielo y la radiación solar.',
      icon: faMicrochip,
      accent: '#9b8cff',
      accentSoft: 'rgba(155, 140, 255, 0.18)'
    },
    {
      title: 'Cúpula',
      description:
        'Cúpula restaurada y operativa, preparada para las sesiones de observación.',
      icon: faLandmarkDome,
      accent: '#4fd1a5',
      accentSoft: 'rgba(79, 209, 165, 0.16)'
    },
    {
      title: 'Web',
      description:
        'Plataforma web creada con Angular para la divulgación y difusión de las actividades que llevamos a cabo en el observatorio.',
      icon: faLaptopCode,
      accent: '#f472b6',
      accentSoft: 'rgba(244, 114, 182, 0.16)'
    }
  ];
}

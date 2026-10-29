import { Routes } from '@angular/router';
import { Monitorizacion } from './pages/monitorizacion/monitorizacion';
import { Camaras } from './pages/monitorizacion/camaras/camaras';
import { EstacionMeteorologica } from './pages/monitorizacion/estacion-meteorologica/estacion-meteorologica';
import { Radiotelescopio } from './pages/monitorizacion/radiotelescopio/radiotelescopio';
import { Equipamiento } from './pages/equipamiento/equipamiento';
import { Home } from './components/home/home';

export const routes: Routes = [
  { path: '', component: Home, title: 'Inicio | Observatorio Francisco Sánchez' },
  {
    path: 'pages/monitorizacion',
    component: Monitorizacion,
    title: 'Monitorización | Observatorio Francisco Sánchez'
  },
  {
    path: 'pages/monitorizacion/camaras',
    component: Camaras,
    title: 'Cámaras | Observatorio Francisco Sánchez'
  },
  {
    path: 'pages/monitorizacion/estacion-meteorologica',
    component: EstacionMeteorologica,
    title: 'Estación meteorológica | Observatorio Francisco Sánchez'
  },
  {
    path: 'pages/monitorizacion/radiotelescopio',
    component: Radiotelescopio,
    title: 'Radiotelescopio | Observatorio Francisco Sánchez'
  },
  {
    path: 'pages/equipamiento',
    component: Equipamiento,
    title: 'Equipamiento | Observatorio Francisco Sánchez'
  },
  { path: '**', redirectTo: '' }
];

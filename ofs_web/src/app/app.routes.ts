import { Routes } from '@angular/router';
import { Monitorizacion } from './pages/monitorizacion/monitorizacion';
import { Camaras } from './pages/monitorizacion/camaras/camaras';
import { EstacionMeteorologica } from './pages/monitorizacion/estacion-meteorologica/estacion-meteorologica';
import { Equipamiento } from './pages/equipamiento/equipamiento';
import { Home } from './components/home/home';


export const routes: Routes = [
{path: '', component: Home},    
{ path: 'pages/monitorizacion', component: Monitorizacion },
{ path: 'pages/monitorizacion/camaras', component: Camaras },
{ path: 'pages/monitorizacion/estacion-meteorologica', component: EstacionMeteorologica },
{ path: 'pages/equipamiento', component: Equipamiento },
{ path: '', redirectTo: 'monitorizacion', pathMatch: 'full' }
];

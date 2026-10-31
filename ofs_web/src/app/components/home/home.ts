import { Component } from '@angular/core';
import { Landing } from '../landing/landing';
import { Welcome } from '../welcome/welcome';
import { Historia } from '../historia/historia';
import { Proyectos } from '../proyectos/proyectos';
import { CarruselFotos } from '../carrusel-fotos/carrusel-fotos';

@Component({
  selector: 'app-home',
  imports: [Landing, Welcome, Historia, Proyectos, CarruselFotos],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {}

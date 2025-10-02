import { Component } from '@angular/core';
import { Welcome } from '../welcome/welcome';

@Component({
  selector: 'app-landing',
  imports: [Welcome],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class Landing {

}

import { Component } from '@angular/core';
import { Footer } from '../footer/footer';
import { Landing } from '../landing/landing';
import { Welcome } from '../welcome/welcome';

@Component({
  selector: 'app-home',
  imports: [Footer,Landing,Welcome ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

}

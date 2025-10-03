import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Welcome } from "./components/welcome/welcome";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Footer } from "./components/footer/footer";
import { Landing } from "./components/landing/landing";
import{ routes } from './app.routes';
import { Navbar } from './components/navbar/navbar';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Welcome, Footer, Landing,FontAwesomeModule,Navbar,],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ofs_web');
}

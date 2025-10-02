import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Welcome } from "./components/welcome/welcome";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Footer } from "./components/footer/footer";
import { Landing } from "./components/landing/landing";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Welcome, Footer, Landing],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ofs_web');
}

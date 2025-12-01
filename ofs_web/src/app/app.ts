import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { Welcome } from "./components/welcome/welcome";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Footer } from "./components/footer/footer";
import { Landing } from "./components/landing/landing";
import{ routes } from './app.routes';
import { Navbar } from './components/navbar/navbar';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FontAwesomeModule, Navbar, HttpClientModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('ofs_web');
}

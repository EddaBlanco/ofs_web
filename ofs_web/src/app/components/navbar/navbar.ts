import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-navbar',
  imports: [RouterModule,NgbDropdownModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {

	isNavbarCollapsed = true;

toggleNavbarCollapsed() {
  this.isNavbarCollapsed = !this.isNavbarCollapsed;
}
	
	

}

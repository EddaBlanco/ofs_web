import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTwitter, faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-footer',
  imports: [FontAwesomeModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
  readonly year = new Date().getFullYear();
  readonly faTwitter = faTwitter;
  readonly faFacebook = faFacebook;
  readonly faInstagram = faInstagram;
  readonly faMapMarkerAlt = faMapMarkerAlt;
}

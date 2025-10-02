import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
@Component({
  selector: 'app-welcome',
  imports: [CommonModule],
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss'
})
export class Welcome {
    small = this.multipleBoxShadow(700);
    medium = this.multipleBoxShadow(200);
    big = this.multipleBoxShadow(100);
multipleBoxShadow(n: number) {
        let value = Math.floor(Math.random()*2000) + "px " + Math.floor(Math.random()*2000) + "px " + "#FFF";
        for (let index = 2; index < n; index++) {
            value = value + " , " +Math.floor(Math.random()*2000) + "px " + Math.floor(Math.random()*2000) + "px " + "#FFF";
        }
        return value; 
    }
}

import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private router: Router) {
    // this.router.events.subscribe(event => {
    //   console.log(event);
    // });
    // console.log("")
  }

  ngOnInit(): void {
    console.log("AppComponent ngOnInit");
  }

}

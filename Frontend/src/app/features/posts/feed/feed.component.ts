import { Component } from '@angular/core';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent {
  constructor() {
    console.log("Feed constructor");
  }

  ngOnInit() {
    console.log("Feed ngOnInit");
  }
}

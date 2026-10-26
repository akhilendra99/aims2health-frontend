import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-how-it-works',
    templateUrl: './how-it-works.component.html',
    styleUrls: ['./how-it-works.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HowItWorksComponent implements OnInit {

  constructor() { }

  public loadScript(url: string) {
    let node = document.createElement('script');
    node.src = url;
    node.type = 'text/javascript';
    document.getElementsByTagName('head')[0].appendChild(node);
}

  ngOnInit(): void {
    this.loadScript("assets/scripts/main.js");
    this.loadScript("/src/scripts/owl.carousel.min.js");
    this.loadScript("/src/scripts/jquery-3.1.1.slim.min.js");

  }

}

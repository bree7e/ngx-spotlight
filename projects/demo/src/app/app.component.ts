import { Component, Inject } from '@angular/core';

import { WINDOW } from 'ngx-window-token';
// import { WINDOW } from '@ng-web-apis/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'demo';
  info = '';
  console = console;

  constructor(@Inject(WINDOW) _window: Window) {
    this.info = _window.navigator.userAgent;
  }
}

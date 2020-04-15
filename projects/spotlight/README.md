# NGX Spotlight

An angular directive to highlight 🔦 DOM element by adding a overlay layer to the rest of the page

[Demo application](https://bree7e.github.io/ngx-spotlight/)

## Installation

To install this library, run:

```bash
$ npm install ngx-spotlight ngx-window-token --save
```

and then import module:

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { NgxSpotlightModule } from 'ngx-spotlight'; // <===

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    NgxSpotlightModule, // <===
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

## Usage

Simple case

```html
<div ngxSpotlight [auto]="true">
  ...
</div>
```

Advanced case

```html
<div
  ngxSpotlight="some-id"
  #sl="spotlight"
  [overlay]="false"
  [border]="true"
  [borderWidth]="8"
  [indent]="15"
  (spotlightClick)="console.warn($event)"
>
  <button (click)="sl.isShown ? sl.hide() : sl.show()">Toggle</button>
</div>
```

Directive can be shown using `SpotlightService`.

```ts
constructor(private spotlightService: SpotlightService) {}

this.spotlightService.getById('some-id').show();
this.spotlightService.getById('some-id').hide();
```


### Inputs

| Name         | Type    | Default                      | Description                                                   |
| ------------ | ------- | ---------------------------- | ------------------------------------------------------------- |
| ngxSpotlight | string  | 'spotlight*at*' + Date.now() | id                                                            |
| border       | boolean | false                        | draw border around spotlight element                          |
| borderWidth  | number  | 4                            | border width in 'px'                                          |
| indent       | number  | 0                            | space around spotlight element                                |
| overlay      | boolean | false                        | disable click on spotlight element, fire spotlightClick event |
| auto         | boolean | false                        | highlight element after view init                             |

### Outputs

There is a `spotlightClick` event that occurs when a user click on directive elements.

```ts
type SpotlightElementName =
  | 'container'
  | 'backdrop-top'
  | 'backdrop-bottom'
  | 'backdrop-left'
  | 'backdrop-right'
  | 'overlay'
  | 'border-top'
  | 'border-bottom'
  | 'border-left'
  | 'border-right';

interface SpotlightClick {
  piece: SpotlightElementName;
  mouse: MouseEvent;
}
```

## Customization

Variables should be declared for a global scope (:root or the body selector).

| CSS variable                             | Default value         | Description                         |
| ---------------------------------------- | --------------------- | ----------------------------------- |
| --color\_\_spotlight-backdrop_background | rgba(52, 74, 94, 0.8) | Color of the backdrop               |
| --color\_\_spotlight-border              | #c9c9c9               | Border color of highlighted element |

```css
body {
  --color__spotlight-backdrop_background: black;
  --color__spotlight-border: lightgreen;
}
```

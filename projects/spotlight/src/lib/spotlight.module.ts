import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SpotlightDirective } from './spotlight.directive';

/**
 * Spotlight directive.
 * It's used to highlight specific element on the page
 *
 * Usage:
 * ```html
 * <some-component ngxSpotlight></some-component>
 * ```
 */
@NgModule({
  declarations: [SpotlightDirective],
  imports: [CommonModule],
  exports: [SpotlightDirective]
})
export class NgxSpotlightModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SpotlightDirective } from './spotlight.directive';

/**
 * Onboarding spotlight directive.
 *
 * It's used to spotlight specific elements when the hint is shown.
 *
 * Usage:
 * ```html
 * <some-component ngxSpotlight="site/ssl"></some-component>
 * ```
 * When the hint is opened the service picks the element with this directive
 * and calls the `show()` method inside it. When it've been closed, the service
 * calls `hide()`
 */
@NgModule({
  declarations: [SpotlightDirective],
  imports: [CommonModule],
  exports: [SpotlightDirective]
})
export class NgxSpotlightModule { }

import {
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';

import { WINDOW } from 'ngx-window-token';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { fromEvent, merge } from 'rxjs';

import { SpotlightService } from './spotlight.service';

/** all 4 sides */
type Side = 'top' | 'bottom' | 'left' | 'right';

/** setStyles method properties */
interface SetStyleProps {
  top?: string | number;
  bottom?: string | number;
  left?: string | number;
  right?: string | number;
  width?: string | number;
  height?: string | number;
}

/**
 * Onboarding spotlight directive
 *
 * This lets you to spotlight certain elements
 * by placing 4 dark transparent divs around it
 *
 * Usage:
 * ```html
 * <vepp-ssl-widget ngxSpotlight="site/ssl"></vepp-ssl-widget>
 * ```
 *
 * TODO: add optional settings for element like backdrop gap, outlining or a shadow
 */
@Directive({
  selector: '[ngxSpotlight]',
})
export class SpotlightDirective implements OnInit, OnDestroy {
  /** overlay click event */
  @Output() overlayClick = new EventEmitter<void>();
  /** onboarding tip id */
  @Input('ngxSpotlight') public id: string;
  /** whether the directive is shown */
  private _isShown = false;
  /** set of all created corresponding elements (backdrops and overlay) */
  private _layerSet = new Set<HTMLElement>();
  /**
   * set of listeners that should be "unlistened" on destroying
   * @see https://angular.io/api/core/Renderer2#listen
   */
  private _listenerSet = new Set<() => void>();

  constructor(
    private _spotlightService: SpotlightService,
    @Inject(WINDOW) private _window: Window,
    public readonly elementRef: ElementRef<HTMLElement>,
    private _renderer: Renderer2,
    private _zone: NgZone
  ) {}

  ngOnInit(): void {
    this._spotlightService.register(this.id, this);
  }

  ngOnDestroy(): void {
    this._spotlightService.deregister(this.id);
    this.hideOverlay();
    this._renderer.destroy();
  }

  /**
   * Scrolls the window to the top
   */
  private _scrollToTop(): void {
    this._window.scrollTo({
      left: 0,
      top: 0,
    });
  }

  /**
   * Watches for window resize and, when it occurs, modifies the layers styles
   */
  private _watchWindowResize(): void {
    const updateBackdropStyles = () => {
      for (const layer of this._layerSet) {
        this._modifyBackdropPieceStyle(layer);
      }
    };
    this._zone.runOutsideAngular(() => {
      merge(fromEvent(window, 'scroll'), fromEvent(window, 'resize'))
        .pipe(untilDestroyed(this))
        .subscribe(() => updateBackdropStyles());
    });
  }

  /**
   * Sets backdrop piece styles
   * @param element - the element to mutate
   * @param props - the limited set of CSS properties
   */
  private _setStyles(element: HTMLElement, props: SetStyleProps): void {
    for (const prop in props) {
      if (props.hasOwnProperty(prop)) {
        this._renderer.setStyle(element, prop, props[prop]);
      }
    }
  }

  /**
   * Modifies the given layer's styles **by mutating it**
   * @param piece - backdrop's layer HTML element
   */
  private _modifyBackdropPieceStyle(piece: HTMLElement): void {
    const rects = this.elementRef.nativeElement.getBoundingClientRect();
    const side = piece.dataset.side as Side;

    switch (side) {
      case 'top':
        return this._setStyles(piece, { top: 0, left: 0, right: 0, height: `${rects.top}px` });
      case 'bottom':
        return this._setStyles(piece, { top: `${rects.bottom}px`, left: 0, right: 0, bottom: 0 });
      case 'left':
        return this._setStyles(piece, {
          top: `${rects.top}px`,
          left: 0,
          width: `${rects.left}px`,
          height: `${rects.height}px`,
        });
      case 'right':
        return this._setStyles(piece, {
          top: `${rects.top}px`,
          left: `${rects.right}px`,
          right: 0,
          height: `${rects.height}px`,
        });
    }
  }

  /**
   * Places 4 backdrops around the elementRef
   */
  private _drawBackdrop(): void {
    for (const side of ['top', 'bottom', 'left', 'right'] as Side[]) {
      const backdropPiece: HTMLElement = this._renderer.createElement('div');
      this._renderer.addClass(backdropPiece, 'spotlight__backdrop');
      backdropPiece.dataset.side = side;
      this._modifyBackdropPieceStyle(backdropPiece);
      this._layerSet.add(backdropPiece);
      this._renderer.appendChild(this._window.document.body, backdropPiece);
    }
  }

  /**
   * Removes the backdrop and the overlay elements from the DOM
   */
  private _removeLayers(): void {
    for (const removeListener of this._listenerSet) {
      removeListener();
    }
    for (const layer of this._layerSet) {
      layer.remove();
    }
  }

  /**
   * Draws an invisible element over the spotlighted element from the DOM
   */
  private _drawOverlay(): void {
    const overlay = this._renderer.createElement('div');
    /** the size of the object and the positions of it's edges */
    const rects = this.elementRef.nativeElement.getBoundingClientRect();
    this._setStyles(overlay, {
      left: `${rects.left}px`,
      top: `${rects.top}px`,
      width: `${rects.width}px`,
      height: `${rects.height}px`,
    });
    this._renderer.addClass(overlay, 'spotlight__cover');
    this._listenerSet.add(
      this._renderer.listen(overlay, 'click', (event: MouseEvent) => {
        event.preventDefault();
        // nextHint();
      })
    );
    this._watchWindowResize();
    this._layerSet.add(overlay);
    this._renderer.appendChild(this.elementRef.nativeElement.parentElement, overlay);
  }

  /**
   * Shows the overlay
   * - Locks the scrolling for the user
   * - Scrolls the page to the very top
   * - Places 4 overlays around the element
   */
  public showOverlay(): void {
    if (this._isShown) {
      return;
    }
    this._scrollToTop();
    this._drawBackdrop();
    this._drawOverlay();
    this._isShown = true;
  }

  /**
   * Removes the overlay for this element
   */
  public hideOverlay(): void {
    if (!this._isShown) {
      return;
    }
    this._removeLayers();
    this._isShown = false;
  }
}

import {
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  Output,
  Renderer2,
  AfterViewInit,
} from '@angular/core';

import { WINDOW } from 'ngx-window-token';
import { fromEvent, merge, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SpotlightService } from './spotlight.service';
import { capitalize, getStyle } from './spotlight.util';

/** container + all 4 sides + overlay */
export type SpotlightElementName =
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

/**
 * Spotlight directive
 *
 * This lets you to spotlight certain elements
 * by placing 4 dark transparent divs around it
 */
@Directive({
  selector: '[ngxSpotlight]',
  exportAs: 'spotlight',
})
export class SpotlightDirective implements AfterViewInit, OnDestroy {
  /** spotlight id */
  @Input('ngxSpotlight') id = 'spotlight_at_' + Date.now();
  /** draw border around spotlight element */
  @Input() border = false;
  /** space around spotlight element */
  @Input() indent = 0;
  /** draw transparent overlay on spotlight element */
  @Input() overlay = false;
  /** highlight element after view init */
  @Input() auto = false;
  /** border width */
  @Input() borderWidth = 4;
  /** backdrop and overlay click event */
  @Output() spotlightClick = new EventEmitter<{
    piece: SpotlightElementName;
    mouse: MouseEvent;
  }>();
  /** whether the directive is shown */
  private _isShown = false;
  /** whether the spotlight is shown */
  get isShown(): boolean {
    return this._isShown;
  }
  /** main spotlight container */
  get container(): HTMLElement {
    return this._elementMap.get('container');
  }
  /** destroy subject (pattern) */
  private readonly _destroy$ = new Subject<void>();
  /** set of all created corresponding elements (backdrops, borders and overlay) */
  private readonly _elementMap = new Map<SpotlightElementName, HTMLElement>();
  /**
   * Set of listeners that should be "unlistened" on destroying
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

  ngAfterViewInit(): void {
    this._spotlightService.register(this.id, this);
    if (this.auto) {
      this.show();
    }
  }

  /**
   * Shows the overlay
   * - Scrolls the page to the very top
   * - Places 4 overlays around the element
   */
  public show(): void {
    if (this._isShown) {
      return;
    }
    this._drawContainer();
    this._drawBackdrop();
    if (this.border) {
      this._drawBorder();
    }
    if (this.overlay) {
      this._drawOverlay();
    }
    this._watchWindowUpdate();
    this._isShown = true;
  }

  /**
   * Places container to document body
   */
  private _drawContainer(): void {
    const container: HTMLElement = this._renderer.createElement('div');
    this._renderer.addClass(container, 'spotlight__container'); // just for show class
    this._setStyles(container, {
      position: 'absolute',
      zIndex: '940',
      left: '0px',
      top: '0px',
      right: '0px',
      bottom: '0px',
      pointerEvents: 'none',
    });
    this._elementMap.set('container', container);
    this._renderer.appendChild(this._window.document.body, container);
  }

  /**
   * Places 4 backdrops around the elementRef
   */
  private _drawBackdrop(): void {
    for (const side of ['top', 'bottom', 'left', 'right']) {
      const backdrop = `backdrop-${side}` as SpotlightElementName;
      const backdropEl: HTMLElement = this._renderer.createElement('div');
      this._renderer.addClass(backdropEl, 'spotlight__backdrop'); // just for show class
      this._renderer.addClass(backdropEl, `spotlight__backdrop_${side}`); // just for show class
      this._setStyles(backdropEl, {
        position: 'fixed',
        zIndex: '950',
        display: 'block',
        backgroundColor: `var(
          --color__spotlight-backdrop_background,
          rgba(52, 74, 94, 0.8)
        )`,
      });
      this._modifyPieceStyle(backdropEl, backdrop);
      this._listenerSet.add(
        this._renderer.listen(backdropEl, 'click', (event: MouseEvent) => {
          event.preventDefault();
          this.spotlightClick.emit({ piece: backdrop, mouse: event });
        })
      );
      this._elementMap.set(backdrop, backdropEl);
      this._renderer.appendChild(this.container, backdropEl);
    }
  }

  /**
   * Places 4 div around the spotlight to emulate stroke
   */
  private _drawBorder(): void {
    for (const side of ['top', 'bottom', 'left', 'right']) {
      const border = `border-${side}` as SpotlightElementName;
      const borderEl: HTMLElement = this._renderer.createElement('div');
      this._renderer.addClass(borderEl, 'spotlight__border'); // just for show class
      this._renderer.addClass(borderEl, `spotlight__border_${side}`); // just for show class
      this._setStyles(borderEl, {
        position: 'fixed',
        zIndex: '955',
        pointerEvents: 'none',
        borderRadius: '20px',
        display: 'block',
        borderColor: `var(
          --color__spotlight-border,
          #c9c9c9
        )`,
        [`border${capitalize(side)}Width`]: this.borderWidth + 'px',
        [`border${capitalize(side)}Style`]: 'solid',
      });
      this._modifyPieceStyle(borderEl, border);
      this._elementMap.set(border, borderEl);
      this._renderer.appendChild(this.container, borderEl);
    }
  }

  /**
   * Watches for window scroll&resize and, when it occurs, modifies the layers styles
   */
  private _watchWindowUpdate(): void {
    const updateHtmlElements = () => {
      for (const [piece, layer] of this._elementMap) {
        this._modifyPieceStyle(layer, piece);
      }
    };
    this._zone.runOutsideAngular(() => {
      merge(fromEvent(window, 'scroll'), fromEvent(window, 'resize'))
        .pipe(takeUntil(this._destroy$))
        .subscribe(() => updateHtmlElements());
    });
  }

  /**
   * Sets backdrop piece styles
   * @param element - the element to mutate
   * @param props - the limited set of CSS properties
   */
  private _setStyles(
    element: HTMLElement,
    props: Partial<CSSStyleDeclaration>
  ): void {
    for (const prop in props) {
      if (props.hasOwnProperty(prop)) {
        this._renderer.setStyle(element, prop, props[prop]);
      }
    }
  }

  /**
   * Modifies the given layer's styles **by mutating it**
   * @param el - backdrop's layer HTML element
   * @param piece - piece of spotlight element
   */
  private _modifyPieceStyle(
    el: HTMLElement,
    piece: SpotlightElementName
  ): void {
    if (piece !== 'container') {
      const rects = this.elementRef.nativeElement.getBoundingClientRect();
      const style = getStyle(rects, piece, this.borderWidth, this.indent);
      this._setStyles(el, style);
    }
  }

  /**
   * Draws an invisible element over the spotlighted element from the DOM
   */
  private _drawOverlay(): void {
    const overlay: HTMLDivElement = this._renderer.createElement('div');
    this._renderer.addClass(overlay, 'spotlight__cover'); // just for show element
    this._modifyPieceStyle(overlay, 'overlay');
    this._listenerSet.add(
      this._renderer.listen(overlay, 'click', (event: MouseEvent) => {
        event.preventDefault();
        this.spotlightClick.emit({ piece: 'overlay', mouse: event });
      })
    );
    this._elementMap.set('overlay', overlay);
    this._renderer.appendChild(
      this.elementRef.nativeElement.parentElement,
      overlay
    );
  }

  /**
   * Removes the spotlight for this element
   */
  public hide(): void {
    if (!this._isShown) {
      return;
    }
    this._removeElements();
    this._destroy$.next();
    this._isShown = false;
  }

  /**
   * Removes the backdrop and the overlay elements from the DOM
   */
  private _removeElements(): void {
    for (const removeListener of this._listenerSet) {
      removeListener();
    }
    this._listenerSet.clear();
    for (const layer of this._elementMap.values()) {
      layer.remove();
    }
    this._elementMap.clear();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this.hide();
    this._spotlightService.deregister(this.id);
  }
}

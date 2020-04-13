import { SpotlightElementName } from './spotlight.directive';

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Modifies the given layer's styles **by mutating it**
 * @param el - backdrop's layer HTML element
 * @param piece - piece of spotlight element
 */
export function getStyle(
  rects: DOMRect,
  piece: SpotlightElementName,
  borderWidth: number,
  indent: number
): Partial<CSSStyleDeclaration> {
  const left = rects.left - indent;
  const top = rects.top - indent;
  const right = rects.right + indent;
  const bottom = rects.bottom + indent;
  const width = rects.width + 2 * indent;
  const height = rects.height + 2 * indent;

  switch (piece) {
    case 'backdrop-top':
      return {
        top: '0',
        left: '0',
        right: '0',
        height: `${top}px`,
      };
    case 'backdrop-bottom':
      return {
        top: `${bottom}px`,
        left: '0',
        right: '0',
        bottom: '0',
      };
    case 'backdrop-left':
      return {
        top: `${top}px`,
        left: '0',
        width: `${left}px`,
        height: `${height}px`,
      };
    case 'backdrop-right':
      return {
        top: `${top}px`,
        left: `${right}px`,
        right: '0',
        height: `${height}px`,
      };
    case 'overlay':
      return {
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        height: `${height}px`,
        position: 'fixed',
        zIndex: '990',
      };
    case 'border-top':
      return {
        borderTopStyle: 'solid',
        top: `${top - borderWidth}px`,
        left: `${left - borderWidth}px`,
        height: `${borderWidth}px`,
        width: `${width + 2 * borderWidth}px`,
      };
    case 'border-bottom':
      return {
        top: `${bottom - borderWidth}px`,
        left: `${left - borderWidth}px`,
        height: `${borderWidth}px`,
        width: `${width + 2 * borderWidth}px`,
      };
    case 'border-left':
      return {
        top: `${top - borderWidth}px`,
        left: `${left - borderWidth}px`,
        height: `${height + 2 * borderWidth}px`,
        width: `${borderWidth}px`,
      };
    case 'border-right':
      return {
        top: `${top - borderWidth}px`,
        left: `${right - borderWidth}px`,
        height: `${height + 2 * borderWidth}px`,
        width: `${borderWidth}px`,
      };
    default:
      throw new Error(`Unexpected element ${piece}`);
  }
}

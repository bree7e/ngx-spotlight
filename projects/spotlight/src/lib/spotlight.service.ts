import { Injectable } from '@angular/core';

import { SpotlightDirective } from './spotlight.directive';

@Injectable({
  providedIn: 'root',
})
export class SpotlightService {
  /** available spotlights list */
  private _targetMap = new Map<string, SpotlightDirective>();

  constructor() {}

  /**
   * Registers the spotlight directive into the service
   * @param id - spotlight id
   * @param target - spotlight's directive reference
   */
  public register(id: string, target: SpotlightDirective): void {
    if (this._targetMap.has(id)) {
      throw new Error(`The ${id} spotlight is already registered!`);
    }
    this._targetMap.set(id, target);
  }

  /**
   * Unregisters the spotlight directive from the service. Should be used in directive's `OnDestroy` hook
   * @param id - spotlight's id
   */
  public deregister(id: string): void {
    this._targetMap.delete(id);
  }
}

// attributeStyleMap polyfill for browsers without CSS Typed OM
(function () {
  if (typeof window === 'undefined' || typeof HTMLElement === 'undefined') return;
  if ('attributeStyleMap' in HTMLElement.prototype) return;

  class AttributeStyleMapPolyfill {
    private _el: HTMLElement;
    constructor(el: HTMLElement) {
      this._el = el;
    }
    set(prop: string, value: string) {
      this._el.style.setProperty(prop, value);
    }
    get(prop: string) {
      return this._el.style.getPropertyValue(prop) || null;
    }
    has(prop: string) {
      return this._el.style.getPropertyValue(prop) !== '';
    }
    delete(prop: string) {
      this._el.style.removeProperty(prop);
    }
    // 可选：返回所有属性
    entries() {
      return Array.from(this._el.style).map(key => [key, this._el.style.getPropertyValue(key)]);
    }
  }

  Object.defineProperty(HTMLElement.prototype, 'attributeStyleMap', {
    get: function () {
      if (!this.__attributeStyleMap) {
        Object.defineProperty(this, '__attributeStyleMap', {
          value: new AttributeStyleMapPolyfill(this),
          enumerable: false,
          configurable: false,
          writable: false
        });
      }
      return this.__attributeStyleMap;
    },
    configurable: true,
    enumerable: false
  });
})();

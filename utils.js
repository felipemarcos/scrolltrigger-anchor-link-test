(function () {
  const is = {
    arr: function (a) {
      return Array.isArray(a);
    },
    obj: function (a) {
      return Object.prototype.toString.call(a).includes("Object");
    },
    str: function (a) {
      return typeof a === "string";
    },
    fnc: function (a) {
      return typeof a === "function";
    },
    und: function (a) {
      return typeof a === "undefined";
    },
    nil: function (a) {
      return is.und(a) || a === null;
    },
  };

  /*
   * Breakpoints
   */

  function getMediaQueryString(minWidth, maxWidth) {
    if (minWidth && maxWidth) {
      return `(min-width: ${minWidth}px) and (max-width: ${maxWidth}px)`;
    }

    if (maxWidth) {
      return `(max-width: ${maxWidth}px)`;
    }

    if (minWidth) {
      return `(min-width: ${minWidth}px)`;
    }

    return null;
  }

  // Check whether ANY breakpoint (except desktop) is currently active.
  function matchAnyMedia() {
    const { BASE_BREAKPOINT_ID, breakpoints } = window.BreakdanceFrontend.data;

    return breakpoints
      .filter((b) => b.id !== BASE_BREAKPOINT_ID)
      .some((b) => matchMedia(b));
  }

  // Check whether a specific breakpoint is active.
  // Accepts a Breakpoint ID or an entire Breakpoint object.
  function matchMedia(idOrBreakpoint) {
    const { BASE_BREAKPOINT_ID, breakpoints } = window.BreakdanceFrontend.data;
    const isId = typeof idOrBreakpoint === "string";
    const breakpoint = isId
      ? breakpoints.find((b) => b.id === idOrBreakpoint)
      : idOrBreakpoint;

    if (!breakpoint) return false;
    if (breakpoint.id === BASE_BREAKPOINT_ID) return !matchAnyMedia();

    const { minWidth, maxWidth } = breakpoint;
    const mediaQuery = getMediaQueryString(minWidth, maxWidth);
    return window.matchMedia(mediaQuery).matches;
  }

  // Return the current active breakpoint including desktop.
  function getCurrentBreakpoint(availableBreakpoints) {
    const { BASE_BREAKPOINT_ID, breakpoints } = window.BreakdanceFrontend.data;

    const activeBreakpoint = breakpoints
      .filter((b) => {
        if (!availableBreakpoints) return true;
        return availableBreakpoints.includes(b.id);
      })
      .sort((a, b) => a.maxWidth - b.maxWidth)
      .find((b) => matchMedia(b));

    return (
      activeBreakpoint || breakpoints.find((b) => b.id === BASE_BREAKPOINT_ID)
    );
  }

  /*
   * DOM-related utils
   */

  function selectString(str) {
    try {
      return document.querySelectorAll(str);
    } catch (e) {
      return null;
    }
  }

  // Turn element, string selector or nodeList into an array
  function toArray(o) {
    if (is.arr(o)) {
      return o;
    }
    if (is.str(o)) {
      o = selectString(o) || o;
    }
    if (o instanceof NodeList || o instanceof HTMLCollection) {
      return [].slice.call(o);
    }
    return [o];
  }

  /*
   * Objects
   */

  function cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Performs a deep merge of `source` into `target`.
   * Undefined values are not copied to the target object.
   * @author inspired by [jhildenbiddle](https://stackoverflow.com/a/48218209).
   */
  function mergeObjects(obj1, source) {
    const target = cloneObject(obj1);

    if (!is.obj(source)) {
      return target;
    }

    Object.keys(source).forEach((key) => {
      const targetValue = target[key];
      const sourceValue = source[key];

      if (is.obj(targetValue) && is.obj(sourceValue)) {
        target[key] = mergeObjects(Object.assign({}, targetValue), sourceValue);
      } else if (!is.nil(sourceValue)) {
        target[key] = sourceValue;
      }
    });

    return target;
  }

  /*
   * Event Listeners
   */

  function on(eventName, element, callback) {
    if (!is.fnc(callback)) {
      callback = element;
      element = null;
    }

    if (element) {
      toArray(element).forEach((el) => {
        el.addEventListener(eventName, callback);
      });
    } else {
      window.addEventListener(eventName, callback);
    }
  }

  function off(eventName, element, callback) {
    if (!is.fnc(callback)) {
      callback = element;
      element = null;
    }

    if (element) {
      toArray(element).forEach((el) => {
        el.removeEventListener(eventName, callback);
      });
    } else {
      window.removeEventListener(eventName, callback);
    }
  }

  function onResize(callback) {
    const resizeObserver = new ResizeObserver(callback);
    resizeObserver.observe(document.body);

    return () => {
      resizeObserver.disconnect();
    };
  }

  /*
   * Function
   */

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  function debounce(callback, wait, immediate) {
    let timeout;
    return function () {
      const context = this,
        args = arguments;
      const later = function () {
        timeout = null;
        if (!immediate) callback.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) callback.apply(context, args);
    };
  }

  function throttle(callback, wait) {
    let waiting = false;
    return function () {
      if (!waiting) {
        callback.apply(this, arguments);
        waiting = true;
        setTimeout(() => {
          waiting = false;
        }, wait);
      }
    };
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function makeAjaxRequest(url, options) {
    return fetch(url, options);
  }

  // trying to access parent.Breakdance from design lib will cause an error
  // cuz it's a cross domain iframe
  function isBuilder() {
    try {
      return !!window.parent.Breakdance;
    } catch (e) {
      return false;
    }
  }

  if (!window.BreakdanceFrontend) {
    window.BreakdanceFrontend = {};
  }

  window.BreakdanceFrontend.utils = {
    is,
    // Breakpoint
    getCurrentBreakpoint,
    getMediaQueryString,
    matchMedia,
    matchAnyMedia,

    // DOM
    toArray,
    // Objects
    cloneObject,
    mergeObjects,
    // Event Listeners
    on,
    off,
    onResize,
    // Other
    debounce,
    throttle,
    prefersReducedMotion,
    makeAjaxRequest,
    isBuilder,
  };
})();

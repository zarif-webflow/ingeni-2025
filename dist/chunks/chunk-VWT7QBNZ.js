var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// bin/live-reload.js
var init_live_reload = __esm({
  "bin/live-reload.js"() {
    "use strict";
    new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());
  }
});

// node_modules/.pnpm/@taj-wf+utils@1.3.0/node_modules/@taj-wf/utils/dist/index.js
init_live_reload();
var getHtmlElement = ({
  selector,
  parent,
  log = "debug"
}) => {
  const targetElement = (parent || document).querySelector(selector);
  if (targetElement === null) {
    if (log === false) return null;
    const consoleMethod = log === "debug" ? console.debug : console.error;
    consoleMethod(
      `${log.toUpperCase()}: Element with selector "${selector}" not found in ${parent !== void 0 ? "the specified parent element:" : "the document."}`,
      parent
    );
    return null;
  }
  return targetElement;
};
var getMultipleHtmlElements = ({
  selector,
  parent,
  log = "debug"
}) => {
  const targetElements = Array.from((parent || document).querySelectorAll(selector));
  if (targetElements.length === 0) {
    if (log === false) return null;
    const consoleMethod = log === "debug" ? console.debug : console.error;
    consoleMethod(
      `${log.toUpperCase()}: No elements found with selector "${selector}" in ${parent !== void 0 ? "the specified parent element:" : "the document."}`,
      parent
    );
    return null;
  }
  return targetElements;
};
var getGsap = (plugins = [], log = "error") => {
  let gsapInstance = null;
  const logFunc = log === "debug" ? console.debug : log === "error" ? console.error : null;
  try {
    gsapInstance = gsap;
  } catch {
    logFunc?.(
      "GSAP script needs to be imported before this script.",
      "\n",
      "Get GSAP from here: https://gsap.com/docs/v3/Installation/ "
    );
  }
  const result = [gsapInstance];
  for (let i = 0; i < plugins.length; i++) {
    const plugin = plugins[i];
    let pluginInstance = null;
    try {
      pluginInstance = window[plugin] || null;
      if (!pluginInstance) {
        throw new Error();
      }
    } catch {
      logFunc?.(
        `GSAP ${plugin} plugin script needs to be imported before this script.`,
        "\n",
        `Get the ${plugin} plugin from here: https://gsap.com/docs/v3/Installation/ `
      );
    }
    result[i + 1] = pluginInstance;
  }
  return result;
};
window.wfCustomPageLoadFeatures ||= {};

export {
  __commonJS,
  __toESM,
  init_live_reload,
  getHtmlElement,
  getMultipleHtmlElements,
  getGsap
};
//# sourceMappingURL=chunk-VWT7QBNZ.js.map

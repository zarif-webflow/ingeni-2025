// bin/live-reload.js
new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());

// node_modules/.pnpm/@taj-wf+utils@1.3.0/node_modules/@taj-wf/utils/dist/index.js
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
  getHtmlElement,
  getMultipleHtmlElements,
  getGsap
};
//# sourceMappingURL=chunk-TE6JR2D2.js.map

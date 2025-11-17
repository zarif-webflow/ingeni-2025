import { getHtmlElement } from "@taj-wf/utils";
// @ts-expect-error Missing types
import TypeWriter from "typewriter-effect/dist/core";

const textElement = getHtmlElement({ selector: "[platform-typewriter]" });

if (!textElement) throw new Error("Typewriter text element not found");

let typewriter: typeof TypeWriter | null = null;

export const useTypewriter = (text: string, delay?: number) => {
  if (typewriter) {
    typewriter.stop();
    typewriter = null;
    textElement.innerHTML = "";
  }

  typewriter = new TypeWriter(textElement, {
    delay: 20,
    deleteSpeed: 1,
  });

  typewriter.typeString(text);

  setTimeout(() => {
    typewriter.start();
  }, delay || 100);
};

export const prepareTypeWriterText = (text: string) => {
  return text
    .replaceAll("<H>", `<span class="platform-card-highlighted-text">`)
    .replaceAll("</H>", "</span>");
};

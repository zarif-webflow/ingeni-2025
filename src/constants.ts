import type { EmblaEventType } from "embla-carousel";

export const emblaEventListenersSet = new Set([
  "init",
  "reInit",
  "destroy",
  "select",
  "scroll",
  "settle",
  "resize",
  "slidesInView",
  "slidesChanged",
  "slideFocus",
  "pointerDown",
  "pointerUp",
  "autoplay:play",
  "autoplay:stop",
  "autoplay:select",
  "autoplay:timerset",
  "autoplay:timerstopped",
]) as Set<EmblaEventType>;

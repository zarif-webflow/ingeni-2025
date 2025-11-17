import { getGsap, getHtmlElement, getMultipleHtmlElements } from "@taj-wf/utils";
import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import EmblaCarousel from "embla-carousel";

type CarouselInstance = {
  emblaNode: HTMLElement;
  api: EmblaCarouselType;
  abortController: AbortController;
};

const carouselInstances: Array<CarouselInstance> = [];

const SELECTORS = {
  parent: "[carousel-parent]",
  container: "[data-carousel-container]",
  slide: "[data-carousel-slide]",
  nextButton: "[data-carousel-next]",
  prevButton: "[data-carousel-prev]",
} as const;

const getEmblaNodes = <T extends HTMLElement>(parent?: T) =>
  getMultipleHtmlElements({ selector: SELECTORS.parent, parent });

const applyEmblaCarousel = <T extends HTMLElement>(emblaNode: T) => {
  const emblaContainer = getHtmlElement({ selector: SELECTORS.container, parent: emblaNode });

  if (!emblaContainer) return;

  const emblaSlides = getMultipleHtmlElements({
    selector: SELECTORS.slide,
    parent: emblaContainer,
  });

  if (!emblaSlides) return;

  const options: EmblaOptionsType = {
    container: emblaContainer,
    slides: emblaSlides,
    align: "center",
    containScroll: false,
    startIndex: Math.floor(emblaSlides.length / 2),
  };

  const emblaApi = EmblaCarousel(emblaNode, options);

  const abortController = new AbortController();

  // Attach the API instance to the element for external access
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (emblaNode as any).emblaApi = emblaApi;

  const nextButton = getHtmlElement({ selector: SELECTORS.nextButton, parent: emblaNode });
  const prevButton = getHtmlElement({ selector: SELECTORS.prevButton, parent: emblaNode });

  if (nextButton && prevButton) {
    // Prevent all relevant events from propagating to parent elements on both buttons
    const swipeEvents = [
      "mousedown",
      "mousemove",
      "mouseup",
      "touchstart",
      "touchmove",
      "touchend",
    ];

    // Apply to next button
    swipeEvents.forEach((eventType) => {
      nextButton.addEventListener(
        eventType,
        (event) => {
          event.stopPropagation();
        },
        {
          passive: eventType === "touchmove" || eventType === "mousemove",
          signal: abortController.signal,
        }
      );
    });

    // Apply to prev button
    swipeEvents.forEach((eventType) => {
      prevButton.addEventListener(
        eventType,
        (event) => {
          event.stopPropagation();
        },
        {
          passive: eventType === "touchmove" || eventType === "mousemove",
          signal: abortController.signal,
        }
      );
    });

    // Existing click handlers
    nextButton.addEventListener(
      "click",
      (event) => {
        event.stopPropagation(); // Stop event propagation to parent elements
        if (emblaApi.canScrollNext()) {
          emblaApi.scrollNext();
        } else {
          emblaApi.scrollTo(0);
        }
      },
      { capture: false, signal: abortController.signal }
    );
    prevButton.addEventListener(
      "click",
      (event) => {
        event.stopPropagation(); // Stop event propagation to parent elements
        if (emblaApi.canScrollPrev()) {
          emblaApi.scrollPrev();
        } else {
          emblaApi.scrollTo(emblaApi.scrollSnapList().length - 1);
        }
      },
      { capture: false, signal: abortController.signal }
    );

    // Existing button adjustment code
    // const adjustButtons = () => {
    //   if (!emblaApi.canScrollNext()) {
    //     nextButton.classList.add("is-disable");
    //   } else {
    //     nextButton.classList.remove("is-disable");
    //   }

    //   if (!emblaApi.canScrollPrev()) {
    //     prevButton.classList.add("is-disable");
    //   } else {
    //     prevButton.classList.remove("is-disable");
    //   }
    // };
    // emblaApi.on("init", () => {
    //   adjustButtons();
    // });

    // emblaApi.on("reInit", () => {
    //   adjustButtons();
    // });

    // emblaApi.on("select", () => {
    //   adjustButtons();
    // });
  }

  carouselInstances.push({ emblaNode, api: emblaApi, abortController });

  return { emblaNode, emblaApi, emblaSlides };
};

const initializeCarousels = () => {
  const emblaNodes = getEmblaNodes();

  if (!emblaNodes) return;

  for (const emblaNode of emblaNodes) {
    const emblaReturn = applyEmblaCarousel(emblaNode);

    if (!emblaReturn) return;

    const [gsap] = getGsap();

    if (!gsap) return;

    const { emblaApi, emblaSlides } = emblaReturn;

    let currentIndex = emblaApi.selectedScrollSnap();

    const selectCurrentSlide = (currIndex: number) => {
      if (!emblaSlides) {
        console.debug("selectCurrentSlide was used before carousel was initialized");
        return;
      }

      for (let i = 0; i < emblaSlides.length; i++) {
        const slideCard = emblaSlides[i]!;
        const isCurrentSlide = i === currIndex;

        if (isCurrentSlide) {
          slideCard.classList.add("is-selected");

          gsap.to(slideCard, { scale: 1, x: 0, ease: "back", duration: 0.7 });
        } else {
          slideCard.classList.remove("is-selected");

          const isLeftSide = i < currIndex;

          const positionIndex = isLeftSide ? currIndex - i - 1 : i - currIndex - 1;

          const transformAlign = isLeftSide ? "right" : "left";
          slideCard.style.transformOrigin = `${transformAlign} center`;

          gsap.to(slideCard, {
            x: () => {
              const gapAdjustment = 4 + positionIndex * 2;

              return isLeftSide
                ? `${gapAdjustment * positionIndex}%`
                : `-${gapAdjustment * positionIndex}%`;
            },
            scale: () => {
              const scale = 0.92 - positionIndex * 0.05;
              return scale;
            },
            ease: "back",
            duration: 0.7,
          });
        }
      }
    };

    selectCurrentSlide(currentIndex);

    emblaApi.on("select", () => {
      currentIndex = emblaApi.selectedScrollSnap();

      selectCurrentSlide(currentIndex);
    });
  }
};

initializeCarousels();

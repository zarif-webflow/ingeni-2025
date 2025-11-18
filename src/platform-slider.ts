import { getGsap, getHtmlElement, getMultipleHtmlElements } from "@taj-wf/utils";
import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import EmblaCarousel from "embla-carousel";
import Autoplay from "embla-carousel-autoplay";

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

const getSliderDotButtons = (slideLength: number) => {
  const dotContainer = getHtmlElement({ selector: "[platform-carousel-dots]" });

  if (!dotContainer) {
    console.warn("[carousel-dots] Dot container not found");
    return;
  }

  const dotButton = getHtmlElement({ selector: "button", parent: dotContainer });

  if (!dotButton) {
    console.warn("Dot button not found");
    return;
  }

  const clonedDotButton = dotButton.cloneNode(true) as HTMLButtonElement;

  dotContainer.innerHTML = "";

  const dotButtons: Array<HTMLButtonElement> = [];

  for (let i = 0; i < slideLength; i++) {
    const newDotButton = clonedDotButton.cloneNode(true) as HTMLButtonElement;
    dotContainer.appendChild(newDotButton);
    dotButtons.push(newDotButton);
  }

  return dotButtons;
};

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
    startIndex: 0,
    // startIndex: Math.floor(emblaSlides.length / 2),
    loop: true,
  };

  const autoPlayDelay = Number.parseInt(emblaNode.getAttribute("autoplay-delay") || "5", 10) * 1000;

  const emblaApi = EmblaCarousel(emblaNode, options, [
    Autoplay({ delay: autoPlayDelay, stopOnMouseEnter: true, stopOnInteraction: false }),
  ]);

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
        }
      },
      { capture: false, signal: abortController.signal }
    );

    // Existing button adjustment code
    const adjustButtons = () => {
      if (!emblaApi.canScrollNext()) {
        nextButton.classList.add("is-disable");
      } else {
        nextButton.classList.remove("is-disable");
      }

      if (!emblaApi.canScrollPrev()) {
        prevButton.classList.add("is-disable");
      } else {
        prevButton.classList.remove("is-disable");
      }
    };
    emblaApi.on("init", () => {
      adjustButtons();
    });

    emblaApi.on("reInit", () => {
      adjustButtons();
    });

    emblaApi.on("select", () => {
      adjustButtons();
    });
  }

  carouselInstances.push({ emblaNode, api: emblaApi, abortController });

  return { emblaNode, emblaApi, emblaSlides };
};

const sortLeftToRightElements = (elements: HTMLElement[]) => {
  return [...elements].sort((a, b) => {
    const rectA = a.getBoundingClientRect();
    const rectB = b.getBoundingClientRect();
    return rectA.left - rectB.left;
  });
};

const callIntervals = (fn: () => void, times: number, intervalMs: number) => {
  let count = 0;
  const intervalId = setInterval(() => {
    fn();
    count += 1;
    if (count >= times) {
      clearInterval(intervalId);
    }
  }, intervalMs);

  return () => clearInterval(intervalId);
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

    const sliderDotButtons = getSliderDotButtons(emblaSlides.length);

    if (!sliderDotButtons || sliderDotButtons.length !== emblaSlides.length) {
      console.error("Slider dot buttons could not be initialized properly");
      return;
    }

    let currentIndex = emblaApi.selectedScrollSnap();

    const executeSlideMorphAnimation = async (selectedIndex: number) => {
      const currentSlideCard = emblaSlides[selectedIndex]!;
      const allSlideCards = sortLeftToRightElements(emblaSlides);

      if (!allSlideCards) return;

      let currentSlidePlacementIndex: null | number = null;

      for (let i = 0; i < allSlideCards.length; i++) {
        const slideCard = allSlideCards[i]!;

        const isCurrentSlide = slideCard.isSameNode(currentSlideCard);

        if (isCurrentSlide) {
          currentSlidePlacementIndex = i;
          break;
        }
      }

      if (currentSlidePlacementIndex === null) return;

      for (let i = 0; i < allSlideCards.length; i++) {
        const slideScalerCard =
          allSlideCards[i]!.querySelector<HTMLElement>(".platform-slider-scaler")!;

        const isCurrentSlide = i === currentSlidePlacementIndex;

        if (isCurrentSlide) {
          gsap.to(slideScalerCard, {
            scale: 1,
            x: 0,
            ease: "back",
            duration: 0.7,
            overwrite: true,
          });
        } else {
          const isFirstOrLast = i === 0 || i === allSlideCards.length - 1;
          const isLeftSide = i < currentSlidePlacementIndex;

          const positionIndex = isLeftSide
            ? currentSlidePlacementIndex - i - 1
            : i - currentSlidePlacementIndex - 1;

          const transformAlign = isLeftSide ? "right" : "left";
          slideScalerCard.style.transformOrigin = `${transformAlign} center`;

          gsap.to(slideScalerCard, {
            x: () => {
              const gapAdjustment = 6 + positionIndex * 3;

              return isLeftSide
                ? `${gapAdjustment * positionIndex}%`
                : `-${gapAdjustment * positionIndex}%`;
            },
            scale: () => {
              const scale = 0.9 - positionIndex * 0.05;
              return scale;
            },
            ease: "back",
            duration: isFirstOrLast ? 0.4 : 0.7,
            overwrite: true,
          });
        }
      }
    };

    const selectCurrentSlide = (currIndex: number) => {
      if (!emblaSlides) {
        console.debug("selectCurrentSlide was used before carousel was initialized");
        return;
      }

      callIntervals(
        () => {
          executeSlideMorphAnimation(currIndex);
        },
        10,
        50
      );

      for (let i = 0; i < emblaSlides.length; i++) {
        const slideCard = emblaSlides[i]!;
        const isCurrentSlide = i === currIndex;
        const sliderDotButton = sliderDotButtons[i]!;

        if (isCurrentSlide) {
          slideCard.classList.add("is-selected");
          sliderDotButton.classList.add("is-selected");
        } else {
          slideCard.classList.remove("is-selected");
          sliderDotButton.classList.remove("is-selected");
        }
      }
    };

    for (let i = 0; i < emblaSlides.length; i++) {
      const sliderDotButton = sliderDotButtons[i]!;

      sliderDotButton.addEventListener("click", () => {
        emblaApi.scrollTo(i);
      });
    }

    selectCurrentSlide(currentIndex);

    emblaApi.on("select", () => {
      currentIndex = emblaApi.selectedScrollSnap();

      selectCurrentSlide(currentIndex);
    });
  }
};

initializeCarousels();

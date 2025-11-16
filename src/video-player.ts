import { getMultipleHtmlElements } from "@taj-wf/utils";

const init = () => {
  const tabVideoWraps = getMultipleHtmlElements({ selector: "[tab-video-wrap]" });

  if (!tabVideoWraps) return;

  for (const tabVideoWrap of tabVideoWraps) {
    const video = tabVideoWrap.querySelector("video");

    if (!video) {
      console.warn("No video found inside tab-video-wrap");
      continue;
    }

    video.loop = true;
    video.muted = true;

    const trig = tabVideoWrap.querySelector("[tab-video-trig]");
    if (!trig) {
      console.warn("No trigger found inside tab-video-wrap");
      continue;
    }

    const playVideo = () => {
      video.play();
      isPaused = false;
      tabVideoWrap.classList.remove("is-paused");
    };

    const pauseVideo = () => {
      video.pause();
      isPaused = true;
      tabVideoWrap.classList.add("is-paused");
    };

    let isPaused = video.paused;

    if (isPaused) {
      pauseVideo();
    }

    trig.addEventListener("click", () => {
      if (isPaused) {
        playVideo();
        return;
      }
      pauseVideo();
    });

    // Intersection Observer to play video when in viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && video.paused) {
            playVideo();
            observer.unobserve(tabVideoWrap);
          }
        });
      },
      {
        threshold: 0,
      }
    );

    observer.observe(tabVideoWrap);
  }
};

init();

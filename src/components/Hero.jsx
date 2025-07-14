import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import { SplitText } from "gsap/all";
import { useMediaQuery } from "react-responsive";

ggsap.registerPlugin(ScrollTrigger, SplitText);

const Hero = () => {
  const videoRef = useRef();
  const isMobile = useMediaQuery({ maxWidth: 767 });

  useGSAP(() => {
    const heroSplit = new SplitText(".title", { type: "chars, words" });
    const paragraphSplit = new SplitText(".subtitle", { type: "lines" });

    heroSplit.chars.forEach((char) => char.classList.add("text-gradient"));

    gsap.from(heroSplit.chars, {
      yPercent: 100,
      duration: 1,
      opacity: 0,
      ease: "expo.out",
      stagger: 0.05,
    });

    gsap.from(paragraphSplit.lines, {
      opacity: 0,
      yPercent: 100,
      duration: 1,
      ease: "expo.out",
      stagger: 0.05,
      delay: 1,
    });

    // Leaves animation
    gsap
      .timeline({
        scrollTrigger: {
          trigger: "#hero",
          start: "top top",
          end: "bottom top",
          scrub: 0.1,
        },
      })
      .to(".right-leaf", { y: 200 }, 0)
      .to(".left-leaf", { y: -200 }, 0);

    // Scroll-triggered video
    const startValue = isMobile ? "top center" : "center center";
    const endValue = "bottom top";

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: videoRef.current,
        start: startValue,
        end: endValue,
        scrub: 0.1,
        pin: true,
        anticipatePin: 1,
      },
    });

    // Ensure video metadata is loaded before animating
    const video = videoRef.current;

    const playScrollVideo = () => {
      if (!video) return;
      tl.to(video, {
        currentTime: video.duration || 3, // fallback to 3 seconds if metadata not ready
        ease: "none",
      });
      ScrollTrigger.refresh();
    };

    if (video.readyState >= 1) {
      playScrollVideo();
    } else {
      video.addEventListener("loadedmetadata", playScrollVideo);
    }

    // Scroll restoration fix (optional)
    ScrollTrigger.addEventListener("refreshInit", () => window.scrollTo(0, 0));
    ScrollTrigger.refresh();

    return () => {
      video?.removeEventListener("loadedmetadata", playScrollVideo);
      ScrollTrigger.kill();
    };
  }, []);
  return (
    <>
      <section id="hero" className="noisy">
        <h1 className="title">VELVET</h1>
        <img
          src="/images/hero-left-leaf.png"
          alt="left-leaf"
          className="left-leaf"
        />
        <img
          src="/images/hero-right-leaf.png"
          alt="right-leaf"
          className="right-leaf"
        />

        <div className="body">
          <div className="content">
            <div className="">
              <div className="gradient-border space-y-5 hidden p-6 md:block shadow-lg bg-linear-60 from-white/10 to-white/0">
                <p text-white text-sm>
                  Cool. Crisp. Classic.
                </p>
                <p className="subtitle ">
                  Sip the Spirit <br /> of Summer
                </p>
              </div>
            </div>
            <div className="view-cocktails w-[50vw] h-50 lg:w-full">
              <p className="subtitle hidden md:block">
                Every cocktail on our menu is a blend of premium ingredients,
                creative flair, and timeless recipes - designed to delight your
                senses.
              </p>
              <a
                href="#cocktails"
                className="fixed bottom-0 right-5  p-2 rounded-lg backdrop-blur-[10px] border-white/20 border-[2px]  md:static"
              >
                View cocktails &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>
      <div className="video absolute inset-8">
        <video
          ref={videoRef}
          src="/videos/output.mp4"
          muted
          playsInline
          preload="auto"
          style={{ width: "100%", height: "auto", display: "block" }}
        ></video>
      </div>
    </>
  );
};

export default Hero;

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import { SplitText } from "gsap/all";
import { useMediaQuery } from "react-responsive";

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.config({
  autoRefreshEvents: "visibilitychange, DOMContentLoaded, load",
});

ScrollTrigger.defaults({
  scroller: window,
  toggleActions: "play none none reverse",
  refreshPriority: 0,
});

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
      ease: "expo-out",
      stagger: 0.05,
    });

    gsap.from(paragraphSplit.lines, {
      opacity: 0,
      yPercent: 100,
      duration: 1,
      ease: "expo-out",
      stagger: 0.05,
      delay: 1,
    });

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

    const startValue = isMobile ? "top 50%" : "center 60%";
    const endValue = isMobile ? "120%+=1000 top" : "bottom top";

    // Fixed video animation setup
    const setupVideoAnimation = () => {
      if (!videoRef.current) return;

      const video = videoRef.current;

      // Create the timeline with proper properties
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: video,
          start: startValue,
          end: endValue,
          scrub: 0.1,
          pin: true,
          anticipatePin: 1,
          refreshPriority: 0,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Update video currentTime based on scroll progress
            if (video.duration) {
              video.currentTime = self.progress * video.duration;
            }
          },
          onToggle: (self) => {
            // Pause video when not in view
            if (self.isActive) {
              video.pause();
            }
          },
        },
      });

      // Add scale animation to timeline
      tl.to(video, {
        scale: 1.1,
        ease: "none",
      });

      return tl;
    };

    // Wait for video metadata to load
    const handleVideoLoad = () => {
      setupVideoAnimation();
      ScrollTrigger.refresh();
    };

    if (videoRef.current) {
      if (videoRef.current.readyState >= 1) {
        // Video metadata already loaded
        setupVideoAnimation();
      } else {
        // Wait for metadata to load
        videoRef.current.addEventListener("loadedmetadata", handleVideoLoad);
      }
    }

    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    const handleOrientationChange = () => {
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 500);
    };

    // iOS-specific handling
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      const handleIOSResize = () => {
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 150);
      };
      window.addEventListener("resize", handleIOSResize);
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientationChange);

    console.log("ScrollTrigger instances:", ScrollTrigger.getAll());
    ScrollTrigger.addEventListener("scrollStart", () =>
      console.log("scroll start")
    );
    ScrollTrigger.addEventListener("scrollEnd", () =>
      console.log("scroll end")
    );

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);

      if (videoRef.current) {
        videoRef.current.removeEventListener("loadedmetadata", handleVideoLoad);
      }
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
        ></video>
      </div>
    </>
  );
};

export default Hero;

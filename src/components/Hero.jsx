import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import { SplitText } from "gsap/all";
import { useMediaQuery } from "react-responsive";

gsap.registerPlugin(ScrollTrigger, SplitText);

const TOTAL_FRAMES = 200;

const framePath = (index) =>
  `/frames/ezgif-frame-${index.toString().padStart(3, "0")}.jpg`;

ScrollTrigger.config({
  autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
});

const Hero = () => {
  const scrollSectionRef = useRef();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [currentFrame, setCurrentFrame] = useState(1);
  const [framesLoaded, setFramesLoaded] = useState(false);

  // Preload frames
  useEffect(() => {
    let loadedCount = 0;
    const totalFrames = TOTAL_FRAMES;

    const loadFrame = (index) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          if (loadedCount === totalFrames) {
            setFramesLoaded(true);
          }
          resolve();
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === totalFrames) {
            setFramesLoaded(true);
          }
          resolve();
        };
        img.src = framePath(index);
      });
    };

    // Load all frames
    Promise.all(
      Array.from({ length: totalFrames }, (_, i) => loadFrame(i + 1))
    ).then(() => {
      console.log("All frames loaded");
    });
  }, []);

  useGSAP(() => {
    console.log("useGSAP running, isMobile:", isMobile);
    console.log("ScrollTrigger available:", !!ScrollTrigger);

    // Wait for frames to load before setting up ScrollTrigger
    if (!framesLoaded) {
      console.log("Frames not loaded yet, skipping ScrollTrigger setup");
      return;
    }

    // Text animations
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

    // Leaf animations
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

    // Image sequence animation
    if (scrollSectionRef.current) {
      ScrollTrigger.create({
        trigger: scrollSectionRef.current,
        start: isMobile ? "top+=50 top" : "top top",
        end: isMobile ? "+=1500" : "+=2000",
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        refreshPriority: 0,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const frameIndex = Math.floor(self.progress * (TOTAL_FRAMES - 1)) + 1;
          setCurrentFrame(frameIndex);
        },
        onEnter: () => console.log("Image sequence ScrollTrigger entered"),
        onLeave: () => console.log("Image sequence ScrollTrigger left"),
      });
    }

    // Mobile-specific event handlers
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

    // Debug info
    setTimeout(() => {
      console.log("ScrollTrigger instances:", ScrollTrigger.getAll());
      ScrollTrigger.getAll().forEach((st, i) => {
        console.log(`ScrollTrigger ${i}:`, st.vars.trigger);
      });
    }, 1000);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, [isMobile, framesLoaded]); // Added framesLoaded to dependencies

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

      <div
        ref={scrollSectionRef}
        className="w-full md:h-[80%] h-1/2 absolute bottom-0 left-0 md:object-contain object-bottom object-cover"
        style={{
          // Add these styles to prevent touch issues
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {framesLoaded ? (
          <img
            src={framePath(currentFrame)}
            alt={`frame ${currentFrame}`}
            className="absolute top-0 left-0 w-full h-full object-cover"
            style={{
              pointerEvents: "none",
              touchAction: "none",
            }}
          />
        ) : (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/20">
            <p className="text-white">Loading frames...</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Hero;

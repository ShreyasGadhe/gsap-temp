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

const Hero = () => {
  const scrollSectionRef = useRef();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [currentFrame, setCurrentFrame] = useState(1);
  useGSAP(() => {
    //this is the text animation code
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

    //this is the leaf animation code
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

    //this is the image sequence scrolltrigger code

    ScrollTrigger.create({
      trigger: scrollSectionRef.current,
      start: isMobile ? "top+=50 top" : "top top",
      end: isMobile ? "+=1500" : "+=2000",
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        const frameIndex = Math.floor(self.progress * (TOTAL_FRAMES - 1)) + 1;
        setCurrentFrame(frameIndex);
      },
    });

    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
  }, [isMobile]);

  //preloading frames here
  useEffect(() => {
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = framePath(i);
    }
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

      <div
        ref={scrollSectionRef}
        className="w-full md:h-[80%] h-1/2 absolute bottom-0 left-0 md:object-contain object-bottom object-cover;"
      >
        <img
          src={framePath(currentFrame)}
          alt={`frame ${currentFrame}`}
          className="absolute top-0 left-0 w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    </>
  );
};

export default Hero;

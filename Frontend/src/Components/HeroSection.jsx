import styles from "../Style/HeroSection.module.css";
import { Typewriter } from "react-simple-typewriter";
import AOS from "aos";
import "aos/dist/aos.css";
import { loadSlim } from "@tsparticles/slim";
import { useEffect, useRef, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import Aos from "aos";
export const HeroSection = () => {
  const waapiRef = useRef();
  const [init, setInit] = useState(false);
  //animation
  useEffect(() => {
    Aos.init();
  }, []);
  // bg particles
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);
  // color changing animation
  useEffect(() => {
    const waapiElement = waapiRef.current;
    if (!waapiElement) return;
    const waapiAnimation = waapiElement.animate(
      [{ backgroundColor: "#ff0088" }, { backgroundColor: "#0d63f8" }],
      {
        duration: 2000,
        iterations: Infinity,
        direction: "alternate",
        easing: "linear",
      }
    );
    return () => {
      waapiAnimation.cancel();
    };
  }, []);



  const options = useMemo(
    () => ({
      fullScreen: {
        enable: false,
      },
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 120,
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: "push",
          },
          onHover: {
            enable: true,
            mode: "repulse",
          },
        },
        modes: {
          push: {
            quantity: 4,
          },
          repulse: {
            distance: 200,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: "#423595",
        },
        move: {
          direction: "none",
          enable: true,
          outModes: {
            default: "bounce",
            top: "bounce",
            bottom: "bounce",
            left: "bounce",
            right: "bounce",
          },
          random: false,
          speed: 1,
          straight: false,
        },
        number: {
          density: {
            enable: true,
          },
          value: 8,
        },
        opacity: {
          value: 0.5,
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 20, max: 30 },
        },
      },
      detectRetina: true,
    }),
    []
  );
  return (
    <div className={styles.maindiv}>
      <div className={styles.bubbleeffect}>
        <Particles id="tsparticles" options={options} />
      </div>
      <div className={styles.divone}>
        <h1
          data-aos="fade-right"
          data-aos-duration="1000"
          data-aos-easing="ease"
          className={styles.slogan}
          ref={waapiRef}
        >
          <Typewriter
            words={["Walk with Confidence.", "Never Alone."]}
            loop={0}
          />
        </h1>
        <div
          data-aos="fade-up"
          data-aos-duration="1000"
          data-aos-easing="ease"
          className={styles.info}
        >
          <h3>
            Real Time saftey insights , live tracking , and community reports at
            your fingertips.
          </h3>
        </div>
        <div
          data-aos="fade-up"
          data-aos-duration="1000"
          data-aos-easing="ease"
          className={styles.buttondiv}
        >
          <button className={styles.buttons}>
           Start Safe Walk </button>
          <button className={styles.buttontwo}> Report Area </button>
        </div>
      </div>
      <div
        data-aos="zoom-in"
        data-aos-duration="1000"
        data-aos-easing="ease"
        className={styles.divtwo}
      >
        <div className={styles.innerdiv}>
          <div className={styles.pulsedot}></div>
        </div>
      </div>
    </div>
  );
};

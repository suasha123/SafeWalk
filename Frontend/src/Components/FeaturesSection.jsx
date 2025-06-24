import styles from "../Style/Features.module.css";
import Aos from "aos";
import "aos/dist/aos.css";
import { CiLocationOn } from "react-icons/ci";
import { MdOutlineDangerous } from "react-icons/md";
import { CiRoute } from "react-icons/ci";
import { VscReport } from "react-icons/vsc";
import { AiFillAlert } from "react-icons/ai";
import { MdGroupAdd } from "react-icons/md";
import { useEffect } from "react";
export const Features = () => {
  useEffect(() => {
    Aos.init({ once: true });
  }, []);
  const Features = [
    {
      h1: "Live Location Tracking",
      p: "Share your real-time location with trusted contacts.",
      icon: <CiLocationOn className={`${styles.icons} ${styles.heartbeat}`} />,
    },
    {
      h1: "Danger Zone Alerts ",
      p: "Get notified when entering high-risk areas.",
      icon: <MdOutlineDangerous className={`${styles.icons} ${styles.heartbeat}`} />,
    },
    {
      h1: "Alternate Route",
      p: "Get an alternate safe route.",
      icon: <CiRoute className={`${styles.icons}`} />,
    },
    {
      h1: "Community Reports",
      p: "Submit and view safety reports from nearby users.",
      icon: <VscReport className={`${styles.icons}`} />,
    },
    {
      h1: "Make Group",
      p: "Build Group with your trusted people.",
      icon: <MdGroupAdd className={`${styles.icons}`} />,
    },
    {
      h1: "Alert System",
      p: "Group members will get notified when you enter the unsafe zone",
      icon: <AiFillAlert className={`${styles.icons}`} />,
    },
  ];
  return (
    <div className={styles.maindiv}>
      <div className={styles.container}>
        <h1
          data-aos="zoom-in-right"
          data-aos-duration="1000"
          data-aos-easing="ease"
          data-aos-offset="10"
          className={styles.headingg}
        >
          Features :
        </h1>
      </div>
      <div
        data-aos="fade-down"
        data-aos-duration="1000"
        data-aos-easing="ease"
        data-aos-offset="10"
        className={styles.secondcontainer}
      >
        {Features.map((ele, index) => (
          <div key={index} className={styles.innercontainer}>
            <div className={`${styles.iconcontainer} ${styles.heartbeat}`}>{ele.icon}</div>
            <div className={styles.secondc}>
              <div className={styles.heading}>{ele.h1}</div>
              <p className={styles.p}>{ele.p}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import styles from "../Style/Features.module.css";
import Aos from "aos";
import "aos/dist/aos.css";
import { CiRoute } from "react-icons/ci";
import { VscReport } from "react-icons/vsc";
import { AiFillAlert } from "react-icons/ai";
import { MdGroupAdd } from "react-icons/md";
import "../Style/WalkReport.css";
import { FaWalking } from "react-icons/fa";
import { useEffect } from "react";
import { GiPathDistance } from "react-icons/gi";
import { PiPath } from "react-icons/pi";
import { useAuth } from "./AuthContext";
export const WalkReport = ({rdist , tdist , rdistt , tdistt , walk , walkk}) => {
  console.log(rdist , tdist , rdistt , tdistt);
  useEffect(() => {
    Aos.init({ once: true });
  }, []);
  const Features = [
    {
      h1: "Walk Status",
      p: walk||walkk,
      icon: <FaWalking className={`${styles.icons} ${styles.heartbeat}`} />,
    },
    {
      h1: "Total Distance",
      p: `${tdistt||tdist} m`,
      icon: <GiPathDistance className={`${styles.icons}`} />,
    },
     {
      h1: "Remaining Distance ",
      p: `${rdistt || rdist} m`,
      icon: <PiPath className={`${styles.icons} ${styles.heartbeat}`} />,
    },
    {
      h1: "Community Reports",
     // p: "Submit and view safety reports from nearby users.",
      icon: <VscReport className={`${styles.icons}`} />,
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
          className={styles.headding}
        >
          Walk Report :
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
            <div className={`${styles.iconcontainer} ${styles.heartbeat}`}>
              {ele.icon}
            </div>
            <div className={styles.secondc}>
              <div className={styles.heading}>{ele.h1}</div>
              <p className={styles.p} style={{ fontSize: "18px" }}>
                {ele.p}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

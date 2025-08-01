import "../Style/W.css";
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
export const WalkReport = ({ tdd, cdd, walkk, walk, td, cd}) => {
  useEffect(() => {
    Aos.init({ once: true });
  }, []);
  const Features = [
    {
      h1: "Walk Status",
      id: 0,
      p: walk || walkk,
      icon: (
        <FaWalking
          className={`icons heartbeat ${
            (walk || walkk) === "not Active" ? "iconred" : "icongreen"
          }`}
        />
      ),
    },
    {
      h1: "Remaining Distance ",
      id: 1,
      p: `${(cd ?? cdd).toFixed(2)} m`,
      style: walk || walkk === "not Active" ? "red" : "green",
      icon: <PiPath className={`icons heartbeat`} />,
    },
    {
      h1: "Total Distance",
      id: 2,
      p: `${(td ?? tdd).toFixed(2)} m`,
      style: walk || walkk === "not Active" ? "red" : "green",
      icon: <GiPathDistance className={`icons`} />,
    },
    {
      h1: "Community Reports",
      id: 3,
      // p: "Submit and view safety reports from nearby users.",
      icon: <VscReport className={`icons`} />,
    },
  ];

  return (
    <div className="maindiv">
      <div className="container">
        <h1
          data-aos="zoom-in-right"
          data-aos-duration="1000"
          data-aos-easing="ease"
          data-aos-offset="10"
          className="headding"
        >
          Walk Report :
        </h1>
      </div>
      <div
        data-aos="fade-down"
        data-aos-duration="1000"
        data-aos-easing="ease"
        data-aos-offset="10"
        className="secondcontainer"
      >
        {Features.map((ele, index) => (
          <div
            key={index}
            className={`innercontainer ${
              index === 0 && (walk || walkk) === "not Active"
                ? "red"
                : index === 0
                ? "green"
                : ""
            }`}
          >
            <div className={` iconcontainer heartbeat `}>{ele.icon}</div>
            <div className="secondc">
              <div className="heading">{ele.h1}</div>
              <p className="p" style={{ fontSize: "18px" }}>
                {ele.p}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

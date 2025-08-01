import { HeroSection } from "./HeroSection";
import { Features } from "./FeaturesSection";
import { NavBar } from "./Navbar";
import { Footer } from "./Footers";
import { Fragment } from "react";
import { useAuth } from "./AuthContext";
import { SplashScreen } from "./SplashScreen";
import AccountOverlay from "./Accountinfo";
export const Home = () => {
  const { loading } = useAuth();
  return (
    <Fragment>
      {loading ? (
        <SplashScreen />
      ) : (
        <div style={{ height: "100vh", backgroundColor: "#111827" }}>
          <NavBar />
          <HeroSection />
          <Features />
          <Footer />
        </div>
      )}
    </Fragment>
  );
};

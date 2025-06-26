import { HeroSection } from "./HeroSection";
import { Features } from "./FeaturesSection";
import { NavBar } from "./Navbar";
import { Footer } from "./Footers";
import { Fragment } from "react";
import { useAuth } from "./AuthContext";
import { SplashScreen } from "./SplashScreen";
export const Home = () => {
  const { loading } = useAuth();
  return (
    <Fragment>
      {loading ? (
        <SplashScreen />
      ) : (
        <>
          <NavBar />
          <HeroSection />
          <Features />
          <Footer />
        </>
      )}
    </Fragment>
  );
};

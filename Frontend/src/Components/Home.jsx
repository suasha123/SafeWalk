import { HeroSection } from "./HeroSection";
import { Features } from "./FeaturesSection";
import { NavBar } from "./Navbar";
import { Footer } from "./Footers";
import { Fragment } from "react";
import { useAuth } from "./AuthContext";
import { SplashScreen } from "./SplashScreen";
import AccountOverlay from "./Accountinfo";
export const Home = () => {
  const { loading  , showOverlay , setShowOverlay} = useAuth();
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
          {showOverlay && (
            <AccountOverlay onClose={() => setShowOverlay(false)} />
          )}
        </>
      )}
    </Fragment>
  );
};

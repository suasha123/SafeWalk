import { HeroSection } from "./HeroSection";
import { Features } from "./FeaturesSection";
import { NavBar } from "./Navbar";
import { Footer } from "./Footers";
import { Fragment } from "react";
export const Home = ()=>{
    return (
        <Fragment>
        <NavBar />
        <HeroSection />
        <Features />
        <Footer />   
        </Fragment>
    )
}
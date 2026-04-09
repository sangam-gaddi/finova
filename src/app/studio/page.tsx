// @ts-nocheck
"use client";
import "./studio.css";
import "@/app/polite-chaos-fonts.css";
import TeamCards from "@/components/PTeamCards/TeamCards";
import Spotlight from "@/components/PSpotlight/Spotlight";
import CTACard from "@/components/PCTACard/CTACard";
import PFooter from "@/components/PFooter/Footer";
import React, { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Copy from "@/components/PCopy/Copy";

gsap.registerPlugin(ScrollTrigger);

const Page = () => {
  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      ScrollTrigger.refresh(true);
    });

    const onLoad = () => ScrollTrigger.refresh(true);
    window.addEventListener("load", onLoad, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  return (
    <div
      className="studio-page-pc"
      style={{
        "--base-100": "#e3e3db",
        "--base-200": "#ccccc4",
        "--base-300": "#8c7e77",
        "--base-400": "#1a1614",
        "--base-500": "#ff6e14",
        "--accent-1": "#3d2fa9",
        "--accent-2": "#a92f78",
        "--accent-3": "#ff3d33",
        "--accent-4": "#785f47",
        "--accent-5": "#2f72a9",
      }}
    >
      <section className="studio-header-pc">
        <div className="studio-container-pc">
          <div className="studio-header-row-pc">
            <Copy animateOnScroll={false} delay={0.8}>
              <h1>We are polite</h1>
            </Copy>
          </div>

          <div className="studio-header-row-pc">
            <Copy animateOnScroll={false} delay={0.95}>
              <h1>We are chaos</h1>
            </Copy>
          </div>
        </div>
      </section>

      <section className="studio-copy-pc">
        <div className="studio-container-pc">
          <div className="studio-copy-img-pc">
            <img src="/studio/studio-header.jpg" alt="" />
          </div>

          <Copy animateOnScroll={true}>
            <p className="studio-p-lg">
              Polite Chaos is a creative studio shaping digital worlds through
              motion, color, and story. We blend art and technology to create
              visuals that move not only on screen but in emotion. Every project
              is treated like a short film, designed to feel alive, cinematic,
              and intentional.
            </p>
          </Copy>

          <Copy animateOnScroll={true}>
            <p className="studio-p-lg">
              Our work explores the edges of digital expression, from still
              sketches to fluid 3D experiences. We collaborate with brands,
              artists, and creators who believe design can feel like art and art
              can solve real problems. We like ideas that start strange and end
              beautiful.
            </p>
          </Copy>
        </div>
      </section>

      <TeamCards />

      <Spotlight />

      <CTACard />

      <PFooter />
    </div>
  );
};

export default Page;

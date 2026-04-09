// @ts-nocheck
"use client";
import "@/app/polite-chaos-fonts.css";
import "./stories.css";
import StorySlides from "@/components/PStorySlides/StorySlides";

const Page = () => {
  return (
    <div style={{
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
    }}>
      <StorySlides />
    </div>
  );
};

export default Page;

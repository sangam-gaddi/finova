"use client";
import "./FeaturedWork.css";
import { useRef } from "react";
import { projects } from "./project.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useViewTransition } from "@/hooks/useViewTransition";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function FeaturedWork() {
  const featuredWorkContainerRef = useRef(null);
  const { navigateWithTransition } = useViewTransition();

  useGSAP(
    () => {
      const createFeaturedWorkItem = (project) => {
        const featuredWorkItem = document.createElement("div");
        featuredWorkItem.className = "pc-featured-work-item";
        featuredWorkItem.innerHTML = `
        <a href="${project.route}" class="pc-featured-work-item-link">
          <div class="pc-featured-work-item-img">
           <div class="pc-featured-work-item-copy">
            <h3>${project.name}</h3>
          </div>
            <img src="${project.img}" alt="${project.name}" />
          </div>
        </a>
      `;
        return featuredWorkItem;
      };

      const workContainer = featuredWorkContainerRef.current;

      workContainer.innerHTML = "";

      for (let i = 0; i < projects.length; i += 2) {
        const row = document.createElement("div");
        row.className = "pc-fw-row";

        const leftItemIndex = i % projects.length;
        const rightItemIndex = (i + 1) % projects.length;

        row.appendChild(createFeaturedWorkItem(projects[leftItemIndex]));

        if (i + 1 < projects.length * 2) {
          row.appendChild(createFeaturedWorkItem(projects[rightItemIndex]));
        }

        workContainer.appendChild(row);
      }

      gsap.set(".pc-featured-work-item", {
        y: 1000,
      });

      document.querySelectorAll(".pc-fw-row").forEach((row) => {
        const featuredWorkItems = row.querySelectorAll(".pc-featured-work-item");

        featuredWorkItems.forEach((item, itemIndex) => {
          const isLeftProjectItem = itemIndex === 0;
          gsap.set(item, {
            rotation: isLeftProjectItem ? -60 : 60,
            transformOrigin: "center center",
          });
        });

        ScrollTrigger.create({
          trigger: row,
          start: "top 70%",
          onEnter: () => {
            gsap.to(featuredWorkItems, {
              y: 0,
              rotation: 0,
              duration: 1,
              ease: "power4.out",
              stagger: 0.25,
            });
          },
        });
      });

      const links = workContainer.querySelectorAll(".pc-featured-work-item-link");
      const handleClick = (e) => {
        const anchor = e.currentTarget;
        if (!anchor) return;
        e.preventDefault();
        const href = anchor.getAttribute("href");
        if (!href) return;
        navigateWithTransition(href);
      };
      links.forEach((a) => a.addEventListener("click", handleClick));

      return () => {
        links.forEach((a) => a.removeEventListener("click", handleClick));
      };
    },
    { scope: featuredWorkContainerRef }
  );

  return (
    <>
      <div className="pc-featured-work-list" ref={featuredWorkContainerRef}></div>
    </>
  );
}

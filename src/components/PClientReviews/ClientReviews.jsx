"use client";
import "./ClientReviews.css";
import { clientReviewsData } from "./clientReviewsData.js";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ClientReviews = () => {
  const clientReviewsContainerRef = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1000px)", () => {
        const reviewCards = document.querySelectorAll(".pc-review-card");
        const cardContainers = document.querySelectorAll(
          ".pc-review-card-container"
        );

        cardContainers.forEach((cardContainer, index) => {
          const rotation = index % 2 === 0 ? 3 : -3;
          gsap.set(cardContainer, { rotation: rotation });
        });

        const scrollTriggerInstances = [];

        gsap.delayedCall(0.1, () => {
          reviewCards.forEach((card, index) => {
            if (index < reviewCards.length - 1) {
              const trigger = ScrollTrigger.create({
                trigger: card,
                start: "top top",
                endTrigger: reviewCards[reviewCards.length - 1],
                end: "top top",
                pin: true,
                pinSpacing: false,
                scrub: 1,
              });
              scrollTriggerInstances.push(trigger);
            }

            if (index < reviewCards.length - 1) {
              const trigger = ScrollTrigger.create({
                trigger: reviewCards[index + 1],
                start: "top bottom",
                end: "top top",
              });
              scrollTriggerInstances.push(trigger);
            }
          });
        });

        const refreshHandler = () => {
          ScrollTrigger.refresh();
        };
        window.addEventListener("orientationchange", refreshHandler);
        const onLoad = () => ScrollTrigger.refresh();
        window.addEventListener("load", onLoad, { passive: true });

        return () => {
          scrollTriggerInstances.forEach((trigger) => trigger.kill());
          window.removeEventListener("orientationchange", refreshHandler);
          window.removeEventListener("load", onLoad);
        };
      });

      mm.add("(max-width: 999px)", () => {
        const reviewCards = document.querySelectorAll(".pc-review-card");
        const cardContainers = document.querySelectorAll(
          ".pc-review-card-container"
        );

        reviewCards.forEach((card) => {
          if (card) gsap.set(card, { clearProps: "all" });
        });
        cardContainers.forEach((cardContainer) => {
          if (cardContainer) gsap.set(cardContainer, { clearProps: "all" });
        });

        ScrollTrigger.refresh();

        const refreshHandler = () => {
          ScrollTrigger.refresh();
        };
        window.addEventListener("orientationchange", refreshHandler);
        const onLoad = () => ScrollTrigger.refresh();
        window.addEventListener("load", onLoad, { passive: true });

        return () => {
          window.removeEventListener("orientationchange", refreshHandler);
          window.removeEventListener("load", onLoad);
        };
      });

      return () => {
        mm.revert();
      };
    },
    { scope: clientReviewsContainerRef }
  );

  return (
    <div className="pc-client-reviews" ref={clientReviewsContainerRef}>
      {clientReviewsData.map((item, index) => (
        <div className="pc-review-card" key={index}>
          <div
            className="pc-review-card-container"
            id={`pc-review-card-${index + 1}`}
          >
            <div className="pc-review-card-content">
              <div className="pc-review-card-content-wrapper">
                <h3 className="pc-review-card-text">{item.review}</h3>
                <div className="pc-review-card-client-info">
                  <p className="pc-review-card-client pc-cap">{item.clientName}</p>
                  <p className="pc-review-card-client-company pc-sm">
                    {item.clientCompany}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClientReviews;

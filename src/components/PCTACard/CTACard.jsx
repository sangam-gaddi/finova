"use client";
import "./CTACard.css";
import Button from "@/components/PButton/Button";
import { MdArticle } from "react-icons/md";
import Copy from "@/components/PCopy/Copy";

const CTACard = () => {
  return (
    <section className="pc-cta">
      <div className="pc-container">
        <div className="pc-cta-copy">
          <div className="pc-cta-col">
            <Copy animateOnScroll={true}>
              <p className="pc-sm">Part of the collective</p>
            </Copy>
          </div>

          <div className="pc-cta-col">
            <Copy animateOnScroll={true}>
              <p className="pc-lg">
                Polite Chaos is connected to The Noise Network, a collective of
                studios exploring digital art as emotion, motion, and code.
              </p>
            </Copy>

            <Button
              animateOnScroll={true}
              delay={0.25}
              variant="dark"
              href="/contact"
            >
              Drop your portfolio
            </Button>
          </div>
        </div>

        <div className="pc-cta-card">
          <div className="pc-cta-card-copy">
            <div className="pc-cta-card-col">
              <Copy animateOnScroll={true}>
                <h3>Secret Department</h3>
              </Copy>
            </div>

            <div className="pc-cta-card-col">
              <Copy animateOnScroll={true}>
                <p className="pc-cta-p">
                  We like to think we build order out of chaos, but it&apos;s usually
                  the other way around. Every project starts as a mess of
                  sketches and motion tests.
                </p>
              </Copy>

              <Copy animateOnScroll={true}>
                <p className="pc-cta-p pc-cta-p-last">
                  If something feels too polished, we probably broke it on
                  purpose and rebuilt it slightly wrong, just enough to feel
                  human.
                </p>
              </Copy>

              <Button
                animateOnScroll={true}
                delay={0.25}
                variant="light"
                icon={MdArticle}
                href="/studio"
              >
                Read the theory
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTACard;

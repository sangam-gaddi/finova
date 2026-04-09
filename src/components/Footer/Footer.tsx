// @ts-nocheck
import React from "react";
import Link from "next/link";
import ParallaxImage from "../ParallaxImage/ParallaxImage";

import "./Footer.css";

const Footer = () => {
  return (
    <div className="footer">
      <div className="footer-bg">
        <ParallaxImage src="/footer/footer.jpg" alt="" />
      </div>

      <div className="footer-nav">
        <div className="footer-nav-link">
          <Link href="/about">About</Link>
        </div>
        <div className="footer-nav-link">
          <Link href="/solutions">Solutions</Link>
        </div>
        <div className="footer-nav-link">
          <Link href="/updates">Updates</Link>
        </div>
        <div className="footer-nav-link">
          <Link href="/contact">Contact</Link>
        </div>
      </div>

      <div className="footer-outro">
        <div className="footer-col">
          <p>Have Questions?</p>
          <h3>Get in Touch</h3>
          <p className="primary">
            Info@balancedpitch.com <br />
            LinkedIn / Careers
          </p>
          <p>© 2024 Balanced Pitch</p>
        </div>
        <div className="footer-col">
          <p>Planning a Visit?</p>
          <h3>Our Location</h3>
          <p className="primary">
            123 Harmony Lane <br />
            Los Angeles, CA 90210, USA
          </p>
          <p>Designed by Codegrid</p>
        </div>
      </div>

      <div className="footer-form">
        <p className="primary">Make Your Voice Heard!</p>
        <p>Stand for Ethical AI in Music</p>

        <span>Join our movement to protect and empower music creators.</span>

        <div className="footer-ws"></div>

        <div className="footer-input">
          <input type="text" placeholder="First Name" />
        </div>
        <div className="footer-input">
          <input type="text" placeholder="Last Name" />
        </div>
        <div className="footer-input">
          <input type="text" placeholder="Email Address" />
        </div>
        <div className="footer-submit">
          <Link href="/">Submit</Link>
        </div>
      </div>
    </div>
  );
};

export default Footer;


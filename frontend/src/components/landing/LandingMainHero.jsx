import React from "react";
import "./css/landing-main-hero.css";

export default function LandingMainHero() {
  return (
    <section className="tf-mainhero">
      <div className="tf-mainhero__top">
        <div className="tf-mainhero__row">
          <h1 className="tf-mainhero__headline">
            <span className="tf-pill">what</span>
            <span className="tf-mainhero__headline-sub">The portfolio builder for fashion creatives.</span>
          </h1>
          <div className="tf-mainhero__headline-lead">Your work. Your CV. All in one link.</div>
        </div>
      </div>

      <div className="tf-mainhero__steps">
        <img src="/multimedia/landing/index/step1.jpg" alt="" />
        <img src="/multimedia/landing/index/step2.jpg" alt="" />
        <img src="/multimedia/landing/index/step3.jpg" alt="" />
        <img src="/multimedia/landing/index/step4.jpg" alt="" />
      </div>
    </section>
  );
}

import { EASYCHAIR_SUBMISSION_URL } from '@/lib/links';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <p className="eyebrow">
          <span className="eyebrow-dot"></span>
          A workshop at ALIFE&nbsp;2026 · Waterloo, Canada
        </p>
        <h1 className="display">
          <span className="line">Artificial Life</span>
          <span className="line"><em>in the Wild</em></span>
        </h1>
        <p className="lede">
          For decades artificial life has thrived inside simulators, lattices,
          and clean rooms. This workshop asks what happens when we let it loose
          — into ecologies, soils, oceans, cities, swarms, sensors, and other
          people’s problems.
        </p>
        <div className="hero-meta">
          <div>
            <span className="meta-label">When</span>
            <span className="meta-value">17–21&nbsp;Aug&nbsp;2026</span>
          </div>
          <div>
            <span className="meta-label">Where</span>
            <span className="meta-value">Waterloo,&nbsp;Canada</span>
          </div>
          <div>
            <span className="meta-label">Format</span>
            <span className="meta-value">Hybrid · ALIFE&nbsp;2026</span>
          </div>
        </div>
        <div className="hero-cta">
          <a className="btn primary" href={EASYCHAIR_SUBMISSION_URL} rel="noopener">
            Submit a contribution ↗
          </a>
          <a className="btn ghost" href="#about">Read the theme →</a>
        </div>
      </div>
      <div className="hero-scroll" aria-hidden="true">
        <span>scroll</span>
        <span className="hero-scroll-line"></span>
      </div>
    </section>
  );
}

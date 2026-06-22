import { EASYCHAIR_SUBMISSION_URL } from '@/lib/links';

export default function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#top">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
            <circle cx="12" cy="3"  r="1" fill="currentColor" />
            <circle cx="21" cy="12" r="1" fill="currentColor" />
            <circle cx="12" cy="21" r="1" fill="currentColor" />
            <circle cx="3"  cy="12" r="1" fill="currentColor" />
          </svg>
        </span>
        <span className="brand-text">
          <span className="brand-title">Artificial Life in the Wild</span>
          <span className="brand-sub">ALIFE 2026 · Workshop</span>
        </span>
      </a>
      <nav className="site-nav" aria-label="Primary">
        <a href="#about">About</a>
        <a href="#dates">Dates</a>
        <a href="#topics">Topics</a>
        <a href={EASYCHAIR_SUBMISSION_URL} rel="noopener">Submit</a>
        <a href="#organisers">Organisers</a>
        <a href="#cfp" className="nav-cta">Call for papers ↗</a>
      </nav>
    </header>
  );
}

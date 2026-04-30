export default function Footer() {
  const built = new Date().toISOString().slice(0, 10);
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <p className="footer-title">Artificial Life in the Wild</p>
          <p className="footer-sub">A workshop at ALIFE 2026.</p>
        </div>
        <div>
          <p className="footer-label">Contact</p>
          <p><a href="mailto:alife.in.the.wild@gmail.com">alife.in.the.wild@gmail.com</a></p>
        </div>
        <div>
          <p className="footer-label">Code</p>
          <p>
            <a href="https://github.com/alife-in-the-wild" rel="noopener">
              github.com/alife-in-the-wild
            </a>
          </p>
        </div>
        <div>
          <p className="footer-label">Conference</p>
          <p>
            <a href="https://alife.org/" rel="noopener">
              ISAL · ALIFE 2026 ↗
            </a>
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Artificial Life in the Wild · Workshop organising committee</span>
        <span className="footer-mono">built {built} · static · next</span>
      </div>
    </footer>
  );
}

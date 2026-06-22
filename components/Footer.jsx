export default function Footer() {
  const built = new Date().toISOString().slice(0, 10);
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <p className="footer-title">Artificial Life in the Wild</p>
          <p className="footer-sub">
            A workshop at{' '}
            <a href="https://2026.alife.org/" rel="noopener">ALIFE 2026</a>.
          </p>
        </div>
        <div>
          <p className="footer-label">Contact</p>
          <p><a href="mailto:amber@reality.design">amber@reality.design</a></p>
        </div>
        <div>
          <p className="footer-label">Conference</p>
          <p>
            <a href="https://2026.alife.org/" rel="noopener">
              ALIFE 2026 · Waterloo ↗
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

export default function Section({ id, num, title, children }) {
  return (
    <section id={id} className="section">
      <div className="section-head">
        <span className="section-num">{num}</span>
        <h2 className="section-title">{title}</h2>
      </div>
      {children}
    </section>
  );
}

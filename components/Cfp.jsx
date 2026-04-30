import Section from './Section';
import { readMd, parseCfp } from '@/lib/content';

export default async function Cfp() {
  const md = await readMd('cfp');
  const { introHtml, cards } = parseCfp(md);

  return (
    <Section id="cfp" num="04" title="Call for participation">
      {introHtml ? (
        <div
          className="cfp-intro"
          dangerouslySetInnerHTML={{ __html: introHtml }}
        />
      ) : null}

      <div className="cfp-grid">
        {cards.map((card, i) => (
          <article key={i} className="cfp-card">
            <h3 dangerouslySetInnerHTML={{ __html: card.title }} />
            <p
              className="cfp-len"
              dangerouslySetInnerHTML={{ __html: card.taglineHtml }}
            />
            <div dangerouslySetInnerHTML={{ __html: card.bodyHtml }} />
          </article>
        ))}
      </div>

      <div className="cfp-actions">
        <a
          className="btn primary"
          href="#"
          aria-disabled="true"
        >
          Submission portal — opens 15 Apr 2026
        </a>
        <a
          className="btn ghost"
          href="mailto:alife.in.the.wild@gmail.com"
        >
          Contact the organisers ↗
        </a>
      </div>
      <p className="footnote">
        All accepted contributions appear in the ALIFE 2026 workshop
        proceedings (open access).
      </p>
    </Section>
  );
}

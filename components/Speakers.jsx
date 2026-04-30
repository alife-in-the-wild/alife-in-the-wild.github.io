import Section from './Section';
import { readMd, parseSpeakers } from '@/lib/content';

export default async function Speakers() {
  const md = await readMd('speakers');
  const speakers = parseSpeakers(md);

  return (
    <Section id="speakers" num="05" title="Invited speakers">
      <div className="speakers-grid">
        {speakers.map((s, i) => (
          <article key={i} className="speaker">
            <div className="speaker-portrait" aria-hidden="true">
              <span>TBA</span>
            </div>
            <h3 dangerouslySetInnerHTML={{ __html: s.name }} />
            <p
              className="speaker-affil"
              dangerouslySetInnerHTML={{ __html: s.affiliationHtml }}
            />
            <div dangerouslySetInnerHTML={{ __html: s.bioHtml }} />
          </article>
        ))}
      </div>
    </Section>
  );
}

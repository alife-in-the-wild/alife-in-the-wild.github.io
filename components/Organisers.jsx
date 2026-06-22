import Section from './Section';
import { readMd, parseOrganisers } from '@/lib/content';

export default async function Organisers() {
  const md = await readMd('organisers');
  const { people, committeeHtml } = parseOrganisers(md);

  return (
    <Section id="organisers" num="05" title="Organisers">
      <div className="organisers-grid">
        {people.map((p, i) => (
          <article key={i} className="organiser">
            <h3 dangerouslySetInnerHTML={{ __html: p.name }} />
            {p.affiliation && (
              <p
                className="org-affil"
                dangerouslySetInnerHTML={{ __html: p.affiliation }}
              />
            )}
          </article>
        ))}
      </div>
      <h3 className="subhead">Programme committee</h3>
      <div
        className="committee"
        dangerouslySetInnerHTML={{ __html: committeeHtml }}
      />
    </Section>
  );
}

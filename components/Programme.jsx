import Section from './Section';
import { readMd, parseSpeakers, parseDates } from '@/lib/content';

/* The speakers and the running order are one section: who is talking, then
 * when. `parseDates` is the generic table parser — it highlights the last
 * row, which here is the closing discussion. */
export default async function Programme() {
  const [speakersMd, programmeMd] = await Promise.all([
    readMd('speakers'),
    readMd('programme'),
  ]);
  const { speakers, footnoteHtml: speakersNote } = parseSpeakers(speakersMd);
  const { header, rows, footnoteHtml: scheduleNote } = parseDates(programmeMd);

  return (
    <Section id="programme" num="03" title="Programme">
      <h3 className="subhead">Speakers</h3>
      <div className="speakers-grid">
        {speakers.map((s, i) => (
          <article key={i} className="speaker">
            <h3 dangerouslySetInnerHTML={{ __html: s.name }} />
            {s.affiliation && (
              <p
                className="speaker-affil"
                dangerouslySetInnerHTML={{ __html: s.affiliation }}
              />
            )}
            {s.talkHtml && (
              <p
                className="speaker-talk"
                dangerouslySetInnerHTML={{ __html: s.talkHtml }}
              />
            )}
            {s.bodyHtml && (
              <div
                className="speaker-body"
                dangerouslySetInnerHTML={{ __html: s.bodyHtml }}
              />
            )}
          </article>
        ))}
      </div>
      {speakersNote ? (
        <p
          className="footnote"
          dangerouslySetInnerHTML={{ __html: speakersNote }}
        />
      ) : null}

      <h3 className="subhead schedule-subhead">Running order</h3>
      <div className="schedule" role="table">
        {header.length > 0 && (
          <div className="schedule-row schedule-head" role="row">
            {header.map((h, i) => (
              <div key={i} role="columnheader" dangerouslySetInnerHTML={{ __html: h }} />
            ))}
          </div>
        )}
        {rows.map((r, i) => {
          const isLast = i === rows.length - 1;
          const cls = `schedule-row${isLast ? ' schedule-highlight' : ''}`;
          return (
            <div key={i} className={cls} role="row">
              {r.map((cell, ci) => (
                <div key={ci} role="cell" dangerouslySetInnerHTML={{ __html: cell }} />
              ))}
            </div>
          );
        })}
      </div>
      {scheduleNote ? (
        <p
          className="footnote"
          dangerouslySetInnerHTML={{ __html: scheduleNote }}
        />
      ) : null}
    </Section>
  );
}

import Section from './Section';
import { readMd, parseSpeakers, parseAccepted, parseSchedule } from '@/lib/content';

/* The speakers, the accepted papers, and the running order are one section:
 * who is talking, what was accepted, then when. The running order arrives as
 * labelled groups (invited / contributed / discussion); the very last row of
 * the last group — the closing discussion — takes the highlight styling. */
export default async function Programme() {
  const [speakersMd, acceptedMd, programmeMd] = await Promise.all([
    readMd('speakers'),
    readMd('accepted'),
    readMd('programme'),
  ]);
  const { speakers, footnoteHtml: speakersNote } = parseSpeakers(speakersMd);
  const { papers, footnoteHtml: acceptedNote } = parseAccepted(acceptedMd);
  const { header, groups, footnoteHtml: scheduleNote } = parseSchedule(programmeMd);
  const lastGroup = groups.length - 1;

  return (
    <Section id="programme" num="03" title="Programme">
      <h3 className="subhead">Invited speakers</h3>
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

      <h3 className="subhead papers-subhead">Accepted papers</h3>
      <div className="papers">
        {papers.map((p, i) => (
          <article key={i} className="paper">
            <span className="paper-num" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="paper-main">
              <h4 dangerouslySetInnerHTML={{ __html: p.title }} />
              {p.authorsHtml && (
                <p
                  className="paper-authors"
                  dangerouslySetInnerHTML={{ __html: p.authorsHtml }}
                />
              )}
              {p.affiliationHtml && (
                <p
                  className="paper-affil"
                  dangerouslySetInnerHTML={{ __html: p.affiliationHtml }}
                />
              )}
            </div>
            {p.trackHtml && (
              <span
                className="paper-track"
                dangerouslySetInnerHTML={{ __html: p.trackHtml }}
              />
            )}
          </article>
        ))}
      </div>
      {acceptedNote ? (
        <p
          className="footnote"
          dangerouslySetInnerHTML={{ __html: acceptedNote }}
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
        {groups.map((g, gi) => (
          <div key={gi} className="schedule-group" role="rowgroup">
            {g.title && (
              <div className="schedule-group-label" role="row">
                <div role="rowheader" dangerouslySetInnerHTML={{ __html: g.title }} />
              </div>
            )}
            {g.rows.map((r, i) => {
              const isLast = gi === lastGroup && i === g.rows.length - 1;
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
        ))}
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

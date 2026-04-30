import Section from './Section';
import { readMd, parseDates } from '@/lib/content';

export default async function Dates() {
  const md = await readMd('dates');
  const { header, rows, footnoteHtml } = parseDates(md);

  return (
    <Section id="dates" num="02" title="Important dates">
      <div className="dates-table" role="table">
        {header.length > 0 && (
          <div className="dates-row dates-head" role="row">
            {header.map((h, i) => (
              <div key={i} role="columnheader" dangerouslySetInnerHTML={{ __html: h }} />
            ))}
          </div>
        )}
        {rows.map((r, i) => {
          const isLast = i === rows.length - 1;
          const cls = `dates-row${isLast ? ' dates-highlight' : ''}`;
          return (
            <div key={i} className={cls} role="row">
              {r.map((cell, ci) => (
                <div
                  key={ci}
                  role="cell"
                  dangerouslySetInnerHTML={{
                    __html: ci === 0 ? `<strong>${cell}</strong>` : cell,
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>
      {footnoteHtml ? (
        <p
          className="footnote"
          dangerouslySetInnerHTML={{ __html: footnoteHtml }}
        />
      ) : null}
    </Section>
  );
}

import Section from './Section';
import { readMd, parseTopics } from '@/lib/content';

export default async function Topics() {
  const md = await readMd('topics');
  const topics = parseTopics(md);

  return (
    <Section id="topics" num="03" title="Topics">
      <div className="topics-grid">
        {topics.map((t, i) => (
          <article key={i} className="topic">
            <h3 dangerouslySetInnerHTML={{ __html: t.title }} />
            <div dangerouslySetInnerHTML={{ __html: t.bodyHtml }} />
            {t.tags.length > 0 && (
              <ul className="tags">
                {t.tags.map((tag, ti) => (
                  <li key={ti}>{tag}</li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </Section>
  );
}

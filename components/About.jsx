import Section from './Section';
import { readMd, parseAbout } from '@/lib/content';

export default async function About() {
  const md = await readMd('about');
  const { leadHtml, bodyHtml } = parseAbout(md);

  return (
    <Section id="about" num="01" title="The theme">
      <div className="section-body two-col">
        <p
          className="big"
          dangerouslySetInnerHTML={{ __html: leadHtml }}
        />
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      </div>
    </Section>
  );
}

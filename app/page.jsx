import Hero from '@/components/Hero';
import About from '@/components/About';
import Dates from '@/components/Dates';
import Topics from '@/components/Topics';
import Cfp from '@/components/Cfp';
import Organisers from '@/components/Organisers';

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Dates />
      <Topics />
      <Cfp />
      <Organisers />
    </>
  );
}

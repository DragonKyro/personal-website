import { About } from '../components/About';
import { Contact } from '../components/Contact';
import { Experience } from '../components/Experience';
import { Footer } from '../components/Footer';
import { Hero } from '../components/Hero';
import { Launchpad } from '../components/Launchpad';
import { Nav } from '../components/Nav';
import { Work } from '../components/Work';

export function Home() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <About />
        <Work />
        <Launchpad variant="section" />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

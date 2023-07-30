"use client";

import About from "../src/section/About";

// This is a Client Component. It receives data as props and
// has access to state and effects just like Page components
// in the `pages` directory.
export default function HomePage() {
  return (
    <>
      <main>
        <HeroSection />
        <ThingsSection />
        <AboutSection />
        <ContactSection />

        <section>
          <Image src={content.avatar} alt="Stylised avatar of Stefan Hoth" />
          <h1>{content.welcome}</h1>
          <hr />
          <p>{content.subline}</p>
        </section>
        <section>
          <h1>
            Enabling everyone to do their best work and feeling great about it
          </h1>
          <p>
            I want to work with a team of kind, positive, collaborative, and
            curious people.
            <br />
            I want them to feel safe, respected, and appreciated.
            <br />
            I want them to feel like their experience, interests, and ambitions
            matter.
            <br />I want to enable them to create a meaningful impact - at a
            sustainable pace.
          </p>
          <p>
            These values and beliefs fuel my contributions to work policies,
            career frameworks, and process improvements.
          </p>
        </section>
        <section>
          <div id="contact">
            <h1>Contact me</h1>
            <p>TODO</p>
          </div>
        </section>
      </main>
    </>
  );
}

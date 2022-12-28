import Head from "next/head";
import { GetStaticProps } from "next";
import styles from "../styles/Home.module.css";
import avatarPic from "../public/profile.png";
import Image, { StaticImageData } from "next/image";

interface ContentProps {
  title: string;
  description: string;
  welcome: string;
  subline: string;
  avatar: StaticImageData;
}

export const getStaticProps: GetStaticProps = async () => {
  const content: ContentProps = {
    title: "Meet Stefan Hoth - A Senior Engineering Leader",
    description:
      "Stefan Hoth is an experienced Engineering Leader based in Germany.",
    welcome: "Hi there, I'm Stefan 👋",
    subline: "I'm an experienced Engineering Leader based in Germany.",
    avatar: avatarPic,
  };

  return {
    props: {
      content,
    }, // will be passed to the page component as props
  };
};

export default function Home({ content }: { content: ContentProps }) {
  return (
    <>
      <Head>
        <title>{content.title}</title>
        <meta name="description" content="{content.description}" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
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

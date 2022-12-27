import Head from "next/head";
import { GetStaticProps } from "next";
import styles from "../styles/Home.module.css";

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      content: {
        title: "Meet Stefan Hoth - A Senior Engineering Leader",
        description:
          "Stefan Hoth is an experienced Engineering Leader based in Germany.",
        welcome: "Hi from Next.js 13 👋👋👋",
      },
    }, // will be passed to the page component as props
  };
};

export default function Home({ content }) {
  return (
    <>
      <Head>
        <title>{content.title}</title>
        <meta name="description" content="{content.description}" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.description}>
          <h1>{content.welcome}</h1>
        </div>
      </main>
    </>
  );
}

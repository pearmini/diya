import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import styles from "./index.module.css";

function HomepageHeader() {
  return (
    <header className={clsx("hero", styles.heroBanner)}>
      <div className={clsx("container", styles.heroContainer)}>
        <h1 className={styles.heroTagline}>
          <div className={styles.heroLogo}>
            <div className={styles.heroLogoBg}></div>
            <img src="/img/logo.svg" className={styles.heroLogoImage}></img>
          </div>
          <span>
            Plot block <b>di</b>agrams with <b>YA</b>ML, focus on{" "}
            <b>hierarchy</b>
          </span>
        </h1>
        <div className={styles.buttons}>
          <Link
            className={clsx("button button--primary", styles.buttonFirst)}
            to="/docs/intro"
          >
            Get Started
          </Link>
          <Link
            className={clsx("button button--secondary", styles.buttonSecondary)}
            to="/editor"
          >
            Try Online
          </Link>
        </div>
      </div>
    </header>
  );
}

function HomeAnnounce() {
  return (
    <div class={styles.topBanner}>
      <div class={styles.topBannerTitle}>
        🎉&nbsp;
        <a class={styles.topBannerTitleText} href="/blog/releases/3.2">
          Announcing &nbsp;Diya!
        </a>
        &nbsp;🥳
      </div>
    </div>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <HomeAnnounce />
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}

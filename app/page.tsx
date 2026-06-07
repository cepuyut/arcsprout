import Link from 'next/link';
import {
  futureModuleSlots,
  homeFlowSteps,
  homeHeroStats,
  homeModules,
  homeTrustItems,
  passportLevels,
} from '@/lib/content';

export default function Home() {
  return (
    <main className="page-shell">
      <section className="hero-grid">
        <div className="hero-copy glass-card aurora-panel">
          <div className="eyebrow">ArcSprout Passport</div>
          <h1 className="hero-title">
            Community entry that grows into an onchain identity layer.
          </h1>
          <p className="hero-body">
            ArcSprout is no longer just a mint gate. It is the first passport
            layer for trusted members, modular progression, and future
            community access across the Arc ecosystem.
          </p>

          <div className="hero-actions">
            <Link href="/enter" className="btn btn-primary">
              Enter Passport Flow
            </Link>
            <a
              href="https://testnet.arcscan.app/address/0x1146e20874b90F6c37f938dee7b8AF0b8522D218"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              View Contract
            </a>
          </div>

          <div className="hero-trust-list">
            {homeTrustItems.map((item) => (
              <div key={item} className="trust-pill">
                <span className="trust-dot" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <aside className="glass-card constellation-card">
          <div className="eyebrow">Live trust signals</div>
          <div className="stat-stack">
            {homeHeroStats.map((stat) => (
              <div key={stat.label} className="stat-row">
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>

          <div className="mini-orbit">
            <div className="orbit-node orbit-node-primary">Seed</div>
            <div className="orbit-node orbit-node-secondary">Quest</div>
            <div className="orbit-node orbit-node-tertiary">Perk</div>
          </div>
        </aside>
      </section>

      <section className="section-grid">
        <div className="section-heading">
          <div className="eyebrow">Why it matters</div>
          <h2>From one mint flow to a reusable community passport system.</h2>
          <p>
            The redesign keeps minting as the first milestone, but creates a
            structure that can hold progression, utility, and future modules
            without rewriting the product.
          </p>
        </div>

        <div className="feature-grid">
          {homeModules.map((module) => (
            <article key={module.title} className="glass-card feature-card">
              <div className="eyebrow">{module.eyebrow}</div>
              <h3>{module.title}</h3>
              <p>{module.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-grid">
        <div className="section-heading">
          <div className="eyebrow">How it flows</div>
          <h2>A cleaner path from trust check to long-term identity.</h2>
        </div>

        <div className="timeline-grid">
          {homeFlowSteps.map((step, index) => (
            <article key={step.title} className="glass-card timeline-card">
              <div className="timeline-index">0{index + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-grid dual-column">
        <div className="glass-card">
          <div className="eyebrow">Passport progression</div>
          <h2>Designed for levels, not just one transaction.</h2>
          <div className="level-grid">
            {passportLevels.map((level) => (
              <article key={level.label} className="level-card">
                <div className="level-kicker">{level.status}</div>
                <h3>{level.label}</h3>
                <p>{level.body}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="glass-card">
          <div className="eyebrow">Future module slots</div>
          <h2>Flexible areas reserved for upcoming ideas.</h2>
          <div className="slot-list">
            {futureModuleSlots.map((slot) => (
              <div key={slot} className="slot-card">
                {slot}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="glass-card cta-banner">
        <div>
          <div className="eyebrow">Pitch + entry</div>
          <h2>Prove your wallet now, grow your passport later.</h2>
          <p>
            Start with the live mint flow today. The interface is being shaped
            to support future quests, perks, and progression on the same
            foundation.
          </p>
        </div>

        <div className="cta-actions">
          <Link href="/enter" className="btn btn-primary">
            Launch Mint Flow
          </Link>
        </div>
      </section>
    </main>
  );
}

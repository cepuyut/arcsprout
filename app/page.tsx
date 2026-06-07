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
      <header className="topbar">
        <div className="brand-mark" aria-label="ArcSprout">
          A
        </div>
        <nav className="topnav" aria-label="Primary">
          <a href="#how-it-works">How It Works</a>
          <a href="#tiers">Tiers</a>
          <a href="#activity">Activity</a>
          <a href="#docs">Docs</a>
        </nav>
        <div className="topbar-actions">
          <Link href="/enter" className="btn btn-primary compact-btn">
            Check Eligibility
          </Link>
        </div>
      </header>

      <section className="hero-grid hero-showcase">
        <div className="hero-copy glass-card aurora-panel">
          <div className="eyebrow">ArcSprout Passport</div>
          <h1 className="hero-title">
            Your onchain identity grows with every move.
          </h1>
          <p className="hero-body">
            ArcSprout evaluates your wallet activity. Earn your passport. Level
            up your membership. Keep the system alive through meaningful Arc
            participation.
          </p>

          <div className="hero-actions">
            <Link href="/enter" className="btn btn-primary">
              Check Eligibility
            </Link>
            <a href="#how-it-works" className="btn btn-secondary">
              See How It Works
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

        <aside className="hero-figure glass-card">
          <div className="figure-top">
            <div className="figure-chip">Arc Testnet</div>
            <div className="score-orb">
              <div className="score-orb-inner">
                <span>Score</span>
                <strong>82</strong>
              </div>
            </div>
          </div>

          <div className="seed-avatar" aria-hidden="true">
            <div className="seed-head" />
            <div className="seed-eye-bar" />
            <div className="seed-body">
              <div className="seed-logo">A</div>
            </div>
            <div className="seed-root" />
          </div>

          <div className="figure-foot">
            <div className="stat-row">
              <span>Network</span>
              <strong>Arc Testnet</strong>
            </div>
            <div className="stat-row">
              <span>Threshold</span>
              <strong>Score &gt;= 60</strong>
            </div>
            <div className="stat-row">
              <span>Passport</span>
              <strong>Seed Identity</strong>
            </div>
            <div className="stat-row">
              <span>Status</span>
              <strong className="stat-live">Live</strong>
            </div>
          </div>
        </aside>
      </section>

      <section className="status-strip glass-card">
        {homeHeroStats.map((stat) => (
          <div key={stat.label} className="status-strip-item">
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </section>

      <section className="section-grid">
        <div className="section-heading">
          <div className="eyebrow">Why it matters</div>
          <h2>Identity that can evolve, utility that can grow, and membership that stays alive.</h2>
          <p>
            The first mint is only the seed. The system is built to expand into
            progression, quests, perks, and long-term community value without
            breaking the core experience.
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

      <section className="section-grid" id="how-it-works">
        <div className="section-heading">
          <div className="eyebrow">How it flows</div>
          <h2>A clear path from trust check to evolving identity.</h2>
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

      <section className="section-grid dual-column" id="activity">
        <div className="glass-card upgrade-panel">
          <div className="eyebrow">Not eligible yet?</div>
          <h2>Your score grows when your onchain activity does.</h2>
          <div className="upgrade-grid">
            <article className="upgrade-card">
              <div className="upgrade-icon">◌</div>
              <div>
                <h3>Stake on Arc</h3>
                <p>Locking assets signals long-term commitment.</p>
              </div>
              <span className="upgrade-tag">+Score</span>
            </article>
            <article className="upgrade-card">
              <div className="upgrade-icon">↺</div>
              <div>
                <h3>Swap via Arc DEX</h3>
                <p>Active trading builds protocol usage history.</p>
              </div>
              <span className="upgrade-tag">+Score</span>
            </article>
            <article className="upgrade-card">
              <div className="upgrade-icon">⟶</div>
              <div>
                <h3>Bridge to Arc</h3>
                <p>Cross-chain movement shows ecosystem depth.</p>
              </div>
              <span className="upgrade-tag">+Score</span>
            </article>
            <article className="upgrade-card">
              <div className="upgrade-icon">◉</div>
              <div>
                <h3>Use Arc AI Services</h3>
                <p>AI interaction pushes your score the furthest.</p>
              </div>
              <span className="upgrade-tag">+Score</span>
            </article>
          </div>

          <div className="score-bar-shell">
            <div className="score-bar-labels">
              <span>Current Score</span>
              <strong>58</strong>
            </div>
            <div className="score-bar-track">
              <div className="score-bar-fill" style={{ width: '68%' }} />
            </div>
            <div className="score-bar-meta">
              <span>Target: 60+</span>
              <strong>2 points away from minting</strong>
            </div>
          </div>
        </div>

        <div className="glass-card" id="tiers">
          <div className="eyebrow">Your passport levels</div>
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
      </section>

      <section className="glass-card membership-panel">
        <div className="membership-copy">
          <div className="eyebrow">Membership value</div>
          <h2>
            ArcSprout NFTs generate protocol revenue participation for
            top-tier holders.
          </h2>
          <p>
            A portion of protocol fees flows into the fee pool and is
            distributed to higher-tier holders. The more the ecosystem grows,
            the more valuable the membership becomes.
          </p>
        </div>

        <div className="membership-flow">
          <div className="flow-node">Ecosystem Activity</div>
          <div className="flow-arrow">→</div>
          <div className="flow-node">Fee Pool</div>
          <div className="flow-arrow">→</div>
          <div className="flow-node">Canopy Holders</div>
        </div>
      </section>

      <section className="section-grid" id="docs">
        <div className="section-heading">
          <div className="eyebrow">Future module slots</div>
          <h2>Flexible areas reserved for upcoming ideas.</h2>
        </div>

        <div className="slot-list">
          {futureModuleSlots.map((slot) => (
            <div key={slot} className="slot-card">
              {slot}
            </div>
          ))}
        </div>
      </section>

      <footer className="site-footer glass-card">
        <div className="brand-mark footer-mark">A</div>
        <div className="footer-copy">
          <span>Contract Address:</span>
          <strong>0x1146e20874b90F6c37f938dee7b8AF0b8522D218</strong>
        </div>
        <div className="footer-meta">Built on Arc Testnet</div>
      </footer>
    </main>
  );
}

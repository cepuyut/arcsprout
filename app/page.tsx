import Link from 'next/link';
import {
  futureModuleSlots,
  homeEligibilityActions,
  homeFlowSteps,
  homeHeroStats,
  homeMembershipMoments,
  homeModules,
  homeProofCards,
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
          <a href="#overview">Overview</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#progression">Progression</a>
          <a href="#entry-path">Entry Path</a>
        </nav>
        <div className="topbar-actions">
          <Link href="/enter" className="btn btn-primary compact-btn">
            Check Eligibility
          </Link>
        </div>
      </header>

      <section className="home-reset-grid" id="overview">
        <div className="glass-card home-reset-hero">
          <div className="eyebrow">ArcSprout Passport</div>
          <h1 className="home-reset-title">
            Membership identity for the Arc community.
          </h1>
          <p className="home-reset-body">
            ArcSprout evaluates wallet activity, mints a base passport for
            eligible members, and creates a clean path into progression,
            recognition, and future utility across Arc.
          </p>

          <div className="hero-actions">
            <Link href="/enter" className="btn btn-primary">
              Open Wallet Check
            </Link>
            <a href="#how-it-works" className="btn btn-secondary">
              Understand the Flow
            </a>
          </div>

          <div className="hero-trust-list home-reset-trust">
            {homeTrustItems.map((item) => (
              <div key={item} className="trust-pill">
                <span className="trust-dot" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <aside className="glass-card home-reset-aside">
          <div className="aside-kicker">
            <span className="figure-chip">Arc Testnet</span>
            <span className="aside-caption">Live wallet gate</span>
          </div>

          <div className="home-score-panel">
            <div>
              <span className="aside-label">Entry score</span>
              <strong>82</strong>
            </div>
            <p>
              A member-friendly wallet check that reads trust, activity, and
              repeat engagement before minting the base passport.
            </p>
          </div>

          <div className="home-rail-list">
            {homeHeroStats.map((stat) => (
              <div key={stat.label} className="home-rail-row">
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>

          <div className="home-side-note">
            <div className="eyebrow">Arc House ready</div>
            <p>
              Built to feel like a calm home base for members, builders, and
              future Architects who want visible growth instead of vague hype.
            </p>
          </div>
        </aside>
      </section>

      <section className="proof-grid">
        {homeProofCards.map((card) => (
          <article key={card.title} className="glass-card proof-card">
            <div className="eyebrow">{card.label}</div>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </article>
        ))}
      </section>

      <section className="section-grid" id="how-it-works">
        <div className="section-heading">
          <div className="eyebrow">How it works</div>
          <h2>A flow that hides complexity but keeps users in control.</h2>
          <p>
            ArcSprout should explain the path in seconds: connect, get a
            trustworthy score, mint the first passport layer, and keep growing
            from there.
          </p>
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

      <section className="section-grid" id="progression">
        <div className="section-heading">
          <div className="eyebrow">Built for Arc</div>
          <h2>Community, recognition, and AI utility should feel connected.</h2>
          <p>
            ArcSprout should sit naturally beside Arc House and the Architects
            program: one place for identity, one path for recognition, and one
            surface that can grow with the network.
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

      <section className="section-grid dual-column" id="entry-path">
        <div className="glass-card upgrade-panel">
          <div className="eyebrow">Entry path</div>
          <h2>Users who are not eligible yet should still feel guided.</h2>
          <div className="upgrade-grid">
            {homeEligibilityActions.map((item, index) => (
              <article key={item.title} className="upgrade-card">
                <div className="upgrade-icon">0{index + 1}</div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
                <span className="upgrade-tag">Path</span>
              </article>
            ))}
          </div>

          <div className="score-bar-shell">
            <div className="score-bar-labels">
              <span>Example wallet score</span>
              <strong>58</strong>
            </div>
            <div className="score-bar-track">
              <div className="score-bar-fill" style={{ width: '68%' }} />
            </div>
            <div className="score-bar-meta">
              <span>Target entry score</span>
              <strong>2 points from mint readiness</strong>
            </div>
          </div>
        </div>

        <div className="glass-card progression-panel">
          <div className="eyebrow">Progression</div>
          <h2>Designed for visible tiers, roles, and future member value.</h2>
          <div className="level-grid">
            {passportLevels.map((level) => (
              <article key={level.label} className="level-card">
                <div className="level-kicker">{level.status}</div>
                <h3>{level.label}</h3>
                <p>{level.body}</p>
              </article>
            ))}
          </div>

          <div className="progression-notes">
            {homeMembershipMoments.map((item) => (
              <div key={item} className="slot-card">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="glass-card membership-panel">
        <div className="membership-copy">
          <div className="eyebrow">Future module slots</div>
          <h2>A structure that can absorb new community and product ideas.</h2>
          <p>
            The page should stay easy to evolve when ArcSprout adds quests,
            gated roles, AI services, community campaigns, or future value
            mechanics.
          </p>
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
          <span>Contract address</span>
          <strong>0x1146e20874b90F6c37f938dee7b8AF0b8522D218</strong>
        </div>
        <div className="footer-meta">Built on Arc Testnet</div>
      </footer>
    </main>
  );
}

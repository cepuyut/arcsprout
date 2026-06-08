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
    <main className="page-shell" id="main-content">
      <a href="#overview" className="skip-link">
        Skip to overview
      </a>
      <header className="topbar">
        <Link href="/" className="brand-lockup" aria-label="ArcSprout">
          <div className="brand-mark">A</div>
          <div className="brand-copy">
            <strong>ArcSprout</strong>
            <span>Arc community passport</span>
          </div>
        </Link>

        <nav className="topnav" aria-label="Primary">
          <a href="#overview">Overview</a>
          <a href="#how-it-works">Flow</a>
          <a href="#progression">Progression</a>
          <a href="#entry-path">Eligibility</a>
        </nav>

        <div className="topbar-actions">
          <Link href="/enter" className="btn btn-primary compact-btn">
            Check eligibility
          </Link>
        </div>
      </header>

      <section className="hero-shell" id="overview">
        <div className="hero-main glass-card">
          <div className="eyebrow">Arc House identity layer</div>
          <h1 className="hero-title">
            Passport the members who move Arc forward.
          </h1>
          <p className="hero-body">
            ArcSprout is the clean entry point for community identity on Arc.
            It evaluates meaningful wallet activity, mints a base passport for
            eligible members, and leaves room for visible growth, roles, and
            future utility.
          </p>

          <div className="hero-actions">
            <Link href="/enter" className="btn btn-primary">
              Open wallet check
            </Link>
            <a href="#progression" className="btn btn-secondary">
              See progression
            </a>
          </div>

          <div className="trust-row">
            {homeTrustItems.map((item) => (
              <div key={item} className="trust-chip">
                <span className="trust-chip-dot" aria-hidden="true" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <aside className="hero-side glass-card">
          <div className="hero-side-top">
            <span className="figure-chip">Arc Testnet</span>
            <span className="mini-note">Live score gate</span>
          </div>

          <div className="arc-figure">
            <div className="arc-score-ring">
              <div className="arc-score-core">
                <span>Score</span>
                <strong>82</strong>
              </div>
            </div>
            <div className="arc-window" aria-hidden="true">
              <div className="arc-window-foot" />
            </div>
          </div>

          <div className="rail-grid">
            {homeHeroStats.map((stat) => (
              <div key={stat.label} className="rail-row">
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="status-band glass-card">
        <div className="status-band-item">
          <span>Product role</span>
          <strong>Membership identity</strong>
        </div>
        <div className="status-band-item">
          <span>Network model</span>
          <strong>Stablecoin-native Arc</strong>
        </div>
        <div className="status-band-item">
          <span>Community lens</span>
          <strong>Arc House + Architects</strong>
        </div>
        <div className="status-band-item">
          <span>Mint logic</span>
          <strong>Wallet score threshold</strong>
        </div>
      </section>

      <section className="section-shell">
        <div className="section-heading">
          <div className="eyebrow">Why ArcSprout exists</div>
          <h2>Keep entry useful, predictable, and worth growing into.</h2>
          <p>
            ArcSprout should not feel like a one-time NFT drop. It should feel
            like the first layer of belonging inside Arc: easy to understand,
            honest about the rules, and ready to support member growth.
          </p>
        </div>

        <div className="proof-grid">
          {homeProofCards.map((card) => (
            <article key={card.title} className="proof-card glass-card">
              <div className="eyebrow">{card.label}</div>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell" id="how-it-works">
        <div className="section-heading">
          <div className="eyebrow">How it works</div>
          <h2>One calm flow from wallet check to first passport mint.</h2>
          <p>
            The product should explain itself in seconds. Connect a wallet, see
            an understandable score, mint the base passport if eligible, then
            come back as progression expands.
          </p>
        </div>

        <div className="flow-grid">
          {homeFlowSteps.map((step, index) => (
            <article key={step.title} className="flow-card glass-card">
              <div className="flow-index">0{index + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell" id="progression">
        <div className="feature-split">
          <div className="section-heading">
            <div className="eyebrow">Built around Arc</div>
            <h2>Designed to fit Arc House, Architects, and future utility.</h2>
            <p>
              Arc already speaks in the language of contribution, community,
              and transparent progression. ArcSprout should feel native to that
              world instead of acting like an isolated mint page.
            </p>
          </div>

          <div className="feature-stack">
            {homeModules.map((module) => (
              <article key={module.title} className="feature-panel glass-card">
                <div className="eyebrow">{module.eyebrow}</div>
                <h3>{module.title}</h3>
                <p>{module.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="section-heading">
          <div className="eyebrow">Progression path</div>
          <h2>Make growth visible from the first passport layer.</h2>
          <p>
            Tiers, points, and roles should feel like a living community system.
            The user should immediately understand that minting is the start,
            not the finish.
          </p>
        </div>

        <div className="level-grid">
          {passportLevels.map((level) => (
            <article key={level.label} className="level-card glass-card">
              <div className="level-kicker">{level.status}</div>
              <h3>{level.label}</h3>
              <p>{level.body}</p>
            </article>
          ))}
        </div>

        <div className="slot-grid">
          {homeMembershipMoments.map((item) => (
            <div key={item} className="slot-card glass-card">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell" id="entry-path">
        <div className="entry-shell glass-card">
          <div className="entry-copy">
            <div className="eyebrow">For wallets that are not eligible yet</div>
            <h2>Give people a real path forward, not a dead end.</h2>
            <p>
              Users who do not pass the first check should still feel welcomed
              into the system. The guidance should point them toward meaningful
              onchain behavior, not vague grinding.
            </p>
          </div>

          <div className="entry-grid">
            {homeEligibilityActions.map((item, index) => (
              <article key={item.title} className="entry-card">
                <div className="entry-card-count">0{index + 1}</div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="score-panel">
            <div className="score-panel-row">
              <span>Example wallet score</span>
              <strong>58</strong>
            </div>
            <div className="score-track">
              <div className="score-fill" style={{ width: '68%' }} />
            </div>
            <div className="score-panel-row score-panel-row-muted">
              <span>Threshold for mint</span>
              <strong>60+</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="glass-card modules-panel">
        <div className="section-heading compact-heading">
          <div className="eyebrow">Future slots</div>
          <h2>A structure that can absorb more features without feeling broken.</h2>
          <p>
            As ArcSprout grows into quests, campaigns, AI services, and capped
            member rewards, the page should stay modular and easy to extend.
          </p>
        </div>

        <div className="slot-grid">
          {futureModuleSlots.map((slot) => (
            <div key={slot} className="slot-card glass-card">
              {slot}
            </div>
          ))}
        </div>
      </section>

      <footer className="site-footer glass-card">
        <div className="footer-brand">
          <div className="brand-mark footer-mark">A</div>
          <div className="brand-copy">
            <strong>ArcSprout</strong>
            <span>Membership identity on Arc Testnet</span>
          </div>
        </div>

        <div className="footer-copy">
          <span>Contract</span>
          <strong>0x1146e20874b90F6c37f938dee7b8AF0b8522D218</strong>
        </div>

        <div className="footer-meta">Built for Arc House era community growth</div>
      </footer>
    </main>
  );
}

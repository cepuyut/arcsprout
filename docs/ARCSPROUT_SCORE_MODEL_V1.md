# ArcSprout Score Model v1

## Goal

This score model answers one question:

`has this wallet shown enough meaningful Arc participation to earn the base ArcSprout NFT?`

The score is not designed to reward raw spam. It is designed to reward:

- real Arc usage
- repeated participation over time
- economic alignment
- useful ecosystem actions

Pass threshold:

- `Eligible`: `score >= 60`
- `Not eligible`: `score < 60`

Score ceiling:

- maximum score is `100`

## Product Intent

The score must create a healthy loop:

1. new user arrives
2. user sees they are not eligible yet
3. user gets concrete onchain actions to improve
4. those actions help ArcSprout and Arc ecosystem activity
5. user eventually earns mint access

That means the score system should teach behavior, not just filter wallets.

## Inputs

### Base wallet signals

- Arc transaction count
- wallet age
- active days on Arc
- native ARC balance
- USDC balance or usage

### Ecosystem participation signals

- APT staking activity
- APT swap activity
- bridge activity into Arc
- usage of future ArcSprout AI commerce

### Anti-spam signals

- repeated tiny transfers to the same address
- bursts with no retention
- no diversity of actions
- activity concentrated in a very short window

## Score Categories

### 1. Arc Presence

Maximum: `25`

Purpose:

- prove the wallet really uses Arc at all

Rules:

- `+10` if wallet has at least 1 Arc transaction
- `+5` if wallet has at least 5 Arc transactions
- `+5` if wallet has at least 10 Arc transactions
- `+5` if wallet has at least 20 Arc transactions

Notes:

- this rewards depth without making infinite transaction spam useful

### 2. Retention Over Time

Maximum: `20`

Purpose:

- reward repeated return behavior instead of one-day farming

Rules:

- `+5` if wallet has Arc activity across at least 2 distinct days
- `+5` if wallet has Arc activity across at least 5 distinct days
- `+5` if wallet has Arc activity across at least 10 distinct days
- `+5` if first Arc activity is at least 30 days old

Notes:

- this is one of the most important anti-spam categories

Implementation note:

- the current backend uses available Arc proxy signals first
- staking, swap, bridge, AI commerce, and quest telemetry can be wired in later without changing the overall model shape

### 3. Economic Participation

Maximum: `25`

Purpose:

- reward useful ecosystem actions, not only transfers

Rules:

- `+10` if wallet has any verified bridge-in activity to Arc
- `+5` if wallet has any verified swap activity on approved Arc rails
- `+5` if wallet has at least one meaningful APT staking position
- `+5` if wallet has used USDC in a verified Arc context

Notes:

- each bucket is one-time capped in v1
- the first version should prefer clear boolean checks over complicated volume math
- in the current backend, this category uses proxy signals until richer telemetry is available

### 4. Alignment With ArcSprout Economy

Maximum: `15`

Purpose:

- reward actions that directly strengthen ArcSprout's future economy

Rules:

- `+5` if wallet holds a minimum approved amount of APT for at least a minimum window
- `+5` if wallet has paid for an approved ArcSprout service with APT or USDC
- `+5` if wallet has completed at least one approved ArcSprout quest or campaign action

Notes:

- two of these signals may start as unavailable in early product phases
- when unavailable, the category can score from the signals that already exist

### 5. Quality Multiplier Guard

Maximum: `15`

Purpose:

- prevent a wallet with noisy low-quality activity from scoring too easily

Rules:

- `+5` if average action pattern is not flagged as repetitive spam
- `+5` if wallet uses at least 2 distinct activity types
- `+5` if wallet shows non-burst participation across time

Notes:

- this category acts as positive anti-abuse scoring instead of punishment-first design

## Simple Formula

```text
score =
  arc_presence
  + retention_over_time
  + economic_participation
  + alignment_with_arcsprout
  + quality_multiplier_guard

eligible if score >= 60
```

## Example Wallet Outcomes

### Example A: low-quality farm wallet

- 15 tiny self-directed transfers in one hour
- no bridge
- no swaps
- no staking
- 1 active day

Likely score:

- Arc Presence: `15`
- Retention: `0`
- Economic Participation: `0`
- Alignment: `0`
- Quality Guard: `0`

Total: `15`

Result:

- not eligible

### Example B: real new Arc user

- bridged in once
- made 3 swaps
- active on 4 different days
- holds some APT
- used USDC once

Likely score:

- Arc Presence: `10`
- Retention: `5`
- Economic Participation: `20`
- Alignment: `5`
- Quality Guard: `10`

Total: `50`

Result:

- not eligible yet, but very close

### Example C: healthy target wallet

- bridged to Arc
- active for 12 days across time
- swapped multiple times
- staked APT
- used USDC
- completed one ArcSprout quest

Likely score:

- Arc Presence: `20`
- Retention: `20`
- Economic Participation: `25`
- Alignment: `10`
- Quality Guard: `10`

Total: `85`

Result:

- eligible

## Improvement Actions Shown To User

When a user is not eligible, the UI should not only say "score too low".

It should map missing categories to suggested actions:

- missing bridge signal -> `Bridge assets to Arc`
- missing swap signal -> `Make your first swap on Arc`
- missing staking signal -> `Stake APT`
- missing retention signal -> `Return and stay active across more days`
- missing alignment signal -> `Use an ArcSprout quest or AI service`

This turns rejection into onboarding.

## What v1 Should Avoid

- rewarding transaction volume without caps
- weighting raw transfer count too heavily
- using large price or volume thresholds too early
- depending on too many integrations before the product can ship
- punishing users with opaque black-box scoring

## What v1 Should Prioritize

- easy to explain
- easy to calculate
- hard to farm with simple spam
- modular enough for future APT and AI commerce expansion

## Recommended Data Model

Suggested response shape from the evaluation layer:

```json
{
  "score": 58,
  "threshold": 60,
  "eligible": false,
  "breakdown": {
    "arcPresence": 15,
    "retention": 10,
    "economicParticipation": 20,
    "alignment": 5,
    "qualityGuard": 8
  },
  "missingSignals": [
    "staking",
    "retention"
  ],
  "actions": [
    "Stake APT",
    "Return on more active days"
  ]
}
```

This makes the score explainable and useful for UI guidance.

## Delegation Prompt For Notion AI

```text
You are helping refine ArcSprout Score Model v1.

ArcSprout principles:
- utility first
- meaningful activity over spam
- NFT as living identity
- APT as economic fuel
- privileges must be earned and capped
- AI must stay functional, not cosmetic

Current score categories:
- Arc Presence 25
- Retention Over Time 20
- Economic Participation 25
- Alignment With ArcSprout Economy 15
- Quality Multiplier Guard 15

Task:
Propose 3 refinements to this score model that improve anti-spam resistance without making the system too hard to ship.

Output:
- Option A
- Option B
- Option C
- risks
- best recommendation
```

## Mandor Recommendation

Ship this as the first practical score model because it is:

- easy to explain in product copy
- easier to implement than volume-heavy tokenomics logic
- aligned with the ArcSprout economic loop
- strong enough to support the next phase of APT staking, swaps, and quests

# Campaign Architecture

How to structure Meta ad campaigns for demand creation. Based on Simon
Beard's evolution from complex multi-campaign setups at Culture Kings to
the current AI-first, one-campaign approach.

## The One Campaign Setup

If you told Simon this years ago, he'd have said you're crazy. Culture
Kings had the most complex funnels — every step numbered, by product, by
category, five media buyers chopping up the data. That world is gone.

Meta's AI is now better at optimizing than any human media buyer. The
job is no longer to outsmart the algorithm. The job is to FEED the
algorithm with the best possible creative and let it do its work.

### The Default Structure
```
1 Campaign → 1 Ad Set → 8-20 Creatives
Per offer, per country
```

### Setup Rules
- **Objective:** Conversions (Purchase for ecom, Lead for lead gen)
- **Targeting:** Advantage+ Audience (broad). No interests. No lookalikes. No custom audiences.
- **Placements:** Advantage+ Placements (all placements ON)
- **Attribution:** 7-day click, 1-day view (or 1-click/1-view for high velocity)
- **Budget:** Campaign Budget Optimization (CBO)

### When to Split Into Multiple Campaigns
ONLY when gross profit contribution differs:
- Different countries with different shipping costs = separate campaigns
- Different offers with different margins = separate campaigns
- Different products with different GP = separate campaigns
- Same product, same offer, same GP = ONE campaign

### What NOT to Do
- No separate testing vs scaling campaigns (Meta tests within one campaign)
- No prospecting vs retargeting split (let Meta build its own funnel)
- No audience exclusions (they don't work reliably anymore)
- No interest-based targeting (broad beats everything since 2021)

## Creative Loading

### Batch Loading
- Load 8-20 distinct creatives into the ad set
- "Distinct" means genuinely different: different format, different hook,
  different visual style, different talent
- Meta's Andromeda groups similar creatives. Near-dupes get penalized.
- Each creative should target a different customer type or pain point

### The Decision Budget
Before judging any ad's performance:
- Spend minimum 3x your target CPA on that ad
- Below 3x CPA in spend = not enough data to judge
- An ad that spent $20 with a $50 CPA target has told you nothing

### What to Judge
- **Hook Rate:** 3-second view / impression. Target: 25%+
- **Hold Rate:** Average watch time / video length. Target: varies by length
- **CTR (link):** Click-through rate to landing page. Target: 1%+
- **CPA:** Cost per acquisition. THE metric that matters.

### Winner ≠ Biggest Spender
Meta allocates spend to what it THINKS will convert. But sometimes it's
wrong. Judge by EFFICIENCY (CPA, ROAS) not by VOLUME (spend).

An ad spending $50/day at $15 CPA is outperforming an ad spending
$200/day at $40 CPA. Promote the efficient one.

## Cost Cap Strategy

### When to Use Cost Caps
- You know your target CPA / CPL precisely
- You have enough creative volume to sustain the cap
- Your account has conversion history (50+ conversions in 7 days)

### How to Set Cost Caps
- Set at your MAX acceptable CPA (not your target)
- If target CPA is $30, set cap at $35-40
- Too tight = no spend. Too loose = no control.
- Adjust in $2-5 increments, never big jumps

### Cost Cap Golden Rule
If a cost cap campaign isn't spending, the answer is ALWAYS more creative,
not a higher cap. Adding better creative gives Meta more options to find
conversions within your cap.

## The Three Variables (Revisited)

When performance drops, diagnose in this order:

1. **Creative** — Is the creative stale? Are you adding 3-5 new ads/week?
2. **Offer** — Is the offer compelling? Test a new bundle, price, or guarantee
3. **Budget** — Are you over-spending relative to creative volume?

Changing budget without changing creative is like turning up the volume
on a bad song. It just gets louder, not better.

## Signals and Data Hygiene

### The Basics That Break Everything
- **Pixel + CAPI** running in parity (both firing, deduped by event_id)
- **Event match quality** above 6.0 (ideally 8+)
- **No duplicate Purchase events** (check for double-firing snippets)
- **Currency correct** per account (never mix AUD and USD)
- **Real-time events** (not batched, not delayed)

### When Data Breaks
Symptoms: spend drops suddenly, CPA spikes with no creative change,
attribution looks wrong, reported conversions don't match Shopify/CRM.

First check:
1. Pixel helper (Chrome extension) — is the pixel firing?
2. Events Manager — are events deduped? Match quality score?
3. CAPI — is server-side sending? Check for 403s or timeouts
4. Recent code changes — did a dev push break something?

Data hygiene isn't glamorous. It's also the fastest way to waste $10K.

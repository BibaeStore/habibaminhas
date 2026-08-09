# Agents vs Automation — the vocabulary, honestly

**Owner's question (2026-08-03):** *"This blog automation: is there an agent that I have set
up, or is it just an automation? I am a little confused when someone says that I have
created an agent."*

The confusion is reasonable, because the word "agent" is currently used by vendors to mean
almost anything. Here is the distinction that actually matters.

---

## The short answer

**Your blog system is not an agent. It is a scheduled pipeline.**

That is not a criticism. For this job a pipeline is *better* than an agent — cheaper, more
predictable, and it cannot surprise you at 8:40 in the morning on a site that ranks.

---

## The four tiers

Think of it as a ladder. Each rung gives up predictability in exchange for flexibility.

### Tier 1 — Trigger / Rule
> *"When X happens, do Y."*

No intelligence at all. A rule fires.

**In your system:** the low-stock notification. Stock drops below the threshold → a row is
inserted into `notifications`. That is it.

### Tier 2 — Pipeline / Workflow ← **your blog system lives here**
> *"On a schedule, do A, then B, then C."*

Fixed sequence, defined by you in advance. May *call* an AI model as one of its steps, but
the model does not decide anything about the flow.

**In your system, every morning:**

```
08:30 PKT  read next file in content/blog-queue/   ← sorted by filename, no choice made
           validate against the quality gate        ← pass/fail, no judgement
           save as draft
08:40 PKT  generate hero image (OpenAI)             ← the only AI call in the whole flow
           publish
```

An image model is involved. **Nothing is deciding anything.** If post 007 vanished, the
system would not reason about it — it would take 008, because that is what the sort order
says. The path is identical every single day.

### Tier 3 — Agent
> *"Here is a goal. Work out how to reach it."*

The model chooses which tools to use, in what order, how many times, and when to stop. Same
goal, different path each run.

**A genuine agent version of your blog system would:** read Search Console, notice
"sharara" impressions climbing, decide to write about shararas *instead of* what is next in
the queue, search the web to research it, pick its own internal links by querying the
database, and stop when it judged the post good enough.

Nothing in your system does any of that.

### Tier 4 — Multi-agent system
Several agents with different jobs, coordinating. Almost always overkill for a business
this size. Ignore this tier for now.

---

## Where your system actually sits

| Automation | Tier | Decides anything? |
|---|---|---|
| Blog publishing | 2 — Pipeline | No |
| PostEx status sync | 2 — Pipeline | No |
| Order confirmation email | 1 — Trigger | No |
| Low-stock notification | 1 — Trigger | No |
| Live Sale notification card | 1 — Trigger + rules | No (weighted rotation, but fixed logic) |
| Virtual Try Room | — | AI *feature*, not automation. A human clicks; a model responds |
| Admin "AI insights" panel | 2 — Pipeline | Model summarises; does not act |

**You currently operate zero agents.** Everything is Tier 1 or Tier 2.

---

## The one place you nearly had an agent

`lib/blog/config.ts` still supports `BLOG_SOURCE=api`. In that mode Claude researched the
topic live, chose its own angle, wrote the post and picked internal links from a supplied
list. That is much closer to Tier 3.

**You switched it off to remove cost** (~$0.53/post → ~$0.04/post). That was the right
business call. It also happens to have removed the least predictable part of the system.

Worth understanding as a trade you *chose*, not a limitation you are stuck with.

---

## When an agent is actually worth it

Use an agent only when **all three** are true:

1. **The steps genuinely cannot be known in advance.** If you can draw the flowchart, build
   the flowchart. It will be cheaper and it will not hallucinate.
2. **The work is worth more than the unpredictability costs.** An agent that occasionally
   does something odd is fine for drafting an internal report and unacceptable for
   messaging a customer or changing a price.
3. **A mistake is catchable.** Human review, a validation gate, a reversible action.

Your blog pipeline passes (3) — the quality gate — but fails (1). The steps *are* knowable.
So a pipeline is correct.

### Applied to the ideas in the backlog

| Candidate | Right tier | Why |
|---|---|---|
| COD order confirmation on WhatsApp | 1–2 | Fixed flow: send → wait → branch on reply. No judgement needed |
| Abandoned cart recovery | 2 | Timed sequence. Rules, not reasoning |
| Customer support replies | **3 — genuinely agentic** | Open-ended questions, needs to look up orders, decide when to escalate |
| Product description drafting | 2 | Template + model call, reviewed by you |
| Weekly business summary | 2 | Query → summarise → send |
| Restock / reorder decisions | 3, eventually | Needs judgement about demand. **Never let it act unsupervised** |

Note the shape: **only customer support is a real agent use case today**, and even that
should escalate to you rather than act freely.

---

## Vocabulary you will hear, decoded

| Term | What it usually means |
|---|---|
| "AI agent" | Often Tier 2 with a model in it. Ask: *what decision does it make?* |
| "Agentic workflow" | Tier 2 with some branching. Usually honest enough |
| "Autonomous" | Marketing. Ask what it does without a human, and what happens when it is wrong |
| "AI-powered" | Contains an API call somewhere. Says nothing about capability |
| "Copilot" | Human-in-the-loop. Suggests, does not act. Often the right answer |
| "RPA" | Older, rule-based. Clicks buttons. No intelligence |

**The question that cuts through all of it:** *"What decision does this make on its own, and
what happens when it gets that decision wrong?"* If the vendor cannot answer plainly, it is
Tier 2 wearing a costume.

---

## What to say when someone asks

> *"I run a scheduled content pipeline that publishes a researched blog post every morning,
> with an automated quality gate. It's not an agent — nothing makes runtime decisions.
> That's deliberate; the site ranks and I'd rather it be predictable."*

That is accurate, it is more impressive than "I built an AI agent", and it will not fall
apart under a follow-up question.

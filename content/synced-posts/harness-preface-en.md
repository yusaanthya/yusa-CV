---
slug: harness-preface-en
title: Why I Tore Down the Harness I Spent Half a Year Building
description: >-
  After throwing out 18 planning documents, I realized that once writing code
  got cheap, the expensive part is how much people have to understand: the focus
  of the work has been slowly shifting from software engineering to product
  engineering.
date: '2026-11-11'
tags:
  - AI
  - Claude Code
  - Agentic Workflow
  - Harness
published: true
lang: en
translationKey: harness-preface
---


In March I started a new job. The company is a startup that encourages bringing agentic workflows into everyday work, and that's what moved me from using Copilot / Antigravity to building my own harness.

Along the way I threw out 18 planning documents, and only then did I realize that what I really needed to study wasn't the scope of automation. It was **where to put the human gate.**

Writing and changing code used to be expensive, so we guarded the door carefully before anything went into the codebase and put most of our attention on line-by-line code review.

However, In the AI mania era, once the early skeleton is designed well, later iterations are fast enough to be almost free. If the external sources of truth are well managed, you can even let agents govern themselves to a very high level and handle everything on their own.

So the real pain point has moved from changing code to how to verify it. What deserves more thought is how to lighten the load of understanding for people, whether that's the system designer or other stakeholders you meet across the whole development process.

**In other words, the focus of the work has been slowly shifting from software engineering to product engineering.**

Six months of stumbling around left me with a few lessons. I also want to keep practicing organizing my thoughts and writing on my own in the AI booming, so I'm challenging myself to hand-write one post a week about what I've learned lol

Besides this preface, the series is planned as six chapters!

## Where It Started

How my workflow evolved:

1. A first try at a vague idea: give one command, and the agent runs every task linked to the jira ticket.

2. To fit how my team schedules work, I split the workflow into:

   ![Workflow: Jira ticket opened → generate AC and a rough design → settled in the meeting → generate a spec and task plan from Jira → implementation → self-testing done, hand-off to QA](/images/synced-blog/harness-preface-en/c96104af505d8e7312139580fc499c68fce2eaaac985e0a0225a6fcb2ac32a19.svg)

3. To make that flow work, and to leave room to coordinate with teammates later, I moved the planning into external documents, used scratch files to keep state where it made sense, and made it possible to re-enter the flow from any stage.

## Bloat

At first, letting the agent pile up the harness on its own was fast. Whenever a problem came up, I just changed the rules, and it felt extremely efficient. But I soon found that if I didn't step back every so often and check what rules I had piled up, the structure started to rot.

Over-planning put me in a hole: more and more documents, a direction that kept changing, and implementation that never kept up. To run unattended, I went from an early plan for a dedicated agent, to designing a classifier and rules for a writable workspace, to hooking up third-party messaging channels. Only at the end did I realize that, as models improved and the way I worked changed, these far-reaching plans were already out of date, and for some of them there was already an official feature I could just use.

Worse, rules with conflicting logic started fighting each other, and even I had trouble adjusting the harness afterwards.

## Turning Point

Problems have to be fixed, but by then this personal workflow was already part of my routine work, so I didn't start changing it right away.

Only after I saw that Claude Code's auto mode could run reliably in real products did I start scaling down and restructuring. I threw out 18 planning documents (about 4,923 lines), 12 items that were never implemented, 2 that were rolled back the day they went live, and a list of allow rules that had peaked at 59 and still held 50 when I emptied it.

But that round only cut planning documents and permission settings. The rules written for the agent didn't shrink at all, and seven weeks later they had grown by another tenth. So in November I tore it down a second time: I went through 288 rules one by one, kept only 58 as text, rewrote another 58 as scripts, and dropped the remaining 169. The markdown in the harness went from about 4,590 lines to about 1,517.

Together, the two rounds cleared out roughly 8,000 lines of text.

I'll go through this in detail, together with the bloat, in later chapters lol

I'm also currently trying to build a nightly implementation pipeline with Claude Code on the web. After trying it, I found that more of my original ideas no longer need to be hand-built. I'd like to share more about that in the future!

## Building the Theory

In the six months since I set up this workflow, I went through quite a struggle lol

At first I spent a lot of energy on how to restrict the agent's permissions: which actions could be allowed, which couldn't, and how to tune prompts and harness rules to control how the agent behaved. The result was that human review got tied tightly into the workflow. Implementation did get faster, but while I kept pressing approve I was no longer sure what I had actually reviewed. I was exhausted, and still worried about being fooled by hallucinations.

Gradually I realized that in the way I work now, changing code, even refactoring, has become cheap. The place that really needs more human effort is understanding the requirements.

So I changed my approach. Early on I let the critic agents review each other freely. I only settle the high-level system architecture and think through a few important scenarios to keep the data state from being polluted, and I leave the remaining details to the agents. Once they have argued their way to a conclusion, e2e runs in the test environment and leaves a record, and I only check whether the data state changed the way the scenarios we listed at the start said it should.

My approach went through many iterations during this time. At first I also worried that the agents would run wild. In the end it clicked: since changing code is now cheap, there are only three things I need to care about:

1. Whether this release includes destructive operations that are hard to roll back.
2. How to split the ticket scope during development, so that the size of later verification doesn't slow iteration down.
3. Whether this change is tightly coupled, so that a future iteration might get stuck because the QA scope is larger than people can handle.

The funny thing is that this conclusion isn't far from what I used to focus on in software engineering. It still comes down to splitting scope and assessing risk.

The difference is that changing code used to be expensive, so colleagues from every side usually worked around the engineers. Now the expensive part is understanding the requirements. So in my own work I spend more of my effort on planning how a whole feature gets delivered, and on what I can do along the way to lighten the load on everyone involved.

How to implement this is a matter of taste. A common approach in the community is to split agents into several roles. My thinking goes in roughly the same direction, just much simplified: I haven't actually organized agents by function.

I think that's mainly because my work hasn't yet reached the intensity of shipping hundreds of PRs a day, so doing it this way is simpler for now. Agentic workflows have been changing very fast this year, and for my own cognitive capacity, keeping things at this scale puts the least load on my understanding. I'll keep watching the community's discussions and adjust as I go!

## What I'll Write Next

The six chapters fall into two halves.

The first half goes into more detail on how I piled up documents until I couldn't understand my own harness, and how I later noticed and cut it down:

1. Bloat: I leaned heavily on written plans, until the rules and documents piled up to the point where I couldn't change them myself.
2. Teardown: I ended up tearing it down twice. I'll cover what each round did, and how I found out the first round hadn't finished the job.
3. Preventing over-design: what over-design is, and why the extra things an agent does cost more now than they used to.

The second half covers how, after these changes, to make sure every human gate is easy for people to understand:

4. Critic review: once nobody reads code line by line, how the agents' interaction should be designed, and what went wrong with it.
5. Pre-meeting inventory: how to clear away, before the meeting, everything that reading the code can already settle as an engineering decision, leaving only the business-logic questions that really need a human to decide.
6. Architecture diagrams: how to let partners see more clearly how far the implementation has come and what is still missing.

## From Software Engineering to Product Engineering

With so much recent news blooming in the tech community, I feel even more strongly that line-by-line human code review is going to disappear.

In fact, on my own side projects I no longer read PRs myself. I rely on setting up AC early, TDD built on feature tests in the middle, and a final agent review that sorts issues by severity: only P0 and P1 are blocking, while P2 and below are written down as known facts to refer to in future iterations and troubleshooting.

Strangely enough, after sorting all this out, I still believe the rhythm of development will be turned upside down within two or three years, coming back to the vague idea I started with: the feature itself is the final deliverable, implementation details go to agents, and humans are only responsible for planning the workflow up front, the high-level architecture, and the criteria for final acceptance.

Being practical, though, most in-house teams may not iterate that fast, and may not need to copy big tech's way of working or its business scale. In the end it comes back to this: within a team, how you work as a feature owner with stakeholders from different areas and discuss the product's short-, mid-, and long-term plans.

So for now, I still need to figure out how to make my workflow and harness more flexible, so they can adapt to different teams' development processes. That's the direction I'm still exploring.

If all goes well, the next chapter will be up next week!

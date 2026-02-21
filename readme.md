# STANDUP — Mid-Sprint Agenda App

**Live demo:** https://starship-droid.github.io/sprint-agenda-standup/

A real-time standup agenda tool for mid-sprint ceremonies. Everyone joins from the same link, names appear instantly for the whole team, and a two-phase timer keeps each speaker on track.

---

## Features

- **Real-time queue** — anyone can type their name and join; the list updates for everyone without a page refresh
- **Two-phase timer per speaker**
  - **Present Time** — the speaker shares their update (amber countdown)
  - **Q&A Time** — open floor for questions and comments (blue countdown)
- **Breakout room alert** — if either timer runs out before the speaker is done, a ⚠ Breakout Room warning is added to their name in the queue
- **Configurable timers** — set Present and Q&A duration independently (1–30 min each, default 5 min)
- **Queue management** — hover any waiting speaker to reorder (↑↓), edit their name (✎), or remove them (✕)
- **Session reset** — wipe the queue and start fresh at any time

---

## How It Works

1. Share the link with your team before the standup
2. Everyone types their name and hits **Join** — the queue builds in real time
3. Hit **▶ Start Standup** to kick off the first speaker
4. **Present Time** starts — hit **→ End Present / Start Q&A** when they're done (or let the timer run out)
5. **Q&A Time** starts — hit **✓ Done** when discussion wraps up
6. Repeat for each speaker — the next person's timer is ready to go

---

## Deploying to Netlify

This is a single HTML file with no build step required.

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag and drop `standup.html` onto the page
3. Netlify generates a URL — share it with your team

To use a custom domain or persistent URL, connect a GitHub repo and set the publish directory to the root.

---

## Tech

- Vanilla HTML / CSS / JavaScript — no framework, no dependencies
- Real-time sync via Anthropic persistent storage (shared key-value store polled every 2 seconds)
- Fonts: Orbitron, IBM Plex Mono, Share Tech Mono (Google Fonts)
- Single file, deployable anywhere static files are served
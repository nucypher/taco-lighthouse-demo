# SoundProof – Product‑Only Overview

Welcome to **SoundProof**—a music‑discovery experience that pays 90 % of every sale directly to emerging artists and lets listeners permanently own the songs they love.

> This document is intentionally **non‑technical**. It describes *what* the product must achieve, not *how* to code it. An LLM engineer should turn each section into working software using any suitable technology.

---

## 1. Core Idea (One Line)

**Pay‑once** (≈ 3 ¢) → **own a track forever** → **discover tomorrow's artists today**.

---

## 2. Key Personas & Daily Jobs‑to‑Be‑Done

| Persona                          | Motivation                                                 | Day‑1 Success Moment                                                            |
| -------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Listener** ("Crate‑Digger")    | Be first to find fresh underground music, keep it forever. | Purchases 5 tracks in first session without seeing a paywall pop‑up.            |
| **Creator** ("Bedroom Producer") | Upload quickly, earn real money, and watch fandom grow.    | Gets first payout notification within 24 hours of upload.                       |
| **Curator** ("Playlist DJ")      | Build reputation and income by sharing killer playlists.   | Earns first referral payout when a follower buys from their immutable playlist. |

---

## 3. Must‑Have User Flows

1. **Lean‑back feed** (30‑sec hooks → full track).
2. **One‑click upload** (encrypt → publish).
3. **Instant ownership** (hidden purchase, no wallet friction).
4. **Immutable playlist publish** (via Farcaster cast).
5. **Creator dashboard** (real‑time sales + follower growth).
6. **Feed filters** ("Humans only", "Hide tracks I already own").

*If a feature does not serve one of these flows, it is optional.*

---

## 4. Product Rules & Constraints

* **Economics**  90 % artist 10 % treasury (for storage + ops).
* **Pricing**    TrackPass starts at 3 ¢; bonding‑curve step 0.025 % with 99 ¢ cap.
* **Storage**    Free quota = 250 MB (≈ 2 albums); extra paid by creator.
* **Social graph**  Leverage Farcaster FIDs for follow/like—no duplicate tables.
* **Playlists**  Immutable casts; clones flagged + down‑ranked.
* **Governance**  Dual‑house (creators & listeners) with √‑weighted votes; timelock 48 h.

---

## 5. Launch‑Phase Feature Checklist

* [ ] **Creative‑Commons seed import** (≥ 2 k tracks).
* [ ] Friends‑and‑DM private uploader (target +300 tracks).
* [ ] Public beta wait‑list & open upload (target cumulative 3 k–4 k tracks).
* [ ] Daily "Discovery Mix" (fresh tracks < 1 k plays).
* [ ] First‑500‑sales artist spotlight push.
* [ ] Farcaster Frame player with buy button.
* [ ] Basic creator payout reporting (.csv download).

A public launch is *ready* when:
**≥ 3 k tracks**, **avg. listener session ≥ 15 min**, **artists paid ≥ \$500 total.**

---

## 6. Post‑Launch Growth Ideas (Optional)

* Live DJ rooms + mix recording ("Open Decks Friday").
* Remix bounties funded by listeners.
* Season Pass (subscription for N free TrackPass claims).
* Verified‑human badge & AI‑filter.
* DAO‑funded grant program for indie labels.

---

## 7. Success Metrics (90‑Day Horizon)

| Metric                   | Target     |
| ------------------------ | ---------- |
| Monthly Active Listeners | 10 k       |
| Monthly Active Creators  | 1 k        |
| Avg. listener spend      | \$2–\$5/mo |
| Avg. creator income      | ≥ \$20/mo  |
| Median session length    | 20 min     |

---

### 🔑  Takeaway

SoundProof wins if it *feels like magic discovery* for listeners *and* delivers **transparent, immediate income** to small creators—no wallets, no headaches, just music.

---

## Project info

**URL**: https://lovable.dev/projects/ec3d00e5-9c6c-45ae-a810-a7ab1170c9d6

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ec3d00e5-9c6c-45ae-a810-a7ab1170c9d6) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ec3d00e5-9c6c-45ae-a810-a7ab1170c9d6) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)

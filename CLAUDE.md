# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Development build (different Vite mode)
npm run build:dev

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Project Architecture

This is a React/TypeScript application built with Vite that implements a decentralized music platform with token-gated access control using TACo encryption.

### Core Technologies
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context + TanStack React Query
- **Authentication**: Privy (wallet/email/Farcaster) + Supabase
- **Database**: Supabase (PostgreSQL)
- **Storage**: IPFS via Lighthouse
- **Encryption**: NuCypher TACo for token-gated content access

### Key Architectural Patterns

**Dual Authentication System**:
- `AuthContext` manages Privy authentication and Supabase user state
- `WalletContext` handles wallet connections and network switching
- Progressive initialization ensures wallet is ready before user operations

**Encrypted Content Distribution**:
- All audio files encrypted with TACo before IPFS upload
- Decryption requires wallet signatures and token ownership verification
- Uses ERC20/ERC721 conditions for access control

**Network Strategy**:
- Authentication uses Ethereum mainnet
- TACo operations use Polygon Amoy testnet
- Separate providers handle each network context

**Data Model**:
- Users identified by wallet address (not traditional IDs)
- Minimal schema: `users` and `tracks` tables
- Tracks store IPFS CIDs and metadata only

### Key Components Structure

```
src/
├── contexts/           # Global state (Auth, Wallet)
├── integrations/       # External services (Supabase, TACo)
├── components/
│   ├── audio/         # Audio playback components
│   ├── auth/          # Authentication UI
│   ├── taco/          # TACo condition setup
│   ├── upload/        # File upload handling
│   └── ui/            # shadcn/ui components
├── hooks/             # Custom hooks for business logic
├── utils/             # Utility functions (encryption, formatting)
└── types/             # TypeScript type definitions
```

### Important Integration Notes

**TACo Initialization**: 
- Must complete before any encryption/decryption operations
- App continues gracefully if TACo init fails
- Network configuration is hardcoded for Polygon Amoy testnet

**Supabase Integration**:
- Auto-generated types from database schema
- Uses Row Level Security for user data protection
- Client configured with anon key and service role

**Audio Playback Flow**:
1. Fetch encrypted content from IPFS
2. Attempt TACo decryption with wallet signatures
3. Create blob URL from decrypted data
4. Load into HTML5 audio element

### Development Notes

- Configuration values (Privy App ID, Supabase URL) are hardcoded in source
- No test suite currently configured
- Uses address-based user identification throughout
- Graceful error handling for Web3 operations is critical

## Product Overview - SoundProof

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
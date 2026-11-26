# Hearth & Seal — Zero-Infrastructure Secret Santa

Hearth & Seal is a zero-database Secret Santa web application that runs entirely in the browser using cryptographically sealed invite links and a guaranteed non-reciprocal matching engine. Friends receive unique private reveal links that unwrap like winter stationery—requiring no accounts, no email servers, and no backend database infrastructure.

## User Review & Critical Decisions

> [!IMPORTANT]
> Your Phase 1 choices define the core architecture below. Review the confirmed decisions and two recommended defaults before we begin building.

- **Confirmed — Private Reveal Links**: Each participant receives a unique, personal reveal URL rather than emails or shared logins.
- **Confirmed — Stateless Encrypted Links (Zero Database)**: All match payloads are encrypted in the browser (`AES-GCM` via the Web Crypto API) and stored strictly in the URL fragment (`#reveal=...`), eliminating databases and server logs.
- **Confirmed — No Reciprocal Exchanges**: The matching solver strictly forbids 2-cycles (`A → B` and `B → A` cannot both occur), meaning every draw forms cycles of length 3 or greater.
- **Confirmed — Warm Cozy Winter Editorial Stationery**: Archival warm paper surfaces, refined serif typography, subtle hairline rules, and a wax-seal letter reveal experience.
- **Recommended Default — Organizer Blindness & Local Sent Tracker**: By default, the organizer sees only each friend's name and `Copy Link` / `Copy Message` controls (never the assigned recipient), allowing the organizer to participate without spoiling their own draw. An encrypted backup export lets the organizer re-recover a lost link if needed.
- **Recommended Default — Optional Custom Exclusions**: Alongside the mandatory non-reciprocal rule, the organizer can optionally exclude specific pairs (such as partners) before running the draw.

---

## 1. Overview & Core Concept

- **What It Does**: Lets an organizer configure a gift exchange (event name, budget, date, participants, and optional exclusions), runs a validated non-reciprocal Secret Santa draw locally in the browser, and generates individually encrypted, tamper-proof reveal links for every friend.
- **Target Audience**: Friend groups who want a reliable, private Secret Santa without setting up servers, databases, or SMTP email pipelines—and without trusting third-party ad-heavy Secret Santa websites with their friends' names.
- **Hosting Model (Zero Infrastructure Needed)**: Google AI Studio already hosts the static web page for you via your Shared App URL on Cloud Run—so you never need to rent a server, run a database, or manage infrastructure. Because there is no backend API for draws, the exact same static bundle can also be hosted on any free static host (GitHub Pages, Cloudflare Pages, Netlify) if desired.
- **Key Value**: Zero-database privacy, instant link generation, and mathematical guarantees against both self-draws and reciprocal `A ↔ B` pairs.

---

## 2. User Experience & Visual Design

### Key User Flows

```
[ Organizer Flow ]
Landing Editorial Hero ──► Enter Exchange Details & Friends (min. 3)
                                  │
                                  ▼
                       Configure Ruleset
            (Non-Reciprocal Locked ON + Optional Exclusions)
                                  │
                                  ▼
                 Draw & Encrypt Links (In-Browser)
                                  │
                                  ▼
            Distribution Ledger (Recipients Hidden)
         • Copy private link / ready-to-send message
         • Mark friends as "Sent" in local session
         • Export encrypted draw backup / preview sample letter

[ Recipient Flow ]
Opens Private Link (#reveal=...) ──► Sealed Stationery Envelope ("For Elena")
                                           │
                                           ▼
                              Click "Open Your Letter"
                                           │
                                           ▼
                       Match Reveal Card + Event Details
                 (Recipient Name · Budget · Date · Host Note)
```

### Visual Identity & Theme

Grounded in editorial stationery and archival print aesthetics:

- **Aesthetic Direction**: Warm cozy winter editorial stationery—calm, tactile, and unhurried, avoiding loud holiday clichés, neon accents, or SaaS-style pill clutter.
- **Color Palette (60-30-10 Discipline)**:
  - *60% Dominant Canvas*: Archival Warm Paper (`--background: #FBF9F5`) and Soft Parchment (`--surface: #F4EFE6`).
  - *30% Structural Surfaces & Ink*: Antique Charcoal (`--foreground: #1C1917`), Muted Stone (`--muted: #6B6258`), and 1px hairline borders (`#E4DDD0`).
  - *10% Curatorial Accents*: Deep Wax Crimson (`--primary: #8C2D25`) for primary actions and the wax seal, paired with Forest Pine (`--accent: #1E4631`) for verified rule confirmations.
- **Typography & Hierarchy**:
  - *Display & Letter Headings*: `Cormorant Garamond` (weights 500, 600) with `text-wrap: balance` and generous leading for invitations and revealed names.
  - *Body Prose & Controls*: `Plus Jakarta Sans` (weights 400, 500, 600) constrained to comfortable reading measures (`65–75ch`).
  - *Technical/Numeric Alignment*: `tabular-nums` for participant counts, budgets, and step indices.
- **Layout, Top Bar & Restraint**:
  - **3-Zone Top Bar**: Single-line brand wordmark (`Hearth & Seal`), concise text navigation links (`Approach`, `Ruleset`, `Create Draw`, `Privacy`), and one primary action (`New Exchange`).
  - **Zero-Pill Metadata**: Dates, budgets, participant counts, and rule summaries render as quiet unboxed typography separated by `·` rather than capsule badges.
  - **Visual Assets**: Bespoke generated editorial illustrations (a warm wax-sealed winter stationery flat-lay for the hero and a subtle botanical/wax-seal motif for the recipient envelope) with clean CSS/SVG fallbacks.

### Interactive Feedback & Motion

- **Routine Micro-Interactions ($\le 200\text{ms}$)**: Smooth button settling, copy-to-clipboard confirmation text (`Copied`), and inline validation feedback using `transform` and `opacity` only.
- **Letter Unsealing Moment**: A deliberate, tactile wax-seal break and letter unfold transition (respecting `prefers-reduced-motion`) when the recipient clicks to reveal their match.
- **Resilient Error & Empty States**: Clear inline guidance if fewer than 3 participants are added, if custom exclusions make a non-reciprocal draw mathematically impossible, or if a `#reveal=` URL token is malformed or truncated.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Stateless AES-GCM URL Fragments vs. Base64 Encoding or Database**
  - *Chosen Approach*: Each invite link packs a random 128-bit AES-GCM key, 96-bit IV, and authenticated ciphertext inside the URL fragment (`#reveal=<base64url>`).
  - *Why*: URL fragments are never sent to web servers in HTTP requests, preventing accidental logging. Authenticated encryption prevents chat link previews from leaking names and prevents recipients from guessing or tampering with matches.
  - *Alternatives Considered*: Plain Base64 encoding (too easy to decode at a glance in chat previews) and hosted databases like Firestore (adds infrastructure, accounts, and maintenance you wanted to avoid).

- **Decision 2: Strict Non-Reciprocal Solver (`No 2-Cycles`)**
  - *Chosen Approach*: Backtracking constraint solver that rejects self-assignments (`A → A`), custom exclusions, and reciprocal pairs (`A → B` with `B → A`).
  - *Why*: In groups of 4–10 friends, standard random derangements frequently produce isolated pairs exchanging gifts only with each other. Enforcing cycle length $\ge 3$ ensures gifts circulate across the whole group.
  - *Alternatives Considered*: Simple shuffle-and-retry (fails or stalls silently under dense exclusions; our backtracking solver detects impossible rulesets immediately).

- **Decision 3: Blind Organizer Ledger + Self-Contained Participant Mapping**
  - *Chosen Approach*: Each encrypted token contains **both** `giver` (who the link is addressed to) and `recipient` (who they are buying for). Right after the draw, the organizer's browser holds `{ giverName, revealUrl }` in local state so the organizer knows which link to send to each friend without displaying `recipient` on screen, plus an optional downloadable encrypted backup.
  - *Why*: Organizers usually want to play too, and having `giver` inside the token means the frontend never needs a database lookup when a friend opens their link—the browser decrypts the token and immediately knows the envelope is `"For Alice"`.

---

## 4. Technical Architecture & Data Strategy

### System & Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Browser Application                             │
│                                                                         │
│  ┌──────────────────────────┐        ┌───────────────────────────────┐  │
│  │      URL Router          │        │   Client Crypto & Solver      │  │
│  │  Reads window.location   │        │  • Backtracking Derangement   │  │
│  │  .hash (#reveal=...)     │        │    (Cycle length >= 3,        │  │
│  └────────────┬─────────────┘        │     Custom exclusions)        │  │
│               │                      │  • Web Crypto AES-GCM         │  │
│      ┌────────┴────────┐             │    Seal & Unseal Payloads     │  │
│      ▼                 ▼             └──────────────┬────────────────┘  │
│  [No Hash]       [#reveal=token]                    │                   │
│      │                 │                            │                   │
│      ▼                 ▼                            │                   │
│  ┌──────────────┐ ┌─────────────────┐               │                   │
│  │  Organizer   │ │   Recipient     │◄──────────────┘                   │
│  │  Studio      │ │   Letter View   │                                   │
│  └──────┬───────┘ └────────┬────────┘                                   │
│         │                  │                                            │
│   ┌─────┴──────┐    ┌──────┴──────────┐                                 │
│   │ 1. Setup & │    │ 1. Sealed       │                                 │
│   │    Ruleset │    │    Envelope     │                                 │
│   │ 2. Blind   │    │ 2. Revealed     │                                 │
│   │    Ledger  │    │    Match Card   │                                 │
│   └────────────┘    └─────────────────┘                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State

- **Exchange Configuration**: `eventName`, `budget`, `exchangeDate`, `hostNote`, `participants` (unique trimmed names), and `exclusions` (list of disallowed `giver -> recipient` or mutual pairs).
- **Encrypted Invite Payload** (sealed inside each `#reveal=` token):
  - `v`: Schema version (`1`)
  - `giver`: Participant receiving this link
  - `recipient`: Assigned gift recipient
  - `eventName`, `budget`, `exchangeDate`, `hostNote`
  - `nonReciprocal`: Boolean confirmation (`true`)
- **Distribution Ledger State**: Array of `{ giverName, revealUrl, shareText, copied, markedSent }` held in memory (with optional `sessionStorage` persistence for the current tab so accidental refreshes during messaging don't lose copy/sent checkmarks, plus an explicit Reset action).

### How Links Are Generated & Resolved Without a Backend

```
1. ORGANIZER BROWSER (Generates Draw)
   Matches: Alice ──► Marco,  Marco ──► Elena,  Elena ──► Alice
   For each match:
     payload = { giver: "Alice", recipient: "Marco", eventName, budget, date }
     key, iv = random 128-bit AES-GCM key + 96-bit IV (Web Crypto API)
     token   = base64url( iv || rawKey || aesGcmEncrypt(payload, key, iv) )
     link    = "https://<shared-app-url>/#reveal=" + token
   Result kept in organizer's browser state:
     Row 1: "Alice" -> link_1   (recipient "Marco" is NOT shown on screen)

2. STATIC HOST (AI Studio Shared App URL / Cloud Run)
   Serves the exact same HTML/JS/CSS bundle to everyone.
   Never sees anything after "#", so match data never hits server logs.

3. RECIPIENT BROWSER (Alice Opens Her Link)
   Reads window.location.hash ("#reveal=...")
   Unpacks [iv, rawKey, ciphertext] ──► Decrypts JSON locally
   Reads payload.giver     ──► Addresses sealed envelope: "For Alice"
   User clicks "Break Seal" ──► Reveals payload.recipient: "Marco"
```

### Interactive Component & State Mapping

- **Participant & Exclusion Builder**: Validates duplicate names, enforces minimum 3 participants, allows bulk pasting (comma/newline separated), and lets users toggle mutual or directional exclusions with real-time solvability check before drawing.
- **Draw & Encryption Action**: Executes the randomized non-reciprocal solver, encrypts every assignment concurrently via `crypto.subtle.encrypt`, constructs full `APP_URL`-aware `#reveal=` links, and transitions smoothly to the Distribution Ledger.
- **Distribution Ledger**: Provides one-click `Copy Link`, `Copy Invite Message` (formatted greeting + link), `Sent` status toggle, a non-spoiling `Preview Sample Envelope` modal/view, and an `Export Encrypted Backup` file/string.
- **Recipient Reveal View**: Parses `#reveal=` on mount, decrypts the AES-GCM payload client-side, shows a clean error card with recovery advice if the link is corrupted, and otherwise presents the sealed stationery envelope awaiting user click to unwrap.

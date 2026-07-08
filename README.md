# Project Bloodline

Project Bloodline is a first prototype of a web-based horse genetics and breeding sandbox. It focuses on hidden genetic marker interactions, foal creation, and mock performance trials. It does not include accounts, payments, racing, economies, databases, blockchain, seasons, or marketplaces.

## Prototype Features

- 6 seeded starter horses stored in `localStorage` with 3 sires and 3 dams
- 5 genetic marker genome per horse
- 3 possible allele letters: `A`, `B`, and `C`
- Breeding function that passes one allele from each parent per marker
- Hidden trait engine for four physical measurements: Speed, Stamina, Consistency, and Durability
- 80-run mock performance trial for each new foal
- Stable list, horse detail page, breed page, and foal result section
- Reset button to clear and reseed the sandbox

## Project Structure

```text
src/app/              Next.js App Router pages
src/components/       Reusable UI pieces
src/lib/breeding.ts   Foal creation logic
src/lib/genetics.ts   Marker, allele, and trait calculation logic
src/lib/seed.ts       Starter horse generation
src/lib/trial.ts      Mock performance trial simulation
src/lib/useStable.ts  localStorage-backed client state
src/types/            Horse, Genome, GeneticMarker, PhysicalTraits, TrialResults
```

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
```

## Deploy to Vercel

1. Push this repository to GitHub.
2. In Vercel, choose **Add New Project**.
3. Import `Colton12-DDSd/Project_Bloodline`.
4. Keep the default Next.js settings.
5. Deploy.

All sandbox data is stored in each browser's `localStorage`, so every device/browser has its own test stable.

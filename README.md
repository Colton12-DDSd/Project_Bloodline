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
- Shared Stable ID sync through Supabase so phone and PC can load the same horse pool
- Reset button to clear and reseed the sandbox

## Project Structure

```text
src/app/              Next.js App Router pages
src/components/       Reusable UI pieces
src/lib/breeding.ts   Foal creation logic
src/lib/genetics.ts   Marker, allele, and trait calculation logic
src/lib/seed.ts       Starter horse generation
src/lib/stableCloud.ts Supabase load/save for shared Stable IDs
src/lib/trial.ts      Mock performance trial simulation
src/lib/useStable.ts  localStorage-backed client state
src/types/            Horse, Genome, GeneticMarker, PhysicalTraits, TrialResults
```

## Supabase Setup

Create a `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Create the prototype storage table in Supabase:

```sql
create table if not exists public.stables (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.stables enable row level security;

grant select, insert, update on public.stables to anon, authenticated;

create policy "prototype stable read"
on public.stables for select
using (true);

create policy "prototype stable insert"
on public.stables for insert
with check (true);

create policy "prototype stable update"
on public.stables for update
using (true)
with check (true);
```

This is intentionally open for solo prototype testing. Anyone with a Stable ID can read or update that stable.

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

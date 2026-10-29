# Children's Ministry — v3

Next.js 16 static site (App Router, `output: "export"`) modelled on childrens-ministry-website, with:

- Home, About, Classes → Class → Lesson, Events (calendar + .ics), Blog feed, Gallery, Contact, policy pages
- Kids Zone: **Bible Quest** (Duolingo-style learning path, units, hearts, XP, badges, mascot reactions, shared leaderboard) and the **Clothing Collection** (3D rack, colour tags, front/back, shuffle)
- Staff CMS at `/admin/` — every page, class, lesson, teacher, post, event, album, FAQ, game unit, question, mascot and garment is editable

Content lives in the shared Supabase project under the `cm.*` namespace (uploads in `cm/`), so it never touches the v2 site's data.

## Run locally
```bash
npm install
npm run dev
```

## Deploy on Vercel
Framework preset **Next.js**, build command `next build --webpack`, no environment variables needed.

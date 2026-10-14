# Oxpedia

**Live site:** https://oc-review-eta.vercel.app/

Oxpedia is an anonymous review platform for Chinese international students at Oxford College of Emory University. Students who have already taken a course share ratings and comments so that incoming students can make better-informed decisions. The site currently hosts 168+ course reviews, along with reviews of campus facilities, dining, and events, plus an open discussion forum.

## Features
- Anonymous ratings and written reviews organized by category
- Course review directory covering 168+ entries
- Discussion forum for questions, tips, and casual conversation
- Admin contact for reporting inaccurate or inappropriate content

## Tech Stack
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend & Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel


## Running Locally
```bash
npm install
npm run dev
```
Create a `.env.local` file with your Supabase project URL and anon key.

# Daytick ✓

A minimal daily task manager focused on simplicity. Tasks that aren't completed carry over to the next day — only tasks checked off today disappear from your list.

![Daytick Preview](https://img.shields.io/badge/status-live-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![Supabase](https://img.shields.io/badge/Supabase-database-green) ![Vercel](https://img.shields.io/badge/Vercel-deployed-black)

---

## Features

- Add, complete, and delete daily tasks
- Uncompleted tasks automatically carry over to the next day
- Completed tasks only visible on the day they were checked off
- Progress bar showing daily completion percentage
- Authentication with email and password
- Fully responsive design

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | [Supabase](https://supabase.com/) (PostgreSQL) |
| Auth | Supabase Auth |
| Hosting | [Vercel](https://vercel.com/) |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A [Supabase](https://supabase.com/) account (free)

### 1. Clone the repository

```bash
git clone https://github.com/x905/daytick.git
cd daytick
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

Create a new project at [supabase.com](https://supabase.com) and run the following SQL in the **SQL Editor**:

```sql
CREATE TABLE tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  completed boolean DEFAULT false,
  completed_at date,
  created_at timestamp DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tasks"
ON tasks FOR ALL
USING (auth.uid() = user_id);
```

### 4. Configure environment variables

Create a `.env.local` file in the root of the project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

You can find these values in your Supabase project under **Settings → API**.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment

This project is deployed on Vercel. To deploy your own instance:

1. Push the repository to GitHub
2. Import the project at [vercel.com](https://vercel.com)
3. Add the environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy

After deploying, go to Supabase → **Authentication → URL Configuration** and set your Vercel URL as the Site URL.

---

## Project Structure

```
daytick/
├── app/
│   ├── login/
│   │   └── page.tsx       # Login & signup page
│   └── page.tsx           # Main tasks page
├── lib/
│   └── supabase.ts        # Supabase client
├── .env.local             # Environment variables (not committed)
└── README.md
```

---

## License

MIT

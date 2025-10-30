
# OctoLearn — Full Web App (React frontend + FastAPI backend)

This archive contains a ready-to-run full web app prototype: **OctoLearn**, an AI learning companion.

## What I built for you
- **Frontend:** React + Vite (beautiful purple theme)
- **Backend:** FastAPI exposing `/api/explain` and `/api/quiz` endpoints which call OpenAI
- **Design:** Clean, purple-themed UI; responsive-ish layout
- **Notes on OpenAI key:** I cannot provide my own API key. You **must** add your OpenAI API key to run the backend.

---

## How to run locally

### 1) Backend
1. Go to `backend/`
2. (Recommended) create a virtualenv:
```bash
python -m venv .venv
source .venv/bin/activate   # macOS/Linux
.venv\\Scripts\\activate    # Windows
```
3. Install requirements:
```bash
pip install -r requirements.txt
```
4. Create a `.env` file in `backend/` with:
```
OPENAI_API_KEY=sk-your-openai-key
```
5. Run the server:
```bash
uvicorn main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`

### 2) Frontend
1. Go to `frontend/`
2. Install dependencies:
```bash
npm install
```
3. Start dev server:
```bash
npm run dev
```
4. Open the provided Vite URL (usually http://localhost:5173)

If your backend is not at `http://localhost:8000`, set `VITE_API_BASE` in `.env` (frontend) — e.g. `VITE_API_BASE=http://localhost:8000`

---

## Important — API Key and Security
- I cannot and will not share a private OpenAI API key. You must create and supply your own key in `backend/.env`.
- For production use don't expose your key in client-side code. Keep it server-side (like in this FastAPI backend).

---

## What I *didn't* do
- I did not deploy the app to a live server (you can, using Vercel + Cloud or Render).
- I did not connect a database for persistent progress tracking; the backend is stateless (easy to extend with Supabase/Firebase).

---

## Next steps / Enhancements (optional)
- Add user accounts + persistent progress
- Add audio input & TTS
- Improve quiz parsing & scoring
- Add animations / octopus dashboard visualization

Enjoy! — If you'd like, I can now:
- Add database support (Supabase/Firebase)
- Add user auth
- Create a short demo video script for your pitch


# OctoLearn - Full Web App (React frontend + FastAPI backend)

This archive contains a ready-to-run full web app prototype: **OctoLearn**, an AI learning companion.

## What I built for you
- **Frontend:** React + Vite (beautiful purple theme)
- **Backend:** FastAPI exposing `/api/explain` and `/api/quiz` endpoints which call OpenAI
- **Design:** Clean, purple-themed UI; responsive-ish layout
- **Notes on OpenAI key:**  You **must** add your OpenAI API key to run the backend.

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

---


## Next steps / Enhancements (optional)
- Add user accounts + persistent progress
- Add audio input & TTS
- Improve quiz parsing & scoring
- Add animations / octopus dashboard visualization

Enjoy! I will now:
- Add database support (Supabase/Firebase)
- Add user auth

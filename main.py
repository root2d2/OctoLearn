from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os, json, re
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise RuntimeError("Missing OPENAI_API_KEY in .env file")

# Initialize FastAPI
app = FastAPI()

# Allow frontend to connect (React on localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
client = OpenAI(api_key=api_key)


# ---------- Request Models ----------
class ExplainRequest(BaseModel):
    topic: str
    level: str = "beginner"

class QuizRequest(BaseModel):
    topic: str
    num_questions: int = 5


# ---------- Explain Endpoint ----------
@app.post("/api/explain")
async def explain_topic(req: ExplainRequest):
    """Generate a clear explanation for the given topic and level."""
    try:
        prompt = (
            f"Explain the topic '{req.topic}' at a {req.level} level. "
            f"Be concise, educational, and structured using Markdown for clarity. "
            f"Include examples if relevant."
        )

        response = client.responses.create(
            model="gpt-4o-mini",
            input=prompt,
            temperature=0.7
        )

        text = response.output_text.strip()
        if not text:
            raise HTTPException(status_code=500, detail="Empty explanation from model.")

        return {"explanation": text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------- Quiz Endpoint ----------
@app.post("/api/quiz")
async def generate_quiz(req: QuizRequest):
    """Generate multiple-choice quiz questions for the topic."""
    try:
        prompt = (
            f"Create {req.num_questions} multiple-choice quiz questions on '{req.topic}'. "
            f"For each question, include exactly 4 options, specify the correct answer, "
            f"and provide a one-sentence explanation. "
            f"Return valid JSON in this format:\n\n"
            f"{{'questions':[{{'question':...,'options':[],'answer':...,'explanation':...}}]}}"
        )

        response = client.responses.create(
            model="gpt-4o-mini",
            input=prompt,
            temperature=0.7
        )

        text = response.output_text.strip()

        # Safely parse the JSON-like output
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            raise HTTPException(status_code=500, detail="Failed to parse quiz output.")
        data = json.loads(match.group(0))

        if "questions" not in data or not isinstance(data["questions"], list):
            raise HTTPException(status_code=500, detail="Quiz format invalid.")

        return data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------- Root Endpoint ----------
@app.get("/")
async def root():
    return {"message": "OctoLearn backend is running!"}

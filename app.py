from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from dotenv import load_dotenv
import os

from security.analyzer import analyze_conversation

load_dotenv()

app = FastAPI(title="TrustLens")

# Frontend
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


class ConversationRequest(BaseModel):
    conversation: str


@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={"request": request}
    )


@app.post("/api/analyze")
def analyze(request: ConversationRequest):

    if not request.conversation.strip():
        raise HTTPException(
            status_code=400,
            detail="Conversation cannot be empty."
        )

    if len(request.conversation) > 12000:
        raise HTTPException(
            status_code=400,
            detail="Conversation is too long. Please keep it under 12,000 characters."
        )

    try:
        result = analyze_conversation(request.conversation)
        return result

    except Exception as e:
        print(f"Analysis error: {e}")

        raise HTTPException(
            status_code=500,
            detail="TrustLens could not analyze the conversation."
        )
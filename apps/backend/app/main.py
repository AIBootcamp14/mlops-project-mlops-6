from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from app.ml.model import generate_text

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/generate")
def generate(prompt: str = Query(...)):
    return {"generated_text": generate_text(prompt)}
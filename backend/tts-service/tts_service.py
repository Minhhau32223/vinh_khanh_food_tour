from fastapi import FastAPI
from pydantic import BaseModel
from gtts import gTTS
from fastapi.responses import FileResponse
import uuid
import os

app = FastAPI()

# Model request
class TTSRequest(BaseModel):
    text: str
    lang: str = "vi"  # default tiếng Việt

# Endpoint tạo audio
@app.post("/generate")
def generate_tts(req: TTSRequest):
    # tạo tên file tạm
    filename = f"/tmp/{uuid.uuid4()}.mp3"
    # tạo audio
    tts = gTTS(text=req.text, lang=req.lang)
    tts.save(filename)
    # trả file
    return FileResponse(filename, media_type="audio/mpeg", filename="audio.mp3")
FROM python:3.13-slim

WORKDIR /app

COPY tts_service.py .

# Cài FastAPI, Uvicorn, gTTS
RUN pip install fastapi uvicorn gTTS

EXPOSE 8000

# Chạy server FastAPI
CMD ["uvicorn", "tts_service:app", "--host", "0.0.0.0", "--port", "8000"]
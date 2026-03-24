from fastapi import FastAPI
from deep_translator import GoogleTranslator

app = FastAPI()

@app.post("/translate")
def translate(data: dict):
    text = data["text"]
    source = data.get("source", "vi")
    targets = data["targets"]

    result = {}

    for lang in targets:
        try:
            translated = GoogleTranslator(source=source, target=lang).translate(text)
            result[lang] = translated
        except:
            result[lang] = text  # fallback

    return result
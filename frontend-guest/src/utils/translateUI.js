import api from '../api/client';

export async function translateText(text, lang) {
  if (lang === 'vi') return text;

  try {
    const res = await api.post('/translate', {
      text,
      targets: [lang],
      source: "vi"
    });

    return res.data[lang] || text;
  } catch (e) {
    console.error("TRANSLATE ERROR:", e);
    return text;
  }
}
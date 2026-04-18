import api from '../api/client';

const cache = {};
export async function translateText(text, lang) {
  if (lang === 'vi') return text;

  const key = `${lang}_${text}`;
  if (cache[key]) return cache[key];

  try {
    const res = await api.post("/translate", {
      text,
      targets: [lang],
      source: "vi"
    });

    cache[key] = res.data[lang] || text;
    return cache[key];

  } catch {
    return text;
  }
}
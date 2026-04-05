import { useSession } from '../contexts/SessionContext';

const LANGS = [
  { code: 'vi', flag: '🇻🇳', name: 'Tiếng Việt', native: 'Vietnamese' },
  { code: 'en', flag: '🇺🇸', name: 'English',    native: 'Tiếng Anh' },
  { code: 'zh', flag: '🇨🇳', name: '中文',        native: 'Tiếng Trung' },
];

export default function LanguageSelector({ onClose }) {
  const { language, updateLanguage } = useSession();

  const select = async code => {
    await updateLanguage(code);
    onClose();
  };

  return (
    <div className="lang-modal" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="lang-sheet">
        <div className="lang-sheet-title">🌐 Chọn ngôn ngữ / Language</div>
        {LANGS.map(lang => (
          <button
            key={lang.code}
            id={`lang-${lang.code}`}
            className={`lang-option ${language === lang.code ? 'selected' : ''}`}
            onClick={() => select(lang.code)}
          >
            <span className="lang-option-flag">{lang.flag}</span>
            <div>
              <div className="lang-option-name">{lang.name}</div>
              <div className="lang-option-native">{lang.native}</div>
            </div>
            {language === lang.code && <span className="lang-check">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

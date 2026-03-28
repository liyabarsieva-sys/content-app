import { useState } from "react";

const PLATFORMS = [
  { id: "telegram",  label: "Telegram",   icon: "✈️" },
  { id: "vk",        label: "ВКонтакте",  icon: "🔵" },
  { id: "facebook",  label: "Facebook",   icon: "📘" },
  { id: "threads",   label: "Threads",    icon: "◎"  },
  { id: "instagram", label: "Instagram",  icon: "📸" },
];

const TONES = [
  "Тёплый и поддерживающий",
  "Экспертный и авторитетный",
  "Провокационный и честный",
  "Простой и понятный",
];

const S = {
  bg: "#0f0e0c", bg2: "#181613", border: "#3a3028",
  text: "#e8e2d8", muted: "#9a8f82", accent: "#c4954a",
  surface: "#0f0e0c",
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, color: S.muted, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", background: "#2a2218", border: `1px solid #4a3f30`,
  borderRadius: 9, padding: "10px 12px", color: "#f5f0e8",
  fontSize: 14, outline: "none", resize: "none", fontFamily: "sans-serif",
};

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem("lia_api_key") || "");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiSetup, setShowApiSetup] = useState(!localStorage.getItem("lia_api_key"));

  const [expert, setExpert] = useState("");
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState(TONES[1]);
  const [platforms, setPlatforms] = useState(["telegram", "vk"]);
  const [topic, setTopic] = useState("");
  const [details, setDetails] = useState("");
  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState(null);
  const [tab, setTab] = useState("telegram");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function saveApiKey() {
    const key = apiKeyInput.trim();
    if (!key.startsWith("sk-ant-")) {
      setError("Ключ должен начинаться с sk-ant-");
      return;
    }
    localStorage.setItem("lia_api_key", key);
    setApiKey(key);
    setShowApiSetup(false);
    setError("");
  }

  function toggle(id) {
    setPlatforms(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  }

  async function generate() {
    if (!topic.trim() || !apiKey) return;
    setLoading(true); setError(""); setPosts(null);

    const names = PLATFORMS.filter(p => platforms.includes(p.id)).map(p => p.label).join(", ");
    const prompt = `Напиши посты для соцсетей на русском языке.
Эксперт: ${expert || "-"}. Ниша: ${niche || "-"}. Аудитория: ${audience || "-"}. Тональность: ${tone}.
Тема: ${topic}. Что обязательно отразить: ${details || "нет"}.
Платформы: ${names}.

Требования по объёму и стилю (строго соблюдай):
- Telegram: 150-200 слов. Структурированный текст с абзацами. Первые 2 строки — самые важные (это превью). Без хэштегов. Вопрос или призыв в конце.
- ВКонтакте: 120-180 слов. Первый абзац решает всё — он виден до кнопки "читать далее". В конце 3-4 хэштега по теме.
- Facebook: 120-160 слов. Начни с личной истории или провокационного вопроса. Без хэштегов. Заканчивай вопросом для дискуссии.
- Threads: 60-80 слов. Цепляющий хук в первых 2 строках. Без хэштегов.
- Instagram: 90-120 слов. Ключевое слово темы в первом предложении (SEO). В конце 5 хэштегов.

SEO: ключевое слово из темы — в первом предложении каждого поста.

ТОЛЬКО валидный JSON без markdown:
{"telegram":"текст","vk":"текст","facebook":"текст","threads":"текст","instagram":"текст"}
Включи только платформы: ${platforms.join(",")}`;

    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2500,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content.map(b => b.text || "").join("");
      const result = JSON.parse(text.replace(/```json|```/g, "").trim());
      setPosts(result);
      setTab(platforms[0]);
      setStep(3);
    } catch (e) {
      setError("Ошибка: " + e.message);
    }
    setLoading(false);
  }

  const activePlatform = PLATFORMS.find(p => p.id === tab);

  // API Key setup screen
  if (showApiSetup) {
    return (
      <div style={{ minHeight: "100vh", background: S.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "sans-serif" }}>
        <div style={{ maxWidth: 480, width: "100%" }}>
          <h1 style={{ fontFamily: "Georgia,serif", fontSize: 28, color: "#f0ebe0", marginBottom: 8 }}>
            Content <span style={{ color: S.accent, fontStyle: "italic" }}>Intelligence</span>
          </h1>
          <p style={{ fontSize: 13, color: S.muted, marginBottom: 28, lineHeight: 1.6 }}>
            Для работы приложения нужен API-ключ Anthropic. Он хранится только в вашем браузере.
          </p>

          <div style={{ background: S.bg2, border: `1px solid ${S.border}`, borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 11, color: S.muted, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8, fontWeight: 600 }}>API-ключ Anthropic</div>
            <input
              type="password"
              placeholder="sk-ant-api03-..."
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && saveApiKey()}
              style={{ ...inputStyle, marginBottom: 12 }}
            />
            <div style={{ fontSize: 12, color: S.muted, marginBottom: 16, lineHeight: 1.6 }}>
              Получи ключ на <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" style={{ color: S.accent }}>console.anthropic.com</a> → API Keys → Create Key
            </div>
            {error && <p style={{ color: "#e05c5c", fontSize: 12, marginBottom: 12 }}>{error}</p>}
            <button onClick={saveApiKey} style={{ width: "100%", padding: 13, borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${S.accent}, #e8a85a)`, color: "#0f0e0c", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif" }}>
              Сохранить и продолжить →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: S.bg, color: S.text, fontFamily: "sans-serif", padding: "20px 20px 80px" }}>
      <div style={{ maxWidth: 620, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", padding: "36px 0 24px", borderBottom: `1px solid ${S.border}`, marginBottom: 28 }}>
          <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: S.accent, fontWeight: 600, marginBottom: 10 }}>Content Intelligence</div>
          <h1 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(22px,5vw,36px)", color: "#f0ebe0", lineHeight: 1.2, marginBottom: 8 }}>
            Тема → <span style={{ color: S.accent, fontStyle: "italic" }}>посты</span><br />под каждую соцсеть
          </h1>
          <p style={{ fontSize: 12, color: "#5a5248" }}>Алгоритмы платформ · SEO под Яндекс</p>
          <button onClick={() => setShowApiSetup(true)} style={{ marginTop: 10, fontSize: 11, color: "#3a3530", background: "transparent", border: "none", cursor: "pointer", textDecoration: "underline" }}>
            Сменить API-ключ
          </button>
        </div>

        {/* Step 1 — Context */}
        {step === 1 && (
          <div>
            <div style={{ background: "#1e1810", border: "1px solid #3a3028", borderRadius: 14, padding: 22, marginBottom: 16 }}>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 17, color: "#f0ebe0", marginBottom: 18, display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ width: 26, height: 26, background: S.accent, color: "#0f0e0c", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>1</span>
                Контекст
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Бренд / имя эксперта">
                  <input style={inputStyle} placeholder="Сервис ФиксПК / Анна Иванова" value={expert} onChange={e => setExpert(e.target.value)} />
                </Field>
                <Field label="Ниша / сфера деятельности">
                  <input style={inputStyle} placeholder="Ремонт ноутбуков и ПК" value={niche} onChange={e => setNiche(e.target.value)} />
                </Field>
              </div>
              <Field label="Целевая аудитория">
                <input style={inputStyle} placeholder="Женщины 35-50 лет, г. Тбилиси, владелицы малого бизнеса" value={audience} onChange={e => setAudience(e.target.value)} />
              </Field>
              <Field label="Тональность">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {TONES.map(t => (
                    <button key={t} onClick={() => setTone(t)} style={{ padding: "6px 12px", borderRadius: 20, border: `1px solid ${tone === t ? S.accent : "#4a3f30"}`, background: tone === t ? "rgba(196,149,74,.15)" : "#2a2218", color: tone === t ? S.accent : "#c4b49a", fontSize: 12, cursor: "pointer", fontFamily: "sans-serif" }}>
                      {t}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Платформы">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {PLATFORMS.map(p => (
                    <button key={p.id} onClick={() => toggle(p.id)} style={{ padding: "8px 14px", borderRadius: 9, border: `1px solid ${platforms.includes(p.id) ? S.accent : "#4a3f30"}`, background: platforms.includes(p.id) ? "rgba(196,149,74,.15)" : "#2a2218", color: platforms.includes(p.id) ? "#f5f0e8" : "#c4b49a", fontSize: 13, cursor: "pointer", fontFamily: "sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                      {p.icon} {p.label}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
            <button onClick={() => setStep(2)} disabled={platforms.length === 0} style={{ width: "100%", padding: 15, borderRadius: 12, border: "none", background: "linear-gradient(135deg,#c4954a,#e8a85a)", color: "#0f0e0c", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif" }}>
              Далее → Тема поста
            </button>
          </div>
        )}

        {/* Step 2 — Topic */}
        {step === 2 && (
          <div>
            <div style={{ background: "#1e1810", border: "1px solid #3a3028", borderRadius: 14, padding: 22, marginBottom: 16 }}>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 17, color: "#f0ebe0", marginBottom: 18, display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ width: 26, height: 26, background: S.accent, color: "#0f0e0c", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>2</span>
                Тема и содержание
              </div>
              <Field label="Тема поста">
                <textarea style={{ ...inputStyle }} rows={2} placeholder="Например: чистка ноутбука от пыли" value={topic} onChange={e => setTopic(e.target.value)} />
              </Field>
              <Field label="Ключевые факты и УТП">
                <textarea style={{ ...inputStyle }} rows={3} placeholder={"Например:\n— чистить каждые 6-12 месяцев\n— признаки перегрева\n— что будет если не чистить"} value={details} onChange={e => setDetails(e.target.value)} />
              </Field>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ width: 28, height: 28, border: `2px solid ${S.border}`, borderTopColor: S.accent, borderRadius: "50%", animation: "sp .8s linear infinite", margin: "0 auto 10px" }} />
                <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
                <p style={{ fontSize: 13, color: S.muted }}>Создаю посты для {platforms.length} платформ…</p>
              </div>
            ) : (
              <>
                <button onClick={generate} disabled={!topic.trim()} style={{ width: "100%", padding: 15, borderRadius: 12, border: "none", background: !topic.trim() ? S.border : "linear-gradient(135deg,#c4954a,#e8a85a)", color: !topic.trim() ? S.muted : "#0f0e0c", fontSize: 15, fontWeight: 700, cursor: topic.trim() ? "pointer" : "not-allowed", fontFamily: "sans-serif", marginBottom: 10 }}>
                  ✦ Создать посты под {platforms.length} платформы
                </button>
                {error && <p style={{ color: "#e05c5c", fontSize: 13, textAlign: "center", marginBottom: 10 }}>{error}</p>}
                <button onClick={() => setStep(1)} style={{ width: "100%", padding: 10, borderRadius: 10, border: `1px solid ${S.border}`, background: "transparent", color: S.muted, fontSize: 13, cursor: "pointer", fontFamily: "sans-serif" }}>
                  ← Назад
                </button>
              </>
            )}
          </div>
        )}

        {/* Step 3 — Result */}
        {step === 3 && posts && (
          <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {PLATFORMS.filter(p => platforms.includes(p.id)).map(p => (
                <button key={p.id} onClick={() => { setTab(p.id); setCopied(false); }} style={{ padding: "8px 14px", borderRadius: 9, border: `1px solid ${tab === p.id ? S.accent : "#4a3e32"}`, background: tab === p.id ? "rgba(196,149,74,.15)" : "#221c15", color: tab === p.id ? S.accent : "#c4b49a", fontSize: 13, cursor: "pointer", fontFamily: "sans-serif" }}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>

            <div style={{ background: "#1e1810", border: "1px solid #3a3028", borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
              <div style={{ padding: "12px 18px", borderBottom: "1px solid #3a3028", fontSize: 14, fontWeight: 600, color: S.accent }}>
                {activePlatform?.icon} {activePlatform?.label}
              </div>
              <div style={{ padding: 18, fontSize: 14, lineHeight: 1.85, color: "#c8c0b4", whiteSpace: "pre-wrap" }}>
                {posts[tab] || "—"}
              </div>
              <div style={{ padding: "10px 18px", borderTop: "1px solid #3a3028", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#5a5248" }}>
                  {(posts[tab] || "").split(/\s+/).filter(Boolean).length} слов
                </span>
                <button onClick={() => { navigator.clipboard.writeText(posts[tab] || ""); setCopied(true); setTimeout(() => setCopied(false), 1500); }} style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${copied ? "#4a9a6a" : S.border}`, background: "transparent", color: copied ? "#4a9a6a" : S.muted, fontSize: 12, cursor: "pointer", fontFamily: "sans-serif" }}>
                  {copied ? "✓ Скопировано" : "Скопировать"}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setPosts(null); setStep(2); }} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", background: "linear-gradient(135deg,#c4954a,#e8a85a)", color: "#0f0e0c", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif" }}>
                Изменить тему
              </button>
              <button onClick={() => { setPosts(null); setTopic(""); setDetails(""); setStep(1); }} style={{ flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${S.border}`, background: "transparent", color: S.muted, fontSize: 13, cursor: "pointer", fontFamily: "sans-serif" }}>
                Начать заново
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

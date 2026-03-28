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
  bg: "#0f0e0c",
  card: "#1e1810",
  input: "#2a221a",
  border: "#3a3028",
  borderLight: "#4a3e32",
  text: "#f0ebe0",
  muted: "#c4b49a",
  dim: "#7a6a58",
  accent: "#c4954a",
  accentBg: "rgba(196,149,74,.15)",
};

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: S.dim, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: hint ? 3 : 6, fontWeight: 600 }}>{label}</div>
      {hint && <div style={{ fontSize: 11, color: S.dim, marginBottom: 6, fontStyle: "italic" }}>{hint}</div>}
      {children}
    </div>
  );
}

const inp = {
  width: "100%", background: S.input, border: `1px solid ${S.borderLight}`,
  borderRadius: 9, padding: "10px 12px", color: S.text,
  fontSize: 14, outline: "none", resize: "none", fontFamily: "sans-serif",
  transition: "border-color .2s",
};

function CopyBtn({ text }) {
  const [done, setDone] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); }}
      style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${done ? "#4a9a6a" : S.border}`, background: "transparent", color: done ? "#4a9a6a" : S.dim, fontSize: 12, cursor: "pointer", fontFamily: "sans-serif", transition: "all .2s" }}>
      {done ? "✓ Скопировано" : "Скопировать"}
    </button>
  );
}

export default function App() {
  const [apiKey] = useState(() => localStorage.getItem("lia_api_key") || "");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiSetup, setShowApiSetup] = useState(!localStorage.getItem("lia_api_key"));
  const [apiError, setApiError] = useState("");

  const [expert, setExpert] = useState("");
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState(TONES[1]);
  const [toneOfVoice, setToneOfVoice] = useState("");
  const [platforms, setPlatforms] = useState(["telegram", "vk"]);
  const [topic, setTopic] = useState("");
  const [details, setDetails] = useState("");
  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("telegram");
  const [error, setError] = useState("");

  function saveKey() {
    const k = apiKeyInput.trim();
    if (!k.startsWith("sk-ant-")) { setApiError("Ключ должен начинаться с sk-ant-"); return; }
    localStorage.setItem("lia_api_key", k);
    window.location.reload();
  }

  function toggle(id) {
    setPlatforms(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  }

  async function generate() {
    const key = localStorage.getItem("lia_api_key") || apiKey;
    if (!key) { setError("Нет API-ключа"); return; }
    setLoading(true); setError(""); setResult(null);

    const sel = PLATFORMS.filter(p => platforms.includes(p.id));
    const names = sel.map(p => p.label).join(", ");

    const tovSection = toneOfVoice.trim()
      ? `\nГолос бренда — пример стиля автора (строго следуй этому голосу, лексике, интонации):\n"${toneOfVoice.trim()}"\n`
      : "";

    const prompt = `Ты опытный SMM-специалист. Создай контент для поста.

Эксперт/бренд: ${expert || "-"}
Ниша: ${niche || "-"}
Аудитория: ${audience || "-"}
Тональность: ${tone}
${tovSection}
Тема: ${topic}
Ключевые факты и УТП: ${details || "нет"}
Платформы: ${names}

Сначала создай ОБЩИЕ ЭЛЕМЕНТЫ для всех платформ:
1. ЗАГОЛОВОК: цепляющий заголовок поста (до 10 слов). Это не первая строка поста — это отдельный заголовок.
2. ХУК: первые 1-2 предложения которые останавливают скролл. Используй в начале каждого поста.

Затем напиши адаптированные посты. ЖЁСТКИЕ лимиты слов — считай и соблюдай:
- Telegram: 170-200 слов. Абзацы, эмодзи умеренно. Первые 2 строки = превью. Без хэштегов. Вопрос в конце. SEO Яндекс: ключевое слово темы в первом предложении.
- ВКонтакте: 140-180 слов. Первый абзац виден до "читать далее". В конце 3-4 хэштега. SEO Яндекс: ключевое слово темы в первом предложении.
- Facebook: 140-165 слов. Начни с хука. Личный тон. Без хэштегов. Вопрос в конце для дискуссии.
- Threads: 60-80 слов. Хук в первых 2 строках. Без хэштегов.
- Instagram: 100-120 слов. Ключевое слово в первом предложении (внутренний поиск). В конце 5 хэштегов.

Включи только платформы: ${platforms.join(",")}

Ответь ТОЛЬКО валидным JSON без markdown:
{"headline":"заголовок","hook":"хук 1-2 предложения","telegram":"текст","vk":"текст","facebook":"текст","threads":"текст","instagram":"текст"}`;

    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 3000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content.map(b => b.text || "").join("");
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setResult(parsed);
      setActiveTab(platforms[0]);
      setStep(3);
    } catch (e) {
      setError("Ошибка: " + e.message);
    }
    setLoading(false);
  }

  const activePlatform = PLATFORMS.find(p => p.id === activeTab);

  // API setup
  if (showApiSetup) {
    return (
      <div style={{ minHeight:"100vh", background:S.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"sans-serif" }}>
        <div style={{ maxWidth:460, width:"100%" }}>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:28, color:S.text, marginBottom:8 }}>Content <span style={{ color:S.accent, fontStyle:"italic" }}>Intelligence</span></h1>
          <p style={{ fontSize:13, color:S.muted, marginBottom:24, lineHeight:1.6 }}>Для работы нужен API-ключ Anthropic. Хранится только в вашем браузере.</p>
          <div style={{ background:S.card, border:`1px solid ${S.border}`, borderRadius:14, padding:24 }}>
            <div style={{ fontSize:11, color:S.dim, textTransform:"uppercase", letterSpacing:".08em", marginBottom:8, fontWeight:600 }}>API-ключ Anthropic</div>
            <input type="password" placeholder="sk-ant-api03-..." value={apiKeyInput} onChange={e=>setApiKeyInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveKey()}
              style={{ ...inp, marginBottom:10 }} />
            <div style={{ fontSize:12, color:S.dim, marginBottom:14, lineHeight:1.6 }}>
              Получи на <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" style={{ color:S.accent }}>console.anthropic.com</a> → API Keys → Create Key
            </div>
            {apiError && <p style={{ color:"#e05c5c", fontSize:12, marginBottom:10 }}>{apiError}</p>}
            <button onClick={saveKey} style={{ width:"100%", padding:13, borderRadius:10, border:"none", background:`linear-gradient(135deg,${S.accent},#e8a85a)`, color:"#0f0e0c", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"sans-serif" }}>
              Сохранить и начать →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:S.bg, color:S.text, fontFamily:"sans-serif", padding:"20px 20px 80px" }}>
      <div style={{ maxWidth:640, margin:"0 auto" }}>

        {/* Header */}
        <div style={{ textAlign:"center", padding:"36px 0 24px", borderBottom:`1px solid ${S.border}`, marginBottom:28 }}>
          <div style={{ fontSize:10, letterSpacing:".2em", textTransform:"uppercase", color:S.accent, fontWeight:600, marginBottom:10 }}>Content Intelligence</div>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:"clamp(22px,5vw,36px)", color:S.text, lineHeight:1.2, marginBottom:8 }}>
            Тема → <span style={{ color:S.accent, fontStyle:"italic" }}>посты</span><br />под каждую соцсеть
          </h1>
          <p style={{ fontSize:12, color:S.dim }}>Заголовок · Хук · Адаптация под платформы · Голос бренда</p>
          <button onClick={()=>setShowApiSetup(true)} style={{ marginTop:10, fontSize:11, color:"#3a3530", background:"transparent", border:"none", cursor:"pointer", textDecoration:"underline" }}>
            Сменить API-ключ
          </button>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <div style={{ background:S.card, border:`1px solid ${S.border}`, borderRadius:14, padding:24, marginBottom:16 }}>
              <div style={{ fontFamily:"Georgia,serif", fontSize:17, color:S.text, marginBottom:20, display:"flex", alignItems:"center", gap:9 }}>
                <span style={{ width:26, height:26, background:S.accent, color:"#0f0e0c", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, flexShrink:0 }}>1</span>
                Контекст
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <Field label="Бренд / имя эксперта">
                  <input style={inp} placeholder="Сервис ФиксПК / Анна Иванова" value={expert} onChange={e=>setExpert(e.target.value)} />
                </Field>
                <Field label="Ниша / сфера">
                  <input style={inp} placeholder="Ремонт ноутбуков и ПК" value={niche} onChange={e=>setNiche(e.target.value)} />
                </Field>
              </div>

              <Field label="Целевая аудитория" hint="Возраст, пол, город, интересы, боли">
                <input style={inp} placeholder="Женщины 35-50, г. Тбилиси, владелицы малого бизнеса" value={audience} onChange={e=>setAudience(e.target.value)} />
              </Field>

              <Field label="Тональность">
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {TONES.map(t => (
                    <button key={t} onClick={()=>setTone(t)} style={{ padding:"6px 12px", borderRadius:20, border:`1px solid ${tone===t ? S.accent : S.borderLight}`, background:tone===t ? S.accentBg : "#221c15", color:tone===t ? S.accent : S.muted, fontSize:12, cursor:"pointer", fontFamily:"sans-serif" }}>
                      {t}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Голос бренда" hint="Вставь пример своего поста — приложение напишет в твоём стиле">
                <textarea style={inp} rows={3}
                  placeholder="Вставь сюда пример поста в своём стиле (необязательно)..."
                  value={toneOfVoice} onChange={e=>setToneOfVoice(e.target.value)} />
              </Field>

              <Field label="Платформы">
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {PLATFORMS.map(p => (
                    <button key={p.id} onClick={()=>toggle(p.id)} style={{ padding:"8px 14px", borderRadius:9, border:`1px solid ${platforms.includes(p.id) ? S.accent : S.borderLight}`, background:platforms.includes(p.id) ? S.accentBg : "#221c15", color:platforms.includes(p.id) ? S.text : S.muted, fontSize:13, cursor:"pointer", fontFamily:"sans-serif", display:"flex", alignItems:"center", gap:5 }}>
                      {p.icon} {p.label}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            <button onClick={()=>setStep(2)} disabled={platforms.length===0}
              style={{ width:"100%", padding:15, borderRadius:12, border:"none", background:`linear-gradient(135deg,${S.accent},#e8a85a)`, color:"#0f0e0c", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"sans-serif" }}>
              Далее → Тема поста
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <div style={{ background:S.card, border:`1px solid ${S.border}`, borderRadius:14, padding:24, marginBottom:16 }}>
              <div style={{ fontFamily:"Georgia,serif", fontSize:17, color:S.text, marginBottom:20, display:"flex", alignItems:"center", gap:9 }}>
                <span style={{ width:26, height:26, background:S.accent, color:"#0f0e0c", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, flexShrink:0 }}>2</span>
                Тема и содержание
              </div>

              <Field label="Тема поста">
                <textarea style={inp} rows={2} placeholder="Например: чистка ноутбука от пыли" value={topic} onChange={e=>setTopic(e.target.value)} />
              </Field>

              <Field label="Ключевые факты и УТП" hint="Что обязательно отразить — цифры, преимущества, призыв">
                <textarea style={inp} rows={4}
                  placeholder={"Что важно донести:\n— чистка каждые 6-12 месяцев\n— признаки перегрева\n— стоимость чистки 50 лари\n— доставка курьером после ремонта"}
                  value={details} onChange={e=>setDetails(e.target.value)} />
              </Field>
            </div>

            {loading ? (
              <div style={{ background:S.card, border:`1px solid ${S.border}`, borderRadius:14, padding:24, textAlign:"center" }}>
                <div style={{ width:28, height:28, border:`2px solid ${S.border}`, borderTopColor:S.accent, borderRadius:"50%", animation:"sp .8s linear infinite", margin:"0 auto 12px" }} />
                <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
                <p style={{ fontSize:13, color:S.muted }}>Создаю заголовок, хук и посты для {platforms.length} платформ…</p>
              </div>
            ) : (
              <>
                <button onClick={generate} disabled={!topic.trim()}
                  style={{ width:"100%", padding:15, borderRadius:12, border:"none", background:!topic.trim() ? S.border : `linear-gradient(135deg,${S.accent},#e8a85a)`, color:!topic.trim() ? S.dim : "#0f0e0c", fontSize:15, fontWeight:700, cursor:topic.trim()?"pointer":"not-allowed", fontFamily:"sans-serif", marginBottom:10 }}>
                  ✦ Создать заголовок, хук и посты
                </button>
                {error && <p style={{ color:"#e05c5c", fontSize:13, textAlign:"center", marginBottom:10 }}>{error}</p>}
                <button onClick={()=>setStep(1)} style={{ width:"100%", padding:10, borderRadius:10, border:`1px solid ${S.border}`, background:"transparent", color:S.dim, fontSize:13, cursor:"pointer", fontFamily:"sans-serif" }}>
                  ← Назад
                </button>
              </>
            )}
          </div>
        )}

        {/* STEP 3 — Result */}
        {step === 3 && result && (
          <div>
            {/* Headline + Hook */}
            <div style={{ background:S.card, border:`1px solid ${S.accent}`, borderRadius:14, padding:20, marginBottom:16 }}>
              <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:".1em", color:S.accent, fontWeight:600, marginBottom:8 }}>Заголовок поста</div>
              <div style={{ fontFamily:"Georgia,serif", fontSize:20, color:S.text, lineHeight:1.3, marginBottom:16 }}>
                {result.headline}
              </div>
              <div style={{ height:1, background:S.border, marginBottom:14 }} />
              <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:".1em", color:S.accent, fontWeight:600, marginBottom:8 }}>Хук</div>
              <div style={{ fontSize:14, color:S.muted, lineHeight:1.7, fontStyle:"italic" }}>
                {result.hook}
              </div>
              <div style={{ display:"flex", justifyContent:"flex-end", marginTop:12 }}>
                <CopyBtn text={result.headline + "\n\nХук: " + result.hook} />
              </div>
            </div>

            {/* Platform tabs */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
              {PLATFORMS.filter(p => platforms.includes(p.id)).map(p => (
                <button key={p.id} onClick={()=>setActiveTab(p.id)}
                  style={{ padding:"8px 14px", borderRadius:9, border:`1px solid ${activeTab===p.id ? S.accent : S.borderLight}`, background:activeTab===p.id ? S.accentBg : "#221c15", color:activeTab===p.id ? S.accent : S.muted, fontSize:13, cursor:"pointer", fontFamily:"sans-serif" }}>
                  {activePlatform?.id === p.id ? p.icon : p.icon} {p.label}
                </button>
              ))}
            </div>

            {/* Post */}
            <div style={{ background:S.card, border:`1px solid ${S.border}`, borderRadius:12, overflow:"hidden", marginBottom:14 }}>
              <div style={{ padding:"12px 18px", borderBottom:`1px solid ${S.border}`, fontSize:14, fontWeight:600, color:S.accent, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span>{activePlatform?.icon} {activePlatform?.label}</span>
                <span style={{ fontSize:11, color:S.dim, fontWeight:400 }}>
                  {(result[activeTab] || "").split(/\s+/).filter(Boolean).length} слов
                </span>
              </div>
              <div style={{ padding:18, fontSize:14, lineHeight:1.85, color:"#d8d0c4", whiteSpace:"pre-wrap" }}>
                {result[activeTab] || "—"}
              </div>
              <div style={{ padding:"10px 18px", borderTop:`1px solid ${S.border}`, display:"flex", justifyContent:"flex-end" }}>
                <CopyBtn text={result.headline + "\n\n" + result[activeTab]} />
              </div>
            </div>

            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>{setResult(null);setStep(2);}}
                style={{ flex:1, padding:12, borderRadius:10, border:"none", background:`linear-gradient(135deg,${S.accent},#e8a85a)`, color:"#0f0e0c", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"sans-serif" }}>
                Изменить тему
              </button>
              <button onClick={()=>{setResult(null);setTopic("");setDetails("");setStep(1);}}
                style={{ flex:1, padding:12, borderRadius:10, border:`1px solid ${S.border}`, background:"transparent", color:S.dim, fontSize:13, cursor:"pointer", fontFamily:"sans-serif" }}>
                Начать заново
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

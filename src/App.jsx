import { useState } from "react";

const PLATFORMS = [
  {
    id: "telegram",
    label: "Telegram",
    icon: "✈️",
    color: "#4fc3f7",
    bg: "#071a26",
    border: "#1a3a4a",
    desc: "130-180 слов",
    algo: `Алгоритм Telegram: контент индексируется Яндексом. Пиши структурированно с абзацами. Первые 2 строки — самые важные (превью в ленте). Используй эмодзи умеренно для визуального разделения. Без хэштегов. Заканчивай вопросом или призывом к действию. Длина: 130-180 слов.`,
  },
  {
    id: "vk",
    label: "ВКонтакте",
    icon: "🔵",
    color: "#7c9fd4",
    bg: "#07101e",
    border: "#1a2a3a",
    desc: "120-150 слов + хэштеги",
    algo: `Алгоритм ВКонтакте: первые 2 строки видны до кнопки "читать далее" — они решают всё. VK хорошо ранжируется в Яндексе. Алгоритм любит посты с реакциями и комментариями — заканчивай вопросом аудитории. В конце 3-5 тематических хэштегов. Длина: 120-150 слов.`,
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: "📘",
    color: "#8ab4f8",
    bg: "#070f1e",
    border: "#1a2535",
    desc: "120-150 слов",
    algo: `Алгоритм Facebook: алгоритм продвигает посты, которые вызывают дискуссию. Начинай с личной истории, неожиданного факта или провокационного вопроса. Текст должен цеплять эмоционально. Без хэштегов (они снижают охват в FB). Заканчивай вопросом, который хочется обсудить. Длина: 120-150 слов.`,
  },
  {
    id: "threads",
    label: "Threads",
    icon: "◎",
    color: "#e8a87c",
    bg: "#1a100a",
    border: "#3a2a1a",
    desc: "60-90 слов",
    algo: `Алгоритм Threads: короткий формат, алгоритм продвигает посты с высоким engagement в первые 30 минут. Первые 2 строки — хук, который останавливает скролл. Пиши как человек, не как бренд. Можно использовать разрыв строки для паузы. Без хэштегов. Длина: 60-90 слов.`,
  },
  {
    id: "instagram",
    label: "Instagram",
    icon: "📸",
    color: "#e879a0",
    bg: "#1a0a14",
    border: "#3a1a28",
    desc: "80-120 слов + хэштеги",
    algo: `Алгоритм Instagram: алгоритм смотрит на сохранения и репосты — делай контент "сохрани себе". Первая строка — хук до кнопки "ещё". Структурируй текст с переносами строк. В конце 5-7 целевых хэштегов (не спам, а по теме). Призыв сохранить или поделиться. Длина: 80-120 слов.`,
  },
];

const TONES = [
  { id: "warm", label: "Тёплый и поддерживающий" },
  { id: "expert", label: "Экспертный и авторитетный" },
  { id: "provoc", label: "Провокационный и честный" },
  { id: "simple", label: "Простой и понятный" },
];

function Spinner() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "36px 0" }}>
      <div className="spinner" />
      <p style={{ color: "#a89f91", fontSize: 13 }}>Адаптирую под алгоритмы и SEO…</p>
    </div>
  );
}

function WordCount({ text }) {
  const count = (text || "").split(/\s+/).filter(Boolean).length;
  return <span style={{ fontSize: 11, color: "#5a5248" }}>{count} слов</span>;
}

export default function App() {
  const [form, setForm] = useState({
    expert: "", niche: "", audience: "", tone: "expert",
    topic: "", mustInclude: "",
    platforms: ["telegram", "vk", "facebook", "threads"],
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("telegram");
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(1);

  function upd(k, v) { setForm(f => ({ ...f, [k]: v })); }
  function togglePlatform(id) {
    setForm(f => ({
      ...f,
      platforms: f.platforms.includes(id)
        ? f.platforms.filter(p => p !== id)
        : [...f.platforms, id]
    }));
  }

  async function generate() {
    setLoading(true); setError(""); setResult(null);

    const selectedPlatforms = PLATFORMS.filter(p => form.platforms.includes(p.id));
    const platformInstructions = selectedPlatforms.map(p => `\n[${p.label}]\n${p.algo}`).join("\n");
    const tone = TONES.find(t => t.id === form.tone)?.label || "Экспертный";

    const platformRules = selectedPlatforms.map(p => {
      const rules = {
        telegram: "Telegram: 100-130 слов, абзацы, без хэштегов, вопрос в конце",
        vk: "VK: 90-110 слов, 3 хэштега в конце",
        facebook: "Facebook: 90-110 слов, личная история или вопрос в начале",
        threads: "Threads: 50-70 слов, цепляющий хук в первых 2 строках",
        instagram: "Instagram: 70-90 слов, 5 хэштегов в конце",
      };
      return rules[p.id] || p.label;
    }).join(". ");

    const prompt = `SMM + SEO Яндекс. Создай посты.
Эксперт: ${form.expert||"-"}. Сфера: ${form.niche||"-"}. Тональность: ${tone}.
Тема: ${form.topic}. Отразить: ${form.mustInclude||"-"}.
Платформы: ${platformRules}.
SEO: ключевой запрос по теме — в первом предложении каждого поста.
ТОЛЬКО JSON: {"topic_title":"название","main_query":"запрос","keywords":["к1","к2","к3"],"posts":{"telegram":"текст","vk":"текст","facebook":"текст","threads":"текст","instagram":"текст"}}
Генерируй только: ${selectedPlatforms.map(p => p.id).join(", ")}`;

    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 4000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await resp.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
      setActiveTab(form.platforms[0]);
      setStep(3);
    } catch (e) {
      setError("Ошибка: " + (e?.message || "попробуй ещё раз"));
    }
    setLoading(false);
  }

  function copyPost() {
    navigator.clipboard.writeText(result?.posts?.[activeTab] || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const canGen = form.topic.trim().length > 3;
  const activePlatform = PLATFORMS.find(p => p.id === activeTab);
  const selectedPlatforms = PLATFORMS.filter(p => form.platforms.includes(p.id));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Golos+Text:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#0f0e0c}
        .app{min-height:100vh;background:#0f0e0c;color:#e8e2d8;font-family:'Golos Text',sans-serif;padding:0 16px 80px}

        .header{text-align:center;padding:38px 0 22px;border-bottom:1px solid #2a2520;margin-bottom:26px}
        .hl{font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:#c4954a;font-weight:600;margin-bottom:10px}
        .ht{font-family:'Playfair Display',serif;font-size:clamp(22px,5vw,38px);font-weight:700;color:#f0ebe0;line-height:1.2}
        .ht em{font-style:italic;color:#c4954a}
        .sub{margin-top:8px;color:#5a5248;font-size:12px}

        .wrap{max-width:660px;margin:0 auto}
        .card{background:#181613;border:1px solid #2a2520;border-radius:15px;padding:22px;margin-bottom:14px}
        .ct{font-family:'Playfair Display',serif;font-size:16px;color:#f0ebe0;margin-bottom:16px;display:flex;align-items:center;gap:9px}
        .ct-num{width:24px;height:24px;background:#c4954a;color:#0f0e0c;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;font-family:'Golos Text',sans-serif}
        .fg{margin-bottom:14px}
        .fg:last-child{margin-bottom:0}
        .fl{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#7a7268;margin-bottom:6px;font-weight:600;display:flex;align-items:center;gap:6px}
        .fl-req{color:#c4954a;font-size:10px}
        .fi{width:100%;background:#0f0e0c;border:1px solid #2a2520;border-radius:10px;padding:10px 12px;color:#e8e2d8;font-family:'Golos Text',sans-serif;font-size:14px;outline:none;transition:border-color .2s;resize:none}
        .fi:focus{border-color:#c4954a}
        .fi::placeholder{color:#3a3530}
        .r2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        @media(max-width:480px){.r2{grid-template-columns:1fr}}

        .tone-grid{display:flex;flex-wrap:wrap;gap:6px}
        .tone-btn{padding:6px 12px;border-radius:20px;border:1px solid #2a2520;background:transparent;color:#7a7268;font-size:12px;cursor:pointer;transition:all .2s;font-family:'Golos Text',sans-serif}
        .tone-btn.on{border-color:#c4954a;background:rgba(196,149,74,.1);color:#c4954a}

        .pl-grid{display:flex;flex-wrap:wrap;gap:8px}
        .pl-btn{padding:7px 13px;border-radius:10px;border:1px solid #2a2520;background:transparent;color:#7a7268;font-size:12px;cursor:pointer;transition:all .2s;font-family:'Golos Text',sans-serif;display:flex;align-items:center;gap:5px}
        .pl-btn.on{border-color:#c4954a;background:rgba(196,149,74,.08);color:#e8e2d8}

        .gen-btn{width:100%;padding:15px;border-radius:13px;border:none;background:linear-gradient(135deg,#c4954a,#e8a85a);color:#0f0e0c;font-size:15px;font-weight:700;cursor:pointer;font-family:'Golos Text',sans-serif;letter-spacing:.04em;transition:opacity .2s,transform .1s;margin-top:4px}
        .gen-btn:hover:not(:disabled){opacity:.9;transform:translateY(-1px)}
        .gen-btn:disabled{opacity:.35;cursor:not-allowed}
        .reset-btn{width:100%;padding:9px;border-radius:10px;border:1px solid #2a2520;background:transparent;color:#7a7268;font-size:13px;cursor:pointer;font-family:'Golos Text',sans-serif;transition:all .2s;margin-top:10px;display:block}
        .reset-btn:hover{border-color:#c4954a;color:#c4954a}
        .err{color:#e05c5c;font-size:13px;text-align:center;margin-top:10px}
        .spinner{width:30px;height:30px;border:2px solid #2a2520;border-top-color:#c4954a;border-radius:50%;animation:spin .8s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}

        /* RESULT */
        .res-header{background:rgba(196,149,74,.07);border:1px solid rgba(196,149,74,.2);border-radius:12px;padding:16px 18px;margin-bottom:14px}
        .rh-label{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#c4954a;margin-bottom:6px;font-weight:600}
        .rh-title{font-family:'Playfair Display',serif;font-size:18px;color:#f0ebe0;margin-bottom:10px}
        .seo-row{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
        .seo-q{font-size:12px;background:#0a1810;border:1px solid #1a3020;color:#6ac48a;padding:3px 10px;border-radius:10px}
        .seo-k{font-size:11px;background:rgba(74,154,106,.07);border:1px solid rgba(74,154,106,.18);color:#4a9a6a;padding:2px 8px;border-radius:10px}

        .ptabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}
        .ptab{padding:8px 13px;border-radius:10px;border:1px solid #2a2520;background:transparent;color:#5a5248;font-size:12px;cursor:pointer;transition:all .2s;font-family:'Golos Text',sans-serif;display:flex;align-items:center;gap:5px}
        .ptab.on{color:#e8e2d8}

        .post-box{background:#181613;border-radius:14px;overflow:hidden}
        .post-head{padding:11px 16px;display:flex;align-items:center;gap:8px;border-bottom:1px solid #2a2520}
        .ph-icon{font-size:17px}
        .ph-name{font-size:13px;font-weight:600}
        .ph-algo{font-size:11px;color:#5a5248;margin-left:auto}
        .post-body{padding:18px;font-size:14px;line-height:1.85;color:#c8c0b4;white-space:pre-wrap;min-height:100px}
        .post-foot{padding:10px 16px;border-top:1px solid #2a2520;display:flex;align-items:center;justify-content:space-between}
        .cp-btn{padding:7px 14px;border-radius:8px;border:1px solid #2a2520;background:transparent;color:#7a7268;font-size:12px;cursor:pointer;transition:all .2s;font-family:'Golos Text',sans-serif}
        .cp-btn:hover{border-color:#c4954a;color:#c4954a}
        .cp-btn.done{border-color:#4a9a6a!important;color:#4a9a6a!important}

        .algo-tip{margin-top:8px;background:#0f0e0c;border:1px solid #2a2520;border-radius:10px;padding:10px 13px;font-size:12px;color:#5a5248;line-height:1.5}
        .algo-tip strong{color:#7a7268}
      `}</style>

      <div className="app">
        <div className="header">
          <div className="hl">Content Intelligence</div>
          <h1 className="ht">Тема → <em>посты</em><br />под каждую соцсеть</h1>
          <p className="sub">Алгоритмы платформ · SEO под Яндекс · Любая ниша</p>
        </div>

        <div className="wrap">

          {/* STEP 1 — форма */}
          {step === 1 && (
            <>
              <div className="card">
                <div className="ct"><span className="ct-num">1</span> Контекст</div>
                <div className="r2">
                  <div className="fg">
                    <div className="fl">Эксперт / компания</div>
                    <input className="fi" placeholder="Сервис «ФиксПК»" value={form.expert} onChange={e => upd("expert", e.target.value)} />
                  </div>
                  <div className="fg">
                    <div className="fl">Сфера деятельности</div>
                    <input className="fi" placeholder="Ремонт ноутбуков и компьютеров" value={form.niche} onChange={e => upd("niche", e.target.value)} />
                  </div>
                </div>
                <div className="fg">
                  <div className="fl">Целевая аудитория</div>
                  <input className="fi" placeholder="Жители города, владельцы ноутбуков" value={form.audience} onChange={e => upd("audience", e.target.value)} />
                </div>
                <div className="fg">
                  <div className="fl">Тональность</div>
                  <div className="tone-grid">
                    {TONES.map(t => (
                      <button key={t.id} className={`tone-btn ${form.tone === t.id ? "on" : ""}`} onClick={() => upd("tone", t.id)}>{t.label}</button>
                    ))}
                  </div>
                </div>
                <div className="fg">
                  <div className="fl">Платформы</div>
                  <div className="pl-grid">
                    {PLATFORMS.map(p => (
                      <button key={p.id} className={`pl-btn ${form.platforms.includes(p.id) ? "on" : ""}`} onClick={() => togglePlatform(p.id)}>
                        {p.icon} {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button className="gen-btn" style={{background:"#2a2520", color:"#c4954a"}} onClick={() => setStep(2)}>
                Далее → Тема и детали
              </button>
            </>
          )}

          {/* STEP 2 — тема */}
          {step === 2 && (
            <>
              <div className="card">
                <div className="ct"><span className="ct-num">2</span> Тема и содержание</div>
                <div className="fg">
                  <div className="fl">Тема поста <span className="fl-req">обязательно</span></div>
                  <textarea className="fi" rows={2}
                    placeholder="Например: как быстро осуществляется ремонт ноутбука"
                    value={form.topic}
                    onChange={e => upd("topic", e.target.value)}
                  />
                </div>
                <div className="fg">
                  <div className="fl">Что обязательно отразить в посте</div>
                  <textarea className="fi" rows={4}
                    placeholder={"Например:\n— ремонт занимает 2-3 часа\n— можно оставить ноутбук и получить готовый курьером\n— бесплатная диагностика при ремонте"}
                    value={form.mustInclude}
                    onChange={e => upd("mustInclude", e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="card"><Spinner /></div>
              ) : (
                <>
                  <button className="gen-btn" disabled={!canGen} onClick={generate}>
                    ✦ Создать посты под {form.platforms.length} платформы
                  </button>
                  {error && <p className="err">{error}</p>}
                  <button className="reset-btn" onClick={() => setStep(1)}>← Назад</button>
                </>
              )}
            </>
          )}

          {/* STEP 3 — результат */}
          {step === 3 && result && (
            <>
              <div className="res-header">
                <div className="rh-label">Тема</div>
                <div className="rh-title">{result.topic_title}</div>
                <div className="seo-row">
                  {result.main_query && <span className="seo-q">🔍 {result.main_query}</span>}
                  {result.keywords?.map((k, i) => <span key={i} className="seo-k">{k}</span>)}
                </div>
              </div>

              <div className="ptabs">
                {selectedPlatforms.map(p => (
                  <button
                    key={p.id}
                    className={`ptab ${activeTab === p.id ? "on" : ""}`}
                    style={activeTab === p.id ? { borderColor: p.color, background: p.bg, color: p.color } : {}}
                    onClick={() => { setActiveTab(p.id); setCopied(false); }}
                  >
                    {p.icon} {p.label}
                  </button>
                ))}
              </div>

              <div className="post-box" style={{ border: `1px solid ${activePlatform?.border}` }}>
                <div className="post-head" style={{ background: activePlatform?.bg }}>
                  <span className="ph-icon">{activePlatform?.icon}</span>
                  <span className="ph-name" style={{ color: activePlatform?.color }}>{activePlatform?.label}</span>
                  <span className="ph-algo">{activePlatform?.desc}</span>
                </div>
                <div className="post-body">{result.posts?.[activeTab] || "—"}</div>
                <div className="post-foot">
                  <WordCount text={result.posts?.[activeTab]} />
                  <button className={`cp-btn ${copied ? "done" : ""}`} onClick={copyPost}>
                    {copied ? "✓ Скопировано" : "Скопировать"}
                  </button>
                </div>
              </div>

              <div className="algo-tip">
                <strong>Алгоритм {activePlatform?.label}:</strong> {activePlatform?.algo.replace(/^Алгоритм [^:]+: /, "")}
              </div>

              <button className="reset-btn" onClick={() => { setStep(2); setResult(null); }}>← Изменить тему</button>
              <button className="reset-btn" onClick={() => { setStep(1); setResult(null); setForm(f => ({...f, topic:"", mustInclude:""})); }}>← Начать заново</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

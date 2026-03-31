import React, { useState, useEffect } from "react";

const useIsMobile = () => {
  const [mobile, setMobile] = React.useState(window.innerWidth < 600);
  React.useEffect(() => {
    const h = () => setMobile(window.innerWidth < 600);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return mobile;
};

const PLATFORMS = [
  { id: "telegram",  label: "Telegram",   icon: "✈️" },
  { id: "vk",        label: "ВКонтакте",  icon: "🔵" },
  { id: "facebook",  label: "Facebook",   icon: "📘" },
  { id: "threads",   label: "Threads",    icon: "◎"  },
  { id: "instagram", label: "Instagram",  icon: "📸" },
  { id: "zen",       label: "Яндекс Дзен", icon: "🟡" },
  { id: "linkedin",  label: "LinkedIn",   icon: "💼" },
];

const TONES = [
  "Тёплый и поддерживающий",
  "Экспертный и авторитетный",
  "Провокационный и честный",
  "Простой и понятный",
];

const LENGTH_OPTIONS = [
  {
    id:"short", label:"Короткий", icon:"▪", desc:"Анонс, тезис, быстрая мысль",
    note:"Лучший органический охват на FB и Instagram. Для Дзена — слишком коротко.",
    limits:{
      telegram:"50-80 слов. Одна мысль, без воды.",
      vk:"50-80 слов + 2-3 хэштега.",
      facebook:"20-40 слов. Краткость даёт +66% вовлечённости.",
      threads:"30-50 слов. Хук в первой строке.",
      instagram:"20-40 слов. Акцент на визуал, текст — дополнение."
    }
  },
  {
    id:"standard", label:"Стандартный", icon:"▪▪", desc:"Сбалансированный формат",
    note:"Хорошо для Telegram, ВКонтакте, LinkedIn. Для Дзена — минимальный формат.",
    limits:{
      telegram:"150-200 слов. Абзацы, умеренно эмодзи.",
      vk:"120-160 слов + 3-4 хэштега.",
      facebook:"60-100 слов. Личный тон, вопрос в конце.",
      threads:"60-80 слов. Хук в первых 2 строках.",
      instagram:"80-120 слов + 5 хэштегов.",
      zen:"200-400 слов. Заголовок + лид + тело. SEO обязателен.",
      linkedin:"150-200 слов. Профессиональный тон."
    }
  },
  {
    id:"long", label:"Длинный", icon:"▪▪▪", desc:"Экспертный лонгрид",
    note:"Идеален для Дзена и LinkedIn. Telegram и ВКонтакте — хорошо. FB/Instagram — снижает охват.",
    limits:{
      telegram:"350-500 слов. Структура: хук → тезисы → вывод → CTA.",
      vk:"300-450 слов + 4-5 хэштегов. Первый абзац решает всё.",
      facebook:"150-200 слов. Личная история с деталями.",
      threads:"150-200 слов. Развёрнутый экспертный пост.",
      instagram:"150-220 слов + 5 хэштегов. Образовательный формат.",
      zen:"600-1500 слов. Полноценная статья с подзаголовками.",
      linkedin:"300-400 слов. Экспертная колонка."
    }
  },
  {
    id:"thread", label:"Тред", icon:"↓↓", desc:"Хук + серия продолжений",
    note:"Работает в Threads, Telegram, LinkedIn. Дзен — серия статей.",
    limits:{
      telegram:"Серия 4-5 постов по 80-100 слов. Нумеруй [1/5] [2/5] и т.д.",
      vk:"Основной пост 120 слов + 3 продолжения по 70-80 слов в комментариях.",
      facebook:"Основной пост 60-80 слов + 3 комментария-продолжения.",
      threads:"Хук 40-60 слов + 4-5 ответов по 60-80 слов. Каждый ответ — отдельная мысль.",
      instagram:"Пост 80-100 слов + тезисы для карусели (6-8 слайдов) + 5 хэштегов.",
      zen:"Серия 3-4 статей по 400-600 слов.",
      linkedin:"Пост 150 слов + 3 комментария-тезиса."
    }
  },
];

const PILLAR_ANGLES = [
  { id: "reasons",   label: "Причины",   desc: "Почему это происходит" },
  { id: "mistakes",  label: "Ошибки",    desc: "Что делают не так" },
  { id: "examples",  label: "Примеры",   desc: "Реальные случаи и истории" },
  { id: "solutions", label: "Решения",   desc: "Как исправить и что делать" },
];

const AWARENESS_STAGES = [
  { id: "unaware",   label: "Не осознаёт проблему",  goal: "заставить задуматься",       share: "40%", color: "#5a8a6a" },
  { id: "aware",     label: "Осознаёт проблему",      goal: "углубить понимание",          share: "30%", color: "#7a9a5a" },
  { id: "seeking",   label: "Ищет решение",           goal: "показать правильный путь",    share: "30%", color: "#9a8a4a" },
  { id: "choosing",  label: "Выбирает решение",       goal: "сформировать доверие",        share: "20%", color: "#c4954a" },
  { id: "ready",     label: "Готов к покупке",        goal: "перевести в действие",        share: "10%", color: "#c46a4a" },
];

const RUBRICS = [
  { id: "expert",    label: "Экспертный",    desc: "Знания, факты, разборы",         share: "30%", icon: "🎓" },
  { id: "personal",  label: "Личный",        desc: "История, опыт, за кулисами",     share: "20%", icon: "💬" },
  { id: "engaging",  label: "Вовлекающий",   desc: "Вопросы, опросы, дискуссии",     share: "20%", icon: "🔥" },
  { id: "pain",      label: "Боль/Проблема", desc: "Закрываем страхи и возражения",  share: "20%", icon: "💊" },
  { id: "selling",   label: "Продающий",     desc: "Конкретное предложение, выгода, призыв",   share: "10%", icon: "💰" },

];

const CTA_OPTIONS = [
  { id: "dm",       label: "Написать в директ",     icon: "✉️" },
  { id: "site",     label: "Перейти на сайт",        icon: "🌐" },
  { id: "signup",   label: "Записаться / заявка",    icon: "📋" },
  { id: "save",     label: "Сохранить пост",         icon: "🔖" },
  { id: "share",    label: "Поделиться",             icon: "🔄" },
  { id: "comment",  label: "Оставить комментарий",   icon: "💭" },
  { id: "sub",      label: "Подписаться",            icon: "➕" },
  { id: "none",     label: "Без CTA",               icon: "—"  },
];

const S = {
  bg: "#0f0e0c", card: "#1e1810", input: "#2a221a",
  border: "#3a3028", borderL: "#4a3e32",
  text: "#f0ebe0", muted: "#c4b49a", dim: "#7a6a58",
  accent: "#c4954a", accentBg: "rgba(196,149,74,.15)",
};

const inp = {
  width:"100%", background:S.input, border:`1px solid ${S.borderL}`,
  borderRadius:9, padding:"10px 12px", color:S.text,
  fontSize:14, outline:"none", resize:"none", fontFamily:"sans-serif",
};

function Label({ text, hint, share }) {
  return (
    <div style={{ marginBottom: hint ? 3 : 7 }}>
      <div style={{ fontSize:11, color:S.dim, textTransform:"uppercase", letterSpacing:".08em", fontWeight:600, display:"flex", alignItems:"center", gap:8 }}>
        {text}
        {share && <span style={{ fontSize:10, color:S.accent, background:S.accentBg, padding:"1px 7px", borderRadius:10 }}>{share} контент-плана</span>}
      </div>
      {hint && <div style={{ fontSize:11, color:S.dim, marginTop:2, fontStyle:"italic" }}>{hint}</div>}
    </div>
  );
}

function CopyBtn({ text }) {
  const [done, setDone] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); }}
      style={{ padding:"7px 14px", borderRadius:8, border:`1px solid ${done?"#4a9a6a":S.border}`, background:"transparent", color:done?"#4a9a6a":S.dim, fontSize:12, cursor:"pointer", fontFamily:"sans-serif" }}>
      {done ? "✓ Скопировано" : "Скопировать"}
    </button>
  );
}

function Card({ children, accent }) {
  return (
    <div style={{ background:S.card, border:`1px solid ${accent ? S.accent : S.border}`, borderRadius:14, padding:24, marginBottom:16 }}>
      {children}
    </div>
  );
}

function StepNum({ n }) {
  return <span style={{ width:26, height:26, background:S.accent, color:"#0f0e0c", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, flexShrink:0 }}>{n}</span>;
}

export default function App() {
  // API

  // Pillars (saved)
  const [pillars, setPillars] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lia_pillars") || "[]"); } catch { return []; }
  });
  const [showPillarSetup, setShowPillarSetup] = useState(false);
  const [pillarInput, setPillarInput] = useState("");

  // Step 1 — context
  const [expert, setExpert] = useState(() => localStorage.getItem("lia_expert") || "");
  const [niche, setNiche] = useState(() => localStorage.getItem("lia_niche") || "");
  const [audience, setAudience] = useState(() => localStorage.getItem("lia_audience") || "");
  const [tone, setTone] = useState(() => localStorage.getItem("lia_tone") || TONES[1]);
  const [toneOfVoice, setToneOfVoice] = useState(() => localStorage.getItem("lia_tov") || "");
  const [platforms, setPlatforms] = useState(() => { try { return JSON.parse(localStorage.getItem("lia_platforms") || "null") || ["telegram","vk"]; } catch { return ["telegram","vk"]; } });

  // Step 2 — strategy
  const [pillar, setPillar] = useState("");
  const [pillarAngle, setPillarAngle] = useState("");
  const [stage, setStage] = useState("");
  const [rubric, setRubric] = useState("");
  const [cta, setCta] = useState("");

  // Mode
  const [mode, setMode] = useState("post"); // "post" | "case"

  // Step 3 — content
  const [topic, setTopic] = useState("");
  const [details, setDetails] = useState("");
  const [pain, setPain] = useState("");
  const [caseBefore, setCaseBefore] = useState("");
  const [caseAfter, setCaseAfter] = useState("");
  const [caseResult, setCaseResult] = useState("");
  const [caseClient, setCaseClient] = useState("");
  const [length, setLength] = useState("standard");
  const [caseNiche, setCaseNiche] = useState("");

  // Result
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("telegram");
  const [error, setError] = useState("");

  // Save context
  useEffect(() => { localStorage.setItem("lia_expert", expert); }, [expert]);
  useEffect(() => { localStorage.setItem("lia_tone", tone); }, [tone]);
  useEffect(() => { localStorage.setItem("lia_tov", toneOfVoice); }, [toneOfVoice]);
  useEffect(() => { localStorage.setItem("lia_platforms", JSON.stringify(platforms)); }, [platforms]);
  useEffect(() => { localStorage.setItem("lia_niche", niche); }, [niche]);
  useEffect(() => { localStorage.setItem("lia_audience", audience); }, [audience]);

  function savePillar() {
    const p = pillarInput.trim();
    if (!p || pillars.length >= 4) return;
    const updated = [...pillars, p];
    setPillars(updated);
    localStorage.setItem("lia_pillars", JSON.stringify(updated));
    setPillarInput("");
  }

  function removePillar(i) {
    const updated = pillars.filter((_, idx) => idx !== i);
    setPillars(updated);
    localStorage.setItem("lia_pillars", JSON.stringify(updated));
    if (pillar === pillars[i]) setPillar("");
  }

  function startCase() { setMode("case"); setStep(1); setResult(null); }
  function startPost() { setMode("post"); setStep(1); setResult(null); }

  function toggle(id) {
    setPlatforms(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  }

  const selectedStage = AWARENESS_STAGES.find(s => s.id === stage);
  const selectedRubric = RUBRICS.find(r => r.id === rubric);
  const selectedCta = CTA_OPTIONS.find(c => c.id === cta);
  const isCase = mode === "case";

  async function generate() {
    if (!topic.trim()) { setError("Укажи тему поста"); return; }
    setLoading(true); setError(""); setResult(null);

    const names = PLATFORMS.filter(p => platforms.includes(p.id)).map(p => p.label).join(", ");
    const tovSection = toneOfVoice.trim() ? `\nГолос бренда (строго следуй этому стилю и голосу):\n"${toneOfVoice}"\n` : "";

    const caseSection = isCase ? `
Это кейс / история успеха клиента. Адаптируй под формат "было → стало → результат".
Клиент/герой кейса: ${caseClient || "не указано"}
Ниша/контекст клиента: ${caseNiche || "не указано"}
Ситуация ДО: ${caseBefore || "не указано"}
Что было сделано / изменилось: ${caseAfter || "не указано"}
Результат (цифры, факты, эмоции): ${caseResult || "не указано"}
Напиши эмоциональную историю от третьего лица. Конкретные детали важны — они создают доверие.` : "";

    const strategySection = `
СТРАТЕГИЯ ПОСТА (строго соблюдай):
- Пиллар контента: ${pillar || "не выбран"}
- Угол пиллара: ${PILLAR_ANGLES.find(a=>a.id===pillarAngle)?.label || "выбери сам наиболее подходящий из: Причины, Ошибки, Примеры, Решения — исходя из рубрики и стадии аудитории"}
- Стадия аудитории: ${selectedStage?.label || "не выбрана"} → цель поста: ${selectedStage?.goal || ""}
- Рубрика: ${selectedRubric?.label || "не выбрана"}
- Боль аудитории: ${pain || "не указана"}
- CTA: ${selectedCta?.label || "без призыва"}`;

    const prompt = `Ты опытный SMM-стратег и контент-маркетолог.

Эксперт/бренд: ${expert || "-"}
Ниша: ${niche || "-"}
Аудитория: ${audience || "-"}
Тональность: ${tone}
${tovSection}
Тема: ${isCase ? (pain || "история успеха клиента") : topic}
Ключевые факты и УТП: ${details || "нет"}
${caseSection}
${strategySection}

Создай контент:

1. ЗАГОЛОВОК: цепляющий заголовок поста (до 10 слов), учитывая стадию аудитории и рубрику.
2. ХУК: 1-2 предложения которые останавливают скролл. Должен точно бить в боль: "${pain || topic}".
3. ПОСТЫ для платформ: ${names}

Формат поста: ${LENGTH_OPTIONS.find(l=>l.id===length)?.label} — ${LENGTH_OPTIONS.find(l=>l.id===length)?.desc}
Дополнительные требования по платформам:
- Яндекс Дзен: заголовок (до 60 символов) + лид-абзац + основной текст. SEO обязателен. ВАЖНО: никаких символов markdown — никаких ##, **, *, --. Только чистый текст с абзацами.
- LinkedIn: профессиональный тон, бизнес-результаты, личный инсайт. Первая строка = хук. ВАЖНО: никаких символов markdown.

ВАЖНО: если рубрика "Продающий" — пиши о конкретной выгоде и предложении, НЕ рассказывай историю клиента (кейс — это отдельный формат).
ЖЁСТКИЕ требования к объёму для каждой платформы (ОБЯЗАТЕЛЬНО СОБЛЮДАЙ):
${platforms.map(pid=>{const lim=LENGTH_OPTIONS.find(l=>l.id===length)?.limits;return `- ${PLATFORMS.find(p=>p.id===pid)?.label}: ${lim?.[pid]||""}`}).join("\n")}
Для формата "Тред": пронумеруй каждую часть [1], [2], [3] и т.д. — это отдельные сообщения/ответы.

CTA ОБЯЗАТЕЛЕН в каждом посте: напиши явный призыв "${selectedCta?.label || "по контексту"}" последним абзацем каждого поста. Например "Написать в директ" → "Напишите мне в директ — разберём вашу ситуацию". Прямо и конкретно, не намекай.\n\
Последнее предложение каждого поста должно содержать именно этот призыв к действию. Не перефразируй — CTA должен быть конкретным и явным.

Включи только: ${platforms.join(",")}

ТОЛЬКО валидный JSON без markdown:
{"headline":"заголовок","hook":"хук","telegram":"текст","vk":"текст","facebook":"текст","threads":"текст","instagram":"текст","zen":"текст","linkedin":"текст"}`;

    try {
      const resp = await fetch("/api/claude", {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
        },
        body:JSON.stringify({
          model:"claude-haiku-4-5-20251001",
          max_tokens:3500,
          messages:[{role:"user",content:prompt}],
        }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content.map(b=>b.text||"").join("");
      const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
      setResult(parsed);
      setActiveTab(platforms[0]);
      setStep(4);
    } catch(e) {
      setError("Ошибка: " + e.message);
    }
    setLoading(false);
  }

  const isMobile = useIsMobile();
  const activePlatform = PLATFORMS.find(p=>p.id===activeTab);

  // — API SETUP —

  // — MAIN —
  return (
    <div style={{minHeight:"100vh",background:S.bg,color:S.text,fontFamily:"sans-serif",padding:"20px 20px 80px"}}>
      <div style={{maxWidth:660,margin:"0 auto",padding:isMobile?"0 2px":"0 8px"}}>

        {/* Header */}
        <div style={{textAlign:"center",padding:"24px 0 18px",borderBottom:`1px solid ${S.border}`,marginBottom:20}}>
          <div style={{fontSize:10,letterSpacing:".2em",textTransform:"uppercase",color:S.accent,fontWeight:600,marginBottom:8}}>Content Intelligence</div>
          <h1 style={{fontFamily:"Georgia,serif",fontSize:isMobile?"22px":"clamp(20px,5vw,34px)",color:S.text,lineHeight:1.2,marginBottom:6}}>
            Тема → <span style={{color:S.accent,fontStyle:"italic"}}>стратегия</span> → посты
          </h1>
          <p style={{fontSize:11,color:S.dim}}>Пиллары · Стадия аудитории · Рубрика · CTA · Адаптация под платформы</p>
          <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:14,flexWrap:"wrap",flexDirection:isMobile?"column":"row",alignItems:"center"}}>
            <button onClick={startPost} style={{padding:"10px 22px",borderRadius:10,border:`2px solid ${mode==="post"?S.accent:S.borderL}`,background:mode==="post"?S.accentBg:"#221c15",color:mode==="post"?S.accent:S.muted,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>
              ✦ Создать пост
            </button>
            <button onClick={startCase} style={{padding:"10px 22px",borderRadius:10,border:`2px solid ${mode==="case"?S.accent:S.borderL}`,background:mode==="case"?S.accentBg:"#221c15",color:mode==="case"?S.accent:S.muted,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>
              ⭐ Создать кейс
            </button>
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:16,marginTop:10}}>
            <button onClick={()=>setShowPillarSetup(!showPillarSetup)} style={{fontSize:11,color:S.accent,background:"transparent",border:"none",cursor:"pointer",textDecoration:"underline"}}>
              {pillars.length ? `Пиллары (${pillars.length})` : "Настроить пиллары"}
            </button>
          </div>
        </div>

        {/* Pillar setup panel */}
        {showPillarSetup && (
          <Card>
            <div style={{fontFamily:"Georgia,serif",fontSize:16,color:S.text,marginBottom:4}}>Пиллары контента</div>
            <div style={{fontSize:12,color:S.dim,marginBottom:10,lineHeight:1.6}}>
              <strong style={{color:S.muted}}>Пиллар</strong> — это ключевая тема, вокруг которой строится весь ваш контент. Например, у психолога пиллары могут быть: «Отношения», «Самооценка», «Тревога», «Обо мне».
            </div>
            <div style={{padding:"10px 13px",background:"#0f0e0c",borderRadius:8,border:`1px solid ${S.border}`,marginBottom:14,fontSize:11,color:S.dim,lineHeight:1.7}}>
              💡 По методу Ryan Brock (Pillar-Based Marketing): 3-4 пиллара × 4 угла (причины, ошибки, примеры, решения) = бесконечный поток идей без повторений. Пиллары сохраняются и доступны в каждом посте.
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:12}}>
              {pillars.map((p,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:20,border:`1px solid ${S.accent}`,background:S.accentBg}}>
                  <span style={{fontSize:13,color:S.text}}>{p}</span>
                  <button onClick={()=>removePillar(i)} style={{background:"transparent",border:"none",color:S.dim,cursor:"pointer",fontSize:16,lineHeight:1,padding:0}}>×</button>
                </div>
              ))}
              {pillars.length===0&&<span style={{fontSize:12,color:S.dim,fontStyle:"italic"}}>Пиллары не добавлены</span>}
            </div>
            {pillars.length<4&&(
              <div style={{display:"flex",gap:8}}>
                <input style={{...inp,flex:1}} placeholder="Например: Психология отношений" value={pillarInput} onChange={e=>setPillarInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&savePillar()} />
                <button onClick={savePillar} style={{padding:"10px 18px",borderRadius:9,border:"none",background:S.accent,color:"#0f0e0c",fontWeight:700,cursor:"pointer",fontFamily:"sans-serif",fontSize:13}}>+</button>
              </div>
            )}
          </Card>
        )}

        {/* STEP 1 — Context */}
        {step===1&&(
          <div>
            <Card>
              <div style={{fontFamily:"Georgia,serif",fontSize:17,color:S.text,marginBottom:18,display:"flex",alignItems:"center",gap:9}}>
                <StepNum n="1" /> Контекст эксперта
              </div>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}>
                <div style={{marginBottom:14}}>
                  <Label text="Бренд / имя эксперта" />
                  <input style={inp} placeholder="Сервис ФиксПК / Анна Иванова" value={expert} onChange={e=>setExpert(e.target.value)} />
                </div>
                <div style={{marginBottom:14}}>
                  <Label text="Ниша / сфера" />
                  <input style={inp} placeholder="Ремонт ноутбуков и ПК" value={niche} onChange={e=>setNiche(e.target.value)} />
                </div>
              </div>
              <div style={{marginBottom:14}}>
                <Label text="Целевая аудитория" hint="Возраст, пол, город, интересы, боли" />
                <input style={inp} placeholder="Женщины 35-50, г. Тбилиси, владелицы малого бизнеса" value={audience} onChange={e=>setAudience(e.target.value)} />
              </div>
              <div style={{marginBottom:14}}>
                <Label text="Тональность" />
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {TONES.map(t=>(
                    <button key={t} onClick={()=>setTone(t)} style={{padding:"6px 12px",borderRadius:20,border:`1px solid ${tone===t?S.accent:S.borderL}`,background:tone===t?S.accentBg:"#221c15",color:tone===t?S.accent:S.muted,fontSize:12,cursor:"pointer",fontFamily:"sans-serif"}}>{t}</button>
                  ))}
                </div>
              </div>
              <div style={{marginBottom:14}}>
                <Label text="Голос бренда" hint="Вставь пример поста — приложение напишет в твоём стиле" />
                <textarea style={inp} rows={3} placeholder="Пример твоего поста (необязательно)..." value={toneOfVoice} onChange={e=>setToneOfVoice(e.target.value)} />
              </div>
              <div style={{marginBottom:0}}>
                <Label text="Платформы" />
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {PLATFORMS.map(p=>(
                    <button key={p.id} onClick={()=>toggle(p.id)} style={{padding:"8px 14px",borderRadius:9,border:`1px solid ${platforms.includes(p.id)?S.accent:S.borderL}`,background:platforms.includes(p.id)?S.accentBg:"#221c15",color:platforms.includes(p.id)?S.text:S.muted,fontSize:13,cursor:"pointer",fontFamily:"sans-serif",display:"flex",alignItems:"center",gap:5}}>
                      {p.icon} {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
            <button onClick={()=>setStep(isCase ? 3 : 2)} disabled={platforms.length===0} style={{width:"100%",padding:15,borderRadius:12,border:"none",background:`linear-gradient(135deg,${S.accent},#e8a85a)`,color:"#0f0e0c",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>
              {isCase ? "Далее → Данные кейса" : "Далее → Тема поста"}
            </button>
          </div>
        )}

        {/* STEP 3 — Strategy */}
        {step===3&&(
          <div>
            <Card>
              <div style={{fontFamily:"Georgia,serif",fontSize:17,color:S.text,marginBottom:18,display:"flex",alignItems:"center",gap:9}}>
                <StepNum n="2" /> Стратегия поста
              </div>

              {/* Pillar */}
              <div style={{marginBottom:18}}>
                <Label text="Пиллар контента" hint={pillars.length ? "Выбери основную тему" : "Добавь пиллары через кнопку «Настроить пиллары» вверху"} />
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {pillars.length>0 ? pillars.map((p,i)=>(
                    <button key={i} onClick={()=>setPillar(p)} style={{padding:"8px 14px",borderRadius:9,border:`1px solid ${pillar===p?S.accent:S.borderL}`,background:pillar===p?S.accentBg:"#221c15",color:pillar===p?S.text:S.muted,fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>{p}</button>
                  )) : (
                    <button onClick={()=>setShowPillarSetup(true)} style={{padding:"8px 14px",borderRadius:9,border:`1px dashed ${S.borderL}`,background:"transparent",color:S.dim,fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>+ Добавить пиллары</button>
                  )}
                </div>
              </div>

              {/* Angle */}
              <div style={{marginBottom:18}}>
                <Label text="Угол пиллара" />
                <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:8}}>
                  {PILLAR_ANGLES.map(a=>(
                    <button key={a.id} onClick={()=>setPillarAngle(a.id)} style={{padding:"10px 14px",borderRadius:9,border:`1px solid ${pillarAngle===a.id?S.accent:S.borderL}`,background:pillarAngle===a.id?S.accentBg:"#221c15",color:pillarAngle===a.id?S.text:S.muted,fontSize:13,cursor:"pointer",fontFamily:"sans-serif",textAlign:"left"}}>
                      <div style={{fontWeight:600,marginBottom:2}}>{a.label}</div>
                      <div style={{fontSize:11,opacity:.7}}>{a.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stage */}
              <div style={{marginBottom:18}}>
                <Label text="Стадия аудитории" hint="На каком уровне осознания находится читатель?" />
                <div style={{display:"flex",flexDirection:"column",gap:7}}>
                  {AWARENESS_STAGES.map(s=>(
                    <button key={s.id} onClick={()=>setStage(s.id)} style={{padding:"10px 14px",borderRadius:9,border:`1px solid ${stage===s.id?s.color:S.borderL}`,background:stage===s.id?"rgba(196,149,74,.08)":"#221c15",color:stage===s.id?S.text:S.muted,fontSize:13,cursor:"pointer",fontFamily:"sans-serif",textAlign:"left",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <div>
                        <span style={{fontWeight:600}}>{s.label}</span>
                        <span style={{fontSize:11,color:S.dim,marginLeft:8}}>→ {s.goal}</span>
                      </div>
                      <span style={{fontSize:10,color:s.color,background:"rgba(0,0,0,.2)",padding:"2px 8px",borderRadius:10,flexShrink:0}}>{s.share}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rubric */}
              <div style={{marginBottom:18}}>
                <Label text="Рубрика" />
                <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:8}}>
                  {RUBRICS.map(r=>(
                    <button key={r.id} onClick={()=>setRubric(r.id)} style={{padding:"10px 14px",borderRadius:9,border:`1px solid ${rubric===r.id?S.accent:S.borderL}`,background:rubric===r.id?S.accentBg:"#221c15",color:rubric===r.id?S.text:S.muted,fontSize:13,cursor:"pointer",fontFamily:"sans-serif",textAlign:"left"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                        <span>{r.icon}</span>
                        <span style={{fontWeight:600}}>{r.label}</span>
                        <span style={{fontSize:10,color:S.accent,marginLeft:"auto"}}>{r.share}</span>
                      </div>
                      <div style={{fontSize:11,opacity:.7}}>{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Length */}
              <div style={{marginBottom:18}}>
                <Label text="Длина поста" />
                <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:8}}>
                  {LENGTH_OPTIONS.map(l=>(
                    <button key={l.id} onClick={()=>setLength(l.id)} style={{padding:"10px 14px",borderRadius:9,border:`1px solid ${length===l.id?S.accent:S.borderL}`,background:length===l.id?S.accentBg:"#221c15",color:length===l.id?S.text:S.muted,fontSize:13,cursor:"pointer",fontFamily:"sans-serif",textAlign:"left"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                        <span style={{color:S.accent,fontWeight:700,fontSize:11}}>{l.icon}</span>
                        <span style={{fontWeight:600}}>{l.label}</span>
                      </div>
                      <div style={{fontSize:11,color:S.dim,marginBottom:2}}>{l.desc}</div>
                      {length===l.id && <div style={{fontSize:10,color:"#7a9a6a",marginTop:3,fontStyle:"italic"}}>{l.note}</div>}
                    </button>
                  ))}
                </div>
              </div>
              {/* CTA */}
              <div style={{marginBottom:0}}>
                <Label text="CTA — призыв к действию" />
                <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                  {CTA_OPTIONS.map(c=>(
                    <button key={c.id} onClick={()=>setCta(c.id)} style={{padding:"7px 13px",borderRadius:9,border:`1px solid ${cta===c.id?S.accent:S.borderL}`,background:cta===c.id?S.accentBg:"#221c15",color:cta===c.id?S.accent:S.muted,fontSize:12,cursor:"pointer",fontFamily:"sans-serif",display:"flex",alignItems:"center",gap:5}}>
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setStep(2)} style={{flex:1,padding:12,borderRadius:10,border:`1px solid ${S.border}`,background:"transparent",color:S.dim,fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>← Назад</button>
              <button onClick={()=>generate()} style={{flex:3,padding:15,borderRadius:12,border:"none",background:`linear-gradient(135deg,${S.accent},#e8a85a)`,color:"#0f0e0c",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>
                ✦ Создать посты
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — Topic */}
        {step===2&&(
          <div>
            <Card>
              <div style={{fontFamily:"Georgia,serif",fontSize:17,color:S.text,marginBottom:18,display:"flex",alignItems:"center",gap:9}}>
                <StepNum n={isCase?"2":"3"} /> {isCase ? "Данные кейса" : "Тема поста"}
              </div>

              {isCase ? (
                <>
                  <div style={{padding:"12px 14px",background:"rgba(196,149,74,.08)",borderRadius:10,border:`1px solid ${S.borderL}`,marginBottom:18}}>
                    <div style={{fontSize:12,color:S.accent,fontWeight:600,marginBottom:4}}>⭐ История успеха · Было → стало → результат</div>
                    <div style={{fontSize:11,color:S.dim,lineHeight:1.6}}>Опиши реальный кейс — конкретные детали создают доверие. Приложение оформит историю под каждую платформу.</div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                    <div>
                      <Label text="Клиент / герой кейса" hint="Имя, возраст, профессия" />
                      <input style={inp} placeholder="Мария, 42 года, бухгалтер" value={caseClient} onChange={e=>setCaseClient(e.target.value)} />
                    </div>
                    <div>
                      <Label text="Контекст / ниша клиента" />
                      <input style={inp} placeholder="Работает из дома, ноутбук — основной инструмент" value={caseNiche} onChange={e=>setCaseNiche(e.target.value)} />
                    </div>
                  </div>
                  <div style={{marginBottom:14}}>
                    <Label text="БЫЛО — ситуация до" hint="Проблема, боль, с чем пришёл клиент" />
                    <textarea style={inp} rows={3} placeholder="Ноутбук перегревался и выключался сам по себе каждые 30 минут. Работать было невозможно — срывались дедлайны..." value={caseBefore} onChange={e=>setCaseBefore(e.target.value)} />
                  </div>
                  <div style={{marginBottom:14}}>
                    <Label text="СТАЛО — что сделали" hint="Процесс, действия, решение" />
                    <textarea style={inp} rows={3} placeholder="Провели полную чистку от пыли, заменили термопасту, проверили систему охлаждения..." value={caseAfter} onChange={e=>setCaseAfter(e.target.value)} />
                  </div>
                  <div style={{marginBottom:14}}>
                    <Label text="РЕЗУЛЬТАТ — цифры, факты, эмоции" hint="Конкретные измеримые изменения" />
                    <textarea style={inp} rows={3} placeholder="Температура процессора снизилась с 92° до 54°. Ноутбук работает без сбоев уже 4 месяца. Клиент написал: «Как будто новый купила!»" value={caseResult} onChange={e=>setCaseResult(e.target.value)} />
                  </div>
                  <div style={{marginBottom:0}}>
                    <Label text="Боль / урок для аудитории" hint="Что должен вынести читатель из этой истории" />
                    <input style={inp} placeholder="Регулярная чистка продлевает жизнь ноутбука на годы" value={pain} onChange={e=>setPain(e.target.value)} />
                  </div>
                </>
              ) : (
                <>
                  <div style={{marginBottom:14}}>
                    <Label text="Тема поста" />
                    <textarea style={inp} rows={2} placeholder="Например: чистка ноутбука от пыли" value={topic} onChange={e=>setTopic(e.target.value)} />
                  </div>
                  <div style={{marginBottom:14}}>
                    <Label text="Боль аудитории" hint="Что конкретно болит у читателя — одна конкретная боль" />
                    <input style={inp} placeholder="Например: боится что ноутбук сломается и потеряет все данные" value={pain} onChange={e=>setPain(e.target.value)} />
                  </div>
                  <div style={{marginBottom:14}}>
                    <Label text="Ключевые факты и УТП" hint="Что обязательно отразить — цифры, преимущества, детали" />
                    <textarea style={inp} rows={4} placeholder={"Что важно донести:\n— чистка каждые 6-12 месяцев\n— стоимость 50 лари\n— доставка курьером после ремонта"} value={details} onChange={e=>setDetails(e.target.value)} />
                  </div>
                </>
              )}

              {/* Strategy summary */}
              <div style={{padding:"10px 14px",background:"#0f0e0c",borderRadius:9,border:`1px solid ${S.border}`,fontSize:11,color:S.dim,lineHeight:1.7}}>
                {[
                  pillar && `📌 Пиллар: ${pillar}`,
                  pillarAngle && `📐 Угол: ${PILLAR_ANGLES.find(a=>a.id===pillarAngle)?.label}`,
                  stage && `👥 Стадия: ${selectedStage?.label}`,
                  rubric && `📂 Рубрика: ${selectedRubric?.icon} ${selectedRubric?.label}`,
                  cta && `🎯 CTA: ${selectedCta?.label}`,
                ].filter(Boolean).join("  ·  ") || "Стратегия не выбрана"}
              </div>
            </Card>

            {loading ? (
              <Card>
                <div style={{textAlign:"center",padding:"10px 0"}}>
                  <div style={{width:28,height:28,border:`2px solid ${S.border}`,borderTopColor:S.accent,borderRadius:"50%",animation:"sp .8s linear infinite",margin:"0 auto 12px"}} />
                  <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
                  <p style={{fontSize:13,color:S.muted}}>Создаю заголовок, хук и посты…</p>
                </div>
              </Card>
            ) : (
              <>
                {isCase ? (
                  <button onClick={generate} disabled={!caseBefore.trim()} style={{width:"100%",padding:15,borderRadius:12,border:"none",background:!caseBefore.trim()?S.border:`linear-gradient(135deg,${S.accent},#e8a85a)`,color:!caseBefore.trim()?S.dim:"#0f0e0c",fontSize:15,fontWeight:700,cursor:caseBefore.trim()?"pointer":"not-allowed",fontFamily:"sans-serif",marginBottom:10}}>
                    ⭐ Создать кейс-посты
                  </button>
                ) : (
                  <button onClick={()=>setStep(3)} disabled={!topic.trim()} style={{width:"100%",padding:15,borderRadius:12,border:"none",background:!topic.trim()?S.border:`linear-gradient(135deg,${S.accent},#e8a85a)`,color:!topic.trim()?S.dim:"#0f0e0c",fontSize:15,fontWeight:700,cursor:topic.trim()?"pointer":"not-allowed",fontFamily:"sans-serif",marginBottom:10}}>
                    Далее → Стратегия поста
                  </button>
                )}
                {error&&<p style={{color:"#e05c5c",fontSize:13,textAlign:"center",marginBottom:10}}>{error}</p>}
                <button onClick={()=>setStep(1)} style={{width:"100%",padding:10,borderRadius:10,border:`1px solid ${S.border}`,background:"transparent",color:S.dim,fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>← Назад</button>
              </>
            )}
          </div>
        )}

        {/* STEP 4 — Result */}
        {step===4&&result&&(
          <div>
            {/* Strategy badge */}
            <div style={{padding:"10px 16px",background:S.card,border:`1px solid ${S.border}`,borderRadius:10,marginBottom:14,fontSize:11,color:S.dim,lineHeight:1.9,display:"flex",flexWrap:"wrap",gap:2,alignItems:"center"}}>
              {[
                length && {label:"📏 Формат:", value:LENGTH_OPTIONS.find(l=>l.id===length)?.label},
                pillar && {label:"📌 Пиллар:", value:pillar},
                pillarAngle && {label:"📐 Угол:", value:PILLAR_ANGLES.find(a=>a.id===pillarAngle)?.label},
                stage && {label:"👥 Стадия:", value:selectedStage?.label},
                rubric && {label:`${selectedRubric?.icon} Рубрика:`, value:selectedRubric?.label},
                cta && {label:"🎯 CTA:", value:selectedCta?.label},
              ].filter(Boolean).map((item,i)=>(
                <span key={i} style={{marginRight:14,whiteSpace:"nowrap"}}>
                  {item.label} <em style={{color:S.muted,fontStyle:"italic",fontWeight:600}}>{item.value}</em>
                </span>
              ))}
            </div>

            {/* Headline + Hook */}
            <Card accent>
              <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".1em",color:S.accent,fontWeight:600,marginBottom:8}}>Заголовок поста</div>
              <div style={{fontFamily:"Georgia,serif",fontSize:20,color:S.text,lineHeight:1.3,marginBottom:16}}>{result.headline}</div>
              <div style={{height:1,background:S.border,marginBottom:14}} />
              <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".1em",color:S.accent,fontWeight:600,marginBottom:8}}>Хук</div>
              <div style={{fontSize:14,color:S.muted,lineHeight:1.7,fontStyle:"italic"}}>{result.hook}</div>
              <div style={{display:"flex",justifyContent:"flex-end",marginTop:12}}>
                <CopyBtn text={result.headline+"\n\nХук: "+result.hook} />
              </div>
            </Card>

            {/* Tabs */}
            <div style={{display:"flex",flexWrap:"wrap",gap:isMobile?5:6,marginBottom:12}}>
              {PLATFORMS.filter(p=>platforms.includes(p.id)).map(p=>(
                <button key={p.id} onClick={()=>setActiveTab(p.id)} style={{padding:"8px 14px",borderRadius:9,border:`1px solid ${activeTab===p.id?S.accent:S.borderL}`,background:activeTab===p.id?S.accentBg:"#221c15",color:activeTab===p.id?S.accent:S.muted,fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>

            {/* Post */}
            <div style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:12,overflow:"hidden",marginBottom:14}}>
              <div style={{padding:"12px 18px",borderBottom:`1px solid ${S.border}`,fontSize:14,fontWeight:600,color:S.accent,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span>{activePlatform?.icon} {activePlatform?.label}</span>
                <span style={{fontSize:11,color:S.dim,fontWeight:400}}>{(result[activeTab]||"").split(/\s+/).filter(Boolean).length} слов</span>
              </div>
              <div style={{padding:18,fontSize:14,lineHeight:1.85,color:"#d8d0c4",whiteSpace:"pre-wrap"}}>{result[activeTab]||"—"}</div>
              <div style={{padding:"10px 18px",borderTop:`1px solid ${S.border}`,display:"flex",justifyContent:"flex-end"}}>
                <CopyBtn text={result.headline+"\n\n"+result[activeTab]} />
              </div>
            </div>

            <div style={{display:"flex",gap:8,marginBottom:8,flexDirection:isMobile?"column":"row"}}>
              <button onClick={()=>{setResult(null);generate();}} style={{flex:1,padding:12,borderRadius:10,border:`1px solid ${S.accent}`,background:S.accentBg,color:S.accent,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                ↻ Сгенерировать заново
              </button>
            </div>
            <div style={{display:"flex",gap:8,flexDirection:isMobile?"column":"row"}}>
              <button onClick={()=>{setResult(null);setStep(3);}} style={{flex:1,padding:12,borderRadius:10,border:"none",background:`linear-gradient(135deg,${S.accent},#e8a85a)`,color:"#0f0e0c",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>
                Изменить тему
              </button>
              <button onClick={()=>{setResult(null);setStep(2);}} style={{flex:1,padding:12,borderRadius:10,border:`1px solid ${S.border}`,background:"transparent",color:S.dim,fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>
                Изменить стратегию
              </button>
              <button onClick={()=>{setResult(null);setTopic("");setDetails("");setPain("");setCaseBefore("");setCaseAfter("");setCaseResult("");setStep(1);}} style={{flex:1,padding:12,borderRadius:10,border:`1px solid ${S.border}`,background:"transparent",color:S.dim,fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>
                Заново
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

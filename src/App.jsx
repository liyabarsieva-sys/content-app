import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "",
  import.meta.env.VITE_SUPABASE_ANON_KEY || ""
);

const PLATFORM_FREQ_HINTS = {
  telegram:  { rec: 3,  hint: "3-5 в нед",   max: 7  },
  vk:        { rec: 3,  hint: "3-5 в нед",   max: 7  },
  facebook:  { rec: 4,  hint: "4-5 в нед",   max: 7  },
  threads:   { rec: 14, hint: "1-3 в день",  max: 21 },
  instagram: { rec: 4,  hint: "4-5 в нед",   max: 7  },
  zen:       { rec: 2,  hint: "1-3 в нед",   max: 5  },
  linkedin:  { rec: 3,  hint: "3-5 в нед",   max: 7  },
  yt_shorts: { rec: 5,  hint: "3-7 в нед",   max: 14 },
  yt_long:   { rec: 1,  hint: "1-2 в нед",   max: 4  },
};

const RUBRIC_SORDELL_MAP = {
  expert:    ["professional_unexpected", "professional_known"],
  personal:  ["personal_unexpected", "personal_known"],
  engaging:  ["personal_unexpected", "professional_unexpected", "personal_known", "professional_known"],
  pain:      ["personal_unexpected", "professional_unexpected", "personal_known", "professional_known"],
  selling:   ["professional_unexpected", "professional_known"],
};

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
  { id: "yt_shorts", label: "YouTube Shorts", icon: "▶️" },
  { id: "yt_long",   label: "YouTube видео",  icon: "🎬" },
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
      linkedin:"150-200 слов. Профессиональный тон.",
      yt_shorts:"Сценарий 130-150 слов. [ХУК 0-5 сек] + [ОСНОВНОЕ] + [CTA]. Под 60 сек.",
      yt_long:"Сценарный план: заголовок + SEO описание + 5-7 блоков с тезисами (10-20 мин видео)"
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
      linkedin:"300-400 слов. Экспертная колонка.",
      yt_shorts:"Сценарий 130-150 слов под 60 сек. Хук + мысль + CTA.",
      yt_long:"Сценарный план: заголовок + SEO описание + 7-10 блоков (20-30 мин видео)"
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
      linkedin:"Пост 150 слов + 3 комментария-тезиса.",
      yt_shorts:"Серия 3-5 сценариев Shorts по 130-150 слов.",
      yt_long:"Серия: план для 3-4 роликов с заголовками и структурой"
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
  { id: "aware",     label: "Осознаёт проблему",      goal: "углубить понимание",          share: "25%", color: "#7a9a5a" },
  { id: "seeking",   label: "Ищет решение",           goal: "показать правильный путь",    share: "20%", color: "#9a8a4a" },
  { id: "choosing",  label: "Выбирает решение",       goal: "сформировать доверие",        share: "10%", color: "#c4954a" },
  { id: "ready",     label: "Готов к покупке",        goal: "перевести в действие",        share: "5%",  color: "#c46a4a" },
];

const RUBRICS = [
  { id: "expert",    label: "Экспертный",    desc: "Знания, факты, разборы",         share: "30%", icon: "🎓" },
  { id: "personal",  label: "Личный",        desc: "История, опыт, за кулисами",     share: "20%", icon: "💬" },
  { id: "engaging",  label: "Вовлекающий",   desc: "Вопросы, опросы, дискуссии",     share: "20%", icon: "🔥" },
  { id: "pain",      label: "Боль/Проблема", desc: "Закрываем страхи и возражения",  share: "20%", icon: "💊" },
  { id: "selling",   label: "Продающий",     desc: "Конкретное предложение, выгода, призыв",   share: "10%", icon: "💰" },

];

const SORDELL_MATRIX = [
  {
    id: "personal_unexpected",
    label: "Личное + Неожиданное",
    icon: "⚡",
    share: "40%",
    desc: "Личная история которая нарушает ожидание",
    hint: "Самый мощный квадрат. Личный опыт + неожиданный угол. Например: «12 лет практики — и вот что противоречит тому чему меня учили»",
    prompt: "Пиши от первого лица, делись личным опытом автора. Нарушай ожидание читателя — скажи то что эксперты обычно не говорят. Уязвимость + неожиданный поворот."
  },
  {
    id: "professional_unexpected",
    label: "Профессиональное + Неожиданное",
    icon: "🔥",
    share: "30%",
    desc: "Экспертная тема с провокационным углом",
    hint: "Строит авторитет. Возьми профессиональную тему — но скажи о ней так как никто другой. Например: «Самый вредный совет который все дают»",
    prompt: "Экспертный контент с неожиданным углом. Нарушай общепринятое мнение, опровергай популярные советы, показывай то что противоречит ожиданиям. Строй репутацию мыслителя."
  },
  {
    id: "personal_known",
    label: "Личное + Известное",
    icon: "💬",
    share: "20%",
    desc: "Личная история на привычную для аудитории тему",
    hint: "Поддерживает тепло и связь с аудиторией. Высокое доверие, умеренный охват.",
    prompt: "Пиши от первого лица, делись личным опытом на тему которую аудитория ожидает. Тепло, уязвимо, человечно."
  },
  {
    id: "professional_known",
    label: "Профессиональное + Известное",
    icon: "📚",
    share: "10%",
    desc: "Экспертный контент на стандартные темы ниши",
    hint: "База и онбординг новых подписчиков. Не больше 10% от всего контента.",
    prompt: "Экспертный контент на стандартную тему ниши. Чёткое объяснение, факты, структура."
  },
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
  bg: "#f4f1ec", card: "#ffffff", cardAlt: "#f4f1ec",
  input: "#ffffff", border: "#d8d0e0", borderL: "#d8d0e0",
  text: "#362d52", muted: "#9a88b8", dim: "#5c4e7a",
  accent: "#362d52", accentBg: "rgba(54,45,82,.08)",
  header: "#362d52", signal: "#e1df2c",
};


const inp = {
  width:"100%", background:"#f0eef8", border:"1px solid #d8d0e0",
  borderRadius:8, padding:"11px 14px", color:"#362d52",
  fontSize:13, outline:"none", resize:"none", fontFamily:"'Nunito Sans', sans-serif",
  boxSizing:"border-box",
};
const inpAuto = { ...inp, resize:"none", overflow:"hidden", minHeight:42, lineHeight:1.5 };

function Label({ text, hint, share }) {
  return (
    <div style={{ marginBottom: hint ? 3 : 7 }}>
      <div style={{ fontSize:11, color:"#5c4e7a", textTransform:"uppercase", letterSpacing:".08em", fontWeight:600, display:"flex", alignItems:"center", gap:8 }}>
        {text}
        {share && <span style={{ fontSize:10, color:"#362d52", background:"#e1df2c", padding:"1px 7px", borderRadius:10, fontWeight:700 }}>{share} контент-плана</span>}
      </div>
      {hint && <div style={{ fontSize:11, color:"#5c4e7a", marginTop:2, fontStyle:"italic" }}>{hint}</div>}
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
  return <span style={{ width:26, height:26, background:S.accent, color:"#f4f1ec", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, flexShrink:0 }}>{n}</span>;
}

function SordellCard({ t, onCreatePost }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <div style={{padding:"12px 14px",background:t.top?"#f4f1ec":"#fafafa",borderRadius:10,border:t.top?"2px solid #362d52":"1px solid #e8e0f0"}}>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
        {t.top && <span style={{fontSize:16}}>⭐</span>}
        <span style={{fontSize:10,background:t.quadrant?.includes("Личное")?"#e1df2c":"rgba(54,45,82,.08)",color:"#362d52",padding:"1px 8px",borderRadius:6,fontWeight:700}}>{t.quadrant}</span>
      </div>
      <div style={{fontSize:14,fontWeight:600,color:"#362d52",marginBottom:4,lineHeight:1.4}}>{t.topic}</div>
      <div style={{fontSize:12,color:"#5c4e7a",fontStyle:"italic",marginBottom:t.top?8:8,lineHeight:1.5}}>💡 {t.hook}</div>
      {t.top && t.reason && (
        <div style={{fontSize:11,color:"#7a6a9a",background:"rgba(54,45,82,.05)",padding:"6px 10px",borderRadius:7,marginBottom:8,lineHeight:1.5}}>🔥 {t.reason}</div>
      )}
      <div style={{display:"flex",gap:6}}>
        <button onClick={onCreatePost} style={{flex:2,padding:"6px 10px",borderRadius:7,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:11,fontWeight:700,cursor:"pointer"}}>
          ✦ Создать пост
        </button>
        <button onClick={()=>{navigator.clipboard.writeText(t.topic+"\n"+t.hook);setCopied(true);setTimeout(()=>setCopied(false),1500);}}
          style={{flex:1,padding:"6px 10px",borderRadius:7,border:"1px solid #d8d0e0",background:"#fff",color:copied?"#4a9a6a":"#5c4e7a",fontSize:11,cursor:"pointer"}}>
          {copied?"✓":"📋"}
        </button>
      </div>
    </div>
  );
}

function formatPlanText(planResult, period) {
  const header = `КОНТЕНТ-ПЛАН · ${period === "week" ? "НЕДЕЛЯ" : "МЕСЯЦ"} · ${planResult.length} постов\n${"─".repeat(50)}\n\n`;
  const posts = planResult.map((post, i) => {
    const plat = PLATFORMS.find(p => p.id === post.platform);
    return [
      `${post.day} · ${plat ? plat.label : post.platform || ""}`,
      `Функция: ${post.function || "—"}`,
      `Тема: ${post.topic}`,
      `Блок: ${post.block || "—"}`,
      `Стадия: ${post.stage || "—"}`,
      `Угол: ${post.sordell || "—"}`,
    ].join("\n");
  }).join("\n\n" + "─".repeat(40) + "\n\n");
  return header + posts;
}

function CopyAllPlanBtn({ planResult }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button onClick={()=>{
      navigator.clipboard.writeText(formatPlanText(planResult));
      setCopied(true);
      setTimeout(()=>setCopied(false), 2000);
    }} style={{padding:"8px 14px",borderRadius:8,border:"1px solid #362d52",background:"transparent",color:copied?"#4a9a6a":"#362d52",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>
      {copied ? "✓ Скопировано" : "📋 Копировать всё"}
    </button>
  );
}

function DownloadPlanBtn({ planResult, period }) {
  return (
    <button onClick={()=>{
      const text = formatPlanText(planResult, period);
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `контент-план-${period === "week" ? "неделя" : "месяц"}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }} style={{padding:"8px 14px",borderRadius:8,border:"1px solid #362d52",background:"#362d52",color:"#f4f1ec",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>
      ⬇ Скачать .txt
    </button>
  );
}

function PlanCard({ post, onCreatePost }) {
  const [copied, setCopied] = React.useState(false);
  const platInfo = PLATFORMS.find(p=>p.id===post.platform);
  return (
    <div style={{padding:"12px 14px",background:"#f4f1ec",borderRadius:10,border:"1px solid #e8e0f0"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6,flexWrap:"wrap",gap:4}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:11,fontWeight:700,color:"#362d52",textTransform:"uppercase",letterSpacing:".06em"}}>{post.day}</span>
          {platInfo && <span style={{fontSize:10,background:"#362d52",color:"#f4f1ec",padding:"1px 8px",borderRadius:6,fontWeight:600}}>{platInfo.icon} {platInfo.label}</span>}
        </div>
        {post.function && <span style={{fontSize:10,background:"#e1df2c",color:"#362d52",padding:"1px 8px",borderRadius:8,fontWeight:700}}>{post.function}</span>}
      </div>
      <div style={{fontSize:14,fontWeight:600,color:"#362d52",marginBottom:8,lineHeight:1.4}}>{post.topic}</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>
        {post.block && <span style={{fontSize:10,background:"rgba(54,45,82,.08)",color:"#5c4e7a",padding:"2px 8px",borderRadius:6}}>📌 {post.block}</span>}
        {post.stage && <span style={{fontSize:10,background:"rgba(54,45,82,.08)",color:"#5c4e7a",padding:"2px 8px",borderRadius:6}}>👥 {post.stage}</span>}
        {post.sordell && <span style={{fontSize:10,background:"rgba(54,45,82,.08)",color:"#5c4e7a",padding:"2px 8px",borderRadius:6}}>{post.sordell}</span>}
      </div>
      <div style={{display:"flex",gap:6}}>
        <button onClick={onCreatePost} style={{flex:2,padding:"7px 10px",borderRadius:8,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:11,fontWeight:700,cursor:"pointer"}}>
          ✦ Создать пост
        </button>
        <button onClick={()=>{navigator.clipboard.writeText(post.topic);setCopied(true);setTimeout(()=>setCopied(false),1500);}}
          style={{flex:1,padding:"7px 10px",borderRadius:8,border:"1px solid #d8d0e0",background:"#fff",color:copied?"#4a9a6a":"#5c4e7a",fontSize:11,cursor:"pointer"}}>
          {copied?"✓ Скопировано":"📋 Скопировать"}
        </button>
      </div>
    </div>
  );
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
  const [sordellQuad, setSordellQuad] = useState("");

  // Mode
  const [mode, setMode] = useState("post"); // "post" | "case" | "plan"

  // Step 3 — content
  const [topic, setTopic] = useState("");
  const [details, setDetails] = useState("");
  const [pain, setPain] = useState("");
  const [caseBefore, setCaseBefore] = useState("");
  const [caseAfter, setCaseAfter] = useState("");
  const [caseResult, setCaseResult] = useState("");
  const [caseClient, setCaseClient] = useState("");
  const [planPeriod, setPlanPeriod] = useState(() => localStorage.getItem("lia_plan_period") || "week");
  const [planMainFreq, setPlanMainFreq] = useState(() => parseInt(localStorage.getItem("lia_plan_freq") || "3"));
  const [planResult, setPlanResult] = useState(() => {
    try { const s = localStorage.getItem("lia_plan_result"); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [sordellStep, setSordellStep] = useState(0);
  const [sordellAnswers, setSordellAnswers] = useState([]);
  const [sordellCurrentAnswer, setSordellCurrentAnswer] = useState("");
  const [sordellResult, setSordellResult] = useState(() => {
    try { const s = localStorage.getItem("lia_sordell_result"); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [sordellAnswersSaved, setSordellAnswersSaved] = useState(() => {
    try { const s = localStorage.getItem("lia_sordell_answers"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [sordellLoading, setSordellLoading] = useState(false);
  const [sordellError, setSordellError] = useState("");
  const [planPlatformFreqs, setPlanPlatformFreqs] = useState(() => {
    try { const s = localStorage.getItem("lia_plan_freqs"); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });
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
  useEffect(() => { localStorage.setItem("lia_plan_period", planPeriod); }, [planPeriod]);
  useEffect(() => { localStorage.setItem("lia_plan_freq", String(planMainFreq)); }, [planMainFreq]);
  useEffect(() => { if (planResult) localStorage.setItem("lia_plan_result", JSON.stringify(planResult)); }, [planResult]);
  useEffect(() => { localStorage.setItem("lia_plan_freqs", JSON.stringify(planPlatformFreqs)); }, [planPlatformFreqs]);
  useEffect(() => { localStorage.setItem("lia_niche", niche); }, [niche]);
  useEffect(() => { localStorage.setItem("lia_audience", audience); }, [audience]);

  // Auth
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" | "signup"
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // History
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const [suggestingPillars, setSuggestingPillars] = useState(false);
  const [suggestedPillars, setSuggestedPillars] = useState([]);

  async function suggestPillars() {
    if (!niche && !audience) { return; }
    setSuggestingPillars(true);
    const prompt = `Ты опытный контент-стратег. Предложи 4 смысловых блока (темы) для контента эксперта.

Ниша: ${niche || "не указана"}
Аудитория: ${audience || "не указана"}
Тональность: ${tone}
${toneOfVoice ? `Голос бренда / пример поста: ${toneOfVoice}` : ""}

Смысловой блок — это широкая тема вокруг которой строится контент. По методу Pillar-Based Marketing: 3-4 блока × 4 угла = бесконечный поток идей.

Требования:
- Ровно 4 блока
- Каждый блок 2-4 слова, конкретный и понятный
- Релевантны нише и аудитории
- Не повторяют друг друга по смыслу
- На русском языке

ТОЛЬКО валидный JSON: {"pillars":["блок 1","блок 2","блок 3","блок 4"]}`;

    try {
      const resp = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:300, messages:[{role:"user",content:prompt}] }),
      });
      const data = await resp.json();
      const text = data.content.map(b=>b.text||"").join("");
      const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
      setSuggestedPillars(parsed.pillars || []);
    } catch(e) { console.error(e); }
    setSuggestingPillars(false);
  }

  // Auth effects
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setAuthLoading(false);
      if (session?.user) loadHistory(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) loadHistory(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadHistory(userId) {
    const { data } = await supabase
      .from("generations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);
    if (data) setHistory(data);
  }

  async function saveGeneration(type, topicText, resultData, strategyData) {
    if (!user) return;
    const { data } = await supabase.from("generations").insert({
      user_id: user.id,
      type,
      topic: topicText,
      result: resultData,
      strategy: strategyData,
    }).select();
    if (data) setHistory(prev => [data[0], ...prev].slice(0, 30));
  }

  async function deleteGeneration(id) {
    await supabase.from("generations").delete().eq("id", id);
    setHistory(prev => prev.filter(h => h.id !== id));
  }

  async function signUp() {
    setAuthError(""); setAuthSuccess("");
    const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
    if (error) setAuthError(error.message);
    else setAuthSuccess("Проверьте почту для подтверждения регистрации");
  }

  async function signIn() {
    setAuthError(""); setAuthSuccess("");
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    if (error) setAuthError("Неверный email или пароль");
    else setShowAuth(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setHistory([]);
    setShowHistory(false);
  }

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
  function startPlan() { setMode("plan"); setStep(1); setPlanResult(null); setResult(null); }
  function startSordell() {
    if (sordellResult) {
      // Already have results - show them directly
      setMode("sordell"); setSordellStep(13);
    } else {
      // Start fresh interview
      setMode("sordell"); setStep(1); setSordellStep(0); setSordellAnswers([]); setSordellCurrentAnswer(""); setPlanResult(null);
    }
  }
  function startSordellFresh() { setMode("sordell"); setStep(1); setSordellStep(0); setSordellAnswers([]); setSordellCurrentAnswer(""); setSordellResult(null); localStorage.removeItem("lia_sordell_result"); setPlanResult(null); }
  function startPost() { setMode("post"); setStep(1); setResult(null); }

  function toggle(id) {
    setPlatforms(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  }

  const selectedStage = AWARENESS_STAGES.find(s => s.id === stage);
  const painHintByStage = {
    unaware:  "Симптом, а не диагноз. Что человек чувствует, но ещё не называет проблемой? Например: «почему я всегда чувствую вину»",
    aware:    "Боль уже признана. Что он осознаёт но не может изменить? Например: «понимаю что это разрушает, но не могу уйти»",
    seeking:  "Боль от безуспешных попыток. Что пробовал — не сработало? Например: «пробовал(а) терапию, но ничего не изменилось»",
    choosing: "Боль сомнения и выбора. Что мешает принять решение? Например: «не знаю какой подход мне подойдёт»",
    ready:    "Боль промедления. Что теряет каждый день без решения? Например: «уже год собираюсь, но так и не начал(а)»",
  };
  const currentPainHint = stage ? painHintByStage[stage] : "Что конкретно болит у читателя — одна конкретная боль";
  const selectedSordell = SORDELL_MATRIX.find(q => q.id === sordellQuad);
  const selectedRubric = RUBRICS.find(r => r.id === rubric);
  const selectedCta = CTA_OPTIONS.find(c => c.id === cta);
  const isCase = mode === "case";
  const isPlan = mode === "plan";

  const SORDELL_QUESTIONS = [
    {
      q: "Что вы думаете во время работы — но никогда не говорите вслух?",
      hint: "Любая мысль которую вы удерживаете из вежливости, осторожности или привычки. Например: «этот подход не работает но все его рекомендуют» или «клиенты часто сами мешают своему прогрессу».",
      tag: "🔒 Квадрат 2: Личное + Неожиданное"
    },
    {
      q: "Что в вашей работе идёт вразрез с тем чему вас учили — и оказалось правдой?",
      hint: "Момент когда теория расходится с практикой. Что вы открыли сами, через опыт, что противоречит «учебнику»?",
      tag: "🔥 Квадрат 4: Профессиональное + Неожиданное"
    },
    {
      q: "Через что вы прошли лично — и что изменило ваш профессиональный взгляд?",
      hint: "Не советы — а ваш собственный опыт. Провал, разочарование, открытие, поворотный момент. Сорделл называет это «уязвимость прошлого» — самый безопасный и сильный тип личного контента.",
      tag: "⚡ Квадрат 2: Личное + Неожиданное"
    },
    {
      q: "Какой популярный совет в вашей нише — на самом деле не работает или даже вреден?",
      hint: "Что все повторяют как мантру — а вы знаете что это упрощение или ложь? Не нужно атаковать коллег — просто назовите паттерн честно.",
      tag: "🔥 Квадрат 4: Профессиональное + Неожиданное"
    },
    {
      q: "Что вы перестали делать в своей работе — хотя раньше считали это обязательным?",
      hint: "Это может быть метод, подход, убеждение, привычка. Почему вы от этого отказались? Что поняли? Это часто становится самым сильным постом.",
      tag: "⚡ Квадрат 2: Личное + Неожиданное"
    },
    {
      q: "Что клиенты или аудитория хотят от вас услышать — но это неправда?",
      hint: "Люди часто ждут простого ответа на сложный вопрос. Быстрого результата. Волшебной таблетки. Что вы знаете что это не работает — но говорить об этом некомфортно?",
      tag: "🔥 Квадрат 4: Профессиональное + Неожиданное"
    },
    {
      q: "Что произошло в вашей практике или карьере — что вы долго не могли принять или понять?",
      hint: "Не обязательно большой кризис. Может быть маленький момент который что-то сломал или перевернул внутри. Именно такие истории читают до конца.",
      tag: "⚡ Квадрат 2: Личное + Неожиданное"
    },
    {
      q: "Что большинство людей в вашей теме понимают неправильно — хотя уверены что понимают?",
      hint: "Самый частый misconception который вы видите снова и снова. Почему он возникает? Что на самом деле стоит за этим заблуждением?",
      tag: "🔥 Квадрат 4: Профессиональное + Неожиданное"
    },
    {
      q: "О чём в вашей профессии не принято говорить открыто — среди коллег или публично?",
      hint: "Не скандал и не сплетни. Скорее — профессиональное табу. То что все знают но молчат. Выгорание, сомнения, неудачные случаи, конфликты с собственными ценностями.",
      tag: "⚡ Квадрат 2: Личное + Неожиданное"
    },
    {
      q: "С каким убеждением в вашей нише вы категорически не согласны?",
      hint: "Профессиональный консенсус с которым вы спорите. Не нужно быть правым — важно иметь позицию и объяснить её. Именно полярность мнений создаёт вовлечённость.",
      tag: "🔥 Квадрат 4: Профессиональное + Неожиданное"
    },
    {
      q: "Что вы хотели бы знать когда только начинали — и чему вас никто не научил?",
      hint: "Это может быть про профессию, про бизнес, про себя. Что вы «купили» ценой ошибок, времени или боли — и что могли бы передать другому?",
      tag: "⚡ Квадрат 2: Личное + Неожиданное"
    },
    {
      q: "Если бы вы писали один честный пост о своей работе — без фильтров и без страха — о чём бы он был?",
      hint: "Последний вопрос — самый важный. Не думайте о том как это воспримут. Просто напишите что приходит первым. Часто именно это и есть самый сильный контент.",
      tag: "⚡ Квадрат 2: Личное + Неожиданное"
    },
  ];

  async function generateSordellResult() {
    setSordellLoading(true); setSordellError("");
    const qa = SORDELL_QUESTIONS.map((q,i) => `Вопрос ${i+1}: ${q.q}\nОтвет: ${sordellAnswers[i]||"-"}`).join("\n\n");
    const prompt = `Ты — контент-стратег по личным брендам. Проанализируй ответы эксперта и найди сильные темы для контента.

Эксперт: ${expert||"-"}. Ниша: ${niche||"-"}.

ОТВЕТЫ НА ВОПРОСЫ:
${qa}

ЗАДАЧА:
1. Выдели 10 самых сильных тем для контента на основе ответов
2. Для каждой темы напиши готовый хук — первую строку поста до 12 слов
3. Укажи квадрант матрицы Сорделл: "Личное + Неожиданное" или "Профессиональное + Неожиданное"
4. Отметь топ-3 темы с наибольшим потенциалом охвата и объясни почему (поле top:true)

ТОЛЬКО валидный JSON:
{"topics":[{"n":1,"topic":"тема","hook":"хук до 12 слов","quadrant":"Личное + Неожиданное","top":false,"reason":""}]}`;

    try {
      const resp = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:4000, messages:[{role:"user",content:prompt}] }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content.map(b=>b.text||"").join("");
      let parsed;
      try { parsed = JSON.parse(text.replace(/```json|```/g,"").trim()); }
      catch { setSordellError("Ошибка разбора. Попробуй снова."); setSordellLoading(false); return; }
      setSordellResult(parsed.topics);
      localStorage.setItem("lia_sordell_result", JSON.stringify(parsed.topics));
      localStorage.setItem("lia_sordell_answers", JSON.stringify(sordellAnswers));
      setSordellStep(13);
    } catch(e) { setSordellError("Ошибка: " + e.message); }
    setSordellLoading(false);
  }

  async function generatePlan() {
    setLoading(true); setError("");

    const weekTotal = platforms.reduce((sum,pid)=>sum+(planPlatformFreqs[pid]??PLATFORM_FREQ_HINTS[pid]?.rec??3),0);
    const totalPosts = planPeriod === "week" ? weekTotal : weekTotal * 4;
    const blocksText = pillars.length > 0 ? pillars.join(", ") : "темы ниши";

    // Per-platform breakdown
    const platBreakdown = platforms.map(pid=>{
      const p = PLATFORMS.find(pl=>pl.id===pid);
      const freq = planPlatformFreqs[pid] ?? PLATFORM_FREQ_HINTS[pid]?.rec ?? 3;
      const total = planPeriod==="week" ? freq : freq*4;
      return `${p?.label}: ${total} постов`;
    }).join(", ");

    const dist = {
      unaware:  Math.round(totalPosts * 0.40),
      aware:    Math.round(totalPosts * 0.25),
      seeking:  Math.round(totalPosts * 0.20),
      choosing: Math.round(totalPosts * 0.10),
      ready:    Math.max(1, Math.round(totalPosts * 0.05)),
    };

    const prompt = `Ты опытный контент-стратег. Составь контент-план на ${planPeriod === "week" ? "1 неделю" : "1 месяц"}.

Эксперт: ${expert || "-"}
Ниша: ${niche || "-"}
Аудитория: ${audience || "-"}
Смысловые блоки: ${blocksText}
Тональность: ${tone}

Платформы и количество постов: ${platBreakdown}
Всего постов: ${totalPosts}

СТРОГОЕ распределение по стадиям осознанности (сумма = ${totalPosts}):
- Не осознаёт проблему (40%): ${dist.unaware} постов — заставить задуматься
- Осознаёт проблему (25%): ${dist.aware} постов — углубить понимание
- Ищет решение (20%): ${dist.seeking} постов — показать путь
- Выбирает решение (10%): ${dist.choosing} постов — сформировать доверие
- Готов к покупке (5%): ${dist.ready} постов — перевести в действие

По матрице Сорделл: 40% Личное+Неожиданное, 30% Профессиональное+Неожиданное, 20% Личное+Известное, 10% Профессиональное+Известное.

Для каждого поста укажи платформу из списка: ${platforms.join(", ")}.

Темы должны быть конкретными, цепляющими, на русском языке — не абстрактными.

ТОЛЬКО валидный JSON без markdown:
{"posts":[{"day":"День 1","platform":"telegram","block":"блок","topic":"конкретная тема","stage":"стадия","sordell":"угол по Сорделл","function":"узнавание"}]}`;

    try {
      const resp = await fetch("/api/claude", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:totalPosts > 20 ? 8000 : 5000, messages:[{role:"user",content:prompt}] }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content.map(b=>b.text||"").join("");
      let parsed;
      try { parsed = JSON.parse(text.replace(/```json|```/g,"").trim()); }
      catch { setError("Ошибка разбора. Попробуй снова."); setLoading(false); return; }
      setPlanResult(parsed.posts);
      setStep(5);
      saveGeneration("plan", `План ${planPeriod==="week"?"неделя":"месяц"}`, parsed.posts, { planPeriod, platforms });
    } catch(e) {
      setError("Ошибка: " + e.message);
    }
    setLoading(false);
  }

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
- Смысловой блок контента: ${pillar || "не выбран"}
- Угол блока: ${PILLAR_ANGLES.find(a=>a.id===pillarAngle)?.label || "выбери сам наиболее подходящий из: Причины, Ошибки, Примеры, Решения — исходя из рубрики и стадии аудитории"}
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
2. ХУК: 1-2 предложения которые останавливают скролл. Должен точно бить в боль: "${pain || topic}". ВАЖНО: хук — это отдельный элемент, НЕ повторяй его в теле поста.
3. ПОСТЫ для платформ: ${names}

Формат поста: ${LENGTH_OPTIONS.find(l=>l.id===length)?.label} — ${LENGTH_OPTIONS.find(l=>l.id===length)?.desc}
Дополнительные требования по платформам:
- Яндекс Дзен: заголовок (до 60 символов) + лид-абзац + основной текст. SEO обязателен. ВАЖНО: никаких символов markdown — никаких ##, **, *, --. Только чистый текст с абзацами.
- LinkedIn: профессиональный тон, бизнес-результаты, личный инсайт. Первая строка = хук. ВАЖНО: никаких символов markdown.
- YouTube Shorts: пиши СЦЕНАРИЙ для видео до 60 секунд (~130-150 слов). Структура: [ХУК 0-5 сек] — цепляющее открытие, [ОСНОВНОЕ] — одна чёткая мысль, [CTA] — призыв. Разговорный живой язык, без воды. Каждое предложение — новая строка.
- YouTube видео: пиши СЦЕНАРНЫЙ ПЛАН (не полный текст). Структура: ЗАГОЛОВОК ВИДЕО (цепляющий, SEO) + ОПИСАНИЕ ДЛЯ YOUTUBE (150-200 слов с ключевыми словами) + СТРУКТУРА ВИДЕО по блокам — для каждого блока: название, хронометраж, 3-5 тезисов для раскрытия. Без символов markdown.

ПРАВИЛА КАЧЕСТВА ТЕКСТА (обязательно для всех постов):

— ТОЧНОСТЬ И КРАТКОСТЬ (Странк и Уайт, The Elements of Style):
1. Убирай лишние слова. Каждое слово должно нести смысл. Не "по причине того что" — а "потому что". Не "в данный момент времени" — а "сейчас".
2. Активный залог по умолчанию. Не "было сделано" — а "мы сделали". Не "рекомендуется" — а "рекомендую". Пассив — только если действующее лицо намеренно неважно.
3. Конкретное сильнее абстрактного. Не "улучшение качества" — а "ты засыпаешь без тревоги". Не "результат" — а "минус 5 кг за месяц". Создавай картинку в голове читателя.
4. Самое важное — в конец предложения. Это место силы — читатель делает паузу и запоминает последнее.
5. Один абзац — одна мысль. Не смешивай несколько идей в одном абзаце.

— ПРИЛИПАЮЩИЙ ТЕКСТ (Чип и Дэн Хиз, Made to Stick — формула SUCCESs):
6. Simple — один пост, одна идея. Если говоришь три вещи — не говоришь ничего. Найди сердцевину и освободи её от лишнего.
7. Unexpected — нарушай ожидание читателя. Хук должен создавать разрыв: читатель ожидал одно — получил другое. Парадокс, контринтуитивный факт, неожиданный угол. Мозг останавливается там где паттерн нарушен.
8. Concrete — никаких абстракций. "Три года в отношениях где её не слышали" запоминается. "Клиент с нарушением привязанности" — нет. Образ — это якорь для памяти.
9. Credible — детали создают доверие. Конкретная цифра, реальная ситуация, живая деталь убеждают сильнее общих слов.
10. Emotional — один человек с историей затрагивает больше чем статистика. Пиши так чтобы читатель думал: "это про меня".
11. Story — если это кейс или личная история: строй по схеме вызов → действие → результат. Мозг читателя симулирует опыт — он буквально проживает то что читает.
12. Gap — хороший заголовок и хук создают осознанный разрыв в знании. Читатель понимает что чего-то не знает — и хочет узнать. "Почему умные люди принимают плохие решения в отношениях" работает потому что читатель думает: "подождите, это про меня?"

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
          max_tokens:platforms.includes("yt_long") ? 5000 : 3500,
          messages:[{role:"user",content:prompt}],
        }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content.map(b=>b.text||"").join("");
      let parsed;
      try {
        parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
      } catch(jsonErr) {
        // JSON broken - try to extract what we got
        setError("Ошибка разбора ответа. Попробуй снова или выбери меньше платформ.");
        setLoading(false);
        return;
      }
      setResult(parsed);
      setActiveTab(platforms[0]);
      setStep(5);
      saveGeneration("post", topic, parsed, { pillar, pillarAngle, stage, rubric, sordellQuad, cta, length });
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
        <div style={{background:"#362d52",marginBottom:0}}>
          {/* Top bar: logo + tagline + auth */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px 0",gap:12}}>

            {/* Left: App name in 2 lines */}
            <div style={{flexShrink:0}}>
              <div style={{fontSize:9,letterSpacing:".2em",textTransform:"uppercase",color:"rgba(225,223,44,.8)",fontWeight:600,lineHeight:1.4}}>Content</div>
              <div style={{fontSize:9,letterSpacing:".2em",textTransform:"uppercase",color:"rgba(225,223,44,.8)",fontWeight:600,lineHeight:1.4}}>Intelligence</div>
            </div>

            {/* Center: tagline */}
            <div style={{flex:1,textAlign:"center"}}>
              <div style={{fontFamily:"Georgia,serif",fontSize:isMobile?"15px":"18px",color:"#f4f1ec",lineHeight:1.3,fontStyle:"italic",opacity:.9}}>
                Тема → стратегия → посты
              </div>
            </div>

            {/* Right: Auth */}
            <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
              {user ? (
                <>
                  <button onClick={()=>setShowHistory(!showHistory)} style={{padding:"6px 12px",borderRadius:8,border:"1px solid rgba(244,241,236,.2)",background:"transparent",color:"#f4f1ec",fontSize:11,cursor:"pointer",whiteSpace:"nowrap"}}>
                    📋 {!isMobile && `История (${history.length})`}{isMobile && history.length}
                  </button>
                  <button onClick={signOut} title={`Выйти (${user.email})`} style={{padding:"6px 12px",borderRadius:8,border:"1px solid rgba(244,241,236,.2)",background:"transparent",color:"rgba(244,241,236,.7)",fontSize:11,cursor:"pointer",whiteSpace:"nowrap"}}>
                    {isMobile ? "↩" : `↩ ${user.email?.split("@")[0]}`}
                  </button>
                </>
              ) : (
                <button onClick={()=>setShowAuth(true)} style={{padding:"7px 14px",borderRadius:8,border:"none",background:"#e1df2c",color:"#362d52",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
                  Войти
                </button>
              )}
            </div>
          </div>

          {/* Row 1: Смысловые блоки · Найти темы · Контент-план */}
          <div style={{display:"flex",gap:6,padding:"12px 20px 0",justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={()=>setShowPillarSetup(!showPillarSetup)}
              style={{padding:"8px 14px",borderRadius:9,border:`1px solid ${showPillarSetup?"#e1df2c":"rgba(244,241,236,.25)"}`,background:showPillarSetup?"rgba(225,223,44,.15)":"transparent",color:showPillarSetup?"#e1df2c":"rgba(244,241,236,.8)",fontSize:12,cursor:"pointer",fontWeight:showPillarSetup?700:400}}>
              📌 {pillars.length ? `Блоки (${pillars.length})` : "Блоки"}
            </button>
            <button onClick={startSordell}
              style={{padding:"8px 14px",borderRadius:9,border:`1px solid ${mode==="sordell"?"#e1df2c":"rgba(244,241,236,.25)"}`,background:mode==="sordell"?"rgba(225,223,44,.15)":"transparent",color:mode==="sordell"?"#e1df2c":"rgba(244,241,236,.8)",fontSize:12,cursor:"pointer",fontWeight:mode==="sordell"?700:400}}>
              🎯 Найти темы{sordellResult?` (${sordellResult.length})`:""}
            </button>
            <button onClick={startPlan}
              style={{padding:"8px 14px",borderRadius:9,border:`1px solid ${mode==="plan"?"#e1df2c":"rgba(244,241,236,.25)"}`,background:mode==="plan"?"rgba(225,223,44,.15)":"transparent",color:mode==="plan"?"#e1df2c":"rgba(244,241,236,.8)",fontSize:12,cursor:"pointer",fontWeight:mode==="plan"?700:400}}>
              📅 Контент-план
            </button>
          </div>

          {/* Row 2: Создать пост · Создать кейс */}
          <div style={{display:"flex",gap:8,padding:"10px 20px 16px",justifyContent:"center"}}>
            <button onClick={startPost}
              style={{padding:"10px 24px",borderRadius:10,border:"none",background:mode==="post"?"#f4f1ec":"#9a88b8",color:mode==="post"?"#362d52":"#f4f1ec",fontSize:13,fontWeight:700,cursor:"pointer",flex:isMobile?1:0}}>
              ✦ Создать пост
            </button>
            <button onClick={startCase}
              style={{padding:"10px 24px",borderRadius:10,border:"none",background:mode==="case"?"#f4f1ec":"#9a88b8",color:mode==="case"?"#362d52":"#f4f1ec",fontSize:13,fontWeight:700,cursor:"pointer",flex:isMobile?1:0}}>
              ⭐ Создать кейс
            </button>
          </div>
        </div>

        {/* Pillar setup panel */}
        {showPillarSetup && (
          <Card>
            <div style={{fontFamily:"Georgia,serif",fontSize:16,color:S.text,marginBottom:4}}>Смысловые блоки</div>
            <div style={{fontSize:12,color:"#5c4e7a",marginBottom:10,lineHeight:1.6}}>
              <strong style={{color:"#362d52"}}>Смысловой блок</strong> — это ключевая тема, вокруг которой строится весь ваш контент. Например, у психолога блоки могут быть: «Отношения», «Самооценка», «Тревога», «Обо мне».
            </div>
            <div style={{padding:"12px 14px",background:"#362d52",borderRadius:8,border:"none",marginBottom:14,fontSize:11,color:"#f4f1ec",lineHeight:1.7}}>
              💡 По методу Ryan Brock (Pillar-Based Marketing): 3-4 блока × 4 угла (причины, ошибки, примеры, решения) = бесконечный поток идей без повторений. Блоки сохраняются и доступны в каждом посте.
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:12}}>
              {pillars.map((p,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:20,border:"1px solid #362d52",background:"rgba(54,45,82,.08)"}}>
                  <span style={{fontSize:13,color:S.text}}>{p}</span>
                  <button onClick={()=>removePillar(i)} style={{background:"transparent",border:"none",color:"#5c4e7a",cursor:"pointer",fontSize:16,lineHeight:1,padding:0}}>×</button>
                </div>
              ))}
              {pillars.length===0&&<span style={{fontSize:12,color:"#5c4e7a",fontStyle:"italic"}}>Смысловые блоки не добавлены</span>}
            </div>
            {/* AI suggest button */}
            {pillars.length < 4 && (
              <div style={{marginBottom:12}}>
                <button onClick={suggestPillars} disabled={suggestingPillars||(!niche&&!audience)}
                  style={{width:"100%",padding:"10px 14px",borderRadius:9,border:"1px dashed #362d52",background:"rgba(54,45,82,.05)",color:suggestingPillars?"#9a88b8":"#362d52",fontSize:13,fontWeight:600,cursor:(!niche&&!audience)?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  {suggestingPillars ? (
                    <><div style={{width:14,height:14,border:"2px solid #d8d0e0",borderTopColor:"#362d52",borderRadius:"50%",animation:"sp .8s linear infinite"}} /> Подбираю блоки…</>
                  ) : (
                    <>✨ Предложить блоки автоматически</>
                  )}
                </button>
                {!niche && !audience && <div style={{fontSize:11,color:"#9a88b8",marginTop:4,textAlign:"center"}}>Заполните нишу и аудиторию на шаге 1</div>}
              </div>
            )}

            {/* Suggested pillars */}
            {suggestedPillars.length > 0 && (
              <div style={{marginBottom:14,padding:"12px 14px",background:"#f4f1ec",borderRadius:10,border:"1px solid #e8e0f0"}}>
                <div style={{fontSize:11,color:"#5c4e7a",fontWeight:600,textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>✨ Предложения AI — нажми чтобы добавить:</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                  {suggestedPillars.map((p,i)=>{
                    const already = pillars.includes(p);
                    return (
                      <button key={i} onClick={()=>{
                        if (!already && pillars.length < 4) {
                          const updated = [...pillars, p];
                          setPillars(updated);
                          localStorage.setItem("lia_pillars", JSON.stringify(updated));
                          setSuggestedPillars(prev=>prev.filter((_,idx)=>idx!==i));
                        }
                      }} style={{padding:"7px 14px",borderRadius:20,border:`1px solid ${already?"#9a88b8":"#362d52"}`,background:already?"transparent":"#362d52",color:already?"#9a88b8":"#f4f1ec",fontSize:12,cursor:already||pillars.length>=4?"default":"pointer",fontWeight:600}}>
                        {already?"✓ ":""}{p}
                      </button>
                    );
                  })}
                </div>
                <button onClick={()=>{
                  const toAdd = suggestedPillars.filter(p=>!pillars.includes(p)).slice(0, 4-pillars.length);
                  const updated = [...pillars, ...toAdd];
                  setPillars(updated);
                  localStorage.setItem("lia_pillars", JSON.stringify(updated));
                  setSuggestedPillars([]);
                }} style={{marginTop:8,padding:"6px 12px",borderRadius:8,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                  + Добавить все
                </button>
              </div>
            )}

            {pillars.length<4&&(
              <div style={{display:"flex",gap:8}}>
                <textarea style={{...inpAuto,flex:1}} rows={1} placeholder="Например: Психология отношений" value={pillarInput} onChange={e=>{setPillarInput(e.target.value);e.target.style.height="auto";e.target.style.height=e.target.scrollHeight+"px";}} onKeyDown={e=>e.key==="Enter"&&(e.preventDefault(),savePillar())} />
                <button onClick={savePillar} style={{padding:"10px 18px",borderRadius:9,border:"none",background:S.accent,color:"#f4f1ec",fontWeight:700,cursor:"pointer",fontFamily:"sans-serif",fontSize:13}}>+</button>
              </div>
            )}
          </Card>
        )}

        {/* AUTH MODAL */}
        {showAuth && (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
            <div style={{background:"#fff",borderRadius:16,padding:28,maxWidth:400,width:"100%",position:"relative"}}>
              <button onClick={()=>setShowAuth(false)} style={{position:"absolute",top:16,right:16,background:"transparent",border:"none",fontSize:20,cursor:"pointer",color:"#9a88b8"}}>×</button>
              <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:22,color:"#362d52",fontWeight:600,marginBottom:6}}>
                {authMode==="login" ? "Войти" : "Регистрация"}
              </div>
              <p style={{fontSize:12,color:"#9a88b8",marginBottom:20}}>История генераций сохраняется в вашем аккаунте</p>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:11,color:"#5c4e7a",fontWeight:600,textTransform:"uppercase",letterSpacing:".06em"}}>Email</label>
                <input type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)}
                  style={{width:"100%",marginTop:4,padding:"10px 14px",borderRadius:8,border:"1px solid #d8d0e0",fontSize:13,color:"#362d52",outline:"none",boxSizing:"border-box"}}
                  placeholder="your@email.com" />
              </div>
              <div style={{marginBottom:16}}>
                <label style={{fontSize:11,color:"#5c4e7a",fontWeight:600,textTransform:"uppercase",letterSpacing:".06em"}}>Пароль</label>
                <div style={{position:"relative",marginTop:4}}>
                  <input type={showPassword?"text":"password"} value={authPassword} onChange={e=>setAuthPassword(e.target.value)}
                    style={{width:"100%",padding:"10px 40px 10px 14px",borderRadius:8,border:"1px solid #d8d0e0",fontSize:13,color:"#362d52",outline:"none",boxSizing:"border-box"}}
                    placeholder="минимум 6 символов" onKeyDown={e=>e.key==="Enter"&&(authMode==="login"?signIn():signUp())} />
                  <button onClick={()=>setShowPassword(p=>!p)} type="button"
                    style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",cursor:"pointer",color:"#9a88b8",fontSize:16,padding:4,lineHeight:1}}>
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>
              {authError && <p style={{color:"#e05c5c",fontSize:12,marginBottom:10}}>{authError}</p>}
              {authSuccess && <p style={{color:"#4a9a6a",fontSize:12,marginBottom:10}}>{authSuccess}</p>}
              <button onClick={authMode==="login"?signIn:signUp}
                style={{width:"100%",padding:13,borderRadius:10,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:10}}>
                {authMode==="login" ? "Войти" : "Создать аккаунт"}
              </button>
              <button onClick={()=>{setAuthMode(m=>m==="login"?"signup":"login");setAuthError("");setAuthSuccess("");}}
                style={{width:"100%",padding:8,borderRadius:8,border:"none",background:"transparent",color:"#9a88b8",fontSize:12,cursor:"pointer"}}>
                {authMode==="login" ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
              </button>
            </div>
          </div>
        )}

        {/* HISTORY PANEL */}
        {showHistory && user && (
          <Card>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:18,color:"#362d52",fontWeight:600}}>📋 История генераций</div>
              <button onClick={()=>setShowHistory(false)} style={{background:"transparent",border:"none",fontSize:20,cursor:"pointer",color:"#9a88b8"}}>×</button>
            </div>
            {history.length === 0 ? (
              <p style={{fontSize:13,color:"#9a88b8",textAlign:"center",padding:"20px 0"}}>Генераций пока нет. Создайте первый пост!</p>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {history.map((h,i)=>(
                  <div key={h.id} style={{padding:"10px 14px",background:"#f4f1ec",borderRadius:9,border:"1px solid #e8e0f0"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:10,background:"#362d52",color:"#f4f1ec",padding:"1px 8px",borderRadius:6,fontWeight:600}}>
                          {h.type==="post"?"✦ Пост":h.type==="plan"?"📅 План":"⭐ Кейс"}
                        </span>
                        <span style={{fontSize:10,color:"#9a88b8"}}>{new Date(h.created_at).toLocaleDateString("ru")}</span>
                      </div>
                      <button onClick={()=>deleteGeneration(h.id)} style={{background:"transparent",border:"none",color:"#c4b8d8",cursor:"pointer",fontSize:14}}>×</button>
                    </div>
                    <div style={{fontSize:13,fontWeight:600,color:"#362d52",marginBottom:4,lineHeight:1.3}}>{h.topic || "—"}</div>
                    {h.type==="post" && h.result?.headline && (
                      <div style={{fontSize:11,color:"#5c4e7a",fontStyle:"italic"}}>{h.result.headline}</div>
                    )}
                    {h.type==="post" && (
                      <button onClick={()=>{
                        setResult(h.result);
                        setTopic(h.topic||"");
                        setStep(5);
                        setMode("post");
                        setShowHistory(false);
                      }} style={{marginTop:8,padding:"5px 12px",borderRadius:7,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                        Открыть →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* STEP 1 — Context */}
        {step===1&&(
          <div>
            <Card>
              <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:19,color:"#362d52",fontWeight:600,marginBottom:18,display:"flex",alignItems:"center",gap:9}}>
                <StepNum n="1" /> Контекст эксперта
              </div>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}>
                <div style={{marginBottom:14}}>
                  <Label text="Бренд / имя эксперта" />
                  <textarea style={inpAuto} rows={1} placeholder="Сервис ФиксПК / Анна Иванова" value={expert} onChange={e=>{setExpert(e.target.value);e.target.style.height="auto";e.target.style.height=e.target.scrollHeight+"px";}} />
                </div>
                <div style={{marginBottom:14}}>
                  <Label text="Ниша / сфера" />
                  <textarea style={inpAuto} rows={1} placeholder="Ремонт ноутбуков и ПК" value={niche} onChange={e=>{setNiche(e.target.value);e.target.style.height="auto";e.target.style.height=e.target.scrollHeight+"px";}} />
                </div>
              </div>
              <div style={{marginBottom:14}}>
                <Label text="Целевая аудитория" hint="Возраст, пол, город, интересы, боли" />
                <textarea style={inpAuto} rows={1} placeholder="Женщины 35-50, г. Тбилиси, владелицы малого бизнеса" value={audience} onChange={e=>{setAudience(e.target.value);e.target.style.height="auto";e.target.style.height=e.target.scrollHeight+"px";}} />
              </div>
              <div style={{marginBottom:14}}>
                <Label text="Тональность" />
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {TONES.map(t=>(
                    <button key={t} onClick={()=>setTone(t)} style={{padding:"6px 12px",borderRadius:20,border:`1px solid ${tone===t?"#362d52":"#d8d0e0"}`,background:tone===t?"#362d52":"#f0eef8",color:tone===t?"#f4f1ec":"#362d52",fontSize:12,cursor:"pointer",fontFamily:"sans-serif"}}>{t}</button>
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
                    <button key={p.id} onClick={()=>toggle(p.id)} style={{padding:"8px 14px",borderRadius:9,border:`1px solid ${platforms.includes(p.id)?"#362d52":"#d8d0e0"}`,background:platforms.includes(p.id)?"#362d52":"#fff",color:platforms.includes(p.id)?"#f4f1ec":"#362d52",fontSize:13,cursor:"pointer",fontFamily:"sans-serif",display:"flex",alignItems:"center",gap:5}}>
                      {p.icon} {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
            <button onClick={()=>setStep(isCase ? 3 : 2)} style={{width:"100%",padding:15,borderRadius:12,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>
              {isCase ? "Далее → Данные кейса" : isPlan ? "Далее → Параметры плана" : mode==="sordell" ? "Далее → Интервью" : "Далее → Тема поста"}
            </button>
          </div>
        )}

        {/* STEP SORDELL — Интервью */}
        {mode==="sordell"&&step===2&&(
          <div>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}>
              <button onClick={()=>setStep(1)} style={{padding:"7px 14px",borderRadius:8,border:"1px solid #d8d0e0",background:"transparent",color:"#5c4e7a",fontSize:12,cursor:"pointer"}}>← Изменить контекст</button>
            </div>
            {sordellStep === "overview" ? (
              <Card>
                <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:19,color:"#362d52",fontWeight:600,marginBottom:6}}>
                  ✏️ Ваши ответы
                </div>
                <p style={{fontSize:11,color:"#9a88b8",marginBottom:16}}>Нажмите на любой вопрос чтобы изменить ответ</p>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {SORDELL_QUESTIONS.map((q,i)=>(
                    <button key={i} onClick={()=>{setSordellCurrentAnswer(sordellAnswers[i]||"");setSordellStep(i);}}
                      style={{padding:"10px 14px",borderRadius:9,border:`1px solid ${sordellAnswers[i]?.trim()?"#362d52":"#d8d0e0"}`,background:sordellAnswers[i]?.trim()?"#f4f1ec":"#fafafa",textAlign:"left",cursor:"pointer"}}>
                      <div style={{fontSize:10,color:"#9a88b8",marginBottom:3,textTransform:"uppercase",letterSpacing:".05em"}}>Вопрос {i+1} · {q.tag}</div>
                      <div style={{fontSize:12,fontWeight:600,color:"#362d52",marginBottom:sordellAnswers[i]?4:0}}>{q.q}</div>
                      {sordellAnswers[i] ? (
                        <div style={{fontSize:11,color:"#5c4e7a",fontStyle:"italic",lineHeight:1.5}}>{sordellAnswers[i]}</div>
                      ) : (
                        <div style={{fontSize:11,color:"#c4b8d8"}}>— нет ответа</div>
                      )}
                    </button>
                  ))}
                </div>
                <div style={{display:"flex",gap:8,marginTop:14}}>
                  <button onClick={()=>setSordellStep(13)} style={{flex:1,padding:12,borderRadius:10,border:"1px solid #d8d0e0",background:"transparent",color:"#5c4e7a",fontSize:13,cursor:"pointer"}}>← Назад к темам</button>
                  <button onClick={generateSordellResult} style={{flex:2,padding:12,borderRadius:10,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:13,fontWeight:700,cursor:"pointer"}}>↻ Пересоздать темы</button>
                </div>
              </Card>
            ) : sordellStep < 12 ? (
              <Card>
                <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:19,color:"#362d52",fontWeight:600,marginBottom:6,display:"flex",alignItems:"center",gap:9}}>
                  🎯 Найти темы по матрице Сорделл
                </div>
                <p style={{fontSize:11,color:"#9a88b8",marginBottom:8}}>Вопрос {sordellStep+1} из 12</p>

                {/* Progress bar */}
                <div style={{height:4,background:"#e8e0f0",borderRadius:4,marginBottom:20,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${((sordellStep)/12)*100}%`,background:"#362d52",borderRadius:4,transition:"width .3s"}} />
                </div>

                <div style={{marginBottom:16}}>
                  <div style={{fontSize:10,color:"#9a88b8",marginBottom:6,fontWeight:600,letterSpacing:".06em"}}>{SORDELL_QUESTIONS[sordellStep]?.tag}</div>
                  <div style={{padding:"14px 16px",background:"#362d52",borderRadius:10,marginBottom:8}}>
                    <p style={{fontSize:14,color:"#f4f1ec",lineHeight:1.7,fontWeight:500}}>{SORDELL_QUESTIONS[sordellStep]?.q}</p>
                  </div>
                  <div style={{padding:"10px 14px",background:"#f4f1ec",borderRadius:8,border:"1px solid #e8e0f0",fontSize:11,color:"#5c4e7a",lineHeight:1.6,fontStyle:"italic"}}>
                    💡 {SORDELL_QUESTIONS[sordellStep]?.hint}
                  </div>
                </div>

                {/* Previous answers */}
                {sordellStep > 0 && (
                  <div style={{marginBottom:14,padding:"10px 14px",background:"#f4f1ec",borderRadius:9,border:"1px solid #e8e0f0"}}>
                    <div style={{fontSize:10,color:"#9a88b8",marginBottom:4,textTransform:"uppercase",letterSpacing:".06em"}}>Предыдущий ответ</div>
                    <div style={{fontSize:12,color:"#5c4e7a",lineHeight:1.5}}>{sordellAnswers[sordellStep-1]||"—"}</div>
                  </div>
                )}

                <Label text="Ваш ответ" hint="Отвечайте честно и конкретно — чем откровеннее, тем сильнее темы" />
                <textarea
                  value={sordellCurrentAnswer}
                  onChange={e=>setSordellCurrentAnswer(e.target.value)}
                  placeholder="Напишите свой ответ здесь..."
                  rows={4}
                  style={{...inp, marginBottom:12, minHeight:100}}
                />
                <div style={{display:"flex",gap:8}}>
                  {sordellStep > 0 && (
                    <button onClick={()=>{
                      setSordellStep(s=>s-1);
                      setSordellCurrentAnswer(sordellAnswers[sordellStep-1]||"");
                    }} style={{flex:1,padding:12,borderRadius:10,border:"1px solid #d8d0e0",background:"transparent",color:"#5c4e7a",fontSize:13,cursor:"pointer"}}>← Назад</button>
                  )}
                  <button onClick={()=>{
                    const newAnswers = [...sordellAnswers];
                    newAnswers[sordellStep] = sordellCurrentAnswer;
                    setSordellAnswers(newAnswers);
                    if (sordellStep < 11) {
                      setSordellStep(s=>s+1);
                      setSordellCurrentAnswer(newAnswers[sordellStep+1]||"");
                    } else {
                      setSordellStep(12);
                    }
                  }} style={{flex:3,padding:15,borderRadius:12,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:15,fontWeight:700,cursor:"pointer"}}>
                    {sordellStep < 11 ? "Далее →" : "Получить темы →"}
                  </button>
                </div>
              </Card>
            ) : (
              <Card>
                <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:19,color:"#362d52",fontWeight:600,marginBottom:8}}>
                  🎯 Все вопросы пройдены
                </div>
                <p style={{fontSize:13,color:"#5c4e7a",marginBottom:20,lineHeight:1.6}}>Готово — {sordellAnswers.filter(a=>a?.trim()).length} из 12 ответов. Анализирую ваши ответы и нахожу сильные темы по матрице Сорделл.</p>
                {sordellLoading ? (
                  <div style={{textAlign:"center",padding:"20px 0"}}>
                    <div style={{width:28,height:28,border:"2px solid #d8d0e0",borderTopColor:"#362d52",borderRadius:"50%",animation:"sp .8s linear infinite",margin:"0 auto 12px"}} />
                    <p style={{fontSize:13,color:"#9a88b8"}}>Анализирую ваши ответы…</p>
                  </div>
                ) : (
                  <>
                    {sordellError && <p style={{color:"#e05c5c",fontSize:13,marginBottom:10}}>{sordellError}</p>}
                    <button onClick={generateSordellResult} style={{width:"100%",padding:15,borderRadius:12,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:15,fontWeight:700,cursor:"pointer",marginBottom:8}}>
                      🎯 Найти мои темы
                    </button>
                    <button onClick={()=>setSordellStep(11)} style={{width:"100%",padding:10,borderRadius:10,border:"1px solid #d8d0e0",background:"transparent",color:"#5c4e7a",fontSize:13,cursor:"pointer"}}>
                      ← Вернуться к вопросам
                    </button>
                  </>
                )}
              </Card>
            )}

            {/* Sordell Results */}
            {sordellStep===13&&sordellResult&&(
              <Card>
                <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:19,color:"#362d52",fontWeight:600,marginBottom:4}}>
                  ✨ Ваши темы по матрице Сорделл
                </div>
                <p style={{fontSize:11,color:"#9a88b8",marginBottom:16}}>10 тем · ⭐ отмечены 3 с наибольшим потенциалом охвата</p>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {sordellResult.map((t,i)=>(
                    <SordellCard key={i} t={t}
                      onCreatePost={()=>{setTopic(t.topic);setResult(null);setMode("post");setStep(2);}}
                    />
                  ))}
                </div>
                <div style={{display:"flex",gap:8,marginTop:12}}>
                  <button onClick={()=>{setSordellStep("overview");setSordellAnswers(JSON.parse(localStorage.getItem("lia_sordell_answers")||"[]"));}} style={{flex:1,padding:12,borderRadius:10,border:"1px solid #362d52",background:"transparent",color:"#362d52",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                    ✏️ Изменить ответы
                  </button>
                  <button onClick={startSordellFresh} style={{flex:1,padding:12,borderRadius:10,border:"1px solid #d8d0e0",background:"transparent",color:"#9a88b8",fontSize:13,cursor:"pointer"}}>
                    ↻ Начать заново
                  </button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* STEP PLAN — Контент-план */}
        {mode==="plan"&&step===2&&(
          <div>
            <Card>
              <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:19,color:"#362d52",fontWeight:600,marginBottom:18,display:"flex",alignItems:"center",gap:9}}>
                <StepNum n="2" /> Параметры плана
              </div>

              {/* Period */}
              <div style={{marginBottom:18}}>
                <Label text="Период" />
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {[{id:"week",label:"Неделя",icon:"📅"},{id:"month",label:"Месяц",icon:"🗓"}].map(p=>(
                    <button key={p.id} onClick={()=>setPlanPeriod(p.id)}
                      style={{padding:"12px 14px",borderRadius:9,border:`1px solid ${planPeriod===p.id?"#362d52":"#d8d0e0"}`,background:planPeriod===p.id?"#362d52":"#f0eef8",color:planPeriod===p.id?"#f4f1ec":"#362d52",fontSize:14,fontWeight:600,cursor:"pointer",textAlign:"center"}}>
                      {p.icon} {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Per-platform frequency */}
              <div style={{marginBottom:18}}>
                <Label text="Частота по платформам" hint="Укажи количество постов в неделю для каждой платформы" />
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {platforms.map(pid=>{
                    const hint = PLATFORM_FREQ_HINTS[pid];
                    if (!hint) return null;
                    const val = planPlatformFreqs[pid] ?? hint.rec;
                    const plat = PLATFORMS.find(p=>p.id===pid);
                    return (
                      <div key={pid} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#f4f1ec",borderRadius:9,border:"1px solid #e8e0f0"}}>
                        <span style={{fontSize:13,flex:1}}>
                          <span style={{marginRight:6}}>{plat?.icon}</span>
                          <strong>{plat?.label}</strong>
                          <span style={{fontSize:11,color:"#9a88b8",marginLeft:8}}>{hint.hint}</span>
                        </span>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <button onClick={()=>setPlanPlatformFreqs(f=>({...f,[pid]:Math.max(1,(f[pid]??hint.rec)-1)}))}
                            style={{width:28,height:28,borderRadius:6,border:"1px solid #d8d0e0",background:"#fff",color:"#362d52",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>−</button>
                          <span style={{width:32,textAlign:"center",fontWeight:700,fontSize:14,color:"#362d52"}}>{val}</span>
                          <button onClick={()=>setPlanPlatformFreqs(f=>({...f,[pid]:Math.min(hint.max,(f[pid]??hint.rec)+1)}))}
                            style={{width:28,height:28,borderRadius:6,border:"1px solid #d8d0e0",background:"#fff",color:"#362d52",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {(()=>{
                  const weekTotal = platforms.reduce((sum,pid)=>sum+(planPlatformFreqs[pid]??PLATFORM_FREQ_HINTS[pid]?.rec??3),0);
                  const recTotal = platforms.reduce((sum,pid)=>sum+(PLATFORM_FREQ_HINTS[pid]?.rec??3),0);
                  const isLow = weekTotal < recTotal;
                  const monthTotal = weekTotal * 4;
                  return (
                    <>
                      <p style={{fontSize:11,color:"#9a88b8",marginTop:10}}>
                        Итого постов в неделю: <strong style={{color:"#362d52"}}>{weekTotal}</strong>
                        {planPeriod==="month" && <span> · в месяц: <strong style={{color:"#362d52"}}>{monthTotal}</strong></span>}
                        <span style={{color:"#9a88b8"}}> · рекомендуется: <strong>{recTotal}</strong> в нед</span>
                      </p>
                      {(planPeriod==="month"?monthTotal:weekTotal) > 30 && (
                        <div style={{marginTop:8,padding:"8px 12px",background:"rgba(225,100,50,.08)",border:"1px solid rgba(225,100,50,.25)",borderRadius:9,fontSize:11,color:"#c46a4a"}}>
                          ⚠️ Много постов ({planPeriod==="month"?monthTotal:weekTotal}) — генерация может занять больше времени. Рекомендуем не более 30 постов за раз.
                        </div>
                      )}
                      {isLow && (
                        <div style={{marginTop:8,padding:"10px 14px",background:"rgba(225,100,50,.08)",border:"1px solid rgba(225,100,50,.25)",borderRadius:9}}>
                          <div style={{fontSize:12,color:"#c46a4a",fontWeight:600,marginBottom:3}}>⚠️ Постов меньше рекомендуемого</div>
                          <div style={{fontSize:11,color:"#7a5a48",lineHeight:1.6}}>
                            Рекомендуется {recTotal} постов в неделю для выбранных платформ, вы выбрали {weekTotal}.
                            Некоторые стадии воронки могут не получить постов — это снизит охват аудитории на разных этапах готовности.
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Distribution preview */}
              <div style={{padding:"12px 14px",background:"#362d52",borderRadius:9,marginBottom:0}}>
                <div style={{fontSize:11,color:"rgba(244,241,236,.7)",marginBottom:4,textTransform:"uppercase",letterSpacing:".06em"}}>Примерное распределение по стадиям</div>
                <div style={{fontSize:10,color:"rgba(244,241,236,.5)",marginBottom:8,fontStyle:"italic"}}>Минимум 1 пост на каждую стадию</div>
                {[
                  {label:"Не осознаёт проблему",pct:0.40},
                  {label:"Осознаёт проблему",pct:0.25},
                  {label:"Ищет решение",pct:0.20},
                  {label:"Выбирает решение",pct:0.10},
                  {label:"Готов к покупке",pct:0.05},
                ].map((s,i)=>{
                  const weekTotalDisp = platforms.reduce((sum,pid)=>sum+(planPlatformFreqs[pid]??PLATFORM_FREQ_HINTS[pid]?.rec??3),0);
                  const totalDisp = planPeriod==="week"?weekTotalDisp:weekTotalDisp*4;
                  const pctsDisp = [0.40,0.25,0.20,0.10,0.05];
                  let countsDisp = pctsDisp.map(p=>Math.round(totalDisp*p));
                  const diffDisp = totalDisp - countsDisp.reduce((a,b)=>a+b,0);
                  countsDisp[0] = Math.max(0, countsDisp[0] + diffDisp);
                  const n = countsDisp[i];
                  return (
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5,fontSize:12,color:"#f4f1ec"}}>
                      <span>{s.label}</span>
                      <span style={{background:"#e1df2c",color:"#362d52",padding:"1px 8px",borderRadius:8,fontSize:11,fontWeight:700}}>{n} постов</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {loading ? (
              <Card>
                <div style={{textAlign:"center",padding:"10px 0"}}>
                  <div style={{width:28,height:28,border:`2px solid #d8d0e0`,borderTopColor:"#362d52",borderRadius:"50%",animation:"sp .8s linear infinite",margin:"0 auto 12px"}} />
                  <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
                  <p style={{fontSize:13,color:"#9a88b8"}}>Составляю контент-план…</p>
                </div>
              </Card>
            ) : (
              <>
                {error&&<p style={{color:"#e05c5c",fontSize:13,textAlign:"center",marginBottom:10}}>{error}</p>}
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setStep(1)} style={{flex:1,padding:12,borderRadius:10,border:`1px solid ${S.border}`,background:"transparent",color:"#5c4e7a",fontSize:13,cursor:"pointer"}}>← Назад</button>
                  <button onClick={generatePlan} style={{flex:3,padding:15,borderRadius:12,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:15,fontWeight:700,cursor:"pointer"}}>
                    📅 Создать план
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP PLAN RESULT */}
        {mode==="plan"&&step===5&&planResult&&(
          <div>
            <Card>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4,flexWrap:"wrap",gap:8}}>
                <div>
                  <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:19,color:"#362d52",fontWeight:600,marginBottom:4}}>
                    📅 Контент-план
                  </div>
                  <p style={{fontSize:12,color:"#9a88b8"}}>{planPeriod==="week"?"Неделя":"Месяц"} · {planResult.length} постов</p>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <CopyAllPlanBtn planResult={planResult} />
                  <DownloadPlanBtn planResult={planResult} period={planPeriod} />
                </div>
              </div>
              <div style={{marginBottom:16}} />

              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {planResult.map((post,i)=>(
                  <PlanCard key={i} post={post}
                    onCreatePost={()=>{
                      setTopic(post.topic);
                      setPillar(post.block||"");
                      setStage(AWARENESS_STAGES.find(s=>s.label===post.stage||s.id===post.stage)?.id||"");
                      setSordellQuad(SORDELL_MATRIX.find(q=>post.sordell?.includes(q.label)||post.sordell?.includes(q.id))?.id||"");
                      setMode("post");
                      setStep(3);
                      setResult(null);
                    }}
                  />
                ))}
              </div>
            </Card>

            <div style={{display:"flex",gap:8,marginTop:8}}>
              <button onClick={()=>{setPlanResult(null);setStep(2);}} style={{flex:1,padding:12,borderRadius:10,border:"1px solid #d8d0e0",background:"transparent",color:"#5c4e7a",fontSize:13,cursor:"pointer"}}>← Изменить</button>
              <button onClick={()=>{setPlanResult(null);generatePlan();}} style={{flex:1,padding:12,borderRadius:10,border:"1px solid #362d52",background:"transparent",color:"#362d52",fontSize:13,fontWeight:700,cursor:"pointer"}}>↻ Пересоздать план</button>
            </div>
          </div>
        )}

        {/* STEP 3 — О чём писать */}
        {step===3&&mode!=="plan"&&mode!=="sordell"&&(
          <div>
            <Card>
              <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:19,color:"#362d52",fontWeight:600,marginBottom:18,display:"flex",alignItems:"center",gap:9}}>
                <StepNum n="3" /> О чём писать
              </div>

              {/* Pillar */}
              <div style={{marginBottom:18}}>
                <Label text="Смысловой блок" hint={pillars.length ? "Выбери смысловой блок" : "Добавь блоки через кнопку «Настроить блоки» вверху"} />
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {pillars.length>0 ? pillars.map((p,i)=>(
                    <button key={i} onClick={()=>setPillar(p)} style={{padding:"8px 14px",borderRadius:9,border:`1px solid ${pillar===p?"#362d52":"#d8d0e0"}`,background:pillar===p?"#362d52":"#f0eef8",color:pillar===p?"#f4f1ec":"#362d52",fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>{p}</button>
                  )) : (
                    <button onClick={()=>setShowPillarSetup(true)} style={{padding:"8px 14px",borderRadius:9,border:"1px dashed #d8d0e0",background:"transparent",color:"#5c4e7a",fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>+ Добавить блоки</button>
                  )}
                </div>
              </div>

              {/* Angle */}
              <div style={{marginBottom:18}}>
                <Label text="Угол смыслового блока" />
                <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:8}}>
                  {PILLAR_ANGLES.map(a=>(
                    <button key={a.id} onClick={()=>setPillarAngle(a.id)} style={{padding:"10px 14px",borderRadius:9,border:`1px solid ${pillarAngle===a.id?"#362d52":"#d8d0e0"}`,background:pillarAngle===a.id?"#362d52":"#fff",color:pillarAngle===a.id?"#f4f1ec":"#362d52",fontSize:13,cursor:"pointer",fontFamily:"sans-serif",textAlign:"left"}}>
                      <div style={{fontWeight:600,marginBottom:2}}>{a.label}</div>
                      <div style={{fontSize:11,color:pillarAngle===a.id?"#f4f1ec":"#5c4e7a"}}>{a.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stage */}
              <div style={{marginBottom:18}}>
                <Label text="Стадия аудитории" hint="На каком уровне осознания находится читатель?" />
                <div style={{display:"flex",flexDirection:"column",gap:7}}>
                  {AWARENESS_STAGES.map(s=>(
                    <button key={s.id} onClick={()=>setStage(s.id)} style={{padding:"10px 14px",borderRadius:9,border:`1px solid ${stage===s.id?s.color:S.borderL}`,background:stage===s.id?"#362d52":"#fff",color:stage===s.id?"#f4f1ec":"#362d52",fontSize:13,cursor:"pointer",fontFamily:"sans-serif",textAlign:"left",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <div>
                        <span style={{fontWeight:600}}>{s.label}</span>
                        <span style={{fontSize:11,color:stage===s.id?"#f4f1ec":"#9a88b8",marginLeft:8}}>→ {s.goal}</span>
                      </div>
                      <span style={{fontSize:10,color:"#362d52",background:"#e1df2c",padding:"2px 8px",borderRadius:10,flexShrink:0,fontWeight:700}}>{s.share}</span>
                    </button>
                  ))}
                </div>
              </div>

            </Card>

            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setStep(2)} style={{flex:1,padding:12,borderRadius:10,border:`1px solid ${S.border}`,background:"transparent",color:"#5c4e7a",fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>← Назад</button>
              <button onClick={()=>setStep(4)} style={{flex:3,padding:15,borderRadius:12,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>
                Далее → Как подать
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — Как подать */}
        {step===4&&mode!=="plan"&&mode!=="sordell"&&(
          <div>
            <Card>
              <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:19,color:"#362d52",fontWeight:600,marginBottom:18,display:"flex",alignItems:"center",gap:9}}>
                <StepNum n="4" /> Как подать
              </div>

              {/* Матрица Сорделл */}
              <div style={{marginBottom:18}}>
                <Label text="Угол подачи — матрица Сорделл" />
                <div style={{fontSize:11,color:"#5c4e7a",marginBottom:10,lineHeight:1.6,fontStyle:"italic"}}>Как зайти в тему — с какой стороны</div>
                {rubric && !["engaging","pain"].includes(rubric) && (
                  <div style={{padding:"8px 12px",background:"rgba(54,45,82,.06)",borderRadius:8,marginBottom:8,fontSize:11,color:"#5c4e7a"}}>
                    💡 Доступные углы отфильтрованы по рубрике <strong>«{selectedRubric?.label}»</strong>
                  </div>
                )}
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {SORDELL_MATRIX.map(q=>{
                    const allowed = rubric ? (RUBRIC_SORDELL_MAP[rubric] || []) : SORDELL_MATRIX.map(x=>x.id);
                    const isAllowed = !rubric || allowed.includes(q.id);
                    return (
                      <button key={q.id} onClick={()=>isAllowed&&setSordellQuad(q.id)}
                        style={{padding:"12px 14px",borderRadius:9,border:`1px solid ${sordellQuad===q.id?"#362d52":isAllowed?"#d8d0e0":"#ece8f0"}`,background:sordellQuad===q.id?"#362d52":isAllowed?"#f0eef8":"#f8f6fc",color:sordellQuad===q.id?"#f4f1ec":isAllowed?"#362d52":"#c4b8d8",fontSize:13,cursor:isAllowed?"pointer":"not-allowed",fontFamily:"'Nunito Sans', sans-serif",textAlign:"left",transition:"all .2s",opacity:isAllowed?1:.55}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:3}}>
                          <span style={{fontWeight:700}}>{q.icon} {q.label}</span>
                          {isAllowed
                            ? <span style={{fontSize:10,color:"#362d52",background:"#e1df2c",padding:"1px 8px",borderRadius:8,fontWeight:700,flexShrink:0}}>{q.share}</span>
                            : <span style={{fontSize:10,color:"#c4b8d8",padding:"1px 8px"}}>недоступно</span>
                          }
                        </div>
                        <div style={{fontSize:11,color:sordellQuad===q.id?"#f4f1ec":isAllowed?"#5c4e7a":"#c4b8d8"}}>{q.desc}</div>
                        {sordellQuad===q.id && <div style={{fontSize:10,color:"rgba(244,241,236,.8)",marginTop:6,fontStyle:"italic",lineHeight:1.5}}>{q.hint}</div>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Length */}
              <div style={{marginBottom:18}}>
                <Label text="Длина поста" />
                <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:8}}>
                  {LENGTH_OPTIONS.map(l=>(
                    <button key={l.id} onClick={()=>setLength(l.id)} style={{padding:"10px 14px",borderRadius:9,border:`1px solid ${length===l.id?"#362d52":"#d8d0e0"}`,background:length===l.id?"#362d52":"#fff",color:length===l.id?"#f4f1ec":"#362d52",fontSize:13,cursor:"pointer",fontFamily:"sans-serif",textAlign:"left"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                        <span style={{color:length===l.id?"#e1df2c":"#9a88b8",fontWeight:700,fontSize:11}}>{l.icon}</span>
                        <span style={{fontWeight:600}}>{l.label}</span>
                      </div>
                      <div style={{fontSize:11,color:length===l.id?"#f4f1ec":"#5c4e7a",marginBottom:2}}>{l.desc}</div>
                      {length===l.id && <div style={{fontSize:10,color:"#f4f1ec",marginTop:3,fontStyle:"italic",opacity:.9}}>{l.note}</div>}
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div style={{marginBottom:0}}>
                <Label text="CTA — призыв к действию" />
                <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                  {CTA_OPTIONS.map(c=>(
                    <button key={c.id} onClick={()=>setCta(c.id)} style={{padding:"7px 13px",borderRadius:9,border:`1px solid ${cta===c.id?"#362d52":"#d8d0e0"}`,background:cta===c.id?"#362d52":"#fff",color:cta===c.id?"#f4f1ec":"#362d52",fontSize:12,cursor:"pointer",fontFamily:"sans-serif",display:"flex",alignItems:"center",gap:5}}>
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setStep(3)} style={{flex:1,padding:12,borderRadius:10,border:`1px solid ${S.border}`,background:"transparent",color:"#5c4e7a",fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>← Назад</button>
              <button onClick={generate} style={{flex:3,padding:15,borderRadius:12,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>
                ✦ Создать посты
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — Topic */}
        {step===2&&mode!=="plan"&&mode!=="sordell"&&(
          <div>
            <Card>
              <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:19,color:"#362d52",fontWeight:600,marginBottom:18,display:"flex",alignItems:"center",gap:9}}>
                <StepNum n={isCase?"2":"3"} /> {isCase ? "Данные кейса" : "Тема поста"}
              </div>

              {/* Rubric — first for post mode */}
              {!isCase && (
                <div style={{marginBottom:18}}>
                  <Label text="Рубрика" hint="Выбери тип поста — это определит тему и угол подачи" />
                  <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:8}}>
                    {RUBRICS.map(r=>(
                      <button key={r.id} onClick={()=>{setRubric(r.id);}} style={{padding:"10px 14px",borderRadius:9,border:`1px solid ${rubric===r.id?"#362d52":"#d8d0e0"}`,background:rubric===r.id?"#362d52":"#fff",color:rubric===r.id?"#f4f1ec":"#362d52",fontSize:13,cursor:"pointer",fontFamily:"sans-serif",textAlign:"left"}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                          <span>{r.icon}</span>
                          <span style={{fontWeight:600}}>{r.label}</span>
                          <span style={{fontSize:10,color:"#362d52",background:"#e1df2c",padding:"1px 7px",borderRadius:8,marginLeft:"auto",fontWeight:700}}>{r.share}</span>
                        </div>
                        <div style={{fontSize:11,color:rubric===r.id?"#f4f1ec":"#5c4e7a"}}>{r.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isCase ? (
                <>
                  <div style={{padding:"12px 14px",background:"rgba(54,45,82,.05)",borderRadius:10,border:"1px solid #e8e0f0",marginBottom:18}}>
                    <div style={{fontSize:12,color:"#362d52",fontWeight:600,marginBottom:4}}>⭐ История успеха · Было → стало → результат</div>
                    <div style={{fontSize:11,color:"#5c4e7a",lineHeight:1.6}}>Опиши реальный кейс — конкретные детали создают доверие. Приложение оформит историю под каждую платформу.</div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                    <div>
                      <Label text="Клиент / герой кейса" hint="Имя, возраст, профессия" />
                      <textarea style={inpAuto} rows={1} placeholder="Мария, 42 года, бухгалтер" value={caseClient} onChange={e=>{setCaseClient(e.target.value);e.target.style.height="auto";e.target.style.height=e.target.scrollHeight+"px";}} />
                    </div>
                    <div>
                      <Label text="Контекст / ниша клиента" />
                      <textarea style={inpAuto} rows={1} placeholder="Работает из дома, ноутбук — основной инструмент" value={caseNiche} onChange={e=>{setCaseNiche(e.target.value);e.target.style.height="auto";e.target.style.height=e.target.scrollHeight+"px";}} />
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
                    <textarea style={inpAuto} rows={1} placeholder="Регулярная чистка продлевает жизнь ноутбука на годы" value={pain} onChange={e=>{setPain(e.target.value);e.target.style.height="auto";e.target.style.height=e.target.scrollHeight+"px";}} />
                  </div>
                </>
              ) : (
                <>
                  <div style={{marginBottom:14}}>
                    <Label text="Тема поста" />
                    <textarea style={inpAuto} rows={2} placeholder="Например: чистка ноутбука от пыли" value={topic} onChange={e=>{setTopic(e.target.value);e.target.style.height="auto";e.target.style.height=e.target.scrollHeight+"px";}} />
                  </div>
                  <div style={{marginBottom:14}}>
                    <Label text="Боль аудитории" hint={currentPainHint} />
                    <textarea style={inpAuto} rows={1} placeholder="Например: боится что ноутбук сломается и потеряет все данные" value={pain} onChange={e=>{setPain(e.target.value);e.target.style.height="auto";e.target.style.height=e.target.scrollHeight+"px";}} />
                  </div>
                  <div style={{marginBottom:14}}>
                    <Label text="Ключевые факты и УТП" hint="Что обязательно отразить — цифры, преимущества, детали" />
                    <textarea style={inp} rows={4} placeholder={"Что важно донести:\n— чистка каждые 6-12 месяцев\n— стоимость 50 лари\n— доставка курьером после ремонта"} value={details} onChange={e=>setDetails(e.target.value)} />
                  </div>
                </>
              )}

              {/* Strategy summary */}
              <div style={{padding:"10px 14px",background:"#362d52",borderRadius:9,border:"none",fontSize:11,color:"#f4f1ec",lineHeight:1.7,textAlign:"center"}}>
                {[
                  pillar && `📌 Блок: ${pillar}`,
                  sordellQuad && `${selectedSordell?.icon} ${selectedSordell?.label}`,
                  sordellQuad && `${selectedSordell?.icon} ${selectedSordell?.label}`,
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
                  <div style={{width:28,height:28,border:`2px solid ${S.border}`,borderTopColor:"#362d52",borderRadius:"50%",animation:"sp .8s linear infinite",margin:"0 auto 12px"}} />
                  <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
                  <p style={{fontSize:13,color:S.muted}}>Создаю заголовок, хук и посты…</p>
                </div>
              </Card>
            ) : (
              <>
                {isCase ? (
                  <button onClick={generate} disabled={!caseBefore.trim()} style={{width:"100%",padding:15,borderRadius:12,border:"none",background:!caseBefore.trim()?"#d8d0e0":"#362d52",color:!caseBefore.trim()?"#9a88b8":"#f4f1ec",fontSize:15,fontWeight:700,cursor:caseBefore.trim()?"pointer":"not-allowed",fontFamily:"sans-serif",marginBottom:10}}>
                    ⭐ Создать кейс-посты
                  </button>
                ) : (
                  <button onClick={()=>{if(!topic.trim()){setError("Укажи тему поста");return;}setStep(3);}} style={{width:"100%",padding:15,borderRadius:12,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif",marginBottom:10}}>
                    Далее → Стратегия поста
                  </button>
                )}
                {error&&<p style={{color:"#e05c5c",fontSize:13,textAlign:"center",marginBottom:10}}>{error}</p>}
                <button onClick={()=>setStep(1)} style={{width:"100%",padding:10,borderRadius:10,border:`1px solid ${S.border}`,background:"transparent",color:"#5c4e7a",fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>← Назад</button>
              </>
            )}
          </div>
        )}

        {/* STEP 5 — Result */}
        {step===5&&result&&mode!=="plan"&&mode!=="sordell"&&(
          <div>
            {/* Strategy badge */}
            <div style={{padding:"10px 16px",background:"#f4f1ec",border:"1px solid #e8e0f0",borderRadius:10,marginBottom:14,fontSize:11,color:"#5c4e7a",lineHeight:1.9,display:"flex",flexWrap:"wrap",gap:2,alignItems:"center"}}>
              {[
                platforms.length && {label:"📱 Платформы:", value:platforms.map(pid=>PLATFORMS.find(p=>p.id===pid)?.icon).join(" ")},
                length && {label:"📏 Формат:", value:LENGTH_OPTIONS.find(l=>l.id===length)?.label},
                pillar && {label:"📌 Блок:", value:pillar},
                pillarAngle && {label:"📐 Угол блока:", value:PILLAR_ANGLES.find(a=>a.id===pillarAngle)?.label},
                sordellQuad && {label:`${selectedSordell?.icon} Подача:`, value:selectedSordell?.label},
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
              <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".08em",color:"#5c4e7a",fontWeight:600,marginBottom:8}}>Заголовок поста</div>
              <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:22,color:"#362d52",lineHeight:1.3,marginBottom:16,fontWeight:600}}>{result.headline}</div>
              <div style={{height:2,background:"#e1df2c",marginBottom:14,borderRadius:2,width:32}} />
              <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".08em",color:"#5c4e7a",fontWeight:600,marginBottom:8}}>Хук</div>
              <div style={{fontSize:14,color:"#5c4e7a",lineHeight:1.7,fontStyle:"italic"}}>{result.hook}</div>
              <div style={{display:"flex",justifyContent:"flex-end",marginTop:12}}>
                <CopyBtn text={result.headline+"\n\nХук: "+result.hook} />
              </div>
            </Card>

            {/* Tabs */}
            <div style={{display:"flex",flexWrap:"wrap",gap:isMobile?5:6,marginBottom:12}}>
              {PLATFORMS.filter(p=>platforms.includes(p.id)).map(p=>(
                <button key={p.id} onClick={()=>setActiveTab(p.id)} style={{padding:"8px 14px",borderRadius:9,border:`1px solid ${activeTab===p.id?"#362d52":"#d8d0e0"}`,background:activeTab===p.id?"#362d52":"#fff",color:activeTab===p.id?"#f4f1ec":"#362d52",fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>

            {/* Post */}
            <div style={{background:"#fff",border:"1px solid #e8e0f0",borderRadius:12,overflow:"hidden",marginBottom:14}}>
              <div style={{padding:"12px 18px",borderBottom:`1px solid ${S.border}`,fontSize:14,fontWeight:600,color:"#362d52",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span>{activePlatform?.icon} {activePlatform?.label}</span>
                <span style={{fontSize:11,color:"#5c4e7a",fontWeight:400}}>{(result[activeTab]||"").split(/\s+/).filter(Boolean).length} слов</span>
              </div>
              <div style={{padding:18,fontSize:14,lineHeight:1.85,color:"#362d52",whiteSpace:"pre-wrap"}}>{result[activeTab]||"—"}</div>
              <div style={{padding:"10px 18px",borderTop:"1px solid #e8e0f0",display:"flex",justifyContent:"flex-end"}}>
                <CopyBtn text={result.headline+"\n\n"+result[activeTab]} />
              </div>
            </div>

            {/* Save prompt for non-auth users */}
            {!user && (
              <div style={{padding:"12px 16px",background:"#362d52",borderRadius:10,marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:"#e1df2c",marginBottom:2}}>💾 Этот пост не сохранён</div>
                  <div style={{fontSize:11,color:"rgba(244,241,236,.7)"}}>Войдите чтобы сохранять все генерации и возвращаться к ним</div>
                </div>
                <button onClick={()=>setShowAuth(true)} style={{padding:"8px 16px",borderRadius:8,border:"none",background:"#e1df2c",color:"#362d52",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
                  Войти →
                </button>
              </div>
            )}

            <div style={{display:"flex",gap:8,marginBottom:8,flexDirection:isMobile?"column":"row"}}>
              <button onClick={()=>{setResult(null);generate();}} style={{flex:1,padding:12,borderRadius:10,border:"1px solid #362d52",background:"rgba(54,45,82,.08)",color:S.accent,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                ↻ Сгенерировать заново
              </button>
            </div>
            <div style={{display:"flex",gap:8,flexDirection:isMobile?"column":"row"}}>
              <button onClick={()=>{setResult(null);setStep(4);}} style={{flex:1,padding:12,borderRadius:10,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>
                Изменить тему
              </button>
              <button onClick={()=>{setResult(null);setStep(3);}} style={{flex:1,padding:12,borderRadius:10,border:`1px solid ${S.border}`,background:"transparent",color:"#5c4e7a",fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>
                Изменить стратегию
              </button>
              <button onClick={()=>{setResult(null);setTopic("");setDetails("");setPain("");setCaseBefore("");setCaseAfter("");setCaseResult("");setStep(1);}} style={{flex:1,padding:12,borderRadius:10,border:`1px solid ${S.border}`,background:"transparent",color:"#5c4e7a",fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>
                Заново
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

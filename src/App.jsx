import React, { useState, useEffect } from "react";
import {
  PLATFORMS, TONES, LENGTH_OPTIONS, PILLAR_ANGLES,
  AWARENESS_STAGES, RUBRICS, CTA_OPTIONS, RUBRIC_SORDELL_MAP,
  SORDELL_MATRIX, CAROUSEL_TEMPLATES, HOOK_TYPES,
  BRAND_ARCHETYPES, PLATFORM_FREQ_HINTS
} from "./constants";
import {
  Label, CopyBtn, Card, StepNum, SlidecopybtnInline,
  formatPlanText, CopyAllPlanBtn, DownloadPlanBtn, PlanCard,
  SordellCard, CopyAllCarouselBtn, EditablePostView,
  HistoryModal, CalendarDateModal, CalendarView
} from "./components";
import { SORDELL_QUESTIONS } from "./hooks/useSordell";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "",
  import.meta.env.VITE_SUPABASE_ANON_KEY || ""
);

const useIsMobile = () => {
  const [mobile, setMobile] = React.useState(window.innerWidth < 600);
  React.useEffect(() => {
    const h = () => setMobile(window.innerWidth < 600);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return mobile;
};

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


function DownloadCSVBtn({ planResult, period }) {
  return (
    <button onClick={()=>{
      const headers = ["День","Платформа","Тема","Блок","Стадия","Угол Сорделл","Функция"];
      const rows = planResult.map(post => {
        const plat = PLATFORMS.find(p=>p.id===post.platform);
        return [
          post.day||"",
          plat?.label||post.platform||"",
          post.topic||"",
          post.block||"",
          post.stage||"",
          post.sordell||"",
          post.function||"",
        ].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",");
      });
      const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type:"text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `контент-план-${period==="week"?"неделя":period==="two_weeks"?"2-недели":period==="three_weeks"?"3-недели":period==="month"?"месяц":"квартал"}-${expert||"план"}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }} style={{padding:"8px 14px",borderRadius:8,border:"1px solid #362d52",background:"transparent",color:"#362d52",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>
      📊 Скачать .csv
    </button>
  );
}


export default function App() {
  // API

  // Pillars (saved)
  const [pillars, setPillars] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lia_pillars") || "[]"); } catch { return []; }
  });
  const [showPillarSetup, setShowPillarSetup] = useState(false);
  const [showBankOpyt, setShowBankOpyt] = useState(false);
  const [bankOpytExpanded, setBankOpytExpanded] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarPosts, setCalendarPosts] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lia_calendar") || "[]"); } catch { return []; }
  });
  const [calendarModal, setCalendarModal] = useState(null); // {topic, platform, generationId, type}
  const [calendarDate, setCalendarDate] = useState("");
  const [calendarPlatform, setCalendarPlatform] = useState("");
  const [pillarInput, setPillarInput] = useState("");

  const [selectedFormula, setSelectedFormula] = useState(null);

  // Custom formats
  const [customFormats, setCustomFormats] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lia_custom_formats") || "[]"); } catch { return []; }
  });
  const [showFormats, setShowFormats] = useState(false);
  const [editingFormat, setEditingFormat] = useState(null);
  const [formatSeriesTopics, setFormatSeriesTopics] = useState("");
  const [formatSeriesResult, setFormatSeriesResult] = useState(null);
  const [formatSeriesLoading, setFormatSeriesLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(null);

  // Series
  const [seriesBlock, setSeriesBlock] = useState(null);
  const [seriesTopic, setSeriesTopic] = useState("");
  const [seriesResult, setSeriesResult] = useState(null);
  const [seriesLoading, setSeriesLoading] = useState(false);

  // Products
  const [products, setProducts] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lia_products") || "[]"); } catch { return []; }
  });
  const [showProducts, setShowProducts] = useState(false);
  const [showLaunchPlanModal, setShowLaunchPlanModal] = useState(false);
  const [launchPlanProduct, setLaunchPlanProduct] = useState(null);
  const [launchSaleStart, setLaunchSaleStart] = useState("");
  const [launchSaleEnd, setLaunchSaleEnd] = useState("");
  const [editingProduct, setEditingProduct] = useState(null); // null = list, {} = new/edit
  const [launchMode, setLaunchMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedPhase, setSelectedPhase] = useState(null); // 1, 2, 3

  // Brands
  const [brands, setBrands] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lia_brands") || "[]"); } catch { return []; }
  });
  const [showBrandPicker, setShowBrandPicker] = useState(false);
  const [brandChanged, setBrandChanged] = useState(false);
  const [brandSaved, setBrandSaved] = useState(false);
  const [showExpertPanel, setShowExpertPanel] = useState(false);
  const [showStoryBankPanel, setShowStoryBankPanel] = useState(false);

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
  const [hookType, setHookType] = useState("");
  const [carouselTemplate, setCarouselTemplate] = useState("");
  const [carouselSlides, setCarouselSlides] = useState(7);
  const [carouselResult, setCarouselResult] = useState(null);
  const [carouselLoading, setCarouselLoading] = useState(false);
  const [carouselSlideCount, setCarouselSlideCount] = useState(7);

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
  const [microsegments, setMicrosegments] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lia_microsegments") || "[]"); } catch { return []; }
  });
  const [selectedMs, setSelectedMs] = useState(null); // id of selected MS for current post
  const [showMsEditor, setShowMsEditor] = useState(false);
  const [editingMs, setEditingMs] = useState(null); // null=list, {}=new/edit
  const [newMsInput, setNewMsInput] = useState({ name:"", desc:"", pains:"", barriers:"", language:"" });

  const [audienceBarriers, setAudienceBarriers] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lia_audience_barriers") || "[]"); } catch { return []; }
  });
  const [audiencePains, setAudiencePains] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lia_audience_pains") || "[]"); } catch { return []; }
  });
  const [suggestingPains, setSuggestingPains] = useState(false);
  const [suggestingTopicPains, setSuggestingTopicPains] = useState(false);
  const [showPains, setShowPains] = useState(false);
  const [suggestingBarriers, setSuggestingBarriers] = useState(false);
  const [showBarriers, setShowBarriers] = useState(false);
  const [brandQ1, setBrandQ1] = useState(() => localStorage.getItem("lia_brand_q1") || "");
  const [brandQ2, setBrandQ2] = useState(() => localStorage.getItem("lia_brand_q2") || "");
  const [planPeriod, setPlanPeriod] = useState(() => localStorage.getItem("lia_plan_period") || "week");
  const [planMainFreq, setPlanMainFreq] = useState(() => parseInt(localStorage.getItem("lia_plan_freq") || "3"));
  const [planGeneratedAt, setPlanGeneratedAt] = useState(() => localStorage.getItem("lia_plan_generated_at") || "");
  const [planResult, setPlanResult] = useState(() => {
    try { const s = localStorage.getItem("lia_plan_result"); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [sordellStep, setSordellStep] = useState(0);
  const [sordellAnswers, setSordellAnswers] = useState([]);
  const [sordellCurrentAnswer, setSordellCurrentAnswer] = useState("");
  const [sordellResult, setSordellResult] = useState(() => {
    try { const s = localStorage.getItem("lia_sordell_result"); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [personalStories, setPersonalStories] = useState(() => {
    try { const s = localStorage.getItem("lia_personal_stories"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [newStoryInput, setNewStoryInput] = useState("");
  const [sordellAnswersSaved, setSordellAnswersSaved] = useState(() => {
    try { const s = localStorage.getItem("lia_sordell_answers"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [sordellLoading, setSordellLoading] = useState(false);
  const [sordellLoadingMore, setSordellLoadingMore] = useState(false);
  const [expandingTopic, setExpandingTopic] = useState(null); // topic string being expanded
  const [expandedTopics, setExpandedTopics] = useState({}); // {topic: [posts]}
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
  useEffect(() => { localStorage.setItem("lia_brands", JSON.stringify(brands)); }, [brands]);
  useEffect(() => { localStorage.setItem("lia_products", JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem("lia_tone", tone); }, [tone]);
  useEffect(() => { localStorage.setItem("lia_tov", toneOfVoice); }, [toneOfVoice]);
  useEffect(() => { localStorage.setItem("lia_platforms", JSON.stringify(platforms)); }, [platforms]);
  useEffect(() => { localStorage.setItem("lia_plan_period", planPeriod); }, [planPeriod]);
  useEffect(() => { localStorage.setItem("lia_personal_stories", JSON.stringify(personalStories)); }, [personalStories]);
  useEffect(() => { localStorage.setItem("lia_brand_q1", brandQ1); }, [brandQ1]);
  useEffect(() => { localStorage.setItem("lia_calendar", JSON.stringify(calendarPosts)); }, [calendarPosts]);
  useEffect(() => { localStorage.setItem("lia_audience_pains", JSON.stringify(audiencePains)); }, [audiencePains]);
  useEffect(() => { localStorage.setItem("lia_audience_barriers", JSON.stringify(audienceBarriers)); }, [audienceBarriers]);
  useEffect(() => { localStorage.setItem("lia_microsegments", JSON.stringify(microsegments)); }, [microsegments]);
  useEffect(() => { localStorage.setItem("lia_custom_formats", JSON.stringify(customFormats)); }, [customFormats]);
  useEffect(() => { localStorage.setItem("lia_personal_stories", JSON.stringify(personalStories)); }, [personalStories]);
  useEffect(() => { localStorage.setItem("lia_brand_q2", brandQ2); }, [brandQ2]);
  useEffect(() => { localStorage.setItem("lia_plan_freq", String(planMainFreq)); }, [planMainFreq]);
  useEffect(() => { if (planResult) localStorage.setItem("lia_plan_result", JSON.stringify(planResult)); }, [planResult]);
  useEffect(() => { if (planGeneratedAt) localStorage.setItem("lia_plan_generated_at", planGeneratedAt); }, [planGeneratedAt]);
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
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [editablePost, setEditablePost] = useState(null); // {platform, text}
  const [planProgress, setPlanProgress] = useState("");

  const [suggestingPillars, setSuggestingPillars] = useState(false);
  const [suggestedPillars, setSuggestedPillars] = useState([]);

  async function suggestTopicPains() {
    if (!topic.trim()) return;
    setSuggestingTopicPains(true);
    const prompt = `Ты маркетолог. Определи 4 конкретных боли аудитории которые связаны именно с этой темой поста.
Эксперт: ${expert||"-"}. Ниша: ${niche||"-"}. Аудитория: ${audience||"-"}.
Тема поста: "${topic}"
Боль — это конкретное переживание или страх который возникает у читателя в связи с этой темой. Формулируй словами читателя, коротко.
ТОЛЬКО валидный JSON: {"pains":["боль 1","боль 2","боль 3","боль 4"]}`;
    try {
      const resp = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:400,messages:[{role:"user",content:prompt}]})});
      const data = await resp.json();
      const text = data.content.map(b=>b.text||"").join("");
      const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
      if (parsed.pains?.length) setPain(parsed.pains[0]);
    } catch(e) { console.error(e); }
    setSuggestingTopicPains(false);
  }

  async function suggestBarriers() {
    setSuggestingBarriers(true);
    const prompt = `Ты маркетолог-психолог. Определи 5 главных барьеров аудитории перед обращением за помощью к специалисту.
Ниша: ${niche||"-"}. Аудитория: ${audience||"-"}.
Барьер — это конкретная мысль или страх который мешает человеку обратиться. Формулируй словами клиента.
Примеры: "я недостаточно плохо себя чувствую", "это для слабых", "слишком дорого", "я не знаю что будет", "я сам разберусь".
ТОЛЬКО валидный JSON: {"barriers":["барьер 1","барьер 2","барьер 3","барьер 4","барьер 5"]}`;
    try {
      const resp = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:600,messages:[{role:"user",content:prompt}]})});
      const data = await resp.json();
      const text = data.content.map(b=>b.text||"").join("");
      const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
      if (parsed.barriers?.length) setAudienceBarriers(parsed.barriers);
    } catch(e) { console.error(e); }
    setSuggestingBarriers(false);
  }

  async function suggestPains() {
    if (!niche && !audience) return;
    setSuggestingPains(true);
    const prompt = `Ты контент-стратег. Определи 6-7 главных болей целевой аудитории эксперта.

Ниша: ${niche || "-"}
Аудитория: ${audience || "-"}

Боли — это конкретные проблемы, страхи, разочарования, барьеры которые аудитория переживает прямо сейчас.
Каждая боль: 1 конкретное предложение, от первого лица аудитории.
Например: "Я знаю что надо делать, но никак не могу начать" или "Боюсь что вложу деньги и ничего не изменится".

ТОЛЬКО валидный JSON: {"pains":["боль 1","боль 2","боль 3","боль 4","боль 5","боль 6"]}`;

    try {
      const resp = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:500, messages:[{role:"user",content:prompt}] }),
      });
      const data = await resp.json();
      const text = data.content.map(b=>b.text||"").join("");
      const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
      setAudiencePains(parsed.pains || []);
    } catch(e) { console.error(e); }
    setSuggestingPains(false);
  }

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
      strategy: { ...strategyData, expert: expert || "", niche: niche || "" },
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

  function saveBrand() {
    if (!expert.trim()) return;
    setBrandChanged(false);
    setBrandSaved(true); setTimeout(()=>setBrandSaved(false), 2000);
    const brand = {
      id: Date.now(), expert, niche, audience, tone, toneOfVoice,
      platforms, pillars, audiencePains,
      sordellTopics: sordellResult || [],
      products: products || [],
      audienceBarriers: audienceBarriers || [],
      microsegments: microsegments || [],
      customFormats: customFormats || [],
      sordellAnswers: sordellAnswers || [],
      savedAt: new Date().toLocaleDateString("ru"),
    };
    const updated = [brand, ...brands.filter(b => b.expert !== expert)].slice(0, 10);
    setBrands(updated);
    localStorage.setItem("lia_brands", JSON.stringify(updated));
  }

  function loadBrand(brand) {
    setExpert(brand.expert || "");
    setNiche(brand.niche || "");
    setAudience(brand.audience || "");
    setTone(brand.tone || TONES[1]);
    setToneOfVoice(brand.toneOfVoice || "");
    setPlatforms(brand.platforms || ["telegram"]);
    setPillars(brand.pillars || []);
    setAudiencePains(brand.audiencePains || []);
    if (brand.products?.length) {
      setProducts(brand.products);
      localStorage.setItem("lia_products", JSON.stringify(brand.products));
    }
    if (brand.customFormats?.length) {
      setCustomFormats(brand.customFormats);
      localStorage.setItem("lia_custom_formats", JSON.stringify(brand.customFormats));
    }
    if (brand.microsegments?.length) {
      setMicrosegments(brand.microsegments);
      localStorage.setItem("lia_microsegments", JSON.stringify(brand.microsegments));
    }
    if (brand.audienceBarriers?.length) {
      setAudienceBarriers(brand.audienceBarriers);
      localStorage.setItem("lia_audience_barriers", JSON.stringify(brand.audienceBarriers));
    }
    if (brand.sordellTopics?.length) {
      setSordellResult(brand.sordellTopics);
      localStorage.setItem("lia_sordell_result", JSON.stringify(brand.sordellTopics));
    }
    if (brand.sordellAnswers?.length) {
      setSordellAnswers(brand.sordellAnswers);
      localStorage.setItem("lia_sordell_answers", JSON.stringify(brand.sordellAnswers));
    }
    setPlanResult(null);
    setShowBrandPicker(false);
    setBrandChanged(false);
  }

  function deleteBrand(id) {
    const updated = brands.filter(b => b.id !== id);
    setBrands(updated);
    localStorage.setItem("lia_brands", JSON.stringify(updated));
  }

  function addToCalendar(topic, platform, generationId, type, meta={}) {
    setCalendarModal({ topic, platform: platform||platforms[0]||"telegram", generationId, type, expert, ...meta });
    setCalendarDate("");
    setCalendarPlatform(platform||platforms[0]||"telegram");
  }

  function saveToCalendar() {
    if (!calendarDate || !calendarModal) return;
    const entry = {
      id: Date.now(),
      date: calendarDate,
      topic: calendarModal.topic,
      platform: calendarPlatform || calendarModal.platform,
      generationId: calendarModal.generationId || null,
      type: calendarModal.type || "topic",
      expert: calendarModal.expert || expert || "",
      hook: calendarModal.hook || "",
      quadrant: calendarModal.quadrant || "",
      reason: calendarModal.reason || "",
      createdAt: new Date().toISOString(),
    };
    setCalendarPosts(prev => [...prev, entry].sort((a,b) => a.date.localeCompare(b.date)));
    setCalendarModal(null);
  }

  function removeFromCalendar(id) {
    setCalendarPosts(prev => prev.filter(p => p.id !== id));
  }

  function moveCalendarPost(id, newDate) {
    setCalendarPosts(prev => prev.map(p => p.id === id ? {...p, date: newDate} : p).sort((a,b)=>a.date.localeCompare(b.date)));
  }

  function switchMode(newMode) {
    setMode(newMode);
    setResult(null);
    setError("");
    const hasContext = expert.trim() && platforms.length > 0;
    if (newMode === "post") { setStep(hasContext ? 2 : 1); }
    else if (newMode === "case") { setStep(hasContext ? 2 : 1); }
    else if (newMode === "carousel") { setStep(hasContext ? 2 : 1); setCarouselResult(null); }
    else if (newMode === "plan") {
      if (planResult && planResult.length > 0) setStep(5);
      else setStep(hasContext ? 2 : 1);
    }
    else if (newMode === "series") {
      setSeriesResult(null); setSeriesBlock(null); setSeriesTopic(""); setStep(1);
    }
    else if (newMode === "sordell") {
      if (sordellResult && sordellResult.length > 0) { setStep(2); setSordellStep(13); }
      else { setStep(2); setSordellStep(0); setSordellAnswers([]); setSordellCurrentAnswer(""); }
    }
  }

  function startCase() {
    setMode("case");
    setResult(null);
    setError("");
    // If context already filled, skip to step 2
    if (expert.trim() && platforms.length) setStep(2);
    else setStep(1);
  }
  function startPlan() {
    setMode("plan");
    setResult(null);
    if (planResult && planResult.length > 0) {
      setStep(5);
    } else {
      setStep(2);
    }
  }
  function startNewPlan() { setMode("plan"); setStep(2); setPlanResult(null); setResult(null); setError(""); }
  function startCarousel() { setMode("carousel"); setStep(2); setCarouselResult(null); setResult(null); }
  function startSordell() {
    setStep(2); // always reset step to avoid conflicts
    if (sordellResult) {
      setMode("sordell"); setSordellStep(13);
    } else {
      setMode("sordell"); setSordellStep(0); setSordellAnswers([]); setSordellCurrentAnswer("");
    }
  }
  function startSordellFresh() { setMode("sordell"); setStep(1); setSordellStep(0); setSordellAnswers([]); setSordellCurrentAnswer(""); setSordellResult(null); localStorage.removeItem("lia_sordell_result"); setPlanResult(null); }
  function startPost() {
    setShowBankOpyt(false);
    setShowPillarSetup(false);
    switchMode("post");
  }

  function toggle(id) {
    setPlatforms(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]); setBrandChanged(true);
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
  const selectedHookType = HOOK_TYPES.find(h => h.id === hookType);
  const selectedCarouselTemplate = CAROUSEL_TEMPLATES.find(t => t.id === carouselTemplate);
  // Auto-determine archetype from brand questions
  const selectedArchetype = (() => {
    if (!brandQ1 && !brandQ2) return null;
    const map = {
      "expert_facts": "sage",
      "expert_inspire": "mentor",
      "personal_journey": "hero",
      "personal_process": "creator",
      "rebel_truth": "rebel",
      "care_client": "caregiver",
    };
    const key = brandQ1 + "_" + brandQ2;
    // Simple matching logic
    if (brandQ1 === "как эксперта которому доверяют" && brandQ2 === "разборы и факты") return BRAND_ARCHETYPES.find(a=>a.id==="sage");
    if (brandQ1 === "как эксперта которому доверяют" && brandQ2 === "вдохновляющие примеры") return BRAND_ARCHETYPES.find(a=>a.id==="mentor");
    if (brandQ1 === "как человека который прошёл через то же") return BRAND_ARCHETYPES.find(a=>a.id==="hero");
    if (brandQ1 === "как того кто говорит правду") return BRAND_ARCHETYPES.find(a=>a.id==="rebel");
    if (brandQ1 === "как наставника который ведёт") return BRAND_ARCHETYPES.find(a=>a.id==="mentor");
    if (brandQ2 === "закулисье и процесс") return BRAND_ARCHETYPES.find(a=>a.id==="creator");
    if (brandQ2 === "поддержку и истории клиентов") return BRAND_ARCHETYPES.find(a=>a.id==="caregiver");
    return BRAND_ARCHETYPES[0];
  })();
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
      saveGeneration("sordell", `Темы Сорделл — ${expert||"эксперт"}`, { topics: parsed.topics }, { expert, niche });
    } catch(e) { setSordellError("Ошибка: " + e.message); }
    setSordellLoading(false);
  }

  async function generateMoreTopics() {
    setSordellLoadingMore(true);
    const existing = (sordellResult||[]).map(t=>t.topic).join(", ");
    const qa = SORDELL_QUESTIONS.map((q,i) => `Вопрос ${i+1}: ${q.q}\nОтвет: ${sordellAnswers[i]||"-"}`).join("\n\n");
    const personalCtx = (personalStories||[]).map(s=>"- "+s).join("\n");

    const prompt = `Ты — контент-стратег по личным брендам. На основе ответов эксперта найди НОВЫЕ темы для контента.

Эксперт: ${expert||"-"}. Ниша: ${niche||"-"}.

ОТВЕТЫ НА ВОПРОСЫ:
${qa}
${personalCtx ? "\nДОПОЛНИТЕЛЬНЫЙ ЛИЧНЫЙ ОПЫТ:\n" + personalCtx : ""}

УЖЕ НАЙДЕННЫЕ ТЕМЫ (не повторяй, не используй похожие углы):
${existing}

ЗАДАЧА: найди ещё 10 НОВЫХ сильных тем. Другие углы, другие аспекты, другие истории из ответов.
Для каждой темы: хук до 12 слов, квадрант Сорделл, топ-3 отметь звёздочкой.

ТОЛЬКО валидный JSON:
{"topics":[{"n":1,"topic":"тема","hook":"хук до 12 слов","quadrant":"Личное + Неожиданное","top":false,"reason":""}]}`;

    try {
      const resp = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:3000, messages:[{role:"user",content:prompt}] }),
      });
      const data = await resp.json();
      const text = data.content.map(b=>b.text||"").join("");
      const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
      const newTopics = parsed.topics || [];
      const combined = [...(sordellResult||[]), ...newTopics];
      setSordellResult(combined);
      localStorage.setItem("lia_sordell_result", JSON.stringify(combined));
    } catch(e) { console.error(e); }
    setSordellLoadingMore(false);
  }

  async function expandTopic(topic) {
    setExpandingTopic(topic);
    const prompt = `Ты — контент-стратег. Разверни одну тему в 8 конкретных идей для постов.

Эксперт: ${expert||"-"}. Ниша: ${niche||"-"}.
Тема для развёртки: "${topic}"

Создай 8 идей по матрице Пиллар × Сорделл:
- Причины × Личное + Неожиданное
- Ошибки × Профессиональное + Неожиданное
- Примеры × Личное + Известное
- Решения × Профессиональное + Известное
- Причины × Профессиональное + Неожиданное
- Ошибки × Личное + Неожиданное
- Примеры × Профессиональное + Неожиданное
- Решения × Личное + Неожиданное

Для каждой: конкретный заголовок поста (не абстрактный), хук до 10 слов.

ТОЛЬКО валидный JSON:
{"posts":[{"angle":"Причины","sordell":"Личное + Неожиданное","title":"конкретный заголовок поста","hook":"хук до 10 слов"}]}`;

    try {
      const resp = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:2000, messages:[{role:"user",content:prompt}] }),
      });
      const data = await resp.json();
      const text = data.content.map(b=>b.text||"").join("");
      const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
      const posts = parsed.posts||[];
      setExpandedTopics(prev=>({...prev, [topic]: posts}));
      saveGeneration("sordell_angles", `Углы: ${topic}`, { topic, angles: posts }, { expert, niche });
    } catch(e) { console.error(e); }
    setExpandingTopic(null);
  }

  async function generateFormatSeries(format, topicsList) {
    if (!format || !topicsList.length) return;
    setFormatSeriesLoading(true); setFormatSeriesResult(null);

    const topics = topicsList.slice(0, 20); // max 20 per request
    const prompt = `Ты опытный копирайтер для экспертов-психологов.

Эксперт: ${expert||"-"}. Ниша: ${niche||"-"}. Тон: ${tone}.

АВТОРСКИЙ ФОРМАТ «${format.name}»:
Вот пример поста в этом формате — изучи структуру, ритм, стиль, длину:
${format.example}

Напиши ${topics.length} постов в ТОЧНО ТАКОЙ ЖЕ структуре и стиле для каждой темы из списка.
Сохраняй: структуру, ритм предложений, длину, характерные приёмы автора.
Пиши на русском, в тоне оригинала.

Темы:
${topics.map((t,i) => (i+1)+". "+t).join("\n")}


ТОЛЬКО валидный JSON:
{"posts":[{"topic":"тема","text":"текст поста в авторском формате"}]}`;

    try {
      const resp = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:8000, messages:[{role:"user",content:prompt}] }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content.map(b=>b.text||"").join("");
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Нет JSON");
      const parsed = JSON.parse(match[0]);
      setFormatSeriesResult(parsed.posts||[]);
      saveGeneration("format_series", `Серия «${format.name}»`, {format:format.name, posts:parsed.posts}, {expert,niche});
    } catch(e) { console.error(e); }
    setFormatSeriesLoading(false);
  }

  async function generateSeries() {
    if (!seriesBlock || !seriesTopic.trim()) return;
    setSeriesLoading(true); setSeriesResult(null);
    const block = SERIES_BLOCKS.find(b => b.id === seriesBlock);
    if (!block) { setSeriesLoading(false); return; }
    const formulasList = block.formulas.map((f,i) => (i+1)+". "+f.label+": "+f.prompt).join("\n");
    const platform = block.platform === "telegram" ? "Telegram (150-400 слов, прозой)" : block.platform === "threads" ? "Threads (30-80 слов)" : "выбери сам по длине";

    const prompt = `Ты опытный контент-маркетолог для экспертов-психологов. Напиши серию постов.

Эксперт: ${expert||"психолог"}. Ниша: ${niche||"-"}.
Аудитория: ${audience||"-"}. Тон: ${tone}.
Тема серии: ${seriesTopic}

Платформа: ${platform}

Блок формул: ${block.label}
Напиши по одному посту для каждой формулы ниже:
${formulasList}

ПРАВИЛА КАЧЕСТВА (обязательно):
— Активный залог. Сильные глаголы. Никакого канцелярита.
— Конкретное > абстрактного. Сенсорные детали.
— Открытые финалы — не закрывать, не давать советы если формула не предполагает.
— Каждый пост самостоятельный — можно читать без других.

Ответь ТОЛЬКО валидным JSON:
{"posts":[{"formula_id":"id формулы","formula_label":"название формулы","text":"текст поста"}]}`;

    try {
      const resp = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:6000, messages:[{role:"user",content:prompt}] }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content.map(b=>b.text||"").join("");
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Нет JSON в ответе");
      const parsed = JSON.parse(match[0]);
      setSeriesResult(parsed.posts||[]);
      saveGeneration("series", `Серия: ${block.label} — ${seriesTopic}`, {block:block.label, topic:seriesTopic, posts:parsed.posts}, {expert,niche});
    } catch(e) { console.error(e); }
    setSeriesLoading(false);
  }

  async function generateCarousel() {
    if (!carouselTemplate) return;
    setCarouselLoading(true); setCarouselResult(null);
    const tmpl = CAROUSEL_TEMPLATES.find(t=>t.id===carouselTemplate);
    const prompt = `Ты контент-стратег. Создай карусель для соцсетей.

Эксперт: ${expert||"-"}, Ниша: ${niche||"-"}, Аудитория: ${audience||"-"}
Тема: ${topic||"-"}
Тональность: ${tone}
Голос бренда: ${toneOfVoice||"не задан"}
Боли аудитории: ${audiencePains.length>0?audiencePains.join("; "):"не указаны"}

Формат карусели: ${tmpl?.label}
${tmpl?.prompt}

Количество слайдов: ${carouselSlideCount}
Структура слайдов (ориентир): ${tmpl?.slides.join(" | ")}

Требования:
- Текст каждого слайда: 2-4 строки, конкретно и ёмко
- Обложка (слайд 1): цепляющий заголовок до 8 слов + подзаголовок
- Финальный слайд: чёткий CTA
- Язык: живой, разговорный, без клише
- Применяй принципы Will Storr: конкретные детали, активный язык, свежие метафоры
- Активный залог: не "было сделано" а "я сделала"; не "рекомендуется" а "рекомендую"
- Никакого канцелярита: убирай слова на -ние/-ция, "осуществлять", "являться", "в рамках"
- Конкретное > абстрактного: цифры, детали, сенсорные образы
- Варьируй длину предложений. Короткое предложение бьёт сильно.
- Убирай костыли: "очень", "буквально", "стоит отметить", "как известно"

ТОЛЬКО валидный JSON без markdown. Поля СТРОГО такие — не меняй названия:
{"title":"заголовок карусели","slides":[{"n":1,"title":"заголовок слайда","text":"текст 2-4 строки","type":"cover"},{"n":2,"title":"заголовок","text":"текст","type":"content"},{"n":7,"title":"CTA","text":"текст призыва","type":"cta"}]}`;

    try {
      const resp = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:3000, messages:[{role:"user",content:prompt}] }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content.map(b=>b.text||"").join("");
      let parsed;
      try { parsed = JSON.parse(text.replace(/```json|```/g,"").trim()); }
      catch { setCarouselLoading(false); return; }
      setCarouselResult(parsed);
      saveGeneration("carousel", topic, parsed, { carouselTemplate, carouselSlideCount });
    } catch(e) { console.error(e); }
    setCarouselLoading(false);
  }

  async function generateMoreTopics() {
    setSordellLoadingMore(true);
    const existing = (sordellResult||[]).map(t=>t.topic).join(", ");
    const qa = SORDELL_QUESTIONS.map((q,i) => `Вопрос ${i+1}: ${q.q}\nОтвет: ${sordellAnswers[i]||"-"}`).join("\n\n");
    const personalCtx = (personalStories||[]).map(s=>"- "+s).join("\n");

    const prompt = `Ты — контент-стратег по личным брендам. На основе ответов эксперта найди НОВЫЕ темы для контента.

Эксперт: ${expert||"-"}. Ниша: ${niche||"-"}.

ОТВЕТЫ НА ВОПРОСЫ:
${qa}
${personalCtx ? "\nДОПОЛНИТЕЛЬНЫЙ ЛИЧНЫЙ ОПЫТ:\n" + personalCtx : ""}

УЖЕ НАЙДЕННЫЕ ТЕМЫ (не повторяй, не используй похожие углы):
${existing}

ЗАДАЧА: найди ещё 10 НОВЫХ сильных тем. Другие углы, другие аспекты, другие истории из ответов.
Для каждой темы: хук до 12 слов, квадрант Сорделл, топ-3 отметь звёздочкой.

ТОЛЬКО валидный JSON:
{"topics":[{"n":1,"topic":"тема","hook":"хук до 12 слов","quadrant":"Личное + Неожиданное","top":false,"reason":""}]}`;

    try {
      const resp = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:3000, messages:[{role:"user",content:prompt}] }),
      });
      const data = await resp.json();
      const text = data.content.map(b=>b.text||"").join("");
      const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
      const newTopics = parsed.topics || [];
      const combined = [...(sordellResult||[]), ...newTopics];
      setSordellResult(combined);
      localStorage.setItem("lia_sordell_result", JSON.stringify(combined));
    } catch(e) { console.error(e); }
    setSordellLoadingMore(false);
  }


  async function generateFormatSeries(format, topicsList) {
    if (!format || !topicsList.length) return;
    setFormatSeriesLoading(true); setFormatSeriesResult(null);

    const topics = topicsList.slice(0, 20); // max 20 per request
    const prompt = `Ты опытный копирайтер для экспертов-психологов.

Эксперт: ${expert||"-"}. Ниша: ${niche||"-"}. Тон: ${tone}.

АВТОРСКИЙ ФОРМАТ «${format.name}»:
Вот пример поста в этом формате — изучи структуру, ритм, стиль, длину:
${format.example}

Напиши ${topics.length} постов в ТОЧНО ТАКОЙ ЖЕ структуре и стиле для каждой темы из списка.
Сохраняй: структуру, ритм предложений, длину, характерные приёмы автора.
Пиши на русском, в тоне оригинала.

Темы:
${topics.map((t,i)=>(i+1)+'. '+t).join('\n')}

ТОЛЬКО валидный JSON:
{"posts":[{"topic":"тема","text":"текст поста в авторском формате"}]}`;

    try {
      const resp = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:8000, messages:[{role:"user",content:prompt}] }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content.map(b=>b.text||"").join("");
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Нет JSON");
      const parsed = JSON.parse(match[0]);
      setFormatSeriesResult(parsed.posts||[]);
      saveGeneration("format_series", `Серия «${format.name}»`, {format:format.name, posts:parsed.posts}, {expert,niche});
    } catch(e) { console.error(e); }
    setFormatSeriesLoading(false);
  }

  async function generateSeries() {
    if (!seriesBlock || !seriesTopic.trim()) return;
    setSeriesLoading(true); setSeriesResult(null);
    const block = SERIES_BLOCKS.find(b => b.id === seriesBlock);
    if (!block) { setSeriesLoading(false); return; }

    const platform = block.platform === "telegram" ? "Telegram (150-400 слов, прозой)" : block.platform === "threads" ? "Threads (30-80 слов)" : "выбери сам по длине";

    const prompt = `Ты опытный контент-маркетолог для экспертов-психологов. Напиши серию постов.

Эксперт: ${expert||"психолог"}. Ниша: ${niche||"-"}.
Аудитория: ${audience||"-"}. Тон: ${tone}.
Тема серии: ${seriesTopic}

Платформа: ${platform}

Блок формул: ${block.label}
Напиши по одному посту для каждой формулы ниже:
${formulasList}

ПРАВИЛА КАЧЕСТВА (обязательно):
— Активный залог. Сильные глаголы. Никакого канцелярита.
— Конкретное > абстрактного. Сенсорные детали.
— Открытые финалы — не закрывать, не давать советы если формула не предполагает.
— Каждый пост самостоятельный — можно читать без других.

Ответь ТОЛЬКО валидным JSON:
{"posts":[{"formula_id":"id формулы","formula_label":"название формулы","text":"текст поста"}]}`;

    try {
      const resp = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:6000, messages:[{role:"user",content:prompt}] }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content.map(b=>b.text||"").join("");
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Нет JSON в ответе");
      const parsed = JSON.parse(match[0]);
      setSeriesResult(parsed.posts||[]);
      saveGeneration("series", `Серия: ${block.label} — ${seriesTopic}`, {block:block.label, topic:seriesTopic, posts:parsed.posts}, {expert,niche});
    } catch(e) { console.error(e); }
    setSeriesLoading(false);
  }

  async function generateCarousel() {
    if (!topic.trim()) { return; }
    setCarouselLoading(true); setCarouselResult(null);
    const tmpl = CAROUSEL_TEMPLATES.find(t=>t.id===carouselTemplate) || CAROUSEL_TEMPLATES[0];

    const prompt = `Ты эксперт по контент-маркетингу. Создай карусель для Instagram/Telegram.

Эксперт: ${expert||"-"}, Ниша: ${niche||"-"}, Аудитория: ${audience||"-"}
Тема карусели: ${topic}
Боли аудитории: ${audiencePains.length>0?audiencePains.join("; "):"-"}
Голос бренда: ${tone}${toneOfVoice?"\n"+toneOfVoice:""}

Шаблон: ${tmpl.label} — ${tmpl.desc}
${tmpl.prompt}

Количество слайдов: ${carouselSlides}
Структура слайдов: ${tmpl.structure.slice(0,carouselSlides).join(" | ")}

Правила текста (Will Storr + Хиз):
- Заголовок обложки: до 8 слов, цепляющий, с неожиданным элементом
- Каждый слайд: заголовок (до 6 слов) + текст (2-4 строки, конкретно и сенсорно)
- Никаких абстракций — только конкретные детали и образы
- Финальный слайд: чёткий CTA

ТОЛЬКО валидный JSON:
{"title":"заголовок карусели","slides":[{"n":1,"heading":"заголовок слайда","text":"текст 2-4 строки","note":"тип: обложка/контент/финал"}]}`;

    try {
      const resp = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:4000, messages:[{role:"user",content:prompt}] }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content.map(b=>b.text||"").join("");
      const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
      setCarouselResult(parsed);
      saveGeneration("carousel", topic, parsed, { carouselTemplate, carouselSlideCount });
    } catch(e) { console.error(e); }
    setCarouselLoading(false);
  }

  async function generateWithOverrides({ topicOverride, sordellQuadOverride, rubricOverride }) {
    setLoading(true); setError(""); setResult(null);
    setMode("post"); setStep(5);  // go straight to result step

    const useTopic = topicOverride || topic;
    const useSordellQuad = sordellQuadOverride || sordellQuad;
    const useRubric = rubricOverride || rubric || "personal";
    const useSordell = SORDELL_MATRIX.find(q=>q.id===useSordellQuad);
    const useStage = AWARENESS_STAGES.find(s=>s.id===stage) || AWARENESS_STAGES[0];
    const useCta = CTA_OPTIONS.find(c=>c.id===cta) || {label:"по контексту"};
    const usePlatforms = platforms.length ? platforms : ["telegram"];
    const names = PLATFORMS.filter(p=>usePlatforms.includes(p.id)).map(p=>p.label).join(", ");
    const tovSection = toneOfVoice.trim() ? `\nГолос бренда (используй КАК ОБРАЗЕЦ СТИЛЯ, не копируй текст дословно):\n"${toneOfVoice}"\n` : "";
    const useLength = LENGTH_OPTIONS.find(l=>l.id===length) || LENGTH_OPTIONS[1];

    const jsonFields = usePlatforms.map(pid => `"${pid}": "текст поста для ${PLATFORMS.find(p=>p.id===pid)?.label||pid}"`).join(", ");

    const prompt = `Ты опытный SMM-стратег и контент-маркетолог. Пиши на русском языке.

Эксперт/бренд: ${expert||"-"}
Ниша: ${niche||"-"}
Аудитория: ${selectedMs&&microsegments.find(m=>m.id===selectedMs)?`${microsegments.find(m=>m.id===selectedMs).name}: ${microsegments.find(m=>m.id===selectedMs).desc}`:audience||"-"}
${selectedMs&&microsegments.find(m=>m.id===selectedMs)?.language?`Язык аудитории (используй эти формулировки): ${microsegments.find(m=>m.id===selectedMs).language}`:""}
Боли аудитории: ${audiencePains.length>0?audiencePains.map((p,i)=>`${i+1}. ${p}`).join("; "):"не указаны"}
Тональность: ${tone}
${tovSection}
Тема поста: ${useTopic}

СТРАТЕГИЯ:
- Матрица Сорделл: ${useSordell?.label||"Личное + Неожиданное"} — ${useSordell?.prompt||"личный опыт с неожиданным поворотом"}
- Рубрика: ${useRubric==="personal"?"Личный — история от первого лица, трансформация убеждений":"Экспертный — факты, разборы, знания"}
- Стадия аудитории: ${useStage.label}
- Длина: ${useLength.label} (${useLength.desc})

ПРАВИЛА:
— Активный залог. Сильные глаголы. Никакого канцелярита.
— Конкретные детали > абстракций. Сенсорный язык.
— Варьируй длину предложений.
— Начни с неожиданного — нарушай предсказание читателя.

ПЛАТФОРМЫ для генерации: ${names}
Для каждой платформы напиши отдельный адаптированный текст.

Ответь ТОЛЬКО валидным JSON без markdown:
{"headline": "заголовок поста до 10 слов", "hook": "хук 1-2 предложения", ${jsonFields}}`;

    try {
      const resp = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-haiku-4-5-20251001",
          max_tokens:4000,
          messages:[{role:"user",content:prompt}],
        }),
      });
      if (!resp.ok) throw new Error("Ошибка API: " + resp.status);
      const data = await resp.json();
      if (data.error) throw new Error(data.error.message||JSON.stringify(data.error));
      if (!data.content) throw new Error("Пустой ответ от API");
      const text = data.content.map(b=>b.text||"").join("");
      if (!text.trim()) throw new Error("Модель не вернула текст");
      let parsed;
      try {
        const clean = text.replace(/```json|```/g,"").trim();
        parsed = JSON.parse(clean);
      } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          try { parsed = JSON.parse(match[0]); }
          catch { throw new Error("Ошибка разбора JSON: " + text.substring(0,100)); }
        } else {
          throw new Error("Нет JSON в ответе: " + text.substring(0,100));
        }
      }
      const hasText = usePlatforms.some(pid => parsed[pid]);
      if (!hasText) {
        // Try to use any string field as content
        const anyField = Object.entries(parsed).find(([k,v])=>typeof v==="string"&&v.length>50&&k!=="headline"&&k!=="hook");
        if (anyField) { parsed[usePlatforms[0]] = anyField[1]; }
        else throw new Error("Текст постов не найден в ответе");
      }
      setResult(parsed);
      setTopic(useTopic);
      setActiveTab(usePlatforms[0]);
      setStep(5);
      saveGeneration("post", useTopic, parsed, { sordellQuad: useSordellQuad, rubric: useRubric });
    } catch(e) {
      setError("Ошибка генерации: " + (e.message||"Попробуй снова"));
      // Return to plan if we came from plan, otherwise stay on current step
      if (mode === "post" && !result) {
        setMode("plan"); setStep(5);
      }
    }
    setLoading(false);
  }

  async function generatePlanChunk(chunkLabel, chunkPosts, sordellCtx, archetypeCtx, prevCtx, blocksText) {

    // Platform-aware stage distribution
    const tgPosts = platforms.filter(p=>p==="telegram").length > 0
      ? Math.round(chunkPosts * (planPlatformFreqs["telegram"] ?? PLATFORM_FREQ_HINTS["telegram"]?.rec ?? 3) /
        platforms.reduce((s,p)=>s+(planPlatformFreqs[p]??PLATFORM_FREQ_HINTS[p]?.rec??3),0) * chunkPosts)
      : 0;
    const thPosts = chunkPosts - tgPosts;

    // MS distribution
    const msDistText = microsegments.length > 0
      ? microsegments.reduce((acc,ms) => {
          const pct = parseInt(ms.planPercent)||Math.round(100/microsegments.length);
          const count = Math.max(1, Math.round(chunkPosts * pct / 100));
          return acc + "— " + ms.name + " (" + pct + "%, ~" + count + " постов): " + ms.desc + ". Боли: " + (ms.pains||"-") + ". Язык: " + (ms.language||"-") + "\n";
        }, "МИКРОСЕГМЕНТЫ (строго соблюдай пропорции):\n")
      : "";


    // Launch phase text
    const launchText = (launchMode && selectedProduct) ? `
ПРОГРЕВ К ПРОДУКТУ «${selectedProduct.name}»:
Фаза 1 (прогрев темы): посты для Threads/Instagram, стадии 0-1, продукт НЕ упоминать
Фаза 2 (прогрев продукта): стадии 2-3, можно намекнуть «скоро расскажу подробнее»
Фаза 3 (продажи): стадии 3-4, только Telegram, полное раскрытие продукта
Барьер: ${selectedProduct.barrier||"-"}. Результат: ${selectedProduct.result||"-"}` : "";

    const platBreakdown = platforms.map(pid=>{
      const p = PLATFORMS.find(pl=>pl.id===pid);
      const freq = planPlatformFreqs[pid] ?? PLATFORM_FREQ_HINTS[pid]?.rec ?? 3;
      return `${p?.label}: ${freq} постов/нед`;
    }).join(", ");

    // Build audience pains and barriers context
    const painsCtx = audiencePains.length > 0
      ? "БОЛИ АУДИТОРИИ (главный источник тем — 60-70% постов должны отвечать на эти боли):\n" +
        audiencePains.map(p => "— " + p).join("\n")
      : "";
    const barriersCtx = audienceBarriers.length > 0
      ? "БАРЬЕРЫ АУДИТОРИИ (темы для стадий 2-3, снятие возражений):\n" +
        audienceBarriers.map(b => "— " + b).join("\n")
      : "";

    const prompt = `Ты контент-стратег. Составь детальный контент-план: ${chunkLabel}

Эксперт: ${expert||"-"}, Ниша: ${niche||"-"}, Тональность: ${tone}
Платформы: ${platBreakdown}
Всего постов: ${chunkPosts}

ПЛАТФОРМЕННЫЕ ПРАВИЛА (СТРОГО ОБЯЗАТЕЛЬНО):
${platforms.includes("threads") ? "• Threads: стадии 0-1-2 ТОЛЬКО, длина 30-80 слов, без заголовков, формат личное/неожиданное" : ""}
${platforms.includes("instagram") ? "• Instagram: стадии 0-1-2 ТОЛЬКО, визуальный крючок, 30-100 слов" : ""}
${platforms.includes("telegram") ? "• Telegram: стадии 2-3-4, глубина, 150-400 слов, можно заголовок" : ""}

СМЫСЛОВЫЕ БЛОКИ (чередуй равномерно): ${blocksText}

${painsCtx}

${barriersCtx}

РАСПРЕДЕЛЕНИЕ ТЕМ:
— 60-70% постов: темы из болей аудитории выше (узнавание боли, называние, объяснение механизма)
— 15-20% постов: личный опыт эксперта (наблюдения из практики, истории клиентов)
— 10-15% постов: экспертные инсайты, механизмы, факты
${sordellCtx ? "— Личный опыт ТОЛЬКО из этого списка:\n" + sordellCtx : ""}

${msDistText}
${launchText}
${prevCtx}

Матрица Сорделл: 40% Личное+Неожиданное, 30% Проф+Неожиданное, 20% Личное+Известное, 10% Проф+Известное.
Threads/Instagram → только Личное+Неожиданное и Проф+Неожиданное.

ТОЛЬКО валидный JSON (без markdown):
{"posts":[{"day":"День 1","platform":"threads","block":"блок","topic":"конкретная тема основанная на болях ца","stage":"Не осознаёт проблему","sordell":"Личное + Неожиданное","ms":"${microsegments[0]?.name||""}","phase":0,"function":"узнавание"}]}

Поле ms: имя МС из списка выше или пусто.
Поле phase: 1/2/3 если есть запуск, иначе 0.
Поле stage СТРОГО одно из: "Не осознаёт проблему","Осознаёт проблему","Ищет решение","Выбирает решение","Готов к покупке"
`;

    try {
      const resp = await fetch("/api/claude", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:4000, messages:[{role:"user",content:prompt}] })
      });
      const data = await resp.json();
      const text = data.content?.map(b=>b.text||"").join("")||"";
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return [];
      const parsed = JSON.parse(match[0]);
      return parsed.posts||[];
    } catch(e) { console.error(e); return []; }
  }
  async function generatePlan() {
    setLoading(true); setError(""); setPlanProgress("");

    const weekTotal = platforms.reduce((sum,pid)=>sum+(planPlatformFreqs[pid]??PLATFORM_FREQ_HINTS[pid]?.rec??3),0);
    const blocksText = pillars.length > 0 ? pillars.join(", ") : "темы ниши";

    const sordellAnswersText = (sordellAnswers||[]).map(a=>a?.trim()?("- "+a):null).filter(Boolean).join("\n");
    const personalStoriesText = (personalStories||[]).map(s=>"- "+s).join("\n");
    const allPersonalCtx = [sordellAnswersText, personalStoriesText].filter(Boolean).join("\n");
    const sordellCtx = allPersonalCtx ? "\nРЕАЛЬНЫЙ ЛИЧНЫЙ ОПЫТ (только для личных тем):\n" + allPersonalCtx : "";
    const previousTopics = history.filter(h=>h.type==="plan"&&h.result).flatMap(h=>Array.isArray(h.result)?h.result.map(p=>p.topic):[]).filter(Boolean).slice(0,30);
    let prevCtx = previousTopics.length > 0 ? "\nУЖЕ ИСПОЛЬЗОВАННЫЕ ТЕМЫ (не повторяй):\n"+previousTopics.map(t=>"- "+t).join("\n") : "";

    try {
      let allPosts = [];

      if (planPeriod === "week") {
        setPlanProgress("Генерирую неделю…");
        const posts = await generatePlanChunk("Неделя", weekTotal, sordellCtx, "", prevCtx, blocksText);
        allPosts = posts;

      } else if (planPeriod === "two_weeks") {
        for (let w = 1; w <= 2; w++) {
          setPlanProgress(`Генерирую неделю ${w} из 2…`);
          const posts = await generatePlanChunk(`2 недели, Неделя ${w}`, weekTotal, sordellCtx, "", prevCtx, blocksText);
          allPosts = [...allPosts, ...posts];
        }

      } else if (planPeriod === "three_weeks") {
        for (let w = 1; w <= 3; w++) {
          setPlanProgress(`Генерирую неделю ${w} из 3…`);
          const posts = await generatePlanChunk(`3 недели, Неделя ${w}`, weekTotal, sordellCtx, "", prevCtx, blocksText);
          allPosts = [...allPosts, ...posts];
        }

      } else if (planPeriod === "month") {
        for (let w = 1; w <= 4; w++) {
          setPlanProgress(`Генерирую неделю ${w} из 4…`);
          const posts = await generatePlanChunk(`Месяц, Неделя ${w}`, weekTotal, sordellCtx, "", prevCtx, blocksText);
          allPosts = [...allPosts, ...posts];
          prevCtx += "\n" + posts.map(p=>"- "+p.topic).join("\n");
        }

      } else if (planPeriod === "quarter") {
        const monthLabels = [
          "Месяц 1 — Осознание проблемы",
          "Месяц 2 — Углубление и доверие",
          "Месяц 3 — Конверсия и лояльность",
        ];
        for (let m = 0; m < 3; m++) {
          for (let w = 1; w <= 4; w++) {
            setPlanProgress(`${monthLabels[m].split("—")[0].trim()}, неделя ${w} из 4…`);
            const posts = await generatePlanChunk(`${monthLabels[m]}, Неделя ${w}`, weekTotal, sordellCtx, "", prevCtx, blocksText);
            allPosts = [...allPosts, ...posts];
            prevCtx += "\n" + posts.map(p=>"- "+p.topic).join("\n");
          }
        }
      }

      setPlanResult(allPosts);
      setPlanGeneratedAt(new Date().toLocaleString("ru", {day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"}));
      setStep(5);
      setPlanProgress("");
      saveGeneration("plan", `План (${planPeriod==="week"?"неделя":planPeriod==="two_weeks"?"2 недели":planPeriod==="three_weeks"?"3 недели":planPeriod==="month"?"месяц":"квартал"}) — ${expert||"эксперт"}`, { posts: allPosts }, { planPeriod, platforms, expert, niche });
    } catch(e) {
      setError("Ошибка: " + e.message);
      setPlanProgress("");
    }
    setLoading(false);
  }

  async function generate() {
    if (!topic.trim()) { setError("Укажи тему поста"); return; }
    setLoading(true); setError(""); setResult(null);

    const names = PLATFORMS.filter(p => platforms.includes(p.id)).map(p => p.label).join(", ");
    const tovSection = toneOfVoice.trim() ? `\nГолос бренда (используй КАК ОБРАЗЕЦ СТИЛЯ, не копируй текст дословно):\n"${toneOfVoice}"\n` : "";

        // Launch mode instructions
    const launchSection = (launchMode && selectedProduct && selectedPhase) ? `

РЕЖИМ ЗАПУСКА ПРОДУКТА:
Продукт: ${selectedProduct.name}
Тип: ${selectedProduct.type}
Формат: ${selectedProduct.format||""}
Стоимость: ${selectedProduct.cost||""}
Дата старта: ${selectedProduct.startDate||""}
Мест: ${selectedProduct.spots||""}
Барьер аудитории: ${selectedProduct.barrier||""}
Ключевой результат: ${selectedProduct.result||""}
${selectedProduct.aiDesc?"Для промпта: "+selectedProduct.aiDesc:""}

ФАЗА ${selectedPhase}:
${selectedPhase===1?"Тема поста: "+selectedProduct.pillar+". ЗАПРЕЩЕНО упоминать продукт, программу или услуги. Цель: читатель узнаёт себя в теме.":""}
${selectedPhase===2?"Можно один раз мягко упомянуть что эксперт работает с этой темой. Формат: «скоро расскажу подробнее». Название продукта пока НЕ называть.":""}
${selectedPhase===3?"Полное раскрытие: включи название "+selectedProduct.name+", формат "+selectedProduct.format+", стоимость "+selectedProduct.cost+", дату "+selectedProduct.startDate+". Сними барьер аудитории. Покажи ключевой результат.":""}
` : "";

    const caseSection = isCase ? `
Это кейс / история успеха клиента. Адаптируй под формат "было → стало → результат".
Клиент/герой кейса: ${caseClient || "не указано"}
Ниша/контекст клиента: ${caseNiche || "не указано"}
Ситуация ДО: ${caseBefore || "не указано"}
Что было сделано / изменилось: ${caseAfter || "не указано"}
Результат (цифры, факты, эмоции): ${caseResult || "не указано"}
Напиши эмоциональную историю от третьего лица. Конкретные детали важны — они создают доверие.` : "";

        // Rubric-specific prompt additions
    const rubricPrompt = rubric === "engaging" 
      ? "\n\nДОПОЛНИТЕЛЬНАЯ ФУНКЦИЯ — ВОВЛЕКАЮЩИЙ: Заверши пост вопросом к аудитории который провоцирует ответ в комментариях. Вопрос должен быть личным и конкретным."
      : rubric === "pain"
      ? "\n\nДОПОЛНИТЕЛЬНАЯ ФУНКЦИЯ — БОЛЬ/ПРОБЛЕМА: Весь пост строится вокруг точного называния боли читателя его словами. Тон: «я вижу тебя». Без объяснений причин и без решений в конце."
      : rubric === "selling"
      ? "\n\nДОПОЛНИТЕЛЬНАЯ ФУНКЦИЯ — ПРОДАЮЩИЙ: Включи конкретный оффер и прямой призыв к действию в конце поста. Пиши спокойно и без давления."
      : "";

    const strategySection = `
СТРАТЕГИЯ ПОСТА:
- Квадрант Сорделл: ${selectedSordell?.label || "Личное + Неожиданное"} — ${selectedSordell?.prompt || ""}
- Стадия аудитории: ${selectedStage?.label || "не выбрана"} → цель: ${selectedStage?.goal || ""}
- Смысловой блок: ${pillar || "выбери из ниши"}
- Угол подачи: ${PILLAR_ANGLES.find(a=>a.id===pillarAngle)?.label || "Причины / Ошибки / Примеры / Решения на выбор"}
- Боль аудитории: ${pain || "не указана"}
- CTA: ${selectedCta?.label || "по контексту"}${rubricPrompt}`;

    const prompt = `Ты опытный SMM-стратег и контент-маркетолог.

Эксперт/бренд: ${expert || "-"}
Ниша: ${niche || "-"}
Аудитория: ${audience || "-"}
Боли аудитории: ${audiencePains.length > 0 ? audiencePains.map((p,i)=>`${i+1}. ${p}`).join("; ") : "не указаны"}
Барьеры аудитории: ${audienceBarriers?.length > 0 ? audienceBarriers.join("; ") : "не указаны"}
Тональность: ${tone}
${tovSection}
${launchSection}
${selectedFormula?`ФОРМУЛА ПОСТА (используй эту структуру как основу):\n"${POST_FORMULAS.find(f=>f.id===selectedFormula)?.text}"\nЗаполни шаблон содержанием темы. Сохрани ритм и структуру формулы.`:""}
Тема: ${isCase ? (pain || "история успеха клиента") : topic}
Ключевые факты и УТП: ${details || "нет"}
${caseSection}
${strategySection}

Создай контент:

1. ЗАГОЛОВОК: цепляющий заголовок поста (до 10 слов), учитывая стадию аудитории и рубрику.
2. ХУК: 1-2 предложения которые останавливают скролл. Должен точно бить в боль: "${pain || topic}". ВАЖНО: хук — это отдельный элемент, НЕ повторяй его в теле поста.
3. ПОСТЫ для платформ: ${names}

Формат поста: ${LENGTH_OPTIONS.find(l=>l.id===length)?.label} — ${LENGTH_OPTIONS.find(l=>l.id===length)?.desc}
ПЛАТФОРМЕННЫЕ ПРАВИЛА (строго):
- Threads: 30-80 слов, хук в первых 2 строках, наблюдение из жизни без профессионального жаргона, стадии 0-2
- Telegram: 150-400 слов, экспертный голос + личный опыт, стадии 1-4
- Личный пост: CTA только вопрос или точка, БЕЗ упоминания услуг

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

— НЕЙРОБИОЛОГИЯ СТОРИТЕЛЛИНГА (Will Storr, The Science of Storytelling):
${hookType ? `ТИП ХУКА — строго следуй этой инструкции: ${selectedHookType?.prompt}` : "Используй неожиданное изменение или нарушение предсказания чтобы активировать мозг читателя с первой строки."}
— Активный протагонист: герой ДЕЛАЕТ выбор и действует, вещи не просто случаются с ним.
${rubric==="personal" || sordellQuad?.includes("personal") ? "— Покажи трансформацию: персонаж начинает с одним убеждением и заканчивает другим. Не заканчивай там же где начал." : ""}
— Специфичные детали > абстракций. «Пыль толщиной в палец» лучше чем «много пыли».
— Свежий язык: избегай стёртых фраз ниши. Найди неожиданный образ или метафору.
${rubric==="pain" || rubric==="personal" ? "— Сенсорный язык: минимум 2-3 детали через зрение/звук/запах/осязание чтобы читатель ощутил, а не просто понял." : ""}


— ПРАВИЛА КАЧЕСТВЕННОГО РУССКОГО ТЕКСТА:

ГЛАГОЛЫ И ДЕЙСТВИЕ:
- Используй сильные глаголы с приставками: не "пошёл" а "прошмыгнул/вломился/выскочил"
- Активный залог всегда: не "было принято решение" а "я решила"; не "рекомендуется" а "рекомендую"
- Никаких едва-глаголов: "являться", "осуществлять", "иметь место" — заменяй живыми глаголами
- Никаких безличных конструкций: "необходимо", "следует", "рекомендуется" убивают голос автора

СЛОВА И КОНКРЕТНОСТЬ:
- Конкретное сильнее абстрактного: не "работа требует эмпатии" а "она сказала 'я понимаю' — клиент успокоился"
- Убирай слова-костыли: "очень", "весьма", "довольно", "буквально", "реально", "как бы", "своего рода"
- Убирай вводные слова если без них не хуже: "безусловно", "несомненно", "разумеется", "очевидно"
- Убирай заполнители: "стоит отметить", "необходимо подчеркнуть", "как известно", "не секрет что"
- Не начинай каждое предложение с "Я" — меняй структуру

ГЛАВНЫЙ ВРАГ — КАНЦЕЛЯРИТ:
- Существительные на -ние/-ция/-ость — заменяй глаголами где возможно
- Не нанизывай существительные: не "результаты анализа динамики показателей" а "как изменилась эффективность"
- Не злоупотребляй причастными оборотами: не "являясь специалистом, имеющим опыт" а "десять лет я работаю"
- Избегай: "в целях", "в рамках", "посредством", "в части", "по вопросу"

РИТМ И СТРУКТУРА:
- Варьируй длину предложений. Иногда одно слово — абзац. Это работает.
- Важная мысль — в конец предложения (рема)
- Одна мысль — один абзац. В соцсетях это критично
- Тире — мощный инструмент, но не в каждом предложении

ОБРАЗЫ:
- Минимум одна сенсорная деталь (запах, звук, текстура, цвет)
- Живые метафоры, не мёртвые клише: не "точка роста/дорожная карта/боли клиента"
- "Смотреть/глядеть/пялиться/зыркать" — это разные люди в разных ситуациях

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

ТОЛЬКО валидный JSON без markdown. Строго следуй этому формату — включай ТОЛЬКО эти платформы:
${'{"headline":"заголовок","hook":"хук",' + platforms.map(pid=>`"${pid}":"полный текст поста для ${PLATFORMS.find(p=>p.id===pid)?.label||pid}"`).join(",") + '}'}`;

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

  // Auto-generate from plan (handled via generateFromCard)

  const isMobile = useIsMobile();
  const activePlatform = PLATFORMS.find(p=>p.id===activeTab);

  // — API SETUP —

  // — MAIN —
  return (
    <div style={{minHeight:"100vh",background:S.bg,color:S.text,fontFamily:"sans-serif"}}>
      <div style={{maxWidth:isMobile?660:1100,margin:"0 auto",padding:isMobile?"0 8px 80px":"0 24px 80px"}}>

        {/* Header */}
        <div style={{background:"#362d52",marginBottom:0}}>

          {/* Top bar: logo + tagline + auth */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px 8px",gap:12}}>
            <div style={{flexShrink:0}}>
              <div style={{fontSize:16,letterSpacing:".2em",textTransform:"uppercase",color:"rgba(225,223,44,.8)",fontWeight:600,lineHeight:1.3}}>Content</div>
              <div style={{fontSize:16,letterSpacing:".2em",textTransform:"uppercase",color:"rgba(225,223,44,.8)",fontWeight:600,lineHeight:1.3}}>Intelligence</div>
            </div>
            <div style={{flex:1,textAlign:"center"}}>
              <div style={{fontFamily:"Georgia,serif",fontSize:isMobile?"14px":"17px",color:"#f4f1ec",lineHeight:1.3,fontStyle:"italic",opacity:.9}}>
                Тема → стратегия → посты
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
              {user ? (
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:10,color:"rgba(244,241,236,.5)"}}>{user.email?.split("@")[0]}</span>
                    <button onClick={signOut} title="Выйти" style={{padding:"2px 7px",borderRadius:5,border:"1px solid rgba(244,241,236,.15)",background:"transparent",color:"rgba(244,241,236,.5)",fontSize:10,cursor:"pointer"}}>↩</button>
                  </div>
                  <button onClick={()=>setShowHistory(!showHistory)}
                    style={{padding:"7px 14px",borderRadius:8,border:`1px solid ${showHistory?"#e1df2c":"rgba(244,241,236,.25)"}`,background:showHistory?"rgba(225,223,44,.15)":"rgba(255,255,255,.08)",color:showHistory?"#e1df2c":"#f4f1ec",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",width:"100%",textAlign:"center"}}>
                    📋 История {history.length>0&&`(${history.length})`}
                  </button>
                  <button onClick={()=>setShowBrandPicker(true)}
                    style={{padding:"7px 14px",borderRadius:8,border:"1px solid rgba(244,241,236,.25)",background:"rgba(255,255,255,.08)",color:"#f4f1ec",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",width:"100%",textAlign:"center"}}>
                    🏷 Мои бренды {brands.length>0&&`(${brands.length})`}
                  </button>
                </div>
              ) : (
                <button onClick={()=>setShowAuth(true)} style={{padding:"8px 16px",borderRadius:8,border:"none",background:"#e1df2c",color:"#362d52",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
                  Войти
                </button>
              )}
            </div>
          </div>

          {/* Row 1 — База знаний эксперта */}
          <div style={{display:"flex",gap:5,padding:"0 16px 8px",justifyContent:"center",flexWrap:"wrap",borderBottom:"1px solid rgba(244,241,236,.1)"}}>
            {[
              {
                label:`👤 Контекст`,
                active:mode==="post"&&step===1&&!showPillarSetup&&!showBankOpyt&&!showCalendar&&!showProducts,
                onClick:()=>{setShowPillarSetup(false);setShowBankOpyt(false);setShowCalendar(false);setShowProducts(false);setMode("post");setResult(null);setStep(1);}
              },{
                label:`📌 Блоки${pillars.length?" ("+pillars.length+")":""}`,
                active:showPillarSetup,
                onClick:()=>{const next=!showPillarSetup;setShowPillarSetup(next);setShowBankOpyt(false);setShowCalendar(false);setShowProducts(false);if(next){setMode("post");}}
              },{
                label:`🎯 Темы${sordellResult?" ("+sordellResult.length+")":""}`,
                active:mode==="sordell"&&!showPillarSetup&&!showBankOpyt&&!showCalendar&&!showProducts,
                onClick:()=>{setShowBankOpyt(false);setShowPillarSetup(false);setShowCalendar(false);setShowProducts(false);startSordell();}
              },{
                label:"📝 Банк опыта",
                active:showBankOpyt,
                onClick:()=>{const next=!showBankOpyt;setShowBankOpyt(next);setShowPillarSetup(false);setShowCalendar(false);setShowProducts(false);if(next){setMode("post");}}
              },{
                label:"📅 Контент-план",
                active:mode==="plan"&&!showPillarSetup&&!showBankOpyt&&!showCalendar&&!showProducts,
                onClick:()=>{setShowBankOpyt(false);setShowPillarSetup(false);setShowCalendar(false);setShowProducts(false);startPlan();}
              },{
                label:`📆 Календарь${calendarPosts.length?" ("+calendarPosts.length+")":""}`,
                active:showCalendar,
                onClick:()=>{const next=!showCalendar;setShowCalendar(next);setShowBankOpyt(false);setShowPillarSetup(false);setShowProducts(false);}
              },{
                label:`🛍 Продукты${products.length?" ("+products.length+")":""}`,
                active:showProducts,
                onClick:()=>{const next=!showProducts;setShowProducts(next);setShowCalendar(false);setShowBankOpyt(false);setShowPillarSetup(false);}
              },
            ].map((btn,i)=>(
              <button key={i} onClick={btn.onClick}
                style={{padding:"8px 14px",borderRadius:8,border:`1px solid ${btn.active?"#e1df2c":"rgba(244,241,236,.2)"}`,background:btn.active?"rgba(225,223,44,.15)":"transparent",color:btn.active?"#e1df2c":"rgba(244,241,236,.8)",fontSize:13,fontWeight:btn.active?700:500,cursor:"pointer",whiteSpace:"nowrap"}}>
                {btn.label}
              </button>
            ))}
          </div>

          {/* Row 2 — Создание контента */}
          <div style={{display:"flex",gap:8,padding:"8px 16px 14px",justifyContent:"center",flexWrap:"wrap"}}>
            {[
              {label:"✦ Создать пост", mode:"post", active:mode==="post"&&!showPillarSetup&&!showBankOpyt, onClick:startPost},
              {label:"⭐ Кейс", mode:"case", onClick:()=>switchMode("case")},
              {label:"🎨 Карусель", mode:"carousel", onClick:startCarousel},
            ].map((btn,i)=>(
              <button key={i} onClick={btn.onClick}
                style={{padding:"10px 20px",borderRadius:10,border:"none",background:(btn.active??mode===btn.mode)?"#f4f1ec":"rgba(255,255,255,.15)",color:(btn.active??mode===btn.mode)?"#362d52":"#f4f1ec",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main layout wrapper - two columns on desktop */}
        <div style={{display:isMobile?"block":"flex",gap:24,alignItems:"flex-start"}}>
        <div style={{flex:1,minWidth:0}}>

        {/* CUSTOM FORMATS PANEL */}
        {showFormats && (
          <Card>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:20,color:"#362d52",fontWeight:600}}>🗂 Мои форматы</div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setEditingFormat({id:null,name:"",example:""})}
                  style={{padding:"7px 14px",borderRadius:8,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                  + Новый формат
                </button>
                <button onClick={()=>setShowFormats(false)} style={{background:"transparent",border:"none",fontSize:22,cursor:"pointer",color:"#9a88b8"}}>×</button>
              </div>
            </div>

            {/* Format editor */}
            {editingFormat && (
              <div style={{padding:"14px",background:"#f4f1ec",borderRadius:10,border:"1px solid #e8e0f0",marginBottom:12}}>
                <div style={{fontSize:14,fontWeight:700,color:"#362d52",marginBottom:12}}>{editingFormat.id?"Редактировать":"Новый формат"}</div>
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:11,color:"#5c4e7a",fontWeight:600,marginBottom:3,textTransform:"uppercase",letterSpacing:".05em"}}>Название формата</div>
                  <input value={editingFormat.name} onChange={e=>setEditingFormat(p=>({...p,name:e.target.value}))}
                    placeholder="Например: Рецепт, Непопулярное мнение, Инструкция..."
                    style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"1px solid #d8d0e0",fontSize:13,color:"#362d52",outline:"none",boxSizing:"border-box"}} />
                </div>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:11,color:"#5c4e7a",fontWeight:600,marginBottom:3,textTransform:"uppercase",letterSpacing:".05em"}}>Пример поста в этом формате</div>
                  <div style={{fontSize:11,color:"#9a88b8",marginBottom:5,lineHeight:1.5}}>Вставь один готовый пост — Claude изучит структуру и будет воспроизводить её для любых тем</div>
                  <textarea value={editingFormat.example} onChange={e=>setEditingFormat(p=>({...p,example:e.target.value}))}
                    placeholder="Рецепт / Ингредиенты / Приготовление..."
                    rows={8} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #d8d0e0",fontSize:12,color:"#362d52",outline:"none",resize:"vertical",fontFamily:"'Nunito Sans',sans-serif",boxSizing:"border-box",lineHeight:1.7}} />
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setEditingFormat(null)} style={{flex:1,padding:10,borderRadius:8,border:"1px solid #d8d0e0",background:"transparent",color:"#5c4e7a",fontSize:12,cursor:"pointer"}}>Отмена</button>
                  <button onClick={()=>{
                    if (!editingFormat.name.trim()||!editingFormat.example.trim()) return;
                    const fmt = editingFormat.id ? editingFormat : {...editingFormat, id:Date.now()};
                    setCustomFormats(prev => editingFormat.id ? prev.map(f=>f.id===fmt.id?fmt:f) : [...prev,fmt]);
                    setEditingFormat(null);
                  }} style={{flex:2,padding:10,borderRadius:8,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                    💾 Сохранить формат
                  </button>
                </div>
              </div>
            )}

            {/* Formats list */}
            {customFormats.length === 0 && !editingFormat && (
              <p style={{fontSize:13,color:"#9a88b8",textAlign:"center",padding:"20px 0"}}>Нет сохранённых форматов. Добавь первый — вставь пример поста.</p>
            )}

            {customFormats.map(fmt=>(
              <div key={fmt.id} style={{marginBottom:12,borderRadius:10,border:"1px solid #e8e0f0",overflow:"hidden"}}>
                <div style={{padding:"12px 14px",background:"#362d52",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{fontSize:14,fontWeight:700,color:"#f4f1ec"}}>🗂 {fmt.name}</div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>setEditingFormat({...fmt})} style={{padding:"3px 9px",borderRadius:6,border:"1px solid rgba(244,241,236,.3)",background:"transparent",color:"#f4f1ec",fontSize:11,cursor:"pointer"}}>✏️</button>
                    <button onClick={()=>setCustomFormats(prev=>prev.filter(f=>f.id!==fmt.id))} style={{padding:"3px 9px",borderRadius:6,border:"none",background:"transparent",color:"rgba(244,241,236,.5)",fontSize:13,cursor:"pointer"}}>×</button>
                  </div>
                </div>

                {/* Example preview */}
                <div style={{padding:"10px 14px",background:"#fafafa",fontSize:11,color:"#5c4e7a",lineHeight:1.7,borderBottom:"1px solid #e8e0f0",fontStyle:"italic",whiteSpace:"pre-wrap"}}>
                  {fmt.example.substring(0,200)}{fmt.example.length>200?"…":""}
                </div>

                {/* Series generator */}
                <div style={{padding:"12px 14px",background:"#fff"}}>
                  <div style={{fontSize:11,color:"#5c4e7a",fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:".05em"}}>Создать серию постов в этом формате</div>
                  <div style={{fontSize:11,color:"#9a88b8",marginBottom:6}}>Введи темы — по одной на строке. Максимум 20 за раз.</div>
                  <textarea
                    value={selectedFormat===fmt.id ? formatSeriesTopics : ""}
                    onChange={e=>{setSelectedFormat(fmt.id);setFormatSeriesTopics(e.target.value);}}
                    placeholder={"созависимость\nэмоциональное выгорание\nтревога в отношениях\nстрах одиночества"}
                    rows={4} style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"1px solid #d8d0e0",fontSize:12,color:"#362d52",outline:"none",resize:"none",fontFamily:"'Nunito Sans',sans-serif",boxSizing:"border-box",marginBottom:8}} />
                  <button onClick={()=>{
                    const topics = formatSeriesTopics.split("\n").map(t=>t.trim()).filter(Boolean);
                    if (topics.length) generateFormatSeries(fmt, topics);
                  }} disabled={formatSeriesLoading||!formatSeriesTopics.trim()}
                    style={{width:"100%",padding:"10px",borderRadius:9,border:"none",background:formatSeriesTopics.trim()?"#362d52":"#d8d0e0",color:"#f4f1ec",fontSize:13,fontWeight:700,cursor:formatSeriesTopics.trim()?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                    {formatSeriesLoading&&selectedFormat===fmt.id
                      ? <><div style={{width:14,height:14,border:"2px solid rgba(244,241,236,.3)",borderTopColor:"#f4f1ec",borderRadius:"50%",animation:"sp .8s linear infinite"}} /> Генерирую серию…</>
                      : "✦ Создать серию"
                    }
                  </button>
                </div>
              </div>
            ))}

            {/* Series results */}
            {formatSeriesResult&&formatSeriesResult.length>0&&(
              <div style={{marginTop:12}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                  <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:17,color:"#362d52",fontWeight:600}}>{formatSeriesResult.length} постов готово</div>
                  <button onClick={()=>{
                    const text = formatSeriesResult.map(p=>"=== "+p.topic+" ===\n"+p.text).join("\n\n---\n\n");
                    navigator.clipboard.writeText(text);
                  }} style={{padding:"6px 12px",borderRadius:8,border:"1px solid #362d52",background:"transparent",color:"#362d52",fontSize:11,fontWeight:600,cursor:"pointer"}}>
                    📋 Скопировать все
                  </button>
                </div>
                {formatSeriesResult.map((post,i)=>{
                  const [cop,setCop] = React.useState(false);
                  return (
                    <div key={i} style={{marginBottom:10,borderRadius:10,border:"1px solid #e8e0f0",overflow:"hidden"}}>
                      <div style={{padding:"8px 14px",background:"#362d52",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <span style={{fontSize:12,fontWeight:700,color:"#f4f1ec"}}>{post.topic}</span>
                        <div style={{display:"flex",gap:5}}>
                          <button onClick={()=>{navigator.clipboard.writeText(post.text);setCop(true);setTimeout(()=>setCop(false),1500);}}
                            style={{padding:"3px 9px",borderRadius:6,border:"1px solid rgba(244,241,236,.3)",background:"transparent",color:cop?"#e1df2c":"rgba(244,241,236,.8)",fontSize:11,cursor:"pointer"}}>
                            {cop?"✓":"📋"}
                          </button>
                          <button onClick={()=>addToCalendar(post.topic, platforms[0]||"telegram", null, "format_series", {})}
                            style={{padding:"3px 9px",borderRadius:6,border:"1px solid rgba(244,241,236,.3)",background:"transparent",color:"rgba(244,241,236,.8)",fontSize:11,cursor:"pointer"}}>
                            📆
                          </button>
                        </div>
                      </div>
                      <div style={{padding:"12px 14px",fontSize:13,lineHeight:1.8,color:"#362d52",whiteSpace:"pre-wrap"}}>{post.text}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {/* PRODUCTS PANEL */}
        {showProducts && (
          <Card>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:20,color:"#362d52",fontWeight:600}}>🛍 Продукты</div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setEditingProduct({name:"",type:"main",pillar:"",cost:"",format:"",startDate:"",spots:"",aiDesc:"",barrier:"",result:"",phases:{1:{days:7},2:{days:5},3:{days:5}}})}
                  style={{padding:"7px 14px",borderRadius:8,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                  + Новый продукт
                </button>
                <button onClick={()=>setShowProducts(false)} style={{background:"transparent",border:"none",fontSize:22,cursor:"pointer",color:"#9a88b8"}}>×</button>
              </div>
            </div>

            {editingProduct ? (
              <div>
                <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:17,color:"#362d52",fontWeight:600,marginBottom:14}}>
                  {editingProduct.id ? "Редактировать продукт" : "Новый продукт"}
                </div>
                {[
                  {key:"name", label:"Название продукта", ph:"Интенсив «10 дней с потерей»"},
                  {key:"format", label:"Формат", ph:"Групповой интенсив · 10 дней"},
                  {key:"cost", label:"Стоимость", ph:"7 100 ₽"},
                  {key:"spots", label:"Количество мест", ph:"12"},
                  {key:"startDate", label:"Дата старта", type:"date"},
                  {key:"barrier", label:"Главный барьер аудитории", ph:"«Я не готова», «Слишком больно»"},
                  {key:"result", label:"Ключевой результат клиента", ph:"«Перестала возвращаться к воспоминаниям»"},
                  {key:"aiDesc", label:"Описание для AI", ph:"Что важно донести аудитории о продукте — для промпта"},
                ].map(f=>(
                  <div key={f.key} style={{marginBottom:10}}>
                    <div style={{fontSize:11,color:"#5c4e7a",fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:".05em"}}>{f.label}</div>
                    <input type={f.type||"text"} placeholder={f.ph||""} value={editingProduct[f.key]||""}
                      onChange={e=>setEditingProduct(p=>({...p,[f.key]:e.target.value}))}
                      style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"1px solid #d8d0e0",fontSize:13,color:"#362d52",outline:"none",boxSizing:"border-box"}} />
                  </div>
                ))}

                <div style={{marginBottom:12}}>
                  <div style={{fontSize:11,color:"#5c4e7a",fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:".05em"}}>Тип продукта</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                    {[
                      {id:"free",label:"🔓 Бесплатный вход",desc:"Гайд, эфир, разбор · 0 ₽"},
                      {id:"tripwire",label:"💛 Мягкий вход",desc:"Практикум, мини-курс · 500–3 000 ₽"},
                      {id:"main",label:"🎯 Основной продукт",desc:"Курс, группа · 3–30 000 ₽"},
                      {id:"flagship",label:"👑 Флагман",desc:"Индивидуально · от 30 000 ₽"},
                    ].map(t=>(
                      <button key={t.id} onClick={()=>setEditingProduct(p=>({...p,type:t.id}))}
                        style={{padding:"8px 10px",borderRadius:8,border:`1px solid ${editingProduct.type===t.id?"#362d52":"#d8d0e0"}`,background:editingProduct.type===t.id?"#362d52":"#f0eef8",color:editingProduct.type===t.id?"#f4f1ec":"#362d52",fontSize:11,cursor:"pointer",textAlign:"left"}}>
                        <div style={{fontWeight:700,marginBottom:2}}>{t.label}</div>
                        <div style={{fontSize:10,opacity:.8}}>{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{marginBottom:14}}>
                  <div style={{fontSize:11,color:"#5c4e7a",fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:".05em"}}>Фазы запуска (дней)</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                    {[{n:1,label:"Прогрев темы",desc:"Стадии 0–1"},{n:2,label:"Прогрев продукта",desc:"Стадии 2–3"},{n:3,label:"Продажи",desc:"Стадии 3–4"}].map(ph=>(
                      <div key={ph.n} style={{padding:"8px 10px",background:"#f4f1ec",borderRadius:8,border:"1px solid #e8e0f0"}}>
                        <div style={{fontSize:10,fontWeight:700,color:"#362d52",marginBottom:4}}>Фаза {ph.n}: {ph.label}</div>
                        <div style={{fontSize:10,color:"#9a88b8",marginBottom:6}}>{ph.desc}</div>
                        <input type="number" min="1" max="30" value={editingProduct.phases?.[ph.n]?.days||7}
                          onChange={e=>setEditingProduct(p=>({...p,phases:{...p.phases,[ph.n]:{days:parseInt(e.target.value)||7}}}))}
                          style={{width:"100%",padding:"5px 8px",borderRadius:6,border:"1px solid #d8d0e0",fontSize:13,color:"#362d52",outline:"none",textAlign:"center"}} />
                        <div style={{fontSize:9,color:"#9a88b8",textAlign:"center",marginTop:3}}>дней</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setEditingProduct(null)} style={{flex:1,padding:11,borderRadius:9,border:"1px solid #d8d0e0",background:"transparent",color:"#5c4e7a",fontSize:13,cursor:"pointer"}}>Отмена</button>
                  <button onClick={()=>{
                    if (!editingProduct.name?.trim()) return;
                    const product = editingProduct.id
                      ? editingProduct
                      : {...editingProduct, id:Date.now(), createdAt:new Date().toISOString()};
                    setProducts(prev => editingProduct.id
                      ? prev.map(p=>p.id===product.id?product:p)
                      : [product,...prev]);
                    saveGeneration("product", product.name, product, {expert, niche});
                    setEditingProduct(null);
                  }} style={{flex:2,padding:11,borderRadius:9,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                    💾 Сохранить продукт
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {products.length === 0 ? (
                  <p style={{fontSize:13,color:"#9a88b8",textAlign:"center",padding:"20px 0"}}>Нет продуктов. Нажми «+ Новый продукт» чтобы добавить.</p>
                ) : (
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {products.map(p=>{
                      const typeLabels = {free:"🔓 Бесплатный",tripwire:"💛 Мягкий вход",main:"🎯 Основной",flagship:"👑 Флагман"};
                      return (
                        <div key={p.id} style={{padding:"12px 14px",background:"#f4f1ec",borderRadius:10,border:"1px solid #e8e0f0"}}>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                            <div style={{fontSize:14,fontWeight:700,color:"#362d52"}}>{p.name}</div>
                            <div style={{display:"flex",gap:6}}>
                              <button onClick={()=>setEditingProduct({...p})} style={{padding:"3px 8px",borderRadius:6,border:"1px solid #d8d0e0",background:"transparent",color:"#5c4e7a",fontSize:11,cursor:"pointer"}}>✏️</button>
                              <button onClick={()=>setProducts(prev=>prev.filter(pr=>pr.id!==p.id))} style={{padding:"3px 8px",borderRadius:6,border:"none",background:"transparent",color:"#c4b8d8",fontSize:14,cursor:"pointer"}}>×</button>
                            </div>
                          </div>
                          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:6}}>
                            <span style={{fontSize:10,background:"#362d52",color:"#f4f1ec",padding:"1px 8px",borderRadius:5}}>{typeLabels[p.type]||p.type}</span>
                            {p.cost && <span style={{fontSize:10,background:"rgba(54,45,82,.08)",color:"#5c4e7a",padding:"1px 8px",borderRadius:5}}>{p.cost}</span>}
                            {p.startDate && <span style={{fontSize:10,background:"rgba(54,45,82,.08)",color:"#5c4e7a",padding:"1px 8px",borderRadius:5}}>📅 {p.startDate}</span>}
                          </div>
                          {p.result && <div style={{fontSize:11,color:"#5c4e7a",fontStyle:"italic"}}>✨ {p.result}</div>}
                          <div style={{display:"flex",gap:6,marginTop:8}}>
                            <button onClick={()=>{setLaunchMode(true);setSelectedProduct(p);setSelectedPhase(1);setShowProducts(false);switchMode("post");}}
                              style={{flex:1,padding:"6px 10px",borderRadius:7,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                              🚀 Создать пост запуска
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {/* CALENDAR PANEL */}
        {showCalendar && (
          <Card>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:20,color:"#362d52",fontWeight:600}}>📆 Календарь публикаций</div>
              <button onClick={()=>setShowCalendar(false)} style={{background:"transparent",border:"none",fontSize:22,cursor:"pointer",color:"#9a88b8"}}>×</button>
            </div>
            {calendarPosts.length === 0 ? (
              <p style={{fontSize:13,color:"#9a88b8",textAlign:"center",padding:"20px 0"}}>Нет запланированных публикаций.<br/>Нажми «+ В календарь» на любой теме или посте.</p>
            ) : (
              <CalendarView
                calendarPosts={calendarPosts}
                removeFromCalendar={removeFromCalendar}
                onMovePost={moveCalendarPost}
                currentExpert={expert}
                onViewGeneration={(genId)=>{
                  const item = history.find(h=>h.id===genId);
                  if (item) setSelectedHistory(item);
                }}
                onGeneratePost={(calPost)=>{
                  // Pre-fill topic and quadrant from calendar entry
                  setTopic(calPost.topic);
                  if (calPost.quadrant) {
                    const sqId = calPost.quadrant.includes("Личное") ?
                      (calPost.quadrant.includes("Неожиданное") ? "personal_unexpected" : "personal_known") :
                      (calPost.quadrant.includes("Неожиданное") ? "professional_unexpected" : "professional_known");
                    setSordellQuad(sqId);
                  }
                  setPain(calPost.hook||"");
                  setShowCalendar(false);
                  generateWithOverrides({
                    topicOverride: calPost.topic,
                    sordellQuadOverride: calPost.quadrant?.includes("Личное") ?
                      (calPost.quadrant?.includes("Неожиданное") ? "personal_unexpected" : "personal_known") :
                      (calPost.quadrant?.includes("Неожиданное") ? "professional_unexpected" : "professional_known"),
                    rubricOverride: calPost.quadrant?.includes("Личное") ? "personal" : "expert",
                  });
                }}
              />
            )}
          </Card>
        )}

        {/* Bank Opyt panel */}
        {showBankOpyt && (
          <Card>
            <div style={{fontFamily:"Georgia,serif",fontSize:16,color:S.text,marginBottom:8}}>📝 Банк личного опыта</div>

            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <textarea value={newStoryInput} onChange={e=>setNewStoryInput(e.target.value)}
                placeholder="Инсайт, наблюдение, случай из практики..."
                rows={2} style={{...inp,flex:1,fontSize:12}} />
              <button onClick={()=>{ if(!newStoryInput.trim()) return; setPersonalStories(prev=>[newStoryInput.trim(),...prev]); setNewStoryInput(""); setBankOpytExpanded(false); }}
                style={{padding:"10px 14px",borderRadius:9,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:13,fontWeight:700,cursor:"pointer",flexShrink:0}}>+</button>
            </div>

            {personalStories.length===0 && <p style={{fontSize:12,color:"#9a88b8",fontStyle:"italic"}}>Пока пусто — добавьте первую историю</p>}

            {personalStories.length > 0 && (
              <div>
                <button onClick={()=>setBankOpytExpanded(p=>!p)}
                  style={{width:"100%",padding:"7px 12px",borderRadius:8,border:"1px solid #e8e0f0",background:"#f4f1ec",color:"#362d52",fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span>📚 {personalStories.length} {personalStories.length===1?"запись":"записей"} в банке</span>
                  <span style={{color:"#9a88b8"}}>{bankOpytExpanded?"Скрыть ▲":"Показать ▼"}</span>
                </button>
                {bankOpytExpanded && (
                  <div style={{display:"flex",flexDirection:"column",gap:5,marginTop:6,maxHeight:300,overflowY:"auto"}}>
                    {personalStories.map((s,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"7px 10px",background:"#f4f1ec",borderRadius:8,border:"1px solid #e8e0f0"}}>
                        <div style={{fontSize:11,color:"#362d52",flex:1,lineHeight:1.5,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{s}</div>
                        <button onClick={()=>setPersonalStories(prev=>prev.filter((_,idx)=>idx!==i))}
                          style={{background:"transparent",border:"none",color:"#c4b8d8",cursor:"pointer",fontSize:14,flexShrink:0,padding:0}}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

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

        {/* HISTORY MODAL */}
        {selectedHistory && (
          <HistoryModal
            item={selectedHistory}
            onClose={()=>setSelectedHistory(null)}
            onUsePost={(result, topic)=>{setResult(result);setTopic(topic||"");setStep(5);setMode("post");setShowHistory(false);}}
            onUsePlan={(item)=>{setPlanResult(item.result?.posts||item.result||[]);setMode("plan");setStep(5);setShowHistory(false);}}
            onAddToCalendar={(topic, platform, genId, type)=>addToCalendar(topic, platform||platforms[0]||"telegram", genId, type)}
          />
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
                          {h.type==="post"?"✦ Пост":h.type==="plan"?"📅 План":h.type==="carousel"?"🎨 Карусель":h.type==="sordell"?"🎯 Темы Сорделл":h.type==="sordell_angles"?"⊞ Углы подачи":h.type==="product"?"🛍 Продукт":h.type==="series"?"📐 Серия":h.type==="format_series"?"🗂 Серия форматов":"⭐ Кейс"}
                        </span>
                        <span style={{fontSize:10,color:"#9a88b8"}}>{new Date(h.created_at).toLocaleDateString("ru")}</span>
                        {h.strategy?.expert && <span style={{fontSize:10,background:"rgba(54,45,82,.08)",color:"#362d52",padding:"1px 7px",borderRadius:5,fontWeight:600}}>{h.strategy.expert}</span>}
                      </div>
                      <button onClick={()=>deleteGeneration(h.id)} style={{background:"transparent",border:"none",color:"#c4b8d8",cursor:"pointer",fontSize:14}}>×</button>
                    </div>
                    <div style={{fontSize:13,fontWeight:600,color:"#362d52",marginBottom:4,lineHeight:1.3}}>{h.topic || "—"}</div>
                    {h.type==="post" && h.result?.headline && (
                      <div style={{fontSize:11,color:"#5c4e7a",fontStyle:"italic",marginBottom:4}}>{h.result.headline}</div>
                    )}
                    {h.type==="plan" && h.result && (
                      <div style={{fontSize:11,color:"#9a88b8",marginBottom:4}}>{(h.result?.posts||h.result||[]).length} постов</div>
                    )}
                    {h.type==="carousel" && h.result && (
                      <div style={{fontSize:11,color:"#9a88b8",marginBottom:4}}>{h.result.slides?.length||0} слайдов · {h.topic}</div>
                    )}
                    {h.type==="sordell" && h.result && (
                      <div style={{fontSize:11,color:"#9a88b8",marginBottom:4}}>{(h.result.topics||[]).length} тем по матрице Сорделл</div>
                    )}
                    <button onClick={()=>setSelectedHistory(h)}
                      style={{marginTop:4,padding:"5px 14px",borderRadius:7,border:"1px solid #362d52",background:"transparent",color:"#362d52",fontSize:11,fontWeight:600,cursor:"pointer"}}>
                      👁 Просмотреть →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* GLOBAL LOADING OVERLAY */}
        {loading && mode==="post" && (
          <div style={{position:"fixed",inset:0,background:"rgba(54,45,82,.85)",zIndex:3000,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20}}>
            <div style={{width:56,height:56,border:"4px solid rgba(244,241,236,.2)",borderTopColor:"#e1df2c",borderRadius:"50%",animation:"sp .8s linear infinite"}} />
            <div style={{textAlign:"center"}}>
              <div style={{fontFamily:"Georgia,serif",fontSize:20,color:"#f4f1ec",marginBottom:8,fontStyle:"italic"}}>Создаю пост…</div>
              <div style={{fontSize:13,color:"rgba(244,241,236,.6)",maxWidth:260,lineHeight:1.6}}>
                Анализирую тему, подбираю хук, адаптирую под платформы
              </div>
            </div>
            {topic && (
              <div style={{padding:"10px 20px",background:"rgba(225,223,44,.1)",borderRadius:10,border:"1px solid rgba(225,223,44,.3)",maxWidth:320,textAlign:"center"}}>
                <div style={{fontSize:11,color:"rgba(225,223,44,.8)",marginBottom:3,textTransform:"uppercase",letterSpacing:".06em"}}>Тема</div>
                <div style={{fontSize:13,color:"#f4f1ec",lineHeight:1.5}}>{topic}</div>
              </div>
            )}
          </div>
        )}

        {/* LAUNCH PLAN MODAL */}
        {showLaunchPlanModal && (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:4000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={e=>e.target===e.currentTarget&&setShowLaunchPlanModal(false)}>
            <div style={{background:"#fff",borderRadius:16,padding:24,maxWidth:420,width:"100%"}}>
              <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:20,color:"#362d52",fontWeight:600,marginBottom:4}}>🚀 Контент-план запуска</div>
              <p style={{fontSize:12,color:"#9a88b8",marginBottom:16}}>Приложение автоматически рассчитает фазы прогрева и продаж</p>

              <div style={{marginBottom:12}}>
                <div style={{fontSize:11,color:"#5c4e7a",fontWeight:600,marginBottom:5,textTransform:"uppercase",letterSpacing:".05em"}}>Продукт</div>
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  {products.map(p=>(
                    <button key={p.id} onClick={()=>setLaunchPlanProduct(p)}
                      style={{padding:"8px 12px",borderRadius:8,border:`1px solid ${launchPlanProduct?.id===p.id?"#362d52":"#d8d0e0"}`,background:launchPlanProduct?.id===p.id?"#362d52":"#f0eef8",color:launchPlanProduct?.id===p.id?"#f4f1ec":"#362d52",fontSize:12,cursor:"pointer",textAlign:"left",fontWeight:launchPlanProduct?.id===p.id?700:400}}>
                      {p.name} <span style={{fontSize:10,opacity:.7}}>· {p.cost||""}</span>
                    </button>
                  ))}
                </div>
              </div>

              {launchPlanProduct && (
                <div style={{marginBottom:12,padding:"10px 12px",background:"#f4f1ec",borderRadius:9,fontSize:11,color:"#5c4e7a"}}>
                  Фазы: <b>Прогрев {launchPlanProduct.phases?.[1]?.days||7} дн.</b> → <b>Продукт {launchPlanProduct.phases?.[2]?.days||5} дн.</b> → <b>Продажи {launchPlanProduct.phases?.[3]?.days||5} дн.</b>
                  {" "}· Итого: <b>{(launchPlanProduct.phases?.[1]?.days||7)+(launchPlanProduct.phases?.[2]?.days||5)+(launchPlanProduct.phases?.[3]?.days||5)} дней</b>
                </div>
              )}

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
                <div>
                  <div style={{fontSize:11,color:"#5c4e7a",fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:".05em"}}>Дата открытия продаж</div>
                  <input type="date" value={launchSaleStart} onChange={e=>setLaunchSaleStart(e.target.value)}
                    style={{width:"100%",padding:"9px 10px",borderRadius:8,border:"1px solid #d8d0e0",fontSize:13,color:"#362d52",outline:"none",boxSizing:"border-box"}} />
                </div>
                <div>
                  <div style={{fontSize:11,color:"#5c4e7a",fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:".05em"}}>Дата закрытия</div>
                  <input type="date" value={launchSaleEnd} onChange={e=>setLaunchSaleEnd(e.target.value)}
                    style={{width:"100%",padding:"9px 10px",borderRadius:8,border:"1px solid #d8d0e0",fontSize:13,color:"#362d52",outline:"none",boxSizing:"border-box"}} />
                </div>
              </div>

              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setShowLaunchPlanModal(false)} style={{flex:1,padding:11,borderRadius:9,border:"1px solid #d8d0e0",background:"transparent",color:"#5c4e7a",fontSize:13,cursor:"pointer"}}>Отмена</button>
                <button onClick={async ()=>{
                  if (!launchPlanProduct||!launchSaleStart) return;
                  setShowLaunchPlanModal(false);
                  setMode("plan"); setStep(5); setPlanPeriod("month"); setPlanLoading(true); setPlanResult([]);
                  const p = launchPlanProduct;
                  const ph1 = p.phases?.[1]?.days||7;
                  const ph2 = p.phases?.[2]?.days||5;
                  const ph3 = p.phases?.[3]?.days||5;
                  const totalDays = ph1+ph2+ph3;
                  const startDate = new Date(launchSaleStart);
                  startDate.setDate(startDate.getDate()-ph1-ph2);
                  const prompt = `Ты контент-стратег. Составь контент-план запуска продукта.

ПРОДУКТ: ${p.name}
Тип: ${p.type}, Формат: ${p.format||""}, Стоимость: ${p.cost||""}
Дата открытия продаж: ${launchSaleStart}, Закрытие: ${launchSaleEnd||"не указано"}
Барьер аудитории: ${p.barrier||"не указан"}
Результат клиента: ${p.result||"не указан"}
${p.aiDesc?"Для промпта: "+p.aiDesc:""}

ЭКСПЕРТ: ${expert||"-"}, Ниша: ${niche||"-"}
Аудитория: ${audience||"-"}
Смысловые блоки: ${pillars.map(b=>b.label||b).join(", ")||"не указаны"}
Тон: ${tone}

ПЛАН НА ${totalDays} ДНЕЙ:
ФАЗА 1 (дни 1-${ph1}): Прогрев темы. Стадии 0-1. ЗАПРЕЩЕНО упоминать продукт. Аудитория узнаёт себя в теме.
ФАЗА 2 (дни ${ph1+1}-${ph1+ph2}): Прогрев продукта. Стадии 2-3. Мягкое упоминание без названия. «Скоро расскажу подробнее».
ФАЗА 3 (дни ${ph1+ph2+1}-${totalDays}): Продажи. Стадии 3-4. Полное раскрытие: ${p.name}, ${p.cost}, ${p.startDate||launchSaleStart}.

ПРАВИЛА:
- В фазе 1 ноль слов о продукте. Только тема.
- В фазе 3 max 1 продающий пост в Threads за весь запуск.
- 1 раз в неделю «вне запуска» — личный пост-выдох без привязки к продукту.
- Личный пост: CTA только вопрос или точка, без упоминания услуг.
- Для каждого поста: день, платформа, стадия, квадрант Сорделл, тема, фаза.

ТОЛЬКО валидный JSON:
{"posts":[{"day":"День 1","platform":"threads","block":"блок","topic":"тема","stage":"Не осознаёт проблему","sordell":"Личное + Неожиданное","function":"узнавание","phase":1}]}`;

                  try {
                    const resp = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:6000,messages:[{role:"user",content:prompt}]})});
                    const data = await resp.json();
                    const text = data.content.map(b=>b.text||"").join("");
                    const match = text.match(/\{[\s\S]*\}/);
                    if (match) {
                      const parsed = JSON.parse(match[0]);
                      setPlanResult(parsed.posts||[]);
                      saveGeneration("plan", `🚀 Запуск: ${p.name}`, {posts:parsed.posts||[]}, {expert, niche, launchProduct:p.name});
                    }
                  } catch(e) { console.error(e); }
                  setPlanLoading(false);
                }} disabled={!launchPlanProduct||!launchSaleStart}
                  style={{flex:2,padding:11,borderRadius:9,border:"none",background:launchPlanProduct&&launchSaleStart?"#362d52":"#d8d0e0",color:"#f4f1ec",fontSize:13,fontWeight:700,cursor:launchPlanProduct&&launchSaleStart?"pointer":"not-allowed"}}>
                  🚀 Создать план запуска
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CALENDAR DATE MODAL */}
        <CalendarDateModal
          modal={calendarModal}
          date={calendarDate}
          setDate={setCalendarDate}
          platform={calendarPlatform}
          setPlatform={setCalendarPlatform}
          onSave={saveToCalendar}
          onClose={()=>setCalendarModal(null)}
        />

        {/* BRAND PICKER MODAL */}
        {showBrandPicker && (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={e=>e.target===e.currentTarget&&setShowBrandPicker(false)}>
            <div style={{background:"#fff",borderRadius:16,padding:24,maxWidth:440,width:"100%",maxHeight:"80vh",overflowY:"auto"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:20,color:"#362d52",fontWeight:600}}>Сохранённые бренды</div>
                <button onClick={()=>setShowBrandPicker(false)} style={{background:"transparent",border:"none",fontSize:22,cursor:"pointer",color:"#9a88b8"}}>×</button>
              </div>
              {brands.length === 0 ? (
                <p style={{fontSize:13,color:"#9a88b8",textAlign:"center",padding:"20px 0"}}>Нет сохранённых брендов. Заполни контекст и нажми «Сохранить бренд».</p>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {brands.map(b=>(
                    <div key={b.id} style={{padding:"12px 14px",background:"#f4f1ec",borderRadius:10,border:"1px solid #e8e0f0"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                        <div style={{fontSize:14,fontWeight:700,color:"#362d52"}}>{b.expert}</div>
                        <button onClick={()=>deleteBrand(b.id)} style={{background:"transparent",border:"none",color:"#c4b8d8",cursor:"pointer",fontSize:14}}>×</button>
                      </div>
                      <div style={{fontSize:11,color:"#5c4e7a",marginBottom:4}}>{b.niche} · {b.audience?.slice(0,50)}{b.audience?.length>50?"…":""}</div>
                      <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
                        {b.pillars?.length>0 && <span style={{fontSize:10,background:"rgba(54,45,82,.08)",color:"#5c4e7a",padding:"1px 7px",borderRadius:5}}>📌 {b.pillars.length} блоков</span>}
                        {b.sordellTopics?.length>0 && <span style={{fontSize:10,background:"rgba(54,45,82,.08)",color:"#5c4e7a",padding:"1px 7px",borderRadius:5}}>🎯 {b.sordellTopics.length} тем Сорделл</span>}
                        {b.audiencePains?.length>0 && <span style={{fontSize:10,background:"rgba(54,45,82,.08)",color:"#5c4e7a",padding:"1px 7px",borderRadius:5}}>💊 {b.audiencePains.length} болей</span>}
                        {b.savedAt && <span style={{fontSize:10,color:"#c4b8d8"}}>сохранён {b.savedAt}</span>}
                      </div>
                      <button onClick={()=>loadBrand(b)} style={{width:"100%",padding:"8px",borderRadius:8,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                        Загрузить →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
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
                  <textarea style={inpAuto} rows={1} placeholder="Сервис ФиксПК / Анна Иванова" value={expert} onChange={e=>{setExpert(e.target.value);setBrandChanged(true);e.target.style.height="auto";e.target.style.height=e.target.scrollHeight+"px";}} />
                </div>
                <div style={{marginBottom:14}}>
                  <Label text="Ниша / сфера" />
                  <textarea style={inpAuto} rows={1} placeholder="Ремонт ноутбуков и ПК" value={niche} onChange={e=>{setNiche(e.target.value);setBrandChanged(true);e.target.style.height="auto";e.target.style.height=e.target.scrollHeight+"px";}} />
                </div>
              </div>
              <div style={{marginBottom:14}}>
                <Label text="Целевая аудитория" hint="Чем подробнее — тем точнее контент. Включи: возраст и пол · профессия или статус · где живёт · главная проблема которую решает твой продукт · что пробовала раньше · чего боится · о чём мечтает. Пример: Женщины 35-50, владелицы малого бизнеса, Тбилиси — хотят системный контент, пробовали SMM-агентства, разочарованы, боятся потратить деньги впустую" />
                <textarea style={inpAuto} rows={1} placeholder="Женщины 35-50, г. Тбилиси, владелицы малого бизнеса" value={audience} onChange={e=>{setAudience(e.target.value);setBrandChanged(true);e.target.style.height="auto";e.target.style.height=e.target.scrollHeight+"px";}} />
              </div>
              {/* Audience Pains */}
              <div style={{marginBottom:14}}>
                <Label text="Боли аудитории" hint="Конкретные проблемы и страхи которые переживает аудитория прямо сейчас" />

                {/* Suggest button */}
                <button onClick={suggestPains} disabled={suggestingPains||(!niche&&!audience)}
                  style={{width:"100%",padding:"10px 14px",borderRadius:9,border:"1px dashed #362d52",background:"rgba(54,45,82,.04)",color:suggestingPains?"#9a88b8":"#362d52",fontSize:12,fontWeight:600,cursor:(!niche&&!audience)?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:audiencePains.length?10:0}}>
                  {suggestingPains
                    ? <><div style={{width:13,height:13,border:"2px solid #d8d0e0",borderTopColor:"#362d52",borderRadius:"50%",animation:"sp .8s linear infinite"}} /> Определяю боли…</>
                    : <>✨ {audiencePains.length?"Обновить боли":"Определить боли аудитории"}</>
                  }
                </button>
                {!niche && !audience && <div style={{fontSize:10,color:"#9a88b8",marginTop:4,textAlign:"center"}}>Заполните нишу и аудиторию выше</div>}

                {audiencePains.length === 0 && (
                  <div style={{display:"flex",gap:6,marginTop:8}}>
                    <input placeholder="Введите боль аудитории..."
                      onKeyDown={e=>{if(e.key==="Enter"&&e.target.value.trim()){setAudiencePains(prev=>[...prev,e.target.value.trim()]);e.target.value="";}}}
                      style={{flex:1,padding:"9px 12px",borderRadius:8,border:"1px solid #d8d0e0",fontSize:12,color:"#362d52",outline:"none",background:"#f0eef8"}} />
                    <button onClick={e=>{const i=e.target.previousSibling;if(i.value.trim()){setAudiencePains(prev=>[...prev,i.value.trim()]);i.value="";}}}
                      style={{padding:"9px 14px",borderRadius:8,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:13,fontWeight:700,cursor:"pointer",flexShrink:0}}>+</button>
                  </div>
                )}

                {/* Pain chips — collapsible */}
                {audiencePains.length > 0 && (
                  <div style={{marginTop:6}}>
                    <button onClick={()=>setShowPains(p=>!p)}
                      style={{width:"100%",padding:"7px 12px",borderRadius:8,border:"1px solid #e8e0f0",background:"#f4f1ec",color:"#362d52",fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:showPains?8:0}}>
                      <span>💊 Боли определены ({audiencePains.length})</span>
                      <span style={{fontSize:10,color:"#9a88b8"}}>{showPains?"Скрыть ▲":"Показать ▼"}</span>
                    </button>
                    {showPains && (
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        {audiencePains.map((pain,i)=>(
                          <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"8px 12px",background:"#f4f1ec",borderRadius:8,border:"1px solid #e8e0f0"}}>
                            <span style={{fontSize:12,color:"#9a88b8",marginTop:1,flexShrink:0}}>{i+1}.</span>
                            <span style={{fontSize:12,color:"#362d52",flex:1,lineHeight:1.5}}>{pain}</span>
                            <button onClick={()=>setAudiencePains(prev=>prev.filter((_,idx)=>idx!==i))}
                              style={{background:"transparent",border:"none",color:"#c4b8d8",cursor:"pointer",fontSize:15,padding:0,lineHeight:1,flexShrink:0}}>×</button>
                          </div>
                        ))}
                        <div style={{display:"flex",gap:6}}>
                          <input placeholder="Добавить свою боль..."
                            onKeyDown={e=>{if(e.key==="Enter"&&e.target.value.trim()){setAudiencePains(prev=>[...prev,e.target.value.trim()]);e.target.value="";}}}
                            style={{flex:1,padding:"7px 10px",borderRadius:8,border:"1px solid #d8d0e0",fontSize:12,color:"#362d52",outline:"none",background:"#fff"}} />
                          <button onClick={e=>{const i=e.target.previousSibling;if(i.value.trim()){setAudiencePains(prev=>[...prev,i.value.trim()]);i.value="";}}}
                            style={{padding:"7px 12px",borderRadius:8,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:12,fontWeight:700,cursor:"pointer",flexShrink:0}}>+</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Audience Barriers */}
              <div style={{marginBottom:14}}>
                <Label text="Барьеры аудитории" hint="Что мешает вашей аудитории обратиться за помощью? Словами клиента. Используются в постах стадий 2–3." />

                {/* Suggest button */}
                <button onClick={suggestBarriers} disabled={suggestingBarriers||(!niche&&!audience)}
                  style={{width:"100%",padding:"10px 14px",borderRadius:9,border:"1px dashed #362d52",background:"rgba(54,45,82,.04)",color:suggestingBarriers?"#9a88b8":"#362d52",fontSize:12,fontWeight:600,cursor:(!niche&&!audience)?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:audienceBarriers.length?10:0}}>
                  {suggestingBarriers
                    ? <><div style={{width:13,height:13,border:"2px solid #d8d0e0",borderTopColor:"#362d52",borderRadius:"50%",animation:"sp .8s linear infinite"}} /> Определяю барьеры…</>
                    : <>✨ {audienceBarriers.length?"Обновить барьеры":"Определить барьеры аудитории"}</>
                  }
                </button>
                {!niche && !audience && <div style={{fontSize:10,color:"#9a88b8",marginTop:4,textAlign:"center"}}>Заполните нишу и аудиторию выше</div>}

                {audienceBarriers.length === 0 && (
                  <div style={{display:"flex",gap:6,marginTop:8}}>
                    <input placeholder='Например: "я недостаточно плохо себя чувствую"'
                      onKeyDown={e=>{if(e.key==="Enter"&&e.target.value.trim()){setAudienceBarriers(prev=>[...prev,e.target.value.trim()]);e.target.value="";}}}
                      style={{flex:1,padding:"9px 12px",borderRadius:8,border:"1px solid #d8d0e0",fontSize:12,color:"#362d52",outline:"none",background:"#f0eef8"}} />
                    <button onClick={e=>{const i=e.target.previousSibling;if(i.value.trim()){setAudienceBarriers(prev=>[...prev,i.value.trim()]);i.value="";}}}
                      style={{padding:"9px 14px",borderRadius:8,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:13,fontWeight:700,cursor:"pointer",flexShrink:0}}>+</button>
                  </div>
                )}

                {/* Barriers — collapsible */}
                {audienceBarriers.length > 0 && (
                  <div style={{marginTop:6}}>
                    <button onClick={()=>setShowBarriers(p=>!p)}
                      style={{width:"100%",padding:"7px 12px",borderRadius:8,border:"1px solid #e8e0f0",background:"#f4f1ec",color:"#362d52",fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:showBarriers?8:0}}>
                      <span>🚧 Барьеры определены ({audienceBarriers.length})</span>
                      <span style={{fontSize:10,color:"#9a88b8"}}>{showBarriers?"Скрыть ▲":"Показать ▼"}</span>
                    </button>
                    {showBarriers && (
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        {audienceBarriers.map((pain,i)=>(
                          <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"8px 12px",background:"#f4f1ec",borderRadius:8,border:"1px solid #e8e0f0"}}>
                            <span style={{fontSize:12,color:"#9a88b8",marginTop:1,flexShrink:0}}>{i+1}.</span>
                            <span style={{fontSize:12,color:"#362d52",flex:1,lineHeight:1.5}}>{pain}</span>
                            <button onClick={()=>setAudienceBarriers(prev=>prev.filter((_,idx)=>idx!==i))}
                              style={{background:"transparent",border:"none",color:"#c4b8d8",cursor:"pointer",fontSize:15,padding:0,lineHeight:1,flexShrink:0}}>×</button>
                          </div>
                        ))}
                        <div style={{display:"flex",gap:8}}>
                          <input id="barrier-add-input" placeholder="Добавить барьер..." onKeyDown={e=>{
                            if(e.key==="Enter"&&e.target.value.trim()){setAudienceBarriers(prev=>[...prev,e.target.value.trim()]);e.target.value="";}
                          }} style={{flex:1,padding:"7px 12px",borderRadius:8,border:"1px solid #d8d0e0",background:"#fff",fontSize:12,color:"#362d52",outline:"none"}} />
                          <button onClick={()=>{
                            const el=document.getElementById("barrier-add-input");
                            if(el?.value.trim()){setAudienceBarriers(prev=>[...prev,el.value.trim()]);el.value="";}
                          }} style={{padding:"7px 14px",borderRadius:8,border:"none",background:"#f4f1ec",color:"#362d52",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",border:"1px solid #d8d0e0"}}>
                            + Добавить
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>


              {/* Microsegments */}
              <div style={{marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                  <Label text="Микросегменты аудитории" hint="Каждый МС — это точное описание подгруппы. При создании поста выбираешь для кого пишешь." />
                  <button onClick={()=>setShowMsEditor(p=>!p)}
                    style={{padding:"4px 10px",borderRadius:7,border:"1px solid #362d52",background:"transparent",color:"#362d52",fontSize:11,fontWeight:600,cursor:"pointer",flexShrink:0,marginLeft:8}}>
                    {showMsEditor?"Скрыть ▲":"Управлять ▼"}
                  </button>
                </div>

                {/* MS summary chips */}
                {microsegments.length > 0 && !showMsEditor && (
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                    {microsegments.map(ms=>(
                      <span key={ms.id} style={{fontSize:11,background:"rgba(54,45,82,.08)",color:"#362d52",padding:"3px 10px",borderRadius:6,fontWeight:600}}>
                        {ms.name}
                      </span>
                    ))}
                  </div>
                )}

                {showMsEditor && (
                  <div>
                    {/* List */}
                    {!editingMs && (
                      <div>
                        {microsegments.length === 0 && (
                          <p style={{fontSize:12,color:"#9a88b8",fontStyle:"italic",marginBottom:8}}>Нет микросегментов. Добавь первый.</p>
                        )}
                        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:8}}>
                          {microsegments.map(ms=>(
                            <div key={ms.id} style={{padding:"10px 12px",background:"#f4f1ec",borderRadius:9,border:"1px solid #e8e0f0"}}>
                              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:3}}>
                                <div style={{fontSize:13,fontWeight:700,color:"#362d52"}}>{ms.name}</div>
                                <div style={{display:"flex",gap:5}}>
                                  <button onClick={()=>setEditingMs({...ms})} style={{padding:"2px 8px",borderRadius:5,border:"1px solid #d8d0e0",background:"transparent",color:"#5c4e7a",fontSize:11,cursor:"pointer"}}>✏️</button>
                                  <button onClick={()=>setMicrosegments(prev=>prev.filter(m=>m.id!==ms.id))} style={{padding:"2px 8px",borderRadius:5,border:"none",background:"transparent",color:"#c4b8d8",fontSize:13,cursor:"pointer"}}>×</button>
                                </div>
                              </div>
                              {ms.desc && <div style={{fontSize:11,color:"#5c4e7a",lineHeight:1.5}}>{ms.desc.substring(0,100)}{ms.desc.length>100?"…":""}</div>}
                            </div>
                          ))}
                        </div>
                        <button onClick={()=>setEditingMs({id:null,name:"",desc:"",pains:"",barriers:"",language:""})}
                          style={{width:"100%",padding:"8px",borderRadius:8,border:"1px dashed #362d52",background:"transparent",color:"#362d52",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                          + Добавить микросегмент
                        </button>
                      </div>
                    )}

                    {/* Editor */}
                    {editingMs && (
                      <div style={{padding:"12px 14px",background:"#f4f1ec",borderRadius:10,border:"1px solid #e8e0f0"}}>
                        <div style={{fontSize:13,fontWeight:700,color:"#362d52",marginBottom:10}}>
                          {editingMs.id?"Редактировать":"Новый микросегмент"}
                        </div>
                        {[
                          {key:"name", label:"Название", ph:"МС1: Женщины в декрете 30-40", hint:""},
                          {key:"desc", label:"Описание", ph:"Кто это, чем живут, контекст", hint:"", rows:2},
                          {key:"pains", label:"Специфические боли", ph:"Их конкретные боли через запятую или с новой строки", hint:"Что болит именно у них", rows:2},
                          {key:"barriers", label:"Барьеры", ph:"Что мешает именно им обратиться", hint:"", rows:2},
                          {key:"language", label:"Их язык", ph:"Как они говорят о проблеме: 'я не успеваю', 'я срываюсь на ребёнке'...", hint:"Фразы их словами", rows:2},
                          {key:"planPercent", label:"% в контент-плане", ph:"30", hint:"Сколько % постов плана писать для этого МС"},
                        ].map(f=>(
                          <div key={f.key} style={{marginBottom:8}}>
                            <div style={{fontSize:10,color:"#5c4e7a",fontWeight:600,marginBottom:3,textTransform:"uppercase",letterSpacing:".05em"}}>{f.label}{f.hint&&<span style={{fontWeight:400,textTransform:"none",letterSpacing:0,marginLeft:4}}>— {f.hint}</span>}</div>
                            <textarea value={editingMs[f.key]||""} onChange={e=>setEditingMs(p=>({...p,[f.key]:e.target.value}))}
                              placeholder={f.ph} rows={f.rows||1}
                              style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"1px solid #d8d0e0",fontSize:12,color:"#362d52",outline:"none",resize:"none",fontFamily:"'Nunito Sans',sans-serif",boxSizing:"border-box"}} />
                          </div>
                        ))}
                        <div style={{display:"flex",gap:6,marginTop:4}}>
                          <button onClick={()=>setEditingMs(null)} style={{flex:1,padding:"8px",borderRadius:7,border:"1px solid #d8d0e0",background:"transparent",color:"#5c4e7a",fontSize:12,cursor:"pointer"}}>Отмена</button>
                          <button onClick={()=>{
                            if (!editingMs.name.trim()) return;
                            const ms = editingMs.id ? editingMs : {...editingMs, id:Date.now()};
                            setMicrosegments(prev => editingMs.id ? prev.map(m=>m.id===ms.id?ms:m) : [...prev,ms]);
                            setEditingMs(null);
                          }} style={{flex:2,padding:"8px",borderRadius:7,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                            💾 Сохранить МС
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
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


              {/* Brand actions */}
              <div style={{display:"flex",gap:8,marginBottom:14}}>
                <button onClick={saveBrand} disabled={!expert.trim()}
                  style={{flex:1,padding:"8px 12px",borderRadius:8,border:`1px solid ${brandSaved?"#4a9a6a":"#362d52"}`,background:brandSaved?"#4a9a6a":"transparent",color:brandSaved?"#fff":expert.trim()?"#362d52":"#c4b8d8",fontSize:11,fontWeight:600,cursor:expert.trim()?"pointer":"not-allowed",transition:"all .3s"}}>
                  {brandSaved ? "✓ Сохранено" : "💾 Сохранить бренд"}
                </button>
                <button onClick={()=>{
                  if (expert.trim()) saveBrand();
                  setExpert(""); setNiche(""); setAudience(""); setToneOfVoice("");
                  setPillars([]); setAudiencePains([]); setAudienceBarriers([]);
                  setPlatforms(["telegram"]); setTone(TONES[1]);
                  setPlanResult(null); setSordellResult(null);
                  localStorage.removeItem("lia_expert");
                  setBrandChanged(false);
                }} style={{flex:1,padding:"8px 12px",borderRadius:8,border:"1px solid #9a88b8",background:"transparent",color:"#5c4e7a",fontSize:11,fontWeight:600,cursor:"pointer"}}>
                  + Новый бренд
                </button>
                {brands.length > 0 && (
                  <button onClick={()=>setShowBrandPicker(true)}
                    style={{flex:1,padding:"8px 12px",borderRadius:8,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:11,fontWeight:600,cursor:"pointer"}}>
                    📂 Мои бренды ({brands.length})
                  </button>
                )}
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
            ) : sordellStep===13 ? null : (
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
                      onAddToCalendar={()=>addToCalendar(t.topic, platforms[0]||"telegram", null, "sordell", {hook:t.hook, quadrant:t.quadrant, reason:t.reason})}
                      onAddAngleToCalendar={(title, hook, sordell)=>addToCalendar(title, platforms[0]||"telegram", null, "sordell_angle", {hook, quadrant:sordell})}
                      onCreatePost={()=>{
                        setTopic(t.topic);
                        setSordellQuad(t.quadrant?.includes("Личное") ?
                          (t.quadrant?.includes("Неожиданное") ? "personal_unexpected" : "personal_known") :
                          (t.quadrant?.includes("Неожиданное") ? "professional_unexpected" : "professional_known"));
                        generateWithOverrides({
                          topicOverride: t.topic,
                          sordellQuadOverride: t.quadrant?.includes("Личное") ?
                            (t.quadrant?.includes("Неожиданное") ? "personal_unexpected" : "personal_known") :
                            (t.quadrant?.includes("Неожиданное") ? "professional_unexpected" : "professional_known"),
                          rubricOverride: t.quadrant?.includes("Личное") ? "personal" : "expert",
                        });
                      }}
                      onExpand={()=>{
                        if (expandedTopics[t.topic]) {
                          setExpandedTopics(prev=>{const n={...prev};delete n[t.topic];return n;});
                        } else {
                          expandTopic(t.topic);
                        }
                      }}
                      expanded={expandedTopics[t.topic]}
                      expanding={expandingTopic===t.topic}
                    />
                  ))}
                </div>
                {/* More topics button */}
                <button onClick={generateMoreTopics} disabled={sordellLoadingMore}
                  style={{width:"100%",padding:11,borderRadius:10,border:"1px dashed #362d52",background:"rgba(54,45,82,.04)",color:"#362d52",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:12}}>
                  {sordellLoadingMore
                    ? <><div style={{width:14,height:14,border:"2px solid #d8d0e0",borderTopColor:"#362d52",borderRadius:"50%",animation:"sp .8s linear infinite"}} /> Ищу новые темы…</>
                    : <>+ Ещё темы (сейчас {sordellResult?.length||0})</>
                  }
                </button>

                <div style={{display:"flex",gap:8,marginTop:8}}>
                  <button onClick={()=>{setSordellStep("overview");setSordellAnswers(JSON.parse(localStorage.getItem("lia_sordell_answers")||"[]"));}} style={{flex:1,padding:12,borderRadius:10,border:"1px solid #362d52",background:"transparent",color:"#362d52",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                    ✏️ Изменить ответы
                  </button>
  <button onClick={startSordellFresh} style={{flex:1,padding:12,borderRadius:10,border:"1px solid #d8d0e0",background:"transparent",color:"#9a88b8",fontSize:13,cursor:"pointer"}}>
                    ↻ Начать заново
                  </button>
                </div>

                {/* Personal story bank - collapsible */}
                <div style={{marginTop:16,padding:"12px 14px",background:"#f4f1ec",borderRadius:10,border:"1px solid #e8e0f0"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#362d52"}}>📝 Банк личного опыта</div>
                    <span style={{fontSize:11,color:"#9a88b8"}}>{personalStories.length>0?`${personalStories.length} записей`:""}</span>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <textarea value={newStoryInput} onChange={e=>setNewStoryInput(e.target.value)}
                      placeholder="Инсайт, наблюдение, случай из практики..."
                      rows={2} style={{...inp,flex:1,fontSize:12}} />
                    <button onClick={()=>{
                      if(!newStoryInput.trim()) return;
                      setPersonalStories(prev=>[newStoryInput.trim(),...prev]);
                      setNewStoryInput("");
                      setBankOpytExpanded(false);
                    }} style={{padding:"10px 14px",borderRadius:9,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:13,fontWeight:700,cursor:"pointer",flexShrink:0}}>+</button>
                  </div>
                  {personalStories.length > 0 && (
                    <div style={{marginTop:8}}>
                      <button onClick={()=>setBankOpytExpanded(p=>!p)}
                        style={{width:"100%",padding:"6px 10px",borderRadius:7,border:"1px solid #e8e0f0",background:"#fff",color:"#5c4e7a",fontSize:11,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span>📚 {personalStories.length} {personalStories.length===1?"запись":"записей"} в банке</span>
                        <span>{bankOpytExpanded?"Скрыть ▲":"Показать ▼"}</span>
                      </button>
                      {bankOpytExpanded && (
                        <div style={{display:"flex",flexDirection:"column",gap:5,marginTop:6,maxHeight:200,overflowY:"auto"}}>
                          {personalStories.map((s,i)=>(
                            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"7px 10px",background:"#fff",borderRadius:7,border:"1px solid #e8e0f0"}}>
                              <div style={{fontSize:11,color:"#362d52",flex:1,lineHeight:1.5,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{s}</div>
                              <button onClick={()=>setPersonalStories(prev=>prev.filter((_,idx)=>idx!==i))}
                                style={{background:"transparent",border:"none",color:"#c4b8d8",cursor:"pointer",fontSize:14,flexShrink:0,padding:0}}>×</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </Card>
            )}
          </div>
        )}

        {/* STEP CAROUSEL */}
        {mode==="carousel"&&step===2&&(
          <div>
            <Card>
              <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:19,color:"#362d52",fontWeight:600,marginBottom:18}}>
                🎨 Карусель
              </div>

              {/* Topic */}
              <div style={{marginBottom:18}}>
                <Label text="Тема карусели" />
                <textarea style={inpAuto} rows={1} placeholder="Например: 5 ошибок при создании контента" value={topic} onChange={e=>{setTopic(e.target.value);e.target.style.height="auto";e.target.style.height=e.target.scrollHeight+"px";}} />
              </div>

              {/* Template */}
              <div style={{marginBottom:18}}>
                <Label text="Шаблон карусели" />
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {CAROUSEL_TEMPLATES.map(t=>(
                    <button key={t.id} onClick={()=>setCarouselTemplate(carouselTemplate===t.id?"":t.id)}
                      style={{padding:"10px 12px",borderRadius:9,border:`1px solid ${carouselTemplate===t.id?"#362d52":"#d8d0e0"}`,background:carouselTemplate===t.id?"#362d52":"#f0eef8",color:carouselTemplate===t.id?"#f4f1ec":"#362d52",fontSize:12,cursor:"pointer",textAlign:"left",transition:"all .2s"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                        <span style={{fontSize:15}}>{t.icon}</span>
                        <span style={{fontWeight:700,fontSize:11}}>{t.label}</span>
                      </div>
                      <div style={{fontSize:10,color:carouselTemplate===t.id?"rgba(244,241,236,.8)":"#5c4e7a",lineHeight:1.4}}>{t.desc}</div>
                      {carouselTemplate===t.id && <div style={{fontSize:10,color:"rgba(244,241,236,.65)",fontStyle:"italic",lineHeight:1.4,marginTop:4}}>💡 {t.why}</div>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slide count */}
              <div style={{marginBottom:0}}>
                <Label text="Количество слайдов" />
                <div style={{display:"flex",gap:8}}>
                  {[5,7,10].map(n=>(
                    <button key={n} onClick={()=>setCarouselSlideCount(n)}
                      style={{flex:1,padding:"10px",borderRadius:9,border:`1px solid ${carouselSlideCount===n?"#362d52":"#d8d0e0"}`,background:carouselSlideCount===n?"#362d52":"#f0eef8",color:carouselSlideCount===n?"#f4f1ec":"#362d52",fontSize:14,fontWeight:700,cursor:"pointer"}}>
                      {n} слайдов
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {carouselLoading ? (
              <Card>
                <div style={{textAlign:"center",padding:"16px 0"}}>
                  <div style={{width:28,height:28,border:"2px solid #d8d0e0",borderTopColor:"#362d52",borderRadius:"50%",animation:"sp .8s linear infinite",margin:"0 auto 12px"}} />
                  <p style={{fontSize:13,color:"#9a88b8"}}>Создаю карусель…</p>
                </div>
              </Card>
            ) : (
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setStep(1)} style={{flex:1,padding:12,borderRadius:10,border:`1px solid ${S.border}`,background:"transparent",color:"#5c4e7a",fontSize:13,cursor:"pointer"}}>← Назад</button>
                <button onClick={generateCarousel} disabled={!topic.trim()||!carouselTemplate}
                  style={{flex:3,padding:15,borderRadius:12,border:"none",background:!topic.trim()||!carouselTemplate?"#d8d0e0":"#362d52",color:"#f4f1ec",fontSize:15,fontWeight:700,cursor:!topic.trim()||!carouselTemplate?"not-allowed":"pointer"}}>
                  🎨 Создать карусель
                </button>
              </div>
            )}

            {/* Carousel Result */}
            {carouselResult && !carouselLoading && (
              <Card>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                  <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:18,color:"#362d52",fontWeight:600}}>
                    {selectedCarouselTemplate?.icon} {carouselResult.title}
                  </div>
                  <CopyAllCarouselBtn result={carouselResult} topic={topic} />
                </div>

                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {carouselResult.slides.map((slide,i)=>{
                    const isCover = slide.type==="cover"||slide.n===1;
                    const isCta = slide.n===carouselResult.slides.length;
                    return (
                      <div key={i} style={{borderRadius:12,overflow:"hidden",border:`2px solid ${isCover?"#362d52":isCta?"#e1df2c":"#e8e0f0"}`}}>
                        <div style={{padding:"10px 14px",background:isCover?"#362d52":isCta?"#e1df2c":"#f4f1ec",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{width:22,height:22,borderRadius:"50%",background:isCover?"#e1df2c":isCta?"#362d52":"#362d52",color:isCover?"#362d52":isCta?"#f4f1ec":"#f4f1ec",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>{slide.n}</span>
                            <span style={{fontSize:12,fontWeight:700,color:isCover?"#f4f1ec":isCta?"#362d52":"#362d52"}}>{slide.title||slide.heading||""}</span>
                          </div>
                          <SlidecopybtnInline text={`${slide.title||slide.heading||""}\n${slide.text||""}`} />
                        </div>
                        <div style={{padding:"12px 14px",background:"#fff",fontSize:13,lineHeight:1.7,color:"#362d52",whiteSpace:"pre-wrap"}}>{slide.text||""}</div>
                      </div>
                    );
                  })}
                </div>

                <div style={{display:"flex",gap:8,marginTop:12}}>
                  <button onClick={()=>setCarouselResult(null)} style={{flex:1,padding:12,borderRadius:10,border:"1px solid #d8d0e0",background:"transparent",color:"#5c4e7a",fontSize:13,cursor:"pointer"}}>← Изменить</button>
                  <button onClick={generateCarousel} style={{flex:1,padding:12,borderRadius:10,border:"1px solid #362d52",background:"transparent",color:"#362d52",fontSize:13,fontWeight:700,cursor:"pointer"}}>↻ Пересоздать</button>
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
                <div style={{display:"flex",gap:6}}>
                  {[{id:"week",label:"Неделя"},{id:"two_weeks",label:"2 нед."},{id:"three_weeks",label:"3 нед."},{id:"month",label:"Месяц"},{id:"quarter",label:"Квартал"}].map(p=>(
                    <button key={p.id} onClick={()=>setPlanPeriod(p.id)}
                      style={{padding:"6px 8px",borderRadius:7,border:`1px solid ${planPeriod===p.id?"#362d52":"#d8d0e0"}`,background:planPeriod===p.id?"#362d52":"#f0eef8",color:planPeriod===p.id?"#f4f1ec":"#362d52",fontSize:11,fontWeight:600,cursor:"pointer",textAlign:"center",flex:1}}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product warmup link */}
              {products.length > 0 && (
                <div style={{marginBottom:18}}>
                  <Label text="Прогрев к продукту" hint="Включи если план должен вести к запуску продукта" />
                  <div style={{padding:"12px 14px",background:launchMode?"#362d52":"#f4f1ec",borderRadius:10,border:`1px solid ${launchMode?"#362d52":"#e8e0f0"}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:launchMode?12:0}}>
                      <input type="checkbox" checked={launchMode} onChange={e=>{setLaunchMode(e.target.checked);if(!e.target.checked){setSelectedProduct(null);setSelectedPhase(null);}}} style={{width:16,height:16,cursor:"pointer"}} />
                      <span style={{fontSize:13,fontWeight:600,color:launchMode?"#f4f1ec":"#362d52"}}>🚀 Включить прогрев к продукту</span>
                    </div>
                    {launchMode && (
                      <div>
                        <div style={{fontSize:11,color:"rgba(244,241,236,.7)",marginBottom:6}}>Выбери продукт:</div>
                        <div style={{display:"flex",flexDirection:"column",gap:5}}>
                          {products.map(p=>(
                            <button key={p.id} onClick={()=>setSelectedProduct(p)}
                              style={{padding:"8px 12px",borderRadius:8,border:`1px solid ${selectedProduct?.id===p.id?"#e1df2c":"rgba(244,241,236,.25)"}`,background:selectedProduct?.id===p.id?"rgba(225,223,44,.15)":"transparent",color:"#f4f1ec",fontSize:12,cursor:"pointer",textAlign:"left",fontWeight:selectedProduct?.id===p.id?700:400}}>
                              {p.name} {p.cost?`· ${p.cost}`:""}
                            </button>
                          ))}
                        </div>
                        {selectedProduct && (
                          <div style={{marginTop:8,padding:"8px 10px",background:"rgba(225,223,44,.1)",borderRadius:8,fontSize:11,color:"rgba(244,241,236,.8)"}}>
                            ✓ Алгоритм будет строить нарратив ведущий к запуску «{selectedProduct.name}»
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Platform selector */}
              <div style={{marginBottom:18}}>
                <Label text="Платформы" hint="Для каких платформ генерировать контент-план" />
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {PLATFORMS.map(p=>(
                    <button key={p.id} onClick={()=>setPlatforms(prev=>prev.includes(p.id)?prev.filter(x=>x!==p.id):[...prev,p.id])}
                      style={{padding:"7px 14px",borderRadius:9,border:`1px solid ${platforms.includes(p.id)?"#362d52":"#d8d0e0"}`,background:platforms.includes(p.id)?"#362d52":"#f0eef8",color:platforms.includes(p.id)?"#f4f1ec":"#362d52",fontSize:13,cursor:"pointer"}}>
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
                        {planPeriod==="month" && <span> · в месяц: <strong style={{color:"#362d52"}}>{monthTotal}</strong></span>}{planPeriod==="quarter" && <span> · в квартал: <strong style={{color:"#362d52"}}>{weekTotal*12}</strong></span>}
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
                  const totalDisp = planPeriod==="week"?weekTotalDisp:planPeriod==="month"?weekTotalDisp*4:weekTotalDisp*12;
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
                  <p style={{fontSize:13,color:"#9a88b8"}}>{planProgress || "Составляю контент-план…"}</p>
              {planProgress && <p style={{fontSize:11,color:"#9a88b8",marginTop:4,fontStyle:"italic"}}>Это может занять 1-2 минуты</p>}
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
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  <CopyAllPlanBtn planResult={planResult} />
                  <DownloadPlanBtn planResult={planResult} period={planPeriod} />
                  <DownloadCSVBtn planResult={planResult} period={planPeriod} />
                </div>
              </div>

              {/* Plan management buttons */}
              <div style={{display:"flex",gap:8,marginTop:12,marginBottom:4}}>
                <button onClick={()=>setStep(2)}
                  style={{flex:1,padding:"9px 12px",borderRadius:9,border:"1px solid #d8d0e0",background:"transparent",color:"#9a88b8",fontSize:12,cursor:"pointer"}}>
                  ⚙️ Настройки
                </button>
                <button onClick={()=>{setPlanResult(null);setPlanProgress("");setStep(2);}}
                  style={{flex:1,padding:"9px 12px",borderRadius:9,border:"1px solid #e05c5c",background:"transparent",color:"#e05c5c",fontSize:12,cursor:"pointer"}}>
                  🗑 Очистить план
                </button>
                {products.length>0 && (
                  <button onClick={()=>setShowLaunchPlanModal(true)}
                    style={{flex:1,padding:"9px 12px",borderRadius:9,border:"none",background:"#e1df2c",color:"#362d52",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                    🚀 Запуск
                  </button>
                )}
              </div>

              <div style={{marginBottom:12}} />

              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {planResult.map((post,i)=>(
                  <PlanCard key={i} post={post}
                    onAddToCalendar={()=>addToCalendar(post.topic, post.platform, null, "plan", {quadrant:post.sordell, hook:post.function})}
                    onCreatePost={()=>{
                      setTopic(post.topic);
                      setPillar(post.block||"");
                      // Set platform from card
                      if (post.platform) setPlatforms([post.platform]);
                      // Set stage from card
                      const stageObj = AWARENESS_STAGES.find(s=>s.label===post.stage||s.id===post.stage);
                      setStage(stageObj?.id||"unaware");
                      // Set Sordell from card
                      const sordellObj = SORDELL_MATRIX.find(q=>post.sordell?.includes(q.label)||post.sordell?.includes(q.id));
                      setSordellQuad(sordellObj?.id||"professional_unexpected");
                      // Set MS from card
                      if (post.ms && microsegments.length > 0) {
                        const msObj = microsegments.find(m=>m.name===post.ms||post.ms?.includes(m.name));
                        if (msObj) setSelectedMs(msObj.id);
                      }
                      // Set platform-aware length
                      if (post.platform==="threads"||post.platform==="instagram") setLength("short");
                      else if (post.platform==="telegram") setLength("medium");
                      setRubric("expert");
                      setPillarAngle("reasons");
                      setLength("standard");
                      setCta("sub");
                      setHookType("unexpected_change");
                      setPain("");
                      setDetails("");
                      setMode("post");
                      setResult(null);
                      // Auto-generate immediately
                      generateWithOverrides({
                        topicOverride: post.topic,
                        sordellQuadOverride: post.sordell?.includes("Личное") ?
                          (post.sordell?.includes("Неожиданное") ? "personal_unexpected" : "personal_known") :
                          (post.sordell?.includes("Неожиданное") ? "professional_unexpected" : "professional_known"),
                        rubricOverride: "expert",
                      });
                    }}
                  />
                ))}
              </div>
            </Card>

            <div style={{display:"flex",gap:8,marginTop:8}}>
              <button onClick={()=>setStep(1)} style={{flex:1,padding:12,borderRadius:10,border:"1px solid #d8d0e0",background:"transparent",color:"#5c4e7a",fontSize:13,cursor:"pointer"}}>⚙️ Параметры</button>
              <button onClick={()=>{setPlanResult(null);generatePlan();}} style={{flex:2,padding:12,borderRadius:10,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:13,fontWeight:700,cursor:"pointer"}}>↻ Пересоздать план</button>
            </div>
          </div>
        )}

        {/* STEP 3 — О чём писать */}
        {step===3&&mode!=="plan"&&mode!=="sordell"&&mode!=="carousel"&&(
          <div>
            <Card>
              <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:19,color:"#362d52",fontWeight:600,marginBottom:18,display:"flex",alignItems:"center",gap:9}}>
                <StepNum n="3" /> Стратегия
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

              {/* Hook Type */}
{!isCase && sordellQuad && (
                <div style={{marginBottom:18}}>
                  <Label text="Дополнительная функция поста" hint="Выбери если хочешь изменить функцию поста — иначе пост строится по логике квадранта" />
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {[
                      {id:"engaging", icon:"🔥", label:"Вовлекающий", desc:"Добавляет вопрос или опрос в конец поста. Цель: получить комментарии и реакции.", prompt:"Заверши пост вопросом к аудитории который провоцирует ответ в комментариях."},
                      {id:"pain", icon:"💊", label:"Боль / Проблема", desc:"Пост строится вокруг точного называния боли. Тон: «я вижу тебя», без советов и решений.", prompt:"Весь пост — точное называние боли читателя его словами. Без объяснений и решений."},
                      {id:"selling", icon:"💰", label:"Продающий", desc:"Пост содержит конкретный оффер и CTA. Только для стадий 3–4.", prompt:"Включи конкретный оффер и призыв к действию в конце.", disabled:(stage==="unaware"||stage==="aware")},
                    ].map(r=>{
                      const isDisabled = r.disabled;
                      return (
                        <div key={r.id}>
                          <button onClick={()=>!isDisabled&&setRubric(rubric===r.id?"":r.id)}
                            style={{width:"100%",padding:"10px 14px",borderRadius:9,border:`1px solid ${rubric===r.id?"#362d52":isDisabled?"#e8e0f0":"#d8d0e0"}`,background:rubric===r.id?"#362d52":isDisabled?"#fafafa":"#f0eef8",color:rubric===r.id?"#f4f1ec":isDisabled?"#c4b8d8":"#362d52",fontSize:13,cursor:isDisabled?"not-allowed":"pointer",textAlign:"left",opacity:isDisabled?.6:1}}>
                            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                              <span>{r.icon}</span>
                              <span style={{fontWeight:600}}>{r.label}</span>
                              {isDisabled && <span style={{fontSize:10,color:"#c4b8d8",marginLeft:"auto"}}>недоступно для стадий 0–1</span>}
                            </div>
                            <div style={{fontSize:11,color:rubric===r.id?"rgba(244,241,236,.8)":isDisabled?"#c4b8d8":"#5c4e7a"}}>{r.desc}</div>
                          </button>
                          {/* Threads + Selling warning */}
                          {rubric===r.id && r.id==="selling" && platforms.includes("threads") && (
                            <div style={{marginTop:6,padding:"8px 12px",background:"rgba(225,100,50,.08)",border:"1px solid rgba(225,100,50,.25)",borderRadius:8,fontSize:11,color:"#c46a4a"}}>
                              ⚠️ Продающие посты в Threads работают только после 10+ прогревочных постов («джебов»). Убедитесь что аудитория уже прогрета.
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {rubric && <button onClick={()=>setRubric("")} style={{padding:"6px",borderRadius:7,border:"none",background:"transparent",color:"#9a88b8",fontSize:11,cursor:"pointer",textAlign:"left"}}>× Убрать дополнительную функцию</button>}
                  </div>
                </div>
              )}


            </Card>

              {/* Formula selector */}
              {!isCase && (() => {
                const suggested = POST_FORMULAS.filter(f =>
                  f.stages.includes(stage) &&
                  platforms.some(p => f.platforms.includes(p)) &&
                  (sordellQuad ? f.sordell.includes(sordellQuad) : true)
                ).slice(0, 5);
                return suggested.length > 0 ? (
                  <div style={{marginBottom:6}}>
                    <Label text="Формула поста" hint="Опционально — задаёт структуру и ритм текста под твои параметры" />
                    <div style={{display:"flex",flexDirection:"column",gap:5}}>
                      {suggested.map(f=>(
                        <button key={f.id} onClick={()=>setSelectedFormula(selectedFormula===f.id?null:f.id)}
                          style={{padding:"9px 12px",borderRadius:9,border:`1px solid ${selectedFormula===f.id?"#362d52":"#d8d0e0"}`,background:selectedFormula===f.id?"#362d52":"#f0eef8",color:selectedFormula===f.id?"#f4f1ec":"#362d52",fontSize:12,cursor:"pointer",textAlign:"left",lineHeight:1.5}}>
                          <span style={{fontSize:10,opacity:.6,marginRight:6}}>#{f.id}</span>
                          {f.text}
                        </button>
                      ))}
                      {selectedFormula && <button onClick={()=>setSelectedFormula(null)} style={{padding:"4px",border:"none",background:"transparent",color:"#9a88b8",fontSize:11,cursor:"pointer",textAlign:"left"}}>× убрать формулу</button>}
                    </div>
                  </div>
                ) : null;
              })()}

            {error&&<p style={{color:"#e05c5c",fontSize:13,textAlign:"center",marginBottom:10}}>{error}</p>}
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setStep(2)} style={{flex:1,padding:12,borderRadius:10,border:`1px solid ${S.border}`,background:"transparent",color:"#5c4e7a",fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>← Назад</button>
              <button onClick={()=>{setError("");setStep(4);}}
                style={{flex:3,padding:15,borderRadius:12,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>
                Далее → Подтвердить
              </button>
            </div>
          </div>
        )}

        {step===4&&mode!=="plan"&&mode!=="sordell"&&mode!=="carousel"&&(
          <div>
            <Card>
              <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:19,color:"#362d52",fontWeight:600,marginBottom:16,display:"flex",alignItems:"center",gap:9}}>
                <StepNum n="4" /> Подтвердить и создать
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:4}}>
                {[
                  {label:"Тема", value:isCase?(caseClient||"кейс"):topic||"—", step:2},
                  {label:"Боль", value:pain||"—", step:2},
                  {label:"Хук", value:HOOK_TYPES.find(h=>h.id===hookType)?.label||"—", step:2},
                  {label:"Длина", value:LENGTH_OPTIONS.find(l=>l.id===length)?.label||"—", step:2},
                  {label:"CTA", value:CTA_OPTIONS.find(c=>c.id===cta)?.label||"—", step:2},
                  {label:"Платформы", value:PLATFORMS.filter(p=>platforms.includes(p.id)).map(p=>p.label).join(", ")||"не выбраны", step:2},
                  {label:"Блок", value:pillar||"—", step:3},
                  {label:"Угол блока", value:PILLAR_ANGLES.find(a=>a.id===pillarAngle)?.label||"—", step:3},
                  {label:"Стадия", value:AWARENESS_STAGES.find(s=>s.id===stage)?.label||"—", step:3},
                  {label:"Сорделл", value:SORDELL_MATRIX.find(q=>q.id===sordellQuad)?.label||"—", step:3},
                  {label:"Рубрика", value:rubric?{expert:"✦ Экспертный",personal:"👤 Личный",engaging:"🔥 Вовлекающий",pain:"💊 Боль",selling:"💰 Продающий"}[rubric]:"не выбрана", step:3},
                  {label:"Формула", value:selectedFormula?("№"+selectedFormula+": "+POST_FORMULAS.find(f=>f.id===selectedFormula)?.text):"без формулы", step:3},
                ].map((row,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"8px 12px",background:"#f4f1ec",borderRadius:8,border:"1px solid #e8e0f0"}}>
                    <div style={{fontSize:11,color:"#9a88b8",fontWeight:600,width:80,flexShrink:0,paddingTop:2}}>{row.label}</div>
                    <div style={{fontSize:12,color:"#362d52",flex:1,lineHeight:1.5}}>{row.value}</div>
                    <button onClick={()=>setStep(row.step)} style={{padding:"2px 8px",borderRadius:6,border:"1px solid #d8d0e0",background:"transparent",color:"#9a88b8",fontSize:10,cursor:"pointer",flexShrink:0}}>✏️</button>
                  </div>
                ))}
              </div>
              {error&&<p style={{color:"#e05c5c",fontSize:13,textAlign:"center",marginTop:8,marginBottom:0}}>{error}</p>}
            </Card>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setStep(3)} style={{flex:1,padding:12,borderRadius:10,border:`1px solid ${S.border}`,background:"transparent",color:"#5c4e7a",fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>← Назад</button>
              <button onClick={generate} style={{flex:3,padding:15,borderRadius:12,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>
                ✦ Создать пост
              </button>
            </div>
          </div>
        )}

        {step===2&&mode!=="plan"&&mode!=="sordell"&&mode!=="carousel"&&(
          <div>
            <Card>
              <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:19,color:"#362d52",fontWeight:600,marginBottom:18,display:"flex",alignItems:"center",gap:9}}>
                <StepNum n="2" /> Тема поста
              </div>

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
                  {/* Launch mode block */}
                  {products.length > 0 && (
                    <div style={{marginBottom:14,padding:"12px 14px",background:launchMode?"#362d52":"#f4f1ec",borderRadius:10,border:`1px solid ${launchMode?"#362d52":"#e8e0f0"}`}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:launchMode?12:0}}>
                        <input type="checkbox" checked={launchMode} onChange={e=>{setLaunchMode(e.target.checked);if(!e.target.checked){setSelectedProduct(null);setSelectedPhase(null);}}}
                          style={{width:16,height:16,cursor:"pointer"}} />
                        <span style={{fontSize:13,fontWeight:600,color:launchMode?"#f4f1ec":"#362d52"}}>🚀 Пост входит в запуск продукта</span>
                      </div>
                      {launchMode && (
                        <div>
                          <div style={{marginBottom:10}}>
                            <div style={{fontSize:11,color:"rgba(244,241,236,.7)",marginBottom:5}}>Продукт:</div>
                            <div style={{display:"flex",flexDirection:"column",gap:5}}>
                              {products.map(p=>(
                                <button key={p.id} onClick={()=>setSelectedProduct(p)}
                                  style={{padding:"7px 12px",borderRadius:7,border:`1px solid ${selectedProduct?.id===p.id?"#e1df2c":"rgba(244,241,236,.25)"}`,background:selectedProduct?.id===p.id?"rgba(225,223,44,.15)":"transparent",color:"#f4f1ec",fontSize:12,cursor:"pointer",textAlign:"left",fontWeight:selectedProduct?.id===p.id?700:400}}>
                                  {p.name}
                                </button>
                              ))}
                            </div>
                          </div>
                          {selectedProduct && (
                            <div>
                              <div style={{fontSize:11,color:"rgba(244,241,236,.7)",marginBottom:5}}>Фаза запуска:</div>
                              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                                {[
                                  {n:1,label:"Прогрев темы",desc:"Стадии 0–1, без продукта"},
                                  {n:2,label:"Прогрев продукта",desc:"Стадии 2–3, мягкое упоминание"},
                                  {n:3,label:"Продажи",desc:"Стадии 3–4, полное раскрытие"},
                                ].map(ph=>(
                                  <button key={ph.n} onClick={()=>{
                                    setSelectedPhase(ph.n);
                                    // Auto-set stage and quadrant based on phase
                                    if(ph.n===1){setStage("unaware");setSordellQuad("personal_unexpected");}
                                    else if(ph.n===2){setStage("seeking");setSordellQuad("professional_unexpected");}
                                    else if(ph.n===3){setStage("choosing");setSordellQuad("professional_unexpected");setRubric("selling");}
                                  }}
                                    style={{padding:"8px 8px",borderRadius:7,border:`1px solid ${selectedPhase===ph.n?"#e1df2c":"rgba(244,241,236,.25)"}`,background:selectedPhase===ph.n?"rgba(225,223,44,.15)":"transparent",color:"#f4f1ec",fontSize:11,cursor:"pointer",textAlign:"left"}}>
                                    <div style={{fontWeight:700,marginBottom:2}}>Фаза {ph.n}</div>
                                    <div style={{fontSize:9,opacity:.8}}>{ph.label}</div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{marginBottom:14}}>
                    {/* Microsegment selector */}
                    {microsegments.length > 0 && (
                      <div style={{marginBottom:12}}>
                        <Label text="Для кого этот пост?" hint="Выбери МС — его боли и язык подставятся в промпт автоматически" />
                        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                          {microsegments.map(ms=>(
                            <button key={ms.id} onClick={()=>setSelectedMs(selectedMs===ms.id?null:ms.id)}
                              style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${selectedMs===ms.id?"#362d52":"#d8d0e0"}`,background:selectedMs===ms.id?"#362d52":"#f0eef8",color:selectedMs===ms.id?"#f4f1ec":"#362d52",fontSize:12,fontWeight:selectedMs===ms.id?700:400,cursor:"pointer",whiteSpace:"nowrap"}}>
                              {selectedMs===ms.id?"✓ ":""}{ms.name}
                            </button>
                          ))}
                          {selectedMs && (
                            <button onClick={()=>setSelectedMs(null)}
                              style={{padding:"6px 10px",borderRadius:8,border:"none",background:"transparent",color:"#9a88b8",fontSize:11,cursor:"pointer"}}>
                              × общая аудитория
                            </button>
                          )}
                        </div>
                        {selectedMs && microsegments.find(m=>m.id===selectedMs) && (
                          <div style={{marginTop:6,padding:"8px 10px",background:"rgba(54,45,82,.06)",borderRadius:8,fontSize:11,color:"#5c4e7a",lineHeight:1.6}}>
                            {microsegments.find(m=>m.id===selectedMs).desc&&<div style={{marginBottom:3}}>👤 {microsegments.find(m=>m.id===selectedMs).desc.substring(0,100)}</div>}
                            {microsegments.find(m=>m.id===selectedMs).pains&&<div>💊 {microsegments.find(m=>m.id===selectedMs).pains.substring(0,100)}</div>}
                          </div>
                        )}
                      </div>
                    )}

                    <Label text="Боль аудитории" hint={currentPainHint} />
                    <textarea style={inpAuto} rows={1} placeholder="Например: боится что ноутбук сломается и потеряет все данные" value={pain} onChange={e=>{setPain(e.target.value);e.target.style.height="auto";e.target.style.height=e.target.scrollHeight+"px";}} />
                  </div>
                  <div style={{marginBottom:14}}>
                    <Label text="Ключевые факты и УТП" hint="Что обязательно отразить — цифры, преимущества, детали" />
                    <textarea style={inp} rows={4} placeholder={"Что важно донести:\n— чистка каждые 6-12 месяцев\n— стоимость 50 лари\n— доставка курьером после ремонта"} value={details} onChange={e=>setDetails(e.target.value)} />
                  </div>
                </>
              )}

              {/* Quick platform selector on topic step */}
              <div style={{marginBottom:18}}>
                <Label text="Тип хука" hint="Как зацепить мозг читателя с первой строки (по Will Storr)" />
                <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:8}}>
                  {HOOK_TYPES.map(h=>(
                    <button key={h.id} onClick={()=>setHookType(hookType===h.id?"":h.id)}
                      style={{padding:"10px 14px",borderRadius:9,border:`1px solid ${hookType===h.id?"#362d52":"#d8d0e0"}`,background:hookType===h.id?"#362d52":"#f0eef8",color:hookType===h.id?"#f4f1ec":"#362d52",fontSize:13,cursor:"pointer",fontFamily:"sans-serif",textAlign:"left",transition:"all .2s"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                        <span style={{fontSize:15}}>{h.icon}</span>
                        <span style={{fontWeight:600,fontSize:12}}>{h.label}</span>
                      </div>
                      <div style={{fontSize:11,color:hookType===h.id?"rgba(244,241,236,.8)":"#5c4e7a",lineHeight:1.4}}>{h.desc}</div>
                      {hookType===h.id && <div style={{fontSize:10,color:"rgba(244,241,236,.7)",marginTop:6,fontStyle:"italic",lineHeight:1.5,borderTop:"1px solid rgba(244,241,236,.2)",paddingTop:6}}>{h.hint}</div>}
                    </button>
                  ))}
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
              <div style={{marginBottom:14}}>
                <Label text="Платформы для этого поста" hint="Можешь изменить для конкретного поста" />
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {PLATFORMS.map(p=>(
                    <button key={p.id} onClick={()=>{
                      setPlatforms(prev=>prev.includes(p.id)?prev.filter(x=>x!==p.id):[...prev,p.id]);
                    }} style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${platforms.includes(p.id)?"#362d52":"#d8d0e0"}`,background:platforms.includes(p.id)?"#362d52":"#fff",color:platforms.includes(p.id)?"#f4f1ec":"#362d52",fontSize:12,cursor:"pointer"}}>
                      {p.icon} {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {error&&<p style={{color:"#e05c5c",fontSize:13,textAlign:"center",marginBottom:10}}>{error}</p>}
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setStep(1)} style={{flex:1,padding:12,borderRadius:10,border:`1px solid ${S.border}`,background:"transparent",color:"#5c4e7a",fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>← Назад</button>
              <button onClick={()=>{if(!topic.trim()&&!isCase){setError("Укажи тему поста");return;}setError("");setStep(3);}}
                style={{flex:3,padding:15,borderRadius:12,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>
                Далее → Стратегия
              </button>
            </div>
          </div>
        )}


        {/* STEP 5 — Result */}
        {step===5&&result&&mode!=="plan"&&mode!=="sordell"&&mode!=="carousel"&&(
          <div>
            {/* Strategy badge */}
            <div style={{padding:"10px 16px",background:"#f4f1ec",border:"1px solid #e8e0f0",borderRadius:10,marginBottom:14,fontSize:11,color:"#5c4e7a",lineHeight:1.9,display:"flex",flexWrap:"wrap",gap:2,alignItems:"center"}}>
              {[
                platforms.length && {label:"📱 Платформы:", value:platforms.map(pid=>PLATFORMS.find(p=>p.id===pid)?.icon).join(" ")},
                length && {label:"📏 Формат:", value:LENGTH_OPTIONS.find(l=>l.id===length)?.label},
                pillar && {label:"📌 Блок:", value:pillar},
                pillarAngle && {label:"📐 Угол блока:", value:PILLAR_ANGLES.find(a=>a.id===pillarAngle)?.label},
                sordellQuad && {label:`${selectedSordell?.icon} Подача:`, value:selectedSordell?.label},
                hookType && {label:`${selectedHookType?.icon} Хук:`, value:selectedHookType?.label},
                stage && {label:"👥 Стадия:", value:selectedStage?.label},
                rubric && {label:`${selectedRubric?.icon} Рубрика:`, value:selectedRubric?.label},
                cta && {label:"🎯 CTA:", value:selectedCta?.label},
              ].filter(Boolean).map((item,i)=>(
                <span key={i} style={{marginRight:14,whiteSpace:"nowrap"}}>
                  {item.label} <em style={{color:S.muted,fontStyle:"italic",fontWeight:600}}>{item.value}</em>
                </span>
              ))}
            </div>


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
              <div style={{padding:18}}>
                {result.headline && (
                  <div style={{fontSize:18,fontWeight:700,color:"#362d52",fontFamily:"'Cormorant Garamond', serif",lineHeight:1.3,marginBottom:14}}>{result.headline}</div>
                )}
                <div style={{fontSize:14,lineHeight:1.85,color:"#362d52",whiteSpace:"pre-wrap"}}>{result[activeTab]||"—"}</div>
              </div>
              <div style={{padding:"10px 18px",borderTop:"1px solid #e8e0f0",display:"flex",justifyContent:"flex-end"}}>
<CopyBtn text={(result.headline?result.headline+"\n\n":"")+result[activeTab]} />
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

            {/* Add to calendar from post result */}
            {result?.headline && (
              <button onClick={()=>addToCalendar(result.headline, activeTab, history[0]?.id||null, "post", {hook:result.hook})}
                style={{width:"100%",padding:10,borderRadius:9,border:"1px solid #5c9a6a",background:"transparent",color:"#5c9a6a",fontSize:12,fontWeight:600,cursor:"pointer",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                📆 Добавить в календарь публикаций
              </button>
            )}

            {/* Back to plan button if plan exists */}
            {planResult && planResult.length > 0 && (
              <button onClick={()=>{setResult(null);setMode("plan");setStep(5);}}
                style={{width:"100%",padding:11,borderRadius:10,border:"1px solid #e1df2c",background:"rgba(225,223,44,.1)",color:"#362d52",fontSize:12,fontWeight:700,cursor:"pointer",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                📅 Вернуться к контент-плану
              </button>
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

        </div>{/* end left column */}
        </div>{/* end two-column wrapper */}
      </div>
    </div>
  );
}

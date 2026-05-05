import React, { useState } from "react";

function EditablePostView({ result }) {
  const platforms = ["telegram","vk","facebook","threads","instagram","zen","linkedin","yt_shorts","yt_long"];
  const platLabels = {telegram:"✈️ Telegram",vk:"🔵 ВКонтакте",facebook:"📘 Facebook",threads:"◎ Threads",instagram:"📸 Instagram",zen:"🟡 Дзен",linkedin:"💼 LinkedIn",yt_shorts:"▶️ Shorts",yt_long:"🎬 YouTube"};
  const available = platforms.filter(pid=>result[pid]);
  const [activeTab, setActiveTab] = React.useState(available[0]||"telegram");
  const [texts, setTexts] = React.useState(() => {
    const t = {};
    platforms.forEach(pid=>{ if(result[pid]) t[pid] = (result.headline ? result.headline+"\n\n" : "") + result[pid]; });
    return t;
  });
  const [copied, setCopied] = React.useState(false);

  return (
    <div style={{marginTop:16,borderTop:"1px solid #e8e0f0",paddingTop:16}}>
      <div style={{fontSize:12,fontWeight:700,color:"#362d52",marginBottom:10}}>✏️ Редактор — правь текст прямо здесь</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
        {available.map(pid=>(
          <button key={pid} onClick={()=>setActiveTab(pid)}
            style={{padding:"5px 10px",borderRadius:7,border:`1px solid ${activeTab===pid?"#362d52":"#d8d0e0"}`,background:activeTab===pid?"#362d52":"#f0eef8",color:activeTab===pid?"#f4f1ec":"#362d52",fontSize:11,cursor:"pointer"}}>
            {platLabels[pid]}
          </button>
        ))}
      </div>
      <textarea value={texts[activeTab]||""} onChange={e=>setTexts(t=>({...t,[activeTab]:e.target.value}))}
        style={{width:"100%",minHeight:220,padding:"12px 14px",borderRadius:9,border:"1px solid #d8d0e0",fontSize:13,lineHeight:1.85,color:"#362d52",resize:"vertical",fontFamily:"'Nunito Sans', sans-serif",boxSizing:"border-box",outline:"none"}} />
      <div style={{display:"flex",gap:8,marginTop:8}}>
        <button onClick={()=>{navigator.clipboard.writeText(texts[activeTab]||"");setCopied(true);setTimeout(()=>setCopied(false),1500);}}
          style={{flex:1,padding:"9px 14px",borderRadius:8,border:"1px solid #362d52",background:"transparent",color:copied?"#4a9a6a":"#362d52",fontSize:12,fontWeight:600,cursor:"pointer"}}>
          {copied?"✓ Скопировано":"📋 Скопировать"}
        </button>
      </div>
    </div>
  );
}

function HistoryModal({ item, onClose, onUsePost, onUsePlan, onAddToCalendar }) {
  const [copiedIdx, setCopiedIdx] = React.useState(null);
  if (!item) return null;
  const isPlan = item.type === "plan";
  const isPost = item.type === "post";

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:2000,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"20px",overflowY:"auto"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"#fff",borderRadius:16,padding:24,maxWidth:640,width:"100%",position:"relative",marginTop:20,marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div>
            <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:20,color:"#362d52",fontWeight:600}}>
              {isPlan?"📅 Контент-план":isPost?"✦ Пост":"⭐ Кейс"}
            </div>
            <div style={{fontSize:11,color:"#9a88b8",marginTop:2}}>
              {new Date(item.created_at).toLocaleDateString("ru",{day:"numeric",month:"long",year:"numeric"})}
            </div>
          </div>
          <button onClick={onClose} style={{background:"transparent",border:"none",fontSize:24,cursor:"pointer",color:"#9a88b8",lineHeight:1}}>×</button>
        </div>

        {/* POST VIEW */}
        {isPost && item.result && (
          <div>
            <div style={{padding:"14px 16px",background:"#362d52",borderRadius:10,marginBottom:14}}>
              <div style={{fontSize:10,color:"rgba(244,241,236,.6)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>Заголовок</div>
              <div style={{fontSize:16,color:"#f4f1ec",fontWeight:600,fontFamily:"'Cormorant Garamond', serif"}}>{item.result.headline}</div>
              {item.result.hook && <>
                <div style={{fontSize:10,color:"rgba(244,241,236,.6)",textTransform:"uppercase",letterSpacing:".06em",marginTop:10,marginBottom:4}}>Хук</div>
                <div style={{fontSize:13,color:"rgba(244,241,236,.85)",fontStyle:"italic"}}>{item.result.hook}</div>
              </>}
            </div>
            {["telegram","vk","facebook","threads","instagram","zen","linkedin","yt_shorts","yt_long"].map(pid=>{
              if (!item.result[pid]) return null;
              const plat = {telegram:"✈️ Telegram",vk:"🔵 ВКонтакте",facebook:"📘 Facebook",threads:"◎ Threads",instagram:"📸 Instagram",zen:"🟡 Дзен",linkedin:"💼 LinkedIn",yt_shorts:"▶️ Shorts",yt_long:"🎬 YouTube"}[pid];
              return (
                <div key={pid} style={{marginBottom:12,border:"1px solid #e8e0f0",borderRadius:10,overflow:"hidden"}}>
                  <div style={{padding:"8px 14px",background:"#f4f1ec",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <span style={{fontSize:13,fontWeight:600,color:"#362d52"}}>{plat}</span>
                    <button onClick={()=>{navigator.clipboard.writeText(item.result[pid]);setCopiedIdx(pid);setTimeout(()=>setCopiedIdx(null),1500);}}
                      style={{padding:"4px 10px",borderRadius:6,border:"1px solid #d8d0e0",background:"#fff",fontSize:11,color:copiedIdx===pid?"#4a9a6a":"#5c4e7a",cursor:"pointer"}}>
                      {copiedIdx===pid?"✓":"Скопировать"}
                    </button>
                  </div>
                  <div style={{padding:"12px 14px",fontSize:13,lineHeight:1.8,color:"#362d52",whiteSpace:"pre-wrap"}}>{item.result[pid]}</div>
                </div>
              );
            })}
            <button onClick={()=>onAddToCalendar(item.result?.headline||item.topic, null, item.id, "post")}
              style={{width:"100%",marginTop:8,padding:"9px 14px",borderRadius:8,border:"1px solid #5c9a6a",background:"transparent",color:"#5c9a6a",fontSize:12,fontWeight:600,cursor:"pointer"}}>
              📆 Добавить в календарь публикаций
            </button>
            <EditablePostView result={item.result} onClose={onClose} />
          </div>
        )}

        {/* SORDELL VIEW */}
        {item.type==="sordell" && item.result && (
          <div>
            <p style={{fontSize:12,color:"#9a88b8",marginBottom:12}}>{(item.result.topics||[]).length} тем · {item.strategy?.niche||""}</p>
            <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:"60vh",overflowY:"auto"}}>
              {(item.result.topics||[]).map((t,i)=>(
                <div key={i} style={{padding:"10px 14px",background:t.top?"#f4f1ec":"#fafafa",borderRadius:9,border:t.top?"2px solid #362d52":"1px solid #e8e0f0"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                    {t.top && <span>⭐</span>}
                    <span style={{fontSize:10,background:t.quadrant?.includes("Личное")?"#e1df2c":"rgba(54,45,82,.08)",color:"#362d52",padding:"1px 7px",borderRadius:5,fontWeight:700}}>{t.quadrant}</span>
                  </div>
                  <div style={{fontSize:13,fontWeight:600,color:"#362d52",marginBottom:3,lineHeight:1.4}}>{t.topic}</div>
                  <div style={{fontSize:11,color:"#5c4e7a",fontStyle:"italic"}}>{t.hook}</div>
                </div>
              ))}
            </div>
            <button onClick={()=>{
              const text = (item.result.topics||[]).map((t,i)=>`${i+1}. ${t.topic}\nХук: ${t.hook}\nКвадрант: ${t.quadrant}`).join("\n\n");
              navigator.clipboard.writeText(text);
            }} style={{width:"100%",marginTop:12,padding:"9px 14px",borderRadius:8,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:12,fontWeight:700,cursor:"pointer"}}>
              📋 Скопировать все темы
            </button>
          </div>
        )}

        {/* CAROUSEL VIEW */}
        {item.type==="carousel" && item.result && (
          <div>
            <div style={{marginBottom:12,padding:"10px 14px",background:"#362d52",borderRadius:9}}>
              <div style={{fontSize:15,fontWeight:600,color:"#f4f1ec",fontFamily:"'Cormorant Garamond', serif"}}>{item.result.title}</div>
              <div style={{fontSize:10,color:"rgba(244,241,236,.6)",marginTop:3}}>{item.result.slides?.length} слайдов</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:"60vh",overflowY:"auto"}}>
              {(item.result.slides||[]).map((slide,i)=>{
                const isCover = slide.n===1 || slide.type==="cover";
                const isCta = slide.n===(item.result.slides||[]).length || slide.type==="cta";
                return (
                  <div key={i} style={{borderRadius:10,overflow:"hidden",border:`1px solid ${isCover?"#362d52":isCta?"#e1df2c":"#e8e0f0"}`}}>
                    <div style={{padding:"8px 12px",background:isCover?"#362d52":isCta?"#e1df2c":"#f4f1ec",display:"flex",alignItems:"center",gap:8}}>
                      <span style={{width:20,height:20,borderRadius:"50%",background:isCover?"#e1df2c":isCta?"#362d52":"#362d52",color:isCover?"#362d52":"#f4f1ec",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0}}>{slide.n}</span>
                      <span style={{fontSize:12,fontWeight:700,color:isCover?"#f4f1ec":isCta?"#362d52":"#362d52"}}>{slide.title||slide.heading||""}</span>
                    </div>
                    <div style={{padding:"8px 12px",fontSize:12,lineHeight:1.6,color:"#362d52",whiteSpace:"pre-wrap"}}>{slide.text||""}</div>
                  </div>
                );
              })}
            </div>
            <button onClick={()=>{
              const text = (item.result.title||"") + "\n\n" + (item.result.slides||[]).map(s=>`[Слайд ${s.n}] ${s.title||s.heading||""}\n${s.text||""}`).join("\n\n---\n\n");
              navigator.clipboard.writeText(text);
            }} style={{width:"100%",marginTop:12,padding:"9px 14px",borderRadius:8,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:12,fontWeight:700,cursor:"pointer"}}>
              📋 Скопировать все слайды
            </button>
          </div>
        )}

        {/* PLAN VIEW */}
        {isPlan && (item.result?.posts || Array.isArray(item.result)) && (
          <div>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              <button onClick={()=>{
                const text = item.result.map(p=>`${p.day} · ${p.platform||""}
Тема: ${p.topic}
Стадия: ${p.stage||""} · ${p.sordell||""}
Функция: ${p.function||""}`).join("\n\n---\n\n");
                navigator.clipboard.writeText(text);setCopiedIdx("all");setTimeout(()=>setCopiedIdx(null),2000);
              }} style={{flex:1,padding:"8px 14px",borderRadius:8,border:"1px solid #362d52",background:"transparent",color:"#362d52",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                {copiedIdx==="all"?"✓ Скопировано":"📋 Копировать всё"}
              </button>
              <button onClick={()=>{onUsePlan(item);onClose();}}
                style={{flex:1,padding:"8px 14px",borderRadius:8,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                📅 Открыть план
              </button>
              <button onClick={()=>{
                (item.result?.posts||item.result||[]).forEach(p=>onAddToCalendar(p.topic, p.platform, item.id, "plan"));
                onClose();
              }} style={{flex:1,padding:"8px 14px",borderRadius:8,border:"1px solid #5c9a6a",background:"transparent",color:"#5c9a6a",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                📆 Все в календарь
              </button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:"60vh",overflowY:"auto"}}>
              {(item.result?.posts || item.result || []).map((post,i)=>(
                <div key={i} style={{padding:"10px 14px",background:"#f4f1ec",borderRadius:9,border:"1px solid #e8e0f0"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4,flexWrap:"wrap",gap:4}}>
                    <span style={{fontSize:10,fontWeight:700,color:"#362d52",textTransform:"uppercase"}}>{post.day}</span>
                    {post.function && <span style={{fontSize:10,background:"#e1df2c",color:"#362d52",padding:"1px 8px",borderRadius:6,fontWeight:700}}>{post.function}</span>}
                  </div>
                  <div style={{fontSize:13,fontWeight:600,color:"#362d52",marginBottom:4,lineHeight:1.4}}>{post.topic}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                    {post.stage && <span style={{fontSize:10,background:"rgba(54,45,82,.08)",color:"#5c4e7a",padding:"1px 7px",borderRadius:5}}>👥 {post.stage}</span>}
                    {post.sordell && <span style={{fontSize:10,background:"rgba(54,45,82,.08)",color:"#5c4e7a",padding:"1px 7px",borderRadius:5}}>{post.sordell}</span>}
                    {post.block && <span style={{fontSize:10,background:"rgba(54,45,82,.08)",color:"#5c4e7a",padding:"1px 7px",borderRadius:5}}>📌 {post.block}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { EditablePostView, HistoryModal };

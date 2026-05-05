import { S } from '../constants/styles';
import React, { useState } from "react";
import { PLATFORMS, AWARENESS_STAGES } from '../constants';

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

function PlanCard({ post, onCreatePost, onAddToCalendar }) {
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
        {post.stage && <span style={{fontSize:10,background:"rgba(54,45,82,.08)",color:"#5c4e7a",padding:"2px 8px",borderRadius:6}}>👥 {AWARENESS_STAGES.find(s=>s.label===post.stage||s.id===post.stage||post.stage?.toLowerCase().includes(s.label.toLowerCase().slice(0,8)))?.label || post.stage}</span>}
        {post.sordell && <span style={{fontSize:10,background:"rgba(54,45,82,.08)",color:"#5c4e7a",padding:"2px 8px",borderRadius:6}}>{post.sordell}</span>}
      </div>
      <div style={{display:"flex",gap:6}}>
        <button onClick={onCreatePost} style={{flex:2,padding:"7px 10px",borderRadius:8,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:11,fontWeight:700,cursor:"pointer"}}>
          ✦ Создать пост
        </button>
        <button onClick={onAddToCalendar} style={{flex:1,padding:"7px 10px",borderRadius:8,border:"1px solid #5c9a6a",background:"transparent",color:"#5c9a6a",fontSize:11,fontWeight:600,cursor:"pointer"}}>
          📆
        </button>
        <button onClick={()=>{navigator.clipboard.writeText(post.topic);setCopied(true);setTimeout(()=>setCopied(false),1500);}}
          style={{flex:1,padding:"7px 10px",borderRadius:8,border:"1px solid #d8d0e0",background:"#fff",color:copied?"#4a9a6a":"#5c4e7a",fontSize:11,cursor:"pointer"}}>
          {copied?"✓":"📋"}
        </button>
      </div>
    </div>
  );
}

export { formatPlanText, CopyAllPlanBtn, DownloadPlanBtn, PlanCard };

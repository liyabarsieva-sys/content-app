import React, { useState } from "react";

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

function SlidecopybtnInline({ text }) {
  const [done, setDone] = React.useState(false);
  return (
    <button onClick={()=>{navigator.clipboard.writeText(text);setDone(true);setTimeout(()=>setDone(false),1500);}}
      style={{padding:"3px 8px",borderRadius:6,border:"1px solid rgba(54,45,82,.2)",background:"transparent",fontSize:10,cursor:"pointer",color:done?"#4a9a6a":"#5c4e7a",whiteSpace:"nowrap"}}>
      {done?"✓":"📋"}
    </button>
  );
}

export { Label, CopyBtn, Card, StepNum, SlidecopybtnInline };

import React, { useState } from "react";

function CopyAllCarouselBtn({ result, topic }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button onClick={()=>{
      const header = topic ? `Тема: ${topic}\n${result.title||""}` : (result.title||"");
      const text = header + "\n\n" + (result.slides||[]).map(s=>`[Слайд ${s.n||""}] ${s.title||s.heading||""}\n${s.text||""}`).join("\n\n---\n\n");
      navigator.clipboard.writeText(text);
      setCopied(true); setTimeout(()=>setCopied(false),2000);
    }} style={{flex:2,padding:"9px 14px",borderRadius:8,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:12,fontWeight:700,cursor:"pointer"}}>
      {copied?"✓ Скопировано":"📋 Копировать все слайды"}
    </button>
  );
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

export { CopyAllCarouselBtn, SlidecopybtnInline };

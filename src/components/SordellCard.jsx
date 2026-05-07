import React, { useState } from "react";

function SordellCard({ t, onCreatePost, onExpand, expanded, expanding, onAddToCalendar, onAddAngleToCalendar }) {
  const [copied, setCopied] = React.useState(false);
  const [copiedAngle, setCopiedAngle] = React.useState(null);
  const ANGLE_COLORS = { "Причины":"#5a8a6a","Ошибки":"#c46a4a","Примеры":"#7a6a9a","Решения":"#362d52" };
  return (
    <div style={{borderRadius:10,border:t.top?"2px solid #362d52":"1px solid #e8e0f0",overflow:"hidden"}}>
      <div style={{padding:"14px 16px",background:t.top?"#f4f1ec":"#fafafa",display:"flex",gap:14,alignItems:"flex-start"}}>

        {/* Left: content */}
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
            {t.top && <span style={{fontSize:15}}>⭐</span>}
            <span style={{fontSize:10,background:t.quadrant?.includes("Личное")?"#e1df2c":"rgba(54,45,82,.08)",color:"#362d52",padding:"2px 9px",borderRadius:6,fontWeight:700}}>{t.quadrant}</span>
          </div>
          <div style={{fontSize:14,fontWeight:700,color:"#362d52",marginBottom:5,lineHeight:1.4}}>{t.topic}</div>
          <div style={{fontSize:12,color:"#5c4e7a",fontStyle:"italic",lineHeight:1.5,marginBottom:t.top&&t.reason?6:0}}>💡 {t.hook}</div>
          {t.top && t.reason && (
            <div style={{fontSize:11,color:"#7a6a9a",background:"rgba(54,45,82,.05)",padding:"6px 10px",borderRadius:7,lineHeight:1.5,marginTop:6}}>🔥 {t.reason}</div>
          )}
        </div>

        {/* Right: buttons stacked */}
        <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0,width:120}}>
          <button onClick={onCreatePost}
            style={{padding:"9px 12px",borderRadius:8,border:"none",background:"#362d52",color:"#f4f1ec",fontSize:12,fontWeight:700,cursor:"pointer",textAlign:"center"}}>
            ✦ Создать пост
          </button>
          <button onClick={onExpand} disabled={expanding}
            style={{padding:"9px 12px",borderRadius:8,border:"1px solid #362d52",background:"transparent",color:"#362d52",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
            {expanding
              ? <><div style={{width:10,height:10,border:"1.5px solid #d8d0e0",borderTopColor:"#362d52",borderRadius:"50%",animation:"sp .8s linear infinite"}}/>…</>
              : expanded ? "▲ Свернуть" : "⊞ Развернуть"
            }
          </button>
          <button onClick={onAddToCalendar}
            style={{padding:"9px 12px",borderRadius:8,border:"1px solid #5c9a6a",background:"transparent",color:"#5c9a6a",fontSize:12,fontWeight:600,cursor:"pointer",textAlign:"center"}}>
            📆 В календарь
          </button>
          <button onClick={()=>{navigator.clipboard.writeText(t.topic+"\n"+t.hook);setCopied(true);setTimeout(()=>setCopied(false),1500);}}
            style={{padding:"9px 12px",borderRadius:8,border:"1px solid #d8d0e0",background:"#fff",color:copied?"#4a9a6a":"#5c4e7a",fontSize:12,fontWeight:600,cursor:"pointer",textAlign:"center"}}>
            {copied?"✓ Скоп.":"📋 Копировать"}
          </button>
        </div>
      </div>
      {expanded && expanded.length > 0 && (
        <div style={{borderTop:"1px solid #e8e0f0",background:"#f8f6fc",padding:"10px 14px"}}>
          <div style={{fontSize:10,color:"#9a88b8",textTransform:"uppercase",letterSpacing:".06em",marginBottom:8,fontWeight:600}}>8 идей для постов:</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {expanded.map((post,i)=>(
              <div key={i} style={{padding:"8px 10px",background:"#fff",borderRadius:8,border:"1px solid #e8e0f0"}}>
                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
                  <span style={{fontSize:9,fontWeight:700,color:"#fff",background:ANGLE_COLORS[post.angle]||"#362d52",padding:"1px 6px",borderRadius:4}}>{post.angle}</span>
                  <span style={{fontSize:9,color:"#9a88b8"}}>{post.sordell}</span>
                </div>
                <div style={{fontSize:12,fontWeight:600,color:"#362d52",marginBottom:3,lineHeight:1.4}}>{post.title}</div>
                <div style={{fontSize:11,color:"#5c4e7a",fontStyle:"italic",marginBottom:6}}>{post.hook}</div>
                <div style={{display:"flex",gap:5}}>
                  <button onClick={()=>{
                    navigator.clipboard.writeText(post.title+"\n"+post.hook);
                    setCopiedAngle(i);setTimeout(()=>setCopiedAngle(null),1500);
                  }} style={{padding:"3px 8px",borderRadius:5,border:"1px solid #d8d0e0",background:"#fff",color:copiedAngle===i?"#4a9a6a":"#5c4e7a",fontSize:10,cursor:"pointer"}}>
                    {copiedAngle===i?"✓":"📋"}
                  </button>
                  <button onClick={()=>onAddAngleToCalendar&&onAddAngleToCalendar(post.title, post.hook, post.sordell)}
                    style={{padding:"3px 8px",borderRadius:5,border:"1px solid #5c9a6a",background:"transparent",color:"#5c9a6a",fontSize:10,cursor:"pointer"}}>
                    📆
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { SordellCard };

import React, { useState } from "react";

function CalendarDateModal({ modal, date, setDate, platform, setPlatform, onSave, onClose }) {
  const today = new Date().toISOString().split("T")[0];
  const platLabels = {telegram:"✈️ Telegram",vk:"🔵 ВК",facebook:"📘 Facebook",threads:"◎ Threads",instagram:"📸 Instagram",zen:"🟡 Дзен",linkedin:"💼 LinkedIn",yt_shorts:"▶️ Shorts",yt_long:"🎬 YouTube"};
  if (!modal) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:4000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"#fff",borderRadius:16,padding:24,maxWidth:380,width:"100%"}}>
        <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:18,color:"#362d52",fontWeight:600,marginBottom:4}}>📆 Добавить в календарь</div>
        <div style={{fontSize:12,color:"#9a88b8",marginBottom:16,lineHeight:1.5}}>{modal.topic}</div>

        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,color:"#5c4e7a",fontWeight:600,textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>Дата публикации</div>
          <input type="date" value={date} min={today} onChange={e=>setDate(e.target.value)}
            style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid #d8d0e0",fontSize:14,color:"#362d52",outline:"none",boxSizing:"border-box"}} />
        </div>

        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,color:"#5c4e7a",fontWeight:600,textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>Платформа</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {Object.entries(platLabels).map(([id,label])=>(
              <button key={id} onClick={()=>setPlatform(id)}
                style={{padding:"5px 10px",borderRadius:7,border:`1px solid ${platform===id?"#362d52":"#d8d0e0"}`,background:platform===id?"#362d52":"#f0eef8",color:platform===id?"#f4f1ec":"#362d52",fontSize:11,cursor:"pointer"}}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} style={{flex:1,padding:11,borderRadius:9,border:"1px solid #d8d0e0",background:"transparent",color:"#5c4e7a",fontSize:13,cursor:"pointer"}}>Отмена</button>
          <button onClick={onSave} disabled={!date}
            style={{flex:2,padding:11,borderRadius:9,border:"none",background:date?"#362d52":"#d8d0e0",color:"#f4f1ec",fontSize:13,fontWeight:700,cursor:date?"pointer":"not-allowed"}}>
            ✓ Запланировать
          </button>
        </div>
      </div>
    </div>
  );
}

function CalendarView({ calendarPosts, removeFromCalendar, onViewGeneration, onMovePost }) {
  const now = new Date();
  const [monthOffset, setMonthOffset] = React.useState(0);
  const [dragId, setDragId] = React.useState(null);
  const [dragOverDate, setDragOverDate] = React.useState(null);

  const year = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1).getFullYear();
  const month = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1).getMonth();

  const platIcons = {telegram:"✈️",vk:"🔵",facebook:"📘",threads:"◎",instagram:"📸",zen:"🟡",linkedin:"💼",yt_shorts:"▶️",yt_long:"🎬"};
  const monthNames = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
  const dayNames = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;

  function getPostsForDate(day) {
    const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    return calendarPosts.filter(p => p.date === dateStr);
  }

  function handleDrop(day) {
    if (!dragId) return;
    const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    onMovePost(dragId, dateStr);
    setDragId(null);
    setDragOverDate(null);
  }

  const CELL_W = "calc(14.28% - 2px)";

  const [selectedPost, setSelectedPost] = React.useState(null);

  return (
    <div>
      {/* Topic detail popup */}
      {selectedPost && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:5000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setSelectedPost(null)}>
          <div style={{background:"#fff",borderRadius:14,padding:20,maxWidth:400,width:"100%"}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div style={{fontSize:10,background:"#362d52",color:"#f4f1ec",padding:"2px 10px",borderRadius:6,fontWeight:700}}>
                {platIcons[selectedPost.platform]||""} {selectedPost.platform}
              </div>
              <div style={{fontSize:11,color:"#9a88b8"}}>{selectedPost.date}</div>
              <button onClick={()=>setSelectedPost(null)} style={{background:"transparent",border:"none",fontSize:20,cursor:"pointer",color:"#9a88b8",lineHeight:1}}>×</button>
            </div>
            <div style={{fontSize:15,fontWeight:700,color:"#362d52",lineHeight:1.4,marginBottom:10}}>{selectedPost.topic}</div>
            {selectedPost.hook && <div style={{fontSize:12,color:"#5c4e7a",fontStyle:"italic",lineHeight:1.6,marginBottom:8,padding:"8px 10px",background:"#f4f1ec",borderRadius:8}}>💡 {selectedPost.hook}</div>}
            {selectedPost.quadrant && <div style={{fontSize:11,background:"#e1df2c",color:"#362d52",padding:"3px 10px",borderRadius:6,display:"inline-block",fontWeight:700,marginBottom:8}}>{selectedPost.quadrant}</div>}
            {selectedPost.reason && <div style={{fontSize:11,color:"#7a6a9a",lineHeight:1.5,marginBottom:10}}>🔥 {selectedPost.reason}</div>}
            {selectedPost.expert && <div style={{fontSize:10,color:"#9a88b8"}}>👤 {selectedPost.expert}</div>}
            <button onClick={()=>{removeFromCalendar(selectedPost.id);setSelectedPost(null);}}
              style={{marginTop:12,width:"100%",padding:"8px",borderRadius:8,border:"1px solid #e05c5c",background:"transparent",color:"#e05c5c",fontSize:12,cursor:"pointer"}}>
              Удалить из календаря
            </button>
          </div>
        </div>
      )}

      {/* Month navigation */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <button onClick={()=>setMonthOffset(o=>o-1)} disabled={monthOffset<=0}
          style={{padding:"6px 14px",borderRadius:8,border:"1px solid #d8d0e0",background:"transparent",color:monthOffset<=0?"#d8d0e0":"#362d52",fontSize:13,cursor:monthOffset<=0?"not-allowed":"pointer"}}>
          ← Назад
        </button>
        <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:20,fontWeight:600,color:"#362d52"}}>
          {monthNames[month]} {year}
        </div>
        <button onClick={()=>setMonthOffset(o=>o+1)} disabled={monthOffset>=2}
          style={{padding:"6px 14px",borderRadius:8,border:"1px solid #d8d0e0",background:"transparent",color:monthOffset>=2?"#d8d0e0":"#362d52",fontSize:13,cursor:monthOffset>=2?"not-allowed":"pointer"}}>
          Вперёд →
        </button>
      </div>

      {/* Day names */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:2}}>
        {dayNames.map(d=>(
          <div key={d} style={{textAlign:"center",fontSize:10,color:"#9a88b8",fontWeight:600,padding:"4px 0"}}>{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {Array.from({length: startOffset}).map((_,i)=>(
          <div key={"e"+i} style={{height:80}} />
        ))}
        {Array.from({length: daysInMonth}).map((_,i)=>{
          const day = i + 1;
          const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const posts = getPostsForDate(day);
          const isToday = dateStr === todayStr;
          const isPast = dateStr < todayStr;
          const isDragOver = dragOverDate === dateStr;

          return (
            <div key={day}
              onDragOver={e=>{e.preventDefault();setDragOverDate(dateStr);}}
              onDragLeave={()=>setDragOverDate(null)}
              onDrop={()=>handleDrop(day)}
              style={{
                height:80, padding:"4px 4px", borderRadius:7,
                border:`1px solid ${isDragOver?"#362d52":isToday?"#362d52":"#e8e0f0"}`,
                background:isDragOver?"rgba(54,45,82,.08)":isToday?"#f4f1ec":isPast?"#fafafa":"#fff",
                overflow:"hidden", position:"relative",
              }}>
              <div style={{fontSize:10,fontWeight:isToday?700:400,color:isToday?"#362d52":isPast?"#c4b8d8":"#9a88b8",marginBottom:2}}>{day}</div>
              <div style={{display:"flex",flexDirection:"column",gap:1,overflow:"hidden"}}>
                {posts.map(post=>(
                  <div key={post.id}
                    draggable
                    onDragStart={()=>setDragId(post.id)}
                    onDragEnd={()=>{setDragId(null);setDragOverDate(null);}}
                    style={{position:"relative",cursor:"grab"}}>
                    <div
                      onClick={()=>{
                        if (post.generationId) onViewGeneration(post.generationId);
                        else setSelectedPost(post);
                      }}
                      title={post.topic}
                      style={{
                        fontSize:8,lineHeight:1.3,color:"#fff",
                        background:dragId===post.id?"#9a88b8":"#362d52",
                        borderRadius:3,padding:"2px 14px 2px 3px",
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
                        cursor:"pointer",
                        opacity:dragId===post.id?.5:1,
                      }}>
                      {platIcons[post.platform]||""} {post.topic}
                    </div>
                    <button onClick={e=>{e.stopPropagation();removeFromCalendar(post.id);}}
                      style={{position:"absolute",top:0,right:0,width:11,height:11,borderRadius:"50%",border:"none",background:"#e05c5c",color:"#fff",fontSize:7,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0,lineHeight:1,opacity:.8}}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Month counter */}
      <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:14}}>
        {[0,1,2].map(i=>(
          <button key={i} onClick={()=>setMonthOffset(i)}
            style={{width:8,height:8,borderRadius:"50%",border:"none",background:monthOffset===i?"#362d52":"#d8d0e0",cursor:"pointer",padding:0}} />
        ))}
      </div>
    </div>
  );
}

export { CalendarDateModal, CalendarView };

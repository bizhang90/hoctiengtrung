import React, { useEffect, useMemo, useState } from 'react'
import { lesson01 as fallbackLesson } from './data/lesson01'
import { API_BASE, fetchLesson01, getVideoUrl } from './lib/r2Api'

const roadmap = [
  ['01','你好','Xin chào'],['02','汉语不太难','Tiếng Hán không khó lắm'],['03','明天见','Ngày mai gặp lại'],['04','你去哪儿','Bạn đi đâu đấy'],['05','这是王老师','Đây là thầy Vương'],['06','我学习汉语','Tôi học tiếng Hán'],['07','你吃什么','Bạn ăn gì'],['08','苹果一斤多少钱','Táo một cân bao nhiêu tiền'],['09','我换人民币','Tôi đổi tiền Nhân dân tệ'],['10','他住哪儿','Ông ấy sống ở đâu'],['11','我们都是留学生','Chúng tôi đều là lưu học sinh'],['12','你在哪儿学习汉语','Bạn học tiếng Hán ở đâu'],['13','这是不是中药','Đây có phải thuốc Đông y không'],['14','你的车是新的还是旧的','Xe của bạn mới hay cũ'],['15','你们公司有多少职员','Công ty ông có bao nhiêu nhân viên'],
]

export default function AppRemote(){
  const [page,setPage]=useState('home')
  const [tab,setTab]=useState('overview')
  const [lesson,setLesson]=useState(fallbackLesson)
  const [source,setSource]=useState('fallback')
  const [apiError,setApiError]=useState('')
  const [progress,setProgress]=useState(()=>Number(localStorage.getItem('lesson01-progress')||18))
  const [quiz,setQuiz]=useState({i:0,score:0,pick:null,done:false})

  useEffect(()=>{
    let alive=true
    fetchLesson01(fallbackLesson)
      .then(({lesson,source})=>{if(alive){setLesson(lesson);setSource(source);setApiError('')}})
      .catch((e)=>{if(alive){setSource('fallback');setApiError(e.message)}})
    return ()=>{alive=false}
  },[])

  const videoUrl=useMemo(()=>getVideoUrl(lesson.videoKey),[lesson.videoKey])
  const bump=(value)=>{const next=Math.max(progress,value);setProgress(next);localStorage.setItem('lesson01-progress',String(next))}
  const openLesson=(nextTab='overview')=>{setTab(nextTab);setPage('lesson');bump(22);window.scrollTo({top:0,behavior:'smooth'})}

  return <div className="app">
    <header>
      <button className="brand" onClick={()=>setPage('home')}><b>中</b><span>Học Tiếng Trung<small>Hán ngữ theo bài</small></span></button>
      <div className="headright"><span>{source==='r2'?'☁ R2':'◌ Demo'}</span><i>S</i></div>
    </header>

    <main>
      {page==='home'&&<Home lesson={lesson} progress={progress} openLesson={openLesson} setPage={setPage} source={source} apiError={apiError}/>} 
      {page==='roadmap'&&<Roadmap progress={progress} openLesson={openLesson}/>} 
      {page==='lesson'&&<Lesson lesson={lesson} progress={progress} tab={tab} setTab={setTab} setPage={setPage} bump={bump} videoUrl={videoUrl} quiz={quiz} setQuiz={setQuiz}/>} 
    </main>

    {page!=='lesson'&&<nav>
      <button className={page==='home'?'on':''} onClick={()=>setPage('home')}>⌂<small>Học</small></button>
      <button className={page==='roadmap'?'on':''} onClick={()=>setPage('roadmap')}>◫<small>Lộ trình</small></button>
      <button onClick={()=>openLesson('vocab')}>字<small>Ôn tập</small></button>
      <button>☺<small>Tôi</small></button>
    </nav>}
  </div>
}

function Home({lesson,progress,openLesson,setPage,source,apiError}){
  return <div className="stack">
    <section className="welcome"><div><em>你好 👋</em><h1>Học một chút mỗi ngày.</h1><p>Tiếp tục Bài 1 và xây nền phát âm thật chắc.</p></div><aside><b>1.250</b><small>XP</small></aside></section>
    <section className="hero"><div className="heroCopy"><label>HÁN NGỮ 1 · BÀI 1</label><h2>{lesson.titleZh}</h2><em>{lesson.pinyin}</em><h3>{lesson.titleVi}</h3><p>Ngữ âm · Từ mới · Hội thoại · Ngữ pháp · Quiz</p><Bar value={progress}/><div className="meta"><span>{progress}% hoàn thành</span><span>{lesson.duration}</span></div><button className="primary" onClick={()=>openLesson()}>Tiếp tục học →</button></div><div className="art"><b>你</b><b>好</b></div></section>
    <section className="stats"><Stat icon="字" value={lesson.vocabulary.length} label="Từ trong bài"/><Stat icon="声" value="4" label="Thanh điệu"/><Stat icon="✓" value={lesson.quiz.length} label="Câu quiz"/></section>
    <section className="card"><div className="cardHead"><div><em>NGUỒN DỮ LIỆU</em><h2>{source==='r2'?'Đang đọc trực tiếp từ Cloudflare R2':'Đang dùng dữ liệu dự phòng trong app'}</h2></div></div><p style={{marginBottom:0,color:'#777a80'}}>{source==='r2'?`API: ${API_BASE}`:(apiError?`Worker chưa sẵn sàng: ${apiError}`:'Chưa cấu hình VITE_API_BASE_URL.')}</p></section>
    <section className="card"><div className="cardHead"><div><em>LỘ TRÌNH CỦA BẠN</em><h2>Hán ngữ Quyển 1</h2></div><button onClick={()=>setPage('roadmap')}>Xem tất cả</button></div><LessonRow item={roadmap[0]} current progress={progress} onClick={()=>openLesson()}/><LessonRow item={roadmap[1]}/><LessonRow item={roadmap[2]}/></section>
  </div>
}

function Roadmap({progress,openLesson}){
  return <div className="stack"><section className="title"><em>LỘ TRÌNH</em><h1>Hán ngữ Quyển 1</h1><p>15 bài · nền tảng phát âm, từ vựng và giao tiếp cơ bản.</p></section><section className="road"><b>1 / 15</b><span>Bài đang học</span><Bar value={Math.max(7,progress/15)}/><small>Hoàn thành Bài 1 để mở khóa Bài 2.</small></section><section className="lessonList">{roadmap.map((x,i)=><LessonRow key={x[0]} item={x} current={i===0} progress={i===0?progress:null} onClick={i===0?()=>openLesson():null}/>)}</section></div>
}

function Lesson({lesson,progress,tab,setTab,setPage,bump,videoUrl,quiz,setQuiz}){
  const tabs=[['overview','Tổng quan'],['video','Video'],['vocab','Từ mới'],['grammar','Ngữ pháp'],['practice','Luyện nói'],['quiz','Quiz']]
  return <div className="lesson">
    <div className="lessonTop"><button onClick={()=>setPage('roadmap')}>←</button><div><small>HÁN NGỮ 1 · BÀI 1</small><b>{lesson.titleZh} · {lesson.titleVi}</b></div><span>{progress}%</span></div>
    <div className="topbar"><i style={{width:`${progress}%`}}/></div>
    <section className="lessonHero"><strong>{lesson.titleZh}</strong><div><em>{lesson.pinyin}</em><h1>{lesson.titleVi}</h1><p>{lesson.duration} · 5 phần học</p></div></section>
    <div className="tabs">{tabs.map(x=><button key={x[0]} className={tab===x[0]?'on':''} onClick={()=>setTab(x[0])}>{x[1]}</button>)}</div>
    <div className="lessonBody">
      {tab==='overview'&&<Overview lesson={lesson} setTab={setTab} bump={bump}/>} 
      {tab==='video'&&<Video lesson={lesson} url={videoUrl} bump={bump}/>} 
      {tab==='vocab'&&<Vocab lesson={lesson} bump={bump}/>} 
      {tab==='grammar'&&<Grammar lesson={lesson} bump={bump}/>} 
      {tab==='practice'&&<Practice lesson={lesson} bump={bump}/>} 
      {tab==='quiz'&&<Quiz lesson={lesson} quiz={quiz} setQuiz={setQuiz} bump={bump}/>} 
    </div>
  </div>
}

function Overview({lesson,setTab,bump}){
  return <div className="stack"><section className="card"><em>MỤC TIÊU BÀI HỌC</em><h2>Bạn sẽ học được gì?</h2><div className="objectives">{lesson.objectives.map((x,i)=><div key={x}><b>{i+1}</b><p>{x}</p></div>)}</div></section><section className="card"><em>NỘI DUNG</em><h2>5 chặng trong Bài 1</h2><div className="sectionList">{lesson.sections.map((s,i)=><button key={s.id} onClick={()=>{bump(30+i*5);setTab(s.id==='phonetics'?'video':s.id==='dialogue'?'practice':s.id)}}><b>{s.icon}</b><span><strong>{s.title}</strong><small>{s.description}</small><i>{s.time}</i></span>›</button>)}</div></section><section className="quote"><b>{lesson.titleZh}</b><div><em>{lesson.pinyin}</em><h2>{lesson.titleVi}!</h2><p>Câu đầu tiên để bắt đầu mọi cuộc trò chuyện.</p></div></section></div>
}

function Video({lesson,url,bump}){
  return <div className="stack"><section className="video">{url?<video controls playsInline preload="metadata" src={url} onPlay={()=>bump(38)}/>:<div><i>▶</i><h3>Chưa có Worker URL</h3><p>Deploy Worker rồi đặt VITE_API_BASE_URL. Bucket R2 vẫn giữ private.</p><code>{lesson.videoKey}</code></div>}</section><section className="card"><em>TIMELINE</em><h2>Đi nhanh tới phần cần học</h2>{lesson.sections.map(s=><div className="timeline" key={s.id}><b>{s.time.split('–')[0]}</b><span><strong>{s.title}</strong><small>{s.description}</small></span></div>)}</section></div>
}

function Vocab({lesson,bump}){const [active,setActive]=useState(null);return <div className="stack"><section className="title small"><em>TỪ MỚI · {lesson.vocabulary.length} MỤC</em><h2>Nhìn chữ → đọc âm → hiểu nghĩa</h2><p>Chạm thẻ để đánh dấu từ đang ôn.</p></section><section className="vocab">{lesson.vocabulary.map(([h,p,v],i)=><button key={`${h}-${i}`} className={active===i?'on':''} onClick={()=>{setActive(i);bump(50)}}><b>{h}</b><em>{p}</em><strong>{v}</strong><small>{active===i?'Đang ôn':'Chạm để ôn'}</small></button>)}</section></div>}

function Grammar({lesson,bump}){return <div className="stack"><section className="title small"><em>NGỮ PHÁP</em><h2>Hai cấu trúc quan trọng</h2><p>Giữ đúng nội dung Bài 1.</p></section>{lesson.grammar.map((g,i)=><section className="grammar" key={g.title} onMouseEnter={()=>bump(64)}><i>0{i+1}</i><div><h2>{g.title}</h2><p>{g.description}</p><div className="examples">{g.examples.map((x,n)=><div key={`${x[1]}-${n}`}><small>{x[0]}</small><b>{x[1]}</b><em>{x[2]}</em><p>{x[3]}</p></div>)}</div></div></section>)}<section className="tip">💡 <span><b>Ghi nhớ biến điệu</b><p>Trong bài, 不 trước một âm thanh 4 được đọc thành bú: 不大 → bú dà.</p></span></section></div>}

function Practice({lesson,bump}){const [i,setI]=useState(0);const x=lesson.speaking[i];return <div className="stack"><section className="title small"><em>LUYỆN NÓI</em><h2>Đọc thành tiếng từng câu</h2><p>Chấm phát âm AI sẽ nối ở vòng sau.</p></section><section className="speak"><label>{i+1} / {lesson.speaking.length}</label><b>{x[0]}</b><em>{x[1]}</em><p>{x[2]}</p><div className="wave">{Array.from({length:24}).map((_,n)=><i key={n} style={{height:`${15+(n*17)%42}px`}}/>)}</div><button onClick={()=>bump(78)}>● Nhấn để luyện nói</button></section><div className="controls"><button disabled={!i} onClick={()=>setI(i-1)}>← Câu trước</button><button onClick={()=>setI(Math.min(lesson.speaking.length-1,i+1))}>Câu tiếp →</button></div></div>}

function Quiz({lesson,quiz,setQuiz,bump}){
  if(quiz.done){const pct=Math.round(quiz.score/lesson.quiz.length*100);return <section className="result"><b>{pct}<small>điểm</small></b><em>HOÀN THÀNH BÀI 1</em><h2>{pct>=75?'很棒！Rất tốt!':'Cố thêm một chút nhé!'}</h2><p>Bạn trả lời đúng {quiz.score}/{lesson.quiz.length} câu.</p><button className="primary" onClick={()=>setQuiz({i:0,score:0,pick:null,done:false})}>Làm lại Quiz</button></section>}
  const q=lesson.quiz[quiz.i]
  const choose=(n)=>{if(quiz.pick!==null)return;setQuiz({...quiz,pick:n,score:quiz.score+(n===q.answer?1:0)})}
  const next=()=>{if(quiz.i===lesson.quiz.length-1){setQuiz({...quiz,done:true});bump(100)}else setQuiz({...quiz,i:quiz.i+1,pick:null})}
  return <section className="quiz"><div className="quizHead"><span>Quiz Bài 1</span><b>{quiz.i+1}/{lesson.quiz.length}</b></div><Bar value={(quiz.i+1)/lesson.quiz.length*100}/><div className="quizBox"><em>CHỌN ĐÁP ÁN ĐÚNG</em><h2>{q.q}</h2>{q.options.map((o,n)=><button key={`${o}-${n}`} onClick={()=>choose(n)} className={quiz.pick!==null?(n===q.answer?'right':n===quiz.pick?'wrong':''):''}><i>{String.fromCharCode(65+n)}</i><b>{o}</b></button>)}{quiz.pick!==null&&<p className={quiz.pick===q.answer?'good':'bad'}>{quiz.pick===q.answer?'✓ Chính xác':'✕ Đáp án đúng: '+q.options[q.answer]}</p>}<button className="primary full" disabled={quiz.pick===null} onClick={next}>{quiz.i===lesson.quiz.length-1?'Xem kết quả':'Câu tiếp theo →'}</button></div></section>
}

function LessonRow({item,current,progress,onClick}){return <button className={'lessonRow '+(current?'current':'locked')} onClick={onClick} disabled={!onClick}><i>{item[0]}</i><span><b>{item[1]}</b><strong>{item[2]}</strong>{progress!=null&&<small>{progress}% hoàn thành</small>}</span><em>{current?'→':'⌕'}</em></button>}
function Stat({icon,value,label}){return <div className="stat"><b>{icon}</b><span><strong>{value}</strong><small>{label}</small></span></div>}
function Bar({value}){return <div className="bar"><i style={{width:`${Math.min(100,value)}%`}}/></div>}

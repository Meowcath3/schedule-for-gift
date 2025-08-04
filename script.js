let currentDate = null;
let currentDay  = null;
const menu      = document.getElementById('action-menu');
const picker    = document.getElementById('date-picker');
const scheduleH = document.getElementById('schedule-header');
const hourCon   = document.getElementById('hour-container');

function showScreen(id,bg){
  document.querySelectorAll('.screen')
    .forEach(s=>s.classList.toggle('active',s.id===id));
  document.body.className=bg;
  hideMenu();
}

function hideMenu(){
  menu.style.display='none';
}

function showMenu(x,y,box,hour){
  menu.innerHTML='';
  [
    { text:'Escribir tarea', fn:()=>{
        const t=prompt('Escribe tu tarea:','');
        if(t!==null){ box.textContent=t||hour; box.classList.remove('completed'); }
      }},
    { text:'Reiniciar tarea', fn:()=>{
        const t=prompt('Nueva tarea:','');
        box.textContent=t||hour; box.classList.remove('completed');
      }},
    { text:'Marcar como lista', fn:()=>box.classList.add('completed') }
  ].forEach(a=>{
    const d=document.createElement('div');
    d.className='action-item';
    d.textContent=a.text;
    d.onclick=()=>{ a.fn(); saveTasks(); hideMenu(); };
    menu.appendChild(d);
  });
  menu.style.left=x+'px';
  menu.style.top=y+'px';
  menu.style.display='block';
}

document.addEventListener('click',e=>{
  if(!menu.contains(e.target)) hideMenu();
});

document.addEventListener('DOMContentLoaded',()=>{
  const days=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  const startBtn     =document.getElementById('start-btn');
  const dayList      =document.getElementById('day-list');
  const backBtn      =document.getElementById('back-btn');
  const clearBtn     =document.getElementById('clear-btn');
  const completeBtn  =document.getElementById('complete-btn');
  const finalRestart =document.getElementById('final-restart-btn');

  // init date picker → today
  const today=new Date().toISOString().slice(0,10);
  picker.value=today; currentDate=today;

  picker.onchange=()=>{
    saveTasks();
    currentDate=picker.value;
    const [y,m,d]=currentDate.split('-').map(Number);
    const dt=new Date(y,m-1,d), idx=dt.getDay(), map=[6,0,1,2,3,4,5];
    currentDay=days[map[idx]].toUpperCase();

    scheduleH.textContent=currentDay;
    scheduleH.classList.add('shine');
    setTimeout(()=>scheduleH.classList.remove('shine'),1000);

    buildSchedule(); loadTasks();
    showScreen('schedule-screen','bg-schedule');
  };

  startBtn.onclick=()=>showScreen('day-screen','bg-day');

  days.forEach(d=>{
    const btn=document.createElement('button');
    btn.className='pixel-button';
    btn.textContent=d.toUpperCase();
    btn.onclick=()=>{
      saveTasks();
      currentDay=d.toUpperCase();
      scheduleH.textContent=currentDay;
      scheduleH.classList.add('shine');
      setTimeout(()=>scheduleH.classList.remove('shine'),1000);

      buildSchedule(); loadTasks();
      showScreen('schedule-screen','bg-schedule');
    };
    dayList.appendChild(btn);
  });

  backBtn.onclick=()=>{ saveTasks(); showScreen('day-screen','bg-day'); };
  clearBtn.onclick=()=>{
    Array.from(hourCon.children).forEach(b=>{
      const hr=b.dataset.hour;
      b.textContent=hr; b.classList.remove('completed');
    });
    localStorage.removeItem(`schedule_${currentDate}_${currentDay}`);
  };
  completeBtn.onclick=()=>showScreen('final-screen','bg-final');
  finalRestart.onclick=()=>showScreen('start-screen','bg-start');

  function buildSchedule(){
    hourCon.innerHTML='';
    // hours 07→23, then 00→06
    const hours=[...Array(17).keys()].map(i=>i+7).concat([...Array(7).keys()]);
    hours.forEach(h=>{
      const hr=h.toString().padStart(2,'0')+':00';
      const b=document.createElement('button');
      b.className='pixel-button';
      b.textContent=hr;
      b.dataset.hour=hr;
      b.onclick=e=>{
        e.stopPropagation();
        const r=b.getBoundingClientRect();
        showMenu(r.right+scrollX, r.top+scrollY, b, hr);
      };
      hourCon.appendChild(b);
    });
  }

  function saveTasks(){
    if(!currentDate||!currentDay)return;
    const arr=Array.from(hourCon.children).map(b=>({
      hour:b.dataset.hour, text:b.textContent,
      completed:b.classList.contains('completed')
    }));
    localStorage.setItem(
      `schedule_${currentDate}_${currentDay}`,
      JSON.stringify(arr)
    );
  }

  function loadTasks(){
    if(!currentDate||!currentDay)return;
    const raw=localStorage.getItem(
      `schedule_${currentDate}_${currentDay}`
    );
    if(!raw)return;
    JSON.parse(raw).forEach(item=>{
      const b=hourCon.querySelector(`[data-hour="${item.hour}"]`);
      if(b){
        b.textContent=item.text;
        b.classList.toggle('completed',item.completed);
      }
    });
  }

  showScreen('start-screen','bg-start');
});
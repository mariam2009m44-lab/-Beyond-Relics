(function(){
  /* ---- DATA: replace with fetch('data/comic-chapters.json') later ----
     Panel keys: t = tone (moon|mars|deep|earth), c = caption text,
                 p = caption position (tl|tr|bl|br), i = image path (optional)
     To use real art:  {t:'moon', c:'…', p:'tl', i:'assets/images/comics/lunar-1.jpg'}
     Layouts: l5 = 5 panels, l3 = 3 panels, l2 = 2 panels */
  var COMICS=[
    {id:'lunar-module',title:'The Lunar Module',meta:'Apollo 11 • 1969',
     quote:'A small step… for a man, a giant leap for humanity.',
     closing:'The Lunar Module’s journey ended on the Moon… but its story lives on.',
     facts:[['Mission','Apollo 11'],['Landing','July 20, 1969'],['Site','Sea of Tranquility'],['Left behind','Descent stage']],
     pages:[
      {layout:'l5',panels:[{t:'moon',c:'July 20, 1969… A new chapter in human history begins.',p:'tl'},{t:'deep',c:'One small step…',p:'tr'},{t:'earth',c:'…for a man…',p:'bl'},{t:'moon',c:'…a giant leap for humanity.',p:'br'},{t:'moon',c:'And then… silence.',p:'tl'}]},
      {layout:'l3',panels:[{t:'moon',c:'Eagle rests on the plain.',p:'tl'},{t:'deep',c:'The crew returns to orbit…',p:'bl'},{t:'moon',c:'The descent stage stays behind.',p:'br'}]},
      {layout:'l2',panels:[{t:'moon',c:'Silent. Waiting.',p:'bl'},{t:'earth',c:'Earth hangs overhead.',p:'tr'}]}
     ]},
    {id:'curiosity',title:'Curiosity Rover',meta:'Mars • 2012',
     quote:'A robot geologist on a distant world.',
     closing:'Built for two years… still asking questions.',
     facts:[['Landing','August 2012'],['Site','Gale Crater'],['Goal','Past habitability of Mars']],
     pages:[
      {layout:'l3',panels:[{t:'mars',c:'August 2012. Minutes of terror.',p:'tl'},{t:'mars',c:'Touchdown in Gale Crater.',p:'bl'},{t:'deep',c:'Signals travel home.',p:'tr'}]},
      {layout:'l2',panels:[{t:'mars',c:'A rover that outlived its plan.',p:'tl'},{t:'mars',c:'Every rock tells a story.',p:'br'}]}
     ]},
    {id:'voyager',title:'Voyager Probes',meta:'Deep Space • 1977',
     quote:'Two messages in bottles, cast into the cosmic ocean.',
     closing:'Still traveling… still carrying a message from Earth.',
     facts:[['Launch','1977'],['Interstellar space','Voyager 1 (2012) · Voyager 2 (2018)'],['Carries','The Golden Record']],
     pages:[
      {layout:'l3',panels:[{t:'deep',c:'September 1977. Two probes depart.',p:'tl'},{t:'deep',c:'The giant planets pass by…',p:'bl'},{t:'earth',c:'A pale blue dot.',p:'tr'}]},
      {layout:'l2',panels:[{t:'deep',c:'Past the edge of the Sun’s influence…',p:'tl'},{t:'deep',c:'A message still traveling.',p:'br'}]}
     ]}
    ,
    {id:'space-telescope',title:'Spitzer Space Telescope',meta:'Infrared observatory • 2003–2020',
     quote:'The universe has more to show than our eyes can see.',
     closing:'The spacecraft went quiet in 2020. Its infrared discoveries remain alive in the archive.',
     facts:[['Launch','August 25, 2003'],['Mission ended','January 30, 2020'],['Observatory','Infrared space telescope'],['Legacy','Archived data continues to support research']],
     pages:[
      {layout:'l3',panels:[{t:'deep',c:'A new window on the invisible universe.',p:'tl'},{t:'tele',c:'Spitzer observes in infrared light.',p:'br'},{t:'deep',c:'Stars, planets, and distant galaxies revealed.',p:'tl'}]},
      {layout:'l2',panels:[{t:'tele',c:'More than sixteen years of discovery.',p:'tl'},{t:'deep',c:'The mission ends. The data keeps speaking.',p:'br'}]}
     ]},
    {id:'return-capsule',title:'The Stardust Capsule',meta:'Comet sample return • 1999–2011',
     quote:'A tiny capsule brought pieces of a comet home.',
     closing:'The capsule returned to Earth in 2006. The spacecraft continued its journey as Stardust-NExT.',
     facts:[['Launch','February 7, 1999'],['Comet encounter','Wild 2 · January 2004'],['Capsule return','January 15, 2006'],['Extended mission','Stardust-NExT · 2011']],
     pages:[
      {layout:'l3',panels:[{t:'deep',c:'A spacecraft heads toward Comet Wild 2.',p:'tl'},{t:'cap',c:'Dust is captured in delicate aerogel.',p:'br'},{t:'earth',c:'A sample capsule returns to Earth.',p:'tl'}]},
      {layout:'l2',panels:[{t:'cap',c:'A small capsule. An extraordinary cargo.',p:'tl'},{t:'deep',c:'The spacecraft continues as Stardust-NExT.',p:'br'}]}
     ]}

  ];

  var $=function(id){return document.getElementById(id)};
  var want=new URLSearchParams(location.search).get('chapter'),ci=0,pi=0;
  COMICS.forEach(function(c,i){if(c.id===want)ci=i});
  var bg=function(p){return p&&p.i?'background-image:url(\''+p.i+'\');':''};

  function panel(p,k){
    var cap=p.c?'<span class="cap '+(p.p||'tl').split('').join(' ')+'">'+p.c+'</span>':'';
    return '<div class="cp" data-tone="'+p.t+'" data-n="'+(k+1)+'" style="grid-area:'+'abcde'.charAt(k)+';'+bg(p)+'">'+cap+'</div>';
  }
  function thumb(pg,i,big){
    var p=pg.panels[0];
    return '<button class="th" type="button" data-i="'+i+'" data-tone="'+p.t+'" style="'+bg(p)+'" aria-label="Page '+(i+1)+'" aria-current="'+(i===pi)+'"></button>';
  }
  function render(){
    var c=COMICS[ci],pg=c.pages[pi],last=c.pages.length-1;
    document.title=c.title+' — Beyond Relics';
    $('c-title').textContent=c.title;
    $('c-meta').textContent=c.meta;
    $('c-quote').textContent=c.quote;
    $('c-chap').textContent='Chapter 0'+(ci+1)+' / 0'+COMICS.length;
    var t=$('c-thumb');t.setAttribute('data-tone',c.pages[0].panels[0].t);t.setAttribute('style',bg(c.pages[0].panels[0]));
    $('c-page').className='comic '+pg.layout;
    $('c-page').innerHTML=pg.panels.map(panel).join('');
    $('c-closing').textContent=c.closing;
    $('c-thumbs').innerHTML=c.pages.map(thumb).join('');
    $('v-gallery').innerHTML=c.pages.map(thumb).join('');
    $('v-info').innerHTML='<div class="panel"><h2>Mission info</h2><dl class="facts">'+c.facts.map(function(x){return '<dt>'+x[0]+'</dt><dd>'+x[1]+'</dd>'}).join('')+'</dl><a class="btn ghost" href="artifact-details.html?id='+c.id+'">Artifact details ↗</a></div>';
    $('c-count').textContent=(pi+1)+' / '+c.pages.length;
    $('prev').disabled=pi===0;$('next').disabled=pi===last;
  }
  function go(i){pi=i;render();tab('story')}
  function tab(n){
    ['story','gallery','info'].forEach(function(k){$('v-'+k).hidden=k!==n});
    document.querySelectorAll('.tabs button').forEach(function(b){b.classList.toggle('on',b.dataset.tab===n)});
  }
  function chapter(i){
    ci=i;pi=0;render();tab('story');
    try{history.replaceState(null,'','?chapter='+COMICS[ci].id)}catch(e){}
  }
  $('prev').onclick=function(){if(pi>0)go(pi-1)};
  $('next').onclick=function(){if(pi<COMICS[ci].pages.length-1)go(pi+1)};
  $('nextch').onclick=function(){chapter((ci+1)%COMICS.length)};
  document.addEventListener('click',function(e){
    var th=e.target.closest('.th');if(th)go(+th.dataset.i);
    var tb=e.target.closest('.tabs button');if(tb)tab(tb.dataset.tab);
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='ArrowLeft')$('prev').click();
    if(e.key==='ArrowRight')$('next').click();
  });
  render();
})();

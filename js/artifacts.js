(function(){
  // ---- DATA: replace with fetch('data/artifacts.json') later ----
  var DATA=[
    {id:'lunar-module',title:'The Lunar Module',region:'Moon',years:'1969–1972',tone:'moon',
     short:'The spacecraft that carried astronauts from lunar orbit to the surface and back during the Apollo missions.',
     body:'Built to fly only in the vacuum of space, the Lunar Module took astronauts down to the Moon and, with its ascent stage, back up to orbit. Its descent stage stayed behind as a quiet witness to humanity’s first steps on another world.',
     facts:[['Program','Apollo'],['First landing','Apollo 11 · 1969'],['Left behind','Descent stages on the lunar surface']]},
    {id:'curiosity',title:'Curiosity Rover',region:'Mars',years:'2012–Present',tone:'mars',
     short:'A mobile science laboratory exploring the geology and past habitability of Gale Crater.',
     body:'Curiosity drives across Mars studying rocks and soil to learn whether the planet once had conditions suitable for microbial life. It has far outlasted its original planned mission.',
     facts:[['Landing','August 2012'],['Location','Gale Crater, Mars'],['Goal','Past habitability of Mars']]},
    {id:'voyager',title:'Voyager Probes',region:'Deep Space',years:'1977–Present',tone:'deep',
     short:'Twin spacecraft that explored the outer planets and continued outward into interstellar space.',
     body:'Launched in 1977, the two Voyager probes revealed the giant planets up close and then kept going, carrying a Golden Record with sounds and images of Earth.',
     facts:[['Launch','1977'],['Interstellar space','Voyager 1 (2012) · Voyager 2 (2018)'],['Carries','The Golden Record']]},
    {id:'space-telescope',title:'Spitzer Space Telescope',region:'Deep Space',years:'2003–2020',tone:'tele',
     short:'An infrared observatory that studied the universe in light our eyes cannot see.',
     body:'Spitzer peered through cosmic dust to study young stars, distant galaxies, and planets around other suns. After its mission ended it was left drifting in space.',
     facts:[['Launch','2003'],['Retired','January 2020'],['Orbit','Trailing Earth around the Sun']]},
    {id:'return-capsule',title:'The Stardust Capsule',region:'Deep Space',years:'1999–2011',tone:'cap',
     short:'A sample-return capsule that brought comet dust safely back to Earth.',
     body:'Stardust flew past a comet and collected tiny particles in a special collector. Its capsule parachuted to Earth, while the spacecraft itself stayed behind in space.',
     facts:[['Launch','1999'],['Capsule landing','January 2006 · Utah, USA'],['Target','Comet Wild 2']]}
  ];
  var $=function(id){return document.getElementById(id)};

  // ---- archive page ----
  var grid=$('grid');
  if(grid){
    var f='All',q='';
    var regions=['All'].concat(DATA.map(function(a){return a.region}).filter(function(r,i,a){return a.indexOf(r)===i}));
    $('chips').innerHTML=regions.map(function(r){return '<button class="chip" type="button" aria-pressed="'+(r===f)+'">'+r+'</button>'}).join('');
    var draw=function(){
      var list=DATA.filter(function(a){
        return (f==='All'||a.region===f)&&(a.title+' '+a.short+' '+a.region).toLowerCase().indexOf(q)>-1;
      });
      grid.innerHTML=list.map(function(a){
        return '<a class="acard" href="artifact-details.html?id='+a.id+'"><div class="aart" data-tone="'+a.tone+'"><span>'+a.region+' · '+a.years+'</span></div><div class="abody"><h3>'+a.title+'</h3><p>'+a.short+'</p><span class="more">Discover artifact ↗</span></div></a>';
      }).join('');
      $('empty').hidden=list.length>0;
    };
    $('chips').addEventListener('click',function(e){
      var b=e.target.closest('.chip');if(!b)return;
      f=b.textContent;
      this.querySelectorAll('.chip').forEach(function(c){c.setAttribute('aria-pressed',String(c===b))});
      draw();
    });
    $('q').addEventListener('input',function(){q=this.value.trim().toLowerCase();draw()});
    draw();
  }

  // ---- details page ----
  var d=$('detail');
  if(d){
    var id=new URLSearchParams(location.search).get('id');
    var i=DATA.findIndex(function(a){return a.id===id});
    if(i<0){
      d.innerHTML='<div class="panel"><h2>Artifact not found</h2><p>We couldn’t find that artifact in the archive.</p><a class="btn" href="artifacts.html">Back to archive</a></div>';
      d.style.display='block';
    }else{
      var a=DATA[i],pv=DATA[(i+DATA.length-1)%DATA.length],nx=DATA[(i+1)%DATA.length];
      document.title=a.title+' — Beyond Relics';
      d.innerHTML='<div class="dart" data-tone="'+a.tone+'"><span>'+a.region+' · '+a.years+'</span></div>'+
        '<div><p class="eyebrow">'+a.region+' · '+a.years+'</p><h1 class="page-title">'+a.title.replace(/(\S+)$/,'<em>$1</em>')+'</h1>'+
        '<p class="body">'+a.body+'</p><dl class="facts">'+a.facts.map(function(x){return '<dt>'+x[0]+'</dt><dd>'+x[1]+'</dd>'}).join('')+'</dl>'+
        '<div class="actions"><a class="btn" href="comic.html?chapter='+a.id+'">Read the story →</a><a class="btn ghost" href="timeline.html">View timeline</a></div></div>';
      $('pn').innerHTML='<a href="artifact-details.html?id='+pv.id+'">← '+pv.title+'</a><a href="artifact-details.html?id='+nx.id+'">'+nx.title+' →</a>';
    }
  }
})();

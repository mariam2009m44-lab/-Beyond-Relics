(function(){
  // ---- DATA: replace with fetch('data/timeline.json') later ----
  var EVENTS=[
    {year:'1969',title:'Apollo 11 — First crewed Moon landing',place:'The Moon',text:'The Apollo 11 Lunar Module carried Neil Armstrong and Buzz Aldrin to the lunar surface. Its descent stage remains there.',id:'lunar-module'},
    {year:'1971',title:'Apollo 15 — Lunar rover exploration',place:'The Moon',text:'The Lunar Roving Vehicle extended astronauts’ range across the lunar surface and was left behind after the mission.'},
    {year:'1977',title:'Voyager 1 and Voyager 2 launch',place:'Deep Space',text:'The twin spacecraft began journeys that transformed planetary science and later took them into interstellar space.',id:'voyager'},
    {year:'2006',title:'Stardust capsule returns',place:'Earth',text:'A capsule carrying comet dust parachuted into the Utah desert while the spacecraft stayed in space.',id:'return-capsule'},
    {year:'2012',title:'Curiosity lands on Mars',place:'Mars',text:'NASA’s rover began exploring Gale Crater, investigating the planet’s ancient environments.',id:'curiosity'},
    {year:'2020',title:'Spitzer Space Telescope retires',place:'Deep Space',text:'After years of infrared discoveries, the telescope was switched off and left drifting in its orbit around the Sun.',id:'space-telescope'},
    {year:'2021',title:'Perseverance lands on Mars',place:'Mars',text:'The rover began searching for signs of ancient microbial life and collecting samples for possible future return.'}
  ];
  var tl=document.getElementById('tl');
  tl.innerHTML=EVENTS.map(function(e){
    return '<li class="tl-item panel"><span class="tl-year">'+e.year+'</span><h3>'+e.title+'</h3><span class="place">'+e.place+'</span><p>'+e.text+'</p>'+
      (e.id?'<a class="more" href="artifact-details.html?id='+e.id+'">View artifact ↗</a>':'')+'</li>';
  }).join('');
  var items=tl.querySelectorAll('.tl-item');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}});
    },{threshold:.15});
    items.forEach(function(i){io.observe(i)});
  }else items.forEach(function(i){i.classList.add('in')});
})();

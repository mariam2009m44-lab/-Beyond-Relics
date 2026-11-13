(function () {
  "use strict";
  var events = [
    {year:"1969",date:"20 JUL",title:"Apollo 11 reaches the Moon",place:"Moon",text:"The Lunar Module lands in the Sea of Tranquility. Its descent stage remains on the lunar surface.",id:"lunar-module",kind:"Human exploration"},
    {year:"1971",date:"30 JUL",title:"Apollo 15 explores with a lunar rover",place:"Moon",text:"The Lunar Roving Vehicle extends the astronauts’ range and is left behind after the mission.",kind:"Human exploration"},
    {year:"1977",date:"AUG–SEP",title:"Voyager 1 and 2 begin their journeys",place:"Deep Space",text:"Twin probes launch on a grand tour of the outer planets, carrying the Golden Record.",id:"voyager",kind:"Robotic exploration"},
    {year:"1999",date:"07 FEB",title:"Stardust launches",place:"Deep Space",text:"NASA sends a spacecraft to collect samples from Comet Wild 2 and return them to Earth.",id:"return-capsule",kind:"Sample return"},
    {year:"2003",date:"25 AUG",title:"Spitzer Space Telescope launches",place:"Solar orbit",text:"An infrared observatory begins revealing stars, galaxies, and planetary systems.",id:"space-telescope",kind:"Space science"},
    {year:"2006",date:"15 JAN",title:"Stardust capsule returns to Earth",place:"Earth",text:"The sample-return capsule lands in Utah carrying material collected from a comet.",id:"return-capsule",kind:"Sample return"},
    {year:"2012",date:"06 AUG",title:"Curiosity lands on Mars",place:"Mars",text:"The rover begins its exploration of Gale Crater and the planet’s ancient environments.",id:"curiosity",kind:"Robotic exploration"},
    {year:"2020",date:"30 JAN",title:"Spitzer completes its mission",place:"Solar orbit",text:"NASA sends the final command to the infrared telescope after more than sixteen years of discovery.",id:"space-telescope",kind:"Mission legacy"},
    {year:"2021",date:"18 FEB",title:"Perseverance lands on Mars",place:"Mars",text:"A new rover begins exploring Jezero Crater and preparing samples for possible future return.",kind:"Robotic exploration"}
  ];
  var target=document.getElementById("tl");
  if(!target)return;
  function escapeHTML(value){return String(value).replace(/[&<>"']/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c];});}
  target.innerHTML=events.map(function(event){
    var link=event.id?'<a class="more" href="artifact-details.html?id='+encodeURIComponent(event.id)+'">Explore related artifact ↗</a>':'';
    return '<li class="tl-item panel"><div class="tl-top"><span class="tl-year">'+escapeHTML(event.year)+'</span><span class="tl-date">'+escapeHTML(event.date)+'</span></div><span class="tl-kind">'+escapeHTML(event.kind)+'</span><h3>'+escapeHTML(event.title)+'</h3><span class="place">'+escapeHTML(event.place)+'</span><p>'+escapeHTML(event.text)+'</p>'+link+'</li>';
  }).join("");
  var items=target.querySelectorAll(".tl-item");
  if("IntersectionObserver" in window){
    var observer=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add("in");observer.unobserve(entry.target);}});
    },{threshold:.12});
    items.forEach(function(item){observer.observe(item);});
  }else items.forEach(function(item){item.classList.add("in");});
})();
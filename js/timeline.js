(function () {
  "use strict";
  var events=[
    {year:"1969",date:"20 JUL",title:"Apollo 11 lands at Tranquility Base",place:"Moon",text:"The Lunar Module’s descent stage remains on the surface after the crew returns to lunar orbit.",id:"lunar-module",kind:"Lunar hardware"},
    {year:"1969",date:"19 NOV",title:"Apollo 12 deploys ALSEP",place:"Moon",text:"Astronauts install a science station designed to transmit measurements long after they leave.",id:"apollo-12-alsep",kind:"Surface science"},
    {year:"1977",date:"30 SEP",title:"NASA switches off the ALSEP network",place:"Moon",text:"Five Apollo science stations are deactivated; the hardware remains at the lunar sites.",id:"apollo-12-alsep",kind:"Mission legacy"},
    {year:"1977",date:"AUG–SEP",title:"Voyager 1 and 2 launch",place:"Deep Space",text:"Twin probes begin a journey through the outer planets and eventually into interstellar space.",id:"voyager",kind:"Deep-space exploration"},
    {year:"1997",date:"04 JUL",title:"Pathfinder delivers Sojourner to Mars",place:"Mars",text:"The lander and tiny rover demonstrate a new way to explore the Martian surface.",id:"pathfinder-sojourner",kind:"Mars hardware"},
    {year:"2004",date:"JAN",title:"Spirit and Opportunity reach Mars",place:"Mars",text:"Two robotic geologists begin missions designed for 90 sols and continue for years.",id:"spirit",kind:"Mars rovers"},
    {year:"2008",date:"25 MAY",title:"Phoenix lands in the Martian north",place:"Mars",text:"A robotic arm digs into the soil and confirms water ice beneath the surface.",id:"phoenix",kind:"Mars lander"},
    {year:"2011",date:"25 MAY",title:"Spirit mission declared complete",place:"Mars",text:"NASA ends recovery efforts after the rover becomes marooned in soft soil.",id:"spirit",kind:"Mission legacy"},
    {year:"2012",date:"06 AUG",title:"Curiosity lands in Gale Crater",place:"Mars",text:"A new mobile laboratory begins exploring ancient environments and remains active as a comparison mission.",id:"curiosity",kind:"Active mission"},
    {year:"2018",date:"26 NOV",title:"InSight arrives on Mars",place:"Mars",text:"A stationary lander begins listening for marsquakes and measuring the planet’s interior.",id:"insight",kind:"Mars science"},
    {year:"2019",date:"13 FEB",title:"Opportunity’s mission ends",place:"Mars",text:"After nearly 15 years and 45.16 kilometres, NASA declares the rover mission complete.",id:"opportunity",kind:"Mission legacy"},
    {year:"2020",date:"30 JAN",title:"Spitzer ends science operations",place:"Solar orbit",text:"The infrared observatory is decommissioned after more than 16 years; its archive remains useful.",id:"space-telescope",kind:"Deep-space legacy"},
    {year:"2022",date:"15 DEC",title:"InSight mission ends",place:"Mars",text:"After more than four years of science, NASA concludes the mission when contact cannot be restored.",id:"insight",kind:"Mission legacy"}
  ];
  var root=document.getElementById("tl");if(!root)return;
  function el(tag,cls,text){var n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
  events.forEach(function(item){
    var li=el("li","tl-item panel"),top=el("div","tl-top");
    if(item.id)li.dataset.artifactId=item.id;
    top.append(el("span","tl-year",item.year),el("span","tl-date",item.date));
    li.append(top,el("span","tl-kind",item.kind),el("h3","",item.title),el("span","place",item.place),el("p","",item.text));
    if(item.id){var photo=el("div","timeline-photo");photo.setAttribute("aria-label","NASA mission photograph");li.appendChild(photo);}
    if(item.id){var a=el("a","more","Explore related artifact ↗");a.href="artifact-details.html?id="+encodeURIComponent(item.id);li.appendChild(a);}
    root.appendChild(li);
  });
  fetch("data/artifacts.json").then(function(r){if(!r.ok)throw new Error("Archive unavailable");return r.json();}).then(function(records){
    var byId=Object.create(null),cache=Object.create(null);records.forEach(function(record){byId[record.id]=record;});
    root.querySelectorAll(".tl-item[data-artifact-id]").forEach(function(card){
      var id=card.dataset.artifactId,item=byId[id],target=card.querySelector(".timeline-photo");
      if(!item||!item.image_query||!target||!window.BeyondRelicsImages)return;
      if(!cache[id])cache[id]=window.BeyondRelicsImages.search(item.image_query,16);
      cache[id].then(function(images){
        if(!images.length)return;
        var link=el("a","timeline-photo-link");link.href=images[0].detail;link.target="_blank";link.rel="noopener noreferrer";
        var img=el("img","");img.alt=images[0].title||item.title;img.loading="lazy";img.decoding="async";img.referrerPolicy="no-referrer";
        img.addEventListener("nasaimageerror",function(){link.remove();},{once:true});
        var credit=el("span","timeline-photo-credit","NASA IMAGE · "+images[0].id);
        img.addEventListener("nasaimageload",function(event){link.href=event.detail.detail;credit.textContent="NASA IMAGE · "+event.detail.id;});
        link.appendChild(img);link.appendChild(credit);window.BeyondRelicsImages.mount(img,images);target.replaceChildren(link);
      });
    });
  }).catch(function(){});
  var items=root.querySelectorAll(".tl-item");
  if("IntersectionObserver" in window){var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add("in");observer.unobserve(entry.target);}});},{threshold:.12});items.forEach(function(item){observer.observe(item);});}
  else items.forEach(function(item){item.classList.add("in");});
})();
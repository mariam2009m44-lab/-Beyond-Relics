(function(){
 "use strict";
 var root=document.getElementById("mission-detective");
 if(!root)return;
 var questions=[
  {eyebrow:"CASE 01 · MARS PATHFINDER",title:"How long did Sojourner operate?",prompt:"Its planned mission was only seven Martian days (sols). What did it actually achieve?",options:["7 sols","23 sols","83 sols"],answer:2,explanation:"Sojourner operated for 83 sols—far beyond its planned seven-sol mission. Its work helped demonstrate the value of small mobile rovers.",source:"https://science.nasa.gov/mission/mars-pathfinder/",sourceLabel:"NASA Science · Mars Pathfinder"},
  {eyebrow:"CASE 02 · INSIGHT",title:"Which instrument listened for marsquakes?",prompt:"InSight studied the inside of Mars. Which instrument measured seismic waves?",options:["HP³","SEIS","RISE"],answer:1,explanation:"SEIS was InSight’s seismometer. It measured vibrations from marsquakes, impacts, and environmental activity to help scientists investigate the Martian interior.",source:"https://science.nasa.gov/mission/insight/science-instruments/",sourceLabel:"NASA Science · InSight instruments"},
  {eyebrow:"CASE 03 · APOLLO ALSEP",title:"Why deploy seismic stations on the Moon?",prompt:"Apollo’s Passive Seismic Experiment helped scientists do what after astronauts returned to Earth?",options:["Monitor lunar vibrations","Measure ocean tides","Track Earth’s weather"],answer:0,explanation:"The Apollo passive-seismic stations recorded lunar vibrations. Together, the stations formed a network that helped scientists study the Moon’s interior.",source:"https://ntrs.nasa.gov/citations/20190032593",sourceLabel:"NASA NTRS · ALSEP data"}
 ];
 var index=0,score=0,answered=false;
 var eyebrow=root.querySelector("[data-quiz-eyebrow]"),title=root.querySelector("[data-quiz-title]"),prompt=root.querySelector("[data-quiz-prompt]"),options=root.querySelector("[data-quiz-options]"),feedback=root.querySelector("[data-quiz-feedback]"),progress=root.querySelector("[data-quiz-progress]"),next=root.querySelector("[data-quiz-next]"),scoreLine=root.querySelector("[data-quiz-score]");
 function node(tag,cls,txt){var n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;}
 function render(){
  var q=questions[index];answered=false;
  eyebrow.textContent=q.eyebrow;title.textContent=q.title;prompt.textContent=q.prompt;
  progress.textContent="CASE "+(index+1)+" OF "+questions.length;
  options.replaceChildren();feedback.replaceChildren();feedback.hidden=true;
  scoreLine.textContent="SCORE "+score+"/"+questions.length;
  q.options.forEach(function(label,i){var b=node("button","detective-option",label);b.type="button";b.addEventListener("click",function(){choose(i);});options.append(b);});
  next.hidden=true;next.textContent=index===questions.length-1?"See your results":"Next case";
 }
 function choose(choice){
  if(answered)return;answered=true;
  var q=questions[index],correct=choice===q.answer;
  if(correct)score++;
  options.querySelectorAll("button").forEach(function(b,i){b.disabled=true;if(i===q.answer)b.classList.add("is-correct");if(i===choice&&!correct)b.classList.add("is-wrong");});
  feedback.replaceChildren(node("strong","detective-result",correct?"Evidence confirmed.":"Not quite — review the evidence."),node("p","",q.explanation));
  var a=node("a","detective-source",q.sourceLabel+" ↗");a.href=q.source;a.target="_blank";a.rel="noopener noreferrer";feedback.append(a);
  feedback.hidden=false;scoreLine.textContent="SCORE "+score+"/"+questions.length;next.hidden=false;
 }
 function finish(){
  eyebrow.textContent="MISSION COMPLETE";title.textContent=score===questions.length?"Excellent detective work.":"The archive has more to teach.";
  prompt.textContent="You answered "+score+" of "+questions.length+" cases correctly. Explore the NASA evidence links to learn more.";
  options.replaceChildren();feedback.hidden=true;progress.textContent="ALL CASES REVIEWED";next.hidden=false;next.textContent="Play again";
  scoreLine.textContent="FINAL SCORE "+score+"/"+questions.length;
 }
 next.addEventListener("click",function(){
  if(!answered&&index<questions.length)return;
  if(index===questions.length-1){if(next.textContent==="Play again"){index=0;score=0;render();}else finish();}
  else{index++;render();}
 });
 render();
})();
(function(){
  var root=document.documentElement;
  // stars
  document.querySelectorAll('#stars').forEach(function(box){
    var frag=document.createDocumentFragment();
    for(var i=0;i<160;i++){
      var s=document.createElement('i'),z=Math.random()*1.8+.4;
      s.style.cssText='left:'+Math.random()*100+'%;top:'+Math.random()*100+'%;width:'+z+'px;height:'+z+'px;opacity:'+(Math.random()*.6+.2);
      frag.appendChild(s);
    }
    box.appendChild(frag);
  });
  // sound toggle (visual only for now)
  var sound=document.getElementById('sound');
  if(sound)sound.addEventListener('click',function(){
    sound.setAttribute('aria-pressed',sound.getAttribute('aria-pressed')==='true'?'false':'true');
  });
  // dim mode (remembered between pages)
  var theme=document.getElementById('theme');
  function setDim(on){
    if(on)root.setAttribute('data-theme','dim');else root.removeAttribute('data-theme');
    if(theme)theme.setAttribute('aria-pressed',String(on));
    try{localStorage.setItem('br-dim',on?'1':'0')}catch(e){}
  }
  try{if(localStorage.getItem('br-dim')==='1')setDim(true)}catch(e){}
  if(theme)theme.addEventListener('click',function(){setDim(root.getAttribute('data-theme')!=='dim')});
  // footer year
  document.querySelectorAll('[data-year]').forEach(function(e){e.textContent=new Date().getFullYear()});
})();

function imgFail(i){i.style.display='none';var n=i.nextElementSibling;if(n)n.style.display='grid';}
(function(){
  var root=document.documentElement;
  document.getElementById('theme').addEventListener('click',function(){
    root.setAttribute('data-theme',root.getAttribute('data-theme')==='dark'?'light':'dark');
  });
  document.querySelectorAll('[data-pg]').forEach(function(b){
    b.addEventListener('click',function(){
      document.querySelectorAll('.pg').forEach(function(p){p.hidden=(p.id!==b.dataset.pg);});
      document.querySelectorAll('[data-pg]').forEach(function(x){x.classList.toggle('on',x===b);});
      window.scrollTo(0,0);
    });
  });
  document.addEventListener('click',function(e){
    var r=e.target.closest('.reveal');
    if(r){
      var c=r.dataset.code, box=document.createElement('div'), code=document.createElement('code'), btn=document.createElement('button');
      box.className='codebox'; code.textContent=c; btn.type='button'; btn.textContent='Copiază';
      function sel(){var rg=document.createRange();rg.selectNodeContents(code);var s=window.getSelection();s.removeAllRanges();s.addRange(rg);btn.textContent='Selectat';}
      btn.addEventListener('click',function(ev){
        ev.stopPropagation();
        if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(c).then(function(){btn.textContent='Copiat ✓';},sel);}else{sel();}
      });
      box.appendChild(code); box.appendChild(btn); r.replaceWith(box); return;
    }
    var f=e.target.closest('.f');
    if(f){
      var k=f.dataset.f;
      f.parentElement.querySelectorAll('.f').forEach(function(x){x.classList.toggle('on',x===f);});
      document.querySelectorAll('#home-cups .cup').forEach(function(card){
        var ok=k==='all'||(k==='code'&&card.dataset.kind==='code')||(k==='deal'&&card.dataset.kind==='deal')||(k==='soon'&&card.dataset.soon==='1');
        card.hidden=!ok;
      });
    }
  });
})();

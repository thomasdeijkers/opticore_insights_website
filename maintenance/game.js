(() => {
      const language = 'nl';
      const selected = {gameStart:'Start spel',gameAgain:'Nog een keer',gameReady:'Tik op start om te spelen.',gameOver:'Game over · score {score}'};
      const supportCopy = {
        nl: ['Vraag stellen','Stel je vraag','Vul je naam en vraag in. Je verstuurt de e-mail daarna vanuit je eigen mailprogramma.','Naam','Je vraag','E-mail opstellen','Sluiten','Automatisch verversen staat stil zolang dit formulier open is.','Je e-mailprogramma wordt geopend. Verstuur je bericht daar.','Open de e-mail opnieuw'],
        en: ['Ask a question','Ask your question','Enter your name and question. You then send the email from your own email app.','Name','Your question','Compose email','Close','Automatic refresh is paused while this form is open.','Your email app will open. Send your message there.','Open the email again'],
        de: ['Frage stellen','Ihre Frage','Geben Sie Ihren Namen und Ihre Frage ein. Senden Sie die E-Mail anschließend in Ihrem E-Mail-Programm.','Name','Ihre Frage','E-Mail verfassen','Schließen','Solange das Formular geöffnet ist, wird die Seite nicht automatisch aktualisiert.','Ihr E-Mail-Programm wird geöffnet. Senden Sie dort Ihre Nachricht.','E-Mail erneut öffnen'],
        pl: ['Zadaj pytanie','Twoje pytanie','Podaj imię i pytanie. Następnie wyślij wiadomość ze swojej aplikacji pocztowej.','Imię','Pytanie','Utwórz e-mail','Zamknij','Automatyczne odświeżanie jest wstrzymane, gdy formularz jest otwarty.','Otworzy się aplikacja pocztowa. Wyślij w niej wiadomość.','Otwórz e-mail ponownie'],
        ar: ['اطرح سؤالاً','سؤالك','أدخل اسمك وسؤالك، ثم أرسل الرسالة من تطبيق البريد الإلكتروني الخاص بك.','الاسم','سؤالك','كتابة رسالة','إغلاق','يتوقف التحديث التلقائي ما دام هذا النموذج مفتوحاً.','سيفتح تطبيق البريد الإلكتروني. أرسل رسالتك من هناك.','فتح الرسالة مجدداً'],
        tr: ['Soru sor','Sorunuz','Adınızı ve sorunuzu yazın. Ardından e-postayı kendi e-posta uygulamanızdan gönderin.','Adınız','Sorunuz','E-posta oluştur','Kapat','Bu form açıkken otomatik yenileme duraklatılır.','E-posta uygulamanız açılacak. Mesajınızı oradan gönderin.','E-postayı yeniden aç']
      };
      const supportText = supportCopy[language] || supportCopy.nl;
      ['supportToggle','supportTitle','supportIntro','supportNameLabel','supportQuestionLabel','supportSubmit','supportClose','supportHelp'].forEach((id,i) => {
        document.getElementById(id).textContent = supportText[i];
      });
      const supportForm = document.getElementById('supportForm');
      const supportToggle = document.getElementById('supportToggle');
      const supportStatus = document.getElementById('supportStatus');
      const draftKey = 'opticore-maintenance-support-draft';
      try {
        const draft = JSON.parse(sessionStorage.getItem(draftKey) || '{}');
        if (typeof draft.name === 'string') supportForm.elements.name.value = draft.name.slice(0,100);
        if (typeof draft.question === 'string') supportForm.elements.question.value = draft.question.slice(0,2000);
      } catch (_) {}
      supportForm.addEventListener('input', () => {
        try { sessionStorage.setItem(draftKey, JSON.stringify({name:supportForm.elements.name.value, question:supportForm.elements.question.value})); } catch (_) {}
      });
      function showSupport(open) {
        supportForm.hidden = !open;
        supportToggle.setAttribute('aria-expanded', String(open));
        (open ? supportForm.elements.name : supportToggle).focus({preventScroll:!open});
      }
      supportToggle.addEventListener('click', () => showSupport(supportForm.hidden));
      document.getElementById('supportClose').addEventListener('click', () => showSupport(false));
      supportForm.addEventListener('keydown', event => {
        if (event.key === 'Escape') { event.preventDefault(); showSupport(false); }
      });
      function supportMailto() {
        const body = 'Naam: '+supportForm.elements.name.value.trim()+'\n\nVraag:\n'+supportForm.elements.question.value.trim();
        return 'mailto:support@opticore-insights.nl?subject='+encodeURIComponent('Vraag over OptiCore')+'&body='+encodeURIComponent(body);
      }
      function updateSupportDraftLink() {
        supportStatus.textContent = supportText[8]+' ';
        const link = document.createElement('a');
        link.id = 'supportDraftLink'; link.href = supportMailto(); link.textContent = supportText[9];
        supportStatus.appendChild(link);
        return link.href;
      }
      supportForm.addEventListener('submit', event => {
        event.preventDefault();
        if (!supportForm.reportValidity()) return;
        window.location.href = updateSupportDraftLink();
      });
      // Continue retrying the original GET page, but never erase a question being typed.
      window.setInterval(() => { if (supportForm.hidden) window.location.reload(); }, 30000);

      const canvas = document.getElementById('dinoGame');
      const ctx = canvas.getContext('2d');
      const startButton = document.getElementById('gameStart');
      const jumpLabel = {nl:'Spring',en:'Jump',de:'Springen',pl:'Skocz',ar:'اقفز',tr:'Zıpla'}[language] || 'Spring';
      const status = document.getElementById('gameStatus');
      const ground = 88, dinoX = 42;
      let active = false, y = 0, velocity = 0, obstacles = [], elapsed = 0, score = 0, scoreProgress = 0, lastFrame = 0;
      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#d9eef6'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#7aa7a7'; ctx.fillRect(0, ground, canvas.width, 2);
        ctx.fillStyle = '#8cb5ac';
        for (let i=0;i<7;i++) ctx.fillRect((i*83-(score*1.6)%83), ground+9+(i%2)*3, 24, 2);
        const top = ground-27-y;
        ctx.fillStyle = '#236b58';
        ctx.fillRect(dinoX+5, top+8, 22, 17); ctx.fillRect(dinoX+19, top, 15, 15);
        ctx.fillRect(dinoX, top+13, 9, 5); ctx.fillRect(dinoX+25, top+24, 6, 4);
        ctx.fillStyle = '#fff'; ctx.fillRect(dinoX+28, top+4, 3, 3);
        ctx.fillStyle = '#17483e'; ctx.fillRect(dinoX+29, top+5, 1, 1);
        ctx.fillStyle = '#236b58';
        if (y < 1) { const leg=Math.floor(score/3)%2; ctx.fillRect(dinoX+9,top+24,5,leg?4:8);ctx.fillRect(dinoX+21,top+24,5,leg?8:4); }
        else { ctx.fillRect(dinoX+9,top+24,5,6);ctx.fillRect(dinoX+21,top+24,5,6); }
        for(const obstacle of obstacles){ctx.fillStyle='#e36e36';ctx.fillRect(obstacle.x,ground-obstacle.h,obstacle.w,obstacle.h);ctx.fillRect(obstacle.x-4,ground-obstacle.h+8,4,5);}
        ctx.fillStyle='#31546a';ctx.font='bold 12px Arial';ctx.fillText(String(score).padStart(4,'0'),canvas.width-52,20);
      }
      function jump(){if(active&&y===0){velocity=405;}}
      function endGame(){active=false;startButton.textContent=selected.gameAgain;status.textContent=selected.gameOver.replace('{score}',score);}
      function frame(now){
        if(!active)return;
        const dt=Math.min(.035,(now-lastFrame)/1000||0);lastFrame=now;elapsed+=dt;
        velocity-=1150*dt;y=Math.max(0,y+velocity*dt);if(y===0)velocity=0;
        const speed=205+Math.min(115,score*1.5);
        obstacles.forEach(item=>item.x-=speed*dt);obstacles=obstacles.filter(item=>item.x+item.w>-5);
        if(elapsed>1.05+Math.random()*.75){obstacles.push({x:canvas.width+8,w:12+Math.random()*8|0,h:22+Math.random()*16|0});elapsed=0;}
        const dino={left:dinoX+4,right:dinoX+31,top:ground-27-y+2,bottom:ground-y};
        if(obstacles.some(item=>dino.right>item.x&&dino.left<item.x+item.w&&dino.bottom>ground-item.h+2)){draw();endGame();return;}
        scoreProgress+=dt*10;score=Math.floor(scoreProgress);draw();status.textContent=`Score ${score}`;requestAnimationFrame(frame);
      }
      function startGame(){if(active){jump();return;}active=true;y=0;velocity=0;obstacles=[];elapsed=0;score=0;scoreProgress=0;lastFrame=0;startButton.textContent=jumpLabel;status.textContent='Score 0';draw();requestAnimationFrame(frame);}
      startButton.addEventListener('click',startGame);
      canvas.addEventListener('pointerdown',jump);
      window.addEventListener('keydown',event=>{
        if(!supportForm.hidden || !active) return;
        if(event.target instanceof Element && event.target.closest('input,textarea,select,[contenteditable="true"],a,button') && event.target!==startButton) return;
        if(event.code==='Space'||event.code==='ArrowUp'){
          // A focused button would otherwise activate again when Space is released.
          event.preventDefault();
          if(!event.repeat) jump();
        }
      });
      status.textContent=selected.gameReady;draw();
    })();

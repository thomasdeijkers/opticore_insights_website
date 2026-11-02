<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <noscript><meta http-equiv="refresh" content="30"></noscript>
  <meta name="theme-color" content="#071d36">
  <title>{{TITLE}} · OptiCore</title>
  <style>
    *{box-sizing:border-box}html{min-height:100%;background:#071d36}body{margin:0;min-height:100vh;min-height:100svh;display:grid;place-items:center;padding:32px 20px;color:#f4f7fc;font-family:Inter,"Segoe UI",Arial,sans-serif;background:radial-gradient(ellipse at 15% 0%,#16436899,transparent 55%),radial-gradient(ellipse at 95% 100%,#fc640d18,transparent 45%),#071d36}main{position:relative;width:min(100%,540px);padding:44px 40px 32px;border:1px solid #a5c4e224;border-radius:24px;background:linear-gradient(145deg,#183550cc,#0b2441e8);box-shadow:0 24px 90px #0004;overflow:hidden}main:before{content:"";position:absolute;inset:0 0 auto;height:3px;background:linear-gradient(90deg,#ff6400,#ffad6d 70%,transparent)}.logo{display:inline-flex;align-items:center;justify-content:center;padding:17px 22px;border-radius:14px;background:#fff;margin-bottom:36px}.logo img{display:block;width:210px;max-width:100%;height:auto}.eyebrow{display:flex;align-items:center;gap:9px;margin:0 0 14px;font-size:11px;letter-spacing:.17em;font-weight:750;text-transform:uppercase;color:#ffb27d}.dot{width:7px;height:7px;border-radius:50%;background:#ff7a26;box-shadow:0 0 0 5px #ff7a2615}h1{margin:0;font-size:clamp(28px,5.8vw,38px);line-height:1.15;letter-spacing:-.035em;font-weight:720}p{margin:20px 0 0;color:#c3d1e1;font-size:16px;line-height:1.75;white-space:pre-line}.actions{display:flex;align-items:center;flex-wrap:wrap;gap:16px;margin-top:30px}.button{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:48px;padding:13px 19px;border:0;border-radius:10px;background:#ff741f;color:#111e30;text-decoration:none;font:inherit;font-size:14px;font-weight:750;cursor:pointer}.button:hover{background:#ff934f}.button:focus-visible,.game-canvas:focus-visible{outline:3px solid #fff;outline-offset:4px}.button svg{width:17px;height:17px}.note{font-size:12px;line-height:1.6;color:#9fb5cb}.game{margin-top:26px;padding:16px;border:1px solid #a5c4e233;border-radius:14px;background:#061b31a8}.game h2{margin:0 0 10px;font-size:15px}.game-canvas{display:block;width:100%;height:auto;aspect-ratio:480/110;border-radius:8px;background:linear-gradient(#d8f0fa,#eaf6f8);touch-action:manipulation;cursor:pointer}.game-controls{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px}.game-controls .button{min-height:38px;padding:9px 14px}.game-status,.game-hint{margin:0;color:#b7c9dc;font-size:11px;line-height:1.45}.game-hint{margin-top:7px}.footer{margin-top:26px;padding-top:20px;border-top:1px solid #abc8e31a;font-size:11px;letter-spacing:.03em;color:#90a8bf}@media(max-width:480px){body{padding:20px 16px}main{padding:32px 24px 26px;border-radius:20px}.logo{margin-bottom:30px;padding:14px 18px}.logo img{width:190px}.actions{align-items:flex-start;flex-direction:column;gap:12px}.actions .button{width:100%}p{font-size:15px}.game{padding:12px;margin-top:22px}.game-controls{align-items:flex-start;flex-direction:column}.game-controls .button{width:100%}.footer{margin-top:24px}}
  </style>
  <style>
    .button-secondary{border:1px solid #789cbf;background:transparent;color:#f4f7fc}.button-secondary:hover{background:#234765}.support-form{margin-top:24px;padding:20px;border:1px solid #a5c4e233;border-radius:14px;background:#061b31a8}.support-form[hidden]{display:none}.support-form h2{margin:0;font-size:19px}.support-form p{margin:10px 0 16px;font-size:13px;line-height:1.6}.support-form label{display:grid;gap:7px;margin-top:14px;font-size:14px;font-weight:650}.support-form input,.support-form textarea{width:100%;min-width:0;padding:12px;border:1px solid #6687a7;border-radius:8px;background:#071d36;color:#f4f7fc;font:inherit;font-weight:400}.support-form textarea{min-height:125px;resize:vertical}.support-form input:focus-visible,.support-form textarea:focus-visible{outline:2px solid #ff984f;outline-offset:2px}.support-form .actions{margin-top:18px;gap:10px}.support-form a{color:#ffb27d;overflow-wrap:anywhere}.support-form .support-help{margin-bottom:0;color:#b6cce0}.support-address{display:block;margin-top:8px}.support-status:empty{display:none}@media(max-width:480px){.support-form{padding:14px}.support-form .actions{width:100%}}
  </style>
</head>
<body>
  <main data-mode="{{MODE}}">
    <div class="logo"><img src="data:image/png;base64,{{LOGO}}" alt="OptiCore Insights" width="210" height="90"></div>
    <div class="eyebrow"><span class="dot" aria-hidden="true"></span><span data-copy="eyebrow">{{EYEBROW}}</span></div>
    <h1 data-copy="title">{{TITLE}}</h1>
    <p data-copy="message">{{MESSAGE}}</p>
    <div class="actions">
      <a class="button" href=""><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 7a7 7 0 0 1 11.6-1L20 9M4 15l2.3 3A7 7 0 0 0 17.9 17"/></svg><span data-copy="retry">Opnieuw proberen</span></a>
      <button class="button button-secondary" id="supportToggle" type="button" aria-expanded="false" aria-controls="supportForm">Vraag stellen</button>
      <span class="note" data-copy="note">We proberen het automatisch elke 30 seconden opnieuw.</span>
    </div>
    <form class="support-form" id="supportForm" hidden>
      <h2 id="supportTitle">Stel je vraag</h2>
      <p><span id="supportIntro">Vul je naam en vraag in. Je verstuurt de e-mail daarna vanuit je eigen mailprogramma.</span><a class="support-address" href="mailto:support@opticore-insights.nl">support@opticore-insights.nl</a></p>
      <label for="supportName"><span id="supportNameLabel">Naam</span><input id="supportName" name="name" autocomplete="name" maxlength="100" required></label>
      <label for="supportQuestion"><span id="supportQuestionLabel">Je vraag</span><textarea id="supportQuestion" name="question" maxlength="2000" required></textarea></label>
      <div class="actions"><button class="button" id="supportSubmit" type="submit">E-mail opstellen</button><button class="button button-secondary" id="supportClose" type="button">Sluiten</button></div>
      <p class="support-help" id="supportHelp">Automatisch verversen staat stil zolang dit formulier open is.</p>
      <p class="support-status" id="supportStatus" role="status" aria-live="polite"></p>
    </form>
    <noscript><p class="note">Een vraag? Mail naar <a href="mailto:support@opticore-insights.nl">support@opticore-insights.nl</a>.</p></noscript>
    <section class="game" aria-labelledby="gameTitle">
      <h2 id="gameTitle" data-copy="gameTitle">Even spelen?</h2>
      <canvas class="game-canvas" id="dinoGame" width="480" height="110" role="img" aria-label="Dino-runspel. Tik of druk op spatie om te springen."></canvas>
      <div class="game-controls"><p class="game-status" id="gameStatus" aria-live="polite">Tik op start om te spelen.</p><button class="button" id="gameStart" type="button" data-copy="gameStart">Start spel</button></div>
      <p class="game-hint" data-copy="gameHint">Tik op het spel of druk op spatie om te springen en ontwijk de cactussen.</p>
    </section>
    <div class="footer">OptiCore Insights · Insights for smarter decisions</div>
  </main>
  <script src="/maintenance/game.js" defer></script>
</body>
</html>

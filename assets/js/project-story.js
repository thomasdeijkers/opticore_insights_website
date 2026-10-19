document.querySelectorAll('[data-time-calculator]').forEach(calculator => {
  const inputs = [...calculator.querySelectorAll('input')];
  const output = calculator.querySelector('[data-time-result]');
  const number = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 1 });
  function update() {
    if (inputs.some(input => input.value.trim() === '' || !input.validity.valid)) {
      output.textContent = 'Vul alle drie de velden in om de mogelijke tijdwinst te berekenen.';
      return;
    }
    const [before, after, count] = inputs.map(input => Number(input.value));
    const hours = (before - after) * count / 60;
    if (!Number.isFinite(hours)) return;
    output.textContent = hours > 0
      ? `Met jouw invoer: ${number.format(hours)} uur minder per week, oftewel ${number.format(hours * 52)} uur per jaar. Dit is een rekenvoorbeeld.`
      : hours < 0
        ? `Met jouw invoer kost de nieuwe werkwijze ${number.format(-hours)} uur extra per week. Er is in dit rekenvoorbeeld geen tijdwinst.`
        : 'Met jouw invoer blijft de tijd gelijk: 0 uur tijdwinst per week.';
  }
  inputs.forEach(input => input.addEventListener('input', update));
  window.addEventListener('pageshow', update);
  update();
});

(() => {
  'use strict';
  const form = document.getElementById('cash-form');
  if (!form) return;
  form.querySelector('fieldset').disabled = false;
  const result = document.getElementById('cash-result');
  const error = document.getElementById('cash-error');
  const initialResult = result.innerHTML;
  const fields = ['opening', 'deposits', 'withdrawals', 'buys', 'sells', 'income', 'fees', 'recorded'];
  const labels = {opening:'Opening cash balance',deposits:'Deposits',withdrawals:'Withdrawals',buys:'Purchases',sells:'Sale proceeds',income:'Cash income',fees:'Fees and charges',recorded:'Closing cash balance'};
  const formatter = new Intl.NumberFormat('en-US', {minimumFractionDigits:2,maximumFractionDigits:2});
  const format = cents => formatter.format(cents / 100);
  function readAmount(name) {
    const field = form.elements.namedItem(name);
    let text = field.value.trim();
    if (text === '') {
      if (name === 'opening') throw {field, message:'Enter an opening cash balance, including 0 if appropriate.'};
      return name === 'recorded' ? null : 0;
    }
    // Only conventional grouped commas or plain decimal amounts are accepted.
    if (!/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(text)) {
      throw {field, message:labels[name] + ': use a number with up to two decimal places, such as 1250.50.'};
    }
    text = text.replace(/,/g, '');
    const negative = text.startsWith('-');
    if (negative && name !== 'opening' && name !== 'recorded') {
      throw {field, message:labels[name] + ': enter a positive amount; the calculator applies the direction.'};
    }
    const [whole, fraction = ''] = text.replace('-', '').split('.');
    const cents = (Number(whole) * 100 + Number(fraction.padEnd(2, '0'))) * (negative ? -1 : 1);
    if (!Number.isSafeInteger(cents) || Math.abs(cents) > 100000000000000) {
      throw {field, message:labels[name] + ': enter an amount of 1 trillion or less.'};
    }
    return cents;
  }
  function clearErrors() {
    error.hidden = true;
    error.textContent = '';
    for (const name of fields) form.elements.namedItem(name).removeAttribute('aria-invalid');
  }
  function showResult() {
    clearErrors();
    try {
      const values = Object.fromEntries(fields.map(name => [name, readAmount(name)]));
      const incoming = values.deposits + values.sells + values.income;
      const outgoing = values.withdrawals + values.buys + values.fees;
      const closing = values.opening + incoming - outgoing;
      const difference = values.recorded === null ? null : values.recorded - closing;
      result.replaceChildren();
      const eyebrow = document.createElement('p');eyebrow.className='eyebrow';eyebrow.textContent='EXPECTED CLOSING CASH';
      const total = document.createElement('output');total.textContent=format(closing);total.setAttribute('aria-label','Expected closing cash '+format(closing));
      const note = document.createElement('p');note.textContent='Amounts are in the single currency you entered.';
      const list = document.createElement('dl');
      for (const [label, amount] of [['Opening cash',values.opening],['Total cash in',incoming],['Total cash out',outgoing],...(difference === null ? [] : [['Recorded closing cash',values.recorded],['Recorded minus expected',difference]])]) {
        const term = document.createElement('dt');term.textContent=label;const value=document.createElement('dd');value.textContent=format(amount);list.append(term,value);
      }
      const verdict=document.createElement('p');verdict.className='cash-verdict';
      if (difference === null) verdict.textContent='Add your recorded closing balance to compare the two.';
      else if (difference === 0) { verdict.dataset.matched='true';verdict.textContent='✓ The cash arithmetic matches. Check the underlying entries against your statement.'; }
      else verdict.textContent='Review the entries: your recorded balance is '+format(Math.abs(difference))+' '+(difference>0?'higher':'lower')+' than these cash movements explain.';
      result.append(eyebrow,total,note,list,verdict);
      if (window.matchMedia('(max-width: 760px)').matches) {
        result.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
      }
    } catch (problem) {
      error.textContent=problem.message || 'Check the amounts and try again.';error.hidden=false;
      if (problem.field) {problem.field.setAttribute('aria-invalid','true');problem.field.focus();}
    }
  }
  form.addEventListener('submit', event => {event.preventDefault();showResult();});
  form.addEventListener('input', () => {
    if (result.querySelector('output')) {
      result.innerHTML=initialResult;
      result.querySelector('h2').textContent='Update your cash check.';
      result.querySelector('h2 + p').textContent='Your entries changed. Select Check cash balance to calculate the updated result.';
    }
  });
  form.addEventListener('reset', () => {clearErrors();result.innerHTML=initialResult;});
  document.getElementById('sample').addEventListener('click', () => {
    const sample={opening:'10000',deposits:'0',withdrawals:'0',buys:'1000',sells:'440',income:'20',fees:'0',recorded:'9460'};
    for (const [name,value] of Object.entries(sample)) form.elements.namedItem(name).value=value;
    showResult();
  });
  document.getElementById('share-tool').addEventListener('click', async () => {
    const status=document.getElementById('share-status');
    try {await navigator.clipboard.writeText('https://ogerhsou.github.io/astrolabe-portfolio-support/tools/portfolio-cash-calculator.html');status.textContent='Link copied. Your numbers are not included.';}
    catch {status.textContent='Copy the page URL from your address bar. It contains no entered amounts.';}
  });
})();

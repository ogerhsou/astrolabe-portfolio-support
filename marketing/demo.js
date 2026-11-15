"use strict";
(() => {
  const root = document.querySelector("[data-ledger-demo]");
  if (!root) return;
  const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const opening = { cash: 10000, shares: 0, price: 100, entries: [{ label: "Opening cash balance", cash: 10000 }] };
  const steps = [
    { title: "Start with your cash balance.", description: "This sample ledger starts with $10,000 in cash. Record a purchase to see where the money goes.", next: "Record a $1,000 purchase →" },
    { title: "A purchase moves cash into holdings.", description: "Buy 10 sample shares at $100. Cash falls by $1,000 and holdings rise by $1,000. The purchase itself creates no gain.", next: "Record a $20 dividend →", transaction: { label: "Buy 10 sample shares at $100", cash: -1000, shares: 10, price: 100 } },
    { title: "A dividend adds cash to your ledger.", description: "A $20 cash dividend increases your cash balance. You still own 10 shares, so the share count stays the same.", next: "Record a $440 sale →", transaction: { label: "Receive a $20 cash dividend", cash: 20, shares: 0, price: 100 } },
    { title: "A sale puts the proceeds back in cash.", description: "At a sample market price of $110, sell 4 shares for $440. You keep 6 shares worth $660. The $120 difference from the opening value includes realized gains, remaining unrealized gains, and the dividend.", next: "Replay the example ↻", transaction: { label: "Sell 4 sample shares at $110", cash: 440, shares: -4, price: 110 } }
  ];
  let current = 0;
  function stateAt(index) {
    const result = { ...opening, entries: [...opening.entries] };
    for (let i = 1; i <= index; i += 1) {
      const t = steps[i].transaction;
      result.cash += t.cash;
      result.shares += t.shares;
      result.price = t.price;
      result.entries.push({ label: t.label, cash: t.cash });
    }
    return result;
  }
  function render() {
    const step = steps[current];
    const state = stateAt(current);
    root.querySelector("[data-demo-cash]").textContent = money.format(state.cash);
    root.querySelector("[data-demo-holdings]").textContent = money.format(state.shares * state.price);
    root.querySelector("[data-demo-total]").textContent = money.format(state.cash + state.shares * state.price);
    root.querySelector("[data-demo-shares]").textContent = `${state.shares} sample shares`;
    root.querySelector("[data-demo-step]").textContent = `Step ${current + 1} of ${steps.length}`;
    root.querySelector("[data-demo-icon]").textContent = String(current + 1).padStart(2, "0");
    root.querySelector("[data-demo-title]").textContent = step.title;
    root.querySelector("[data-demo-description]").textContent = step.description;
    root.querySelector("[data-demo-next]").textContent = step.next;
    const history = root.querySelector("[data-demo-history]");
    history.replaceChildren();
    state.entries.forEach(entry => {
      const row = document.createElement("li");
      const label = document.createElement("span");
      label.textContent = entry.label;
      const amount = document.createElement("strong");
      amount.textContent = `${entry.cash >= 0 ? "+" : "−"}${money.format(Math.abs(entry.cash))}`;
      row.append(label, amount);
      history.append(row);
    });
  }
  root.querySelector("[data-demo-next]").addEventListener("click", () => { current = (current + 1) % steps.length; render(); });
  root.querySelector("[data-demo-reset]").addEventListener("click", () => { current = 0; render(); });
  render();
})();

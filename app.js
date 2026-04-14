(function () {
  "use strict";

  const displayEl = document.getElementById("display");
  const expressionEl = document.getElementById("expression");
  const keysEl = document.getElementById("keys");

  const OP_MAP = { "÷": "/", "×": "*", "−": "-" };
  const OP_DISPLAY = { "/": "÷", "*": "×", "-": "−", "+": "+" };

  let display = "0";
  let stored = null;
  let pendingOp = null;
  let fresh = true;

  function formatNumber(n) {
    if (!Number.isFinite(n)) return "오류";
    const s = String(n);
    if (s.length > 14) {
      const exp = n.toExponential(6);
      return exp.length > 14 ? n.toExponential(4) : exp;
    }
    return s;
  }

  function updateView() {
    displayEl.textContent = display;
    if (stored !== null && pendingOp) {
      expressionEl.textContent =
        formatNumber(stored) + " " + (OP_DISPLAY[pendingOp] || pendingOp);
    } else {
      expressionEl.textContent = "";
    }
  }

  function applyOp(a, b, op) {
    switch (op) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "*":
        return a * b;
      case "/":
        return b === 0 ? NaN : a / b;
      default:
        return b;
    }
  }

  function inputDigit(d) {
    if (fresh) {
      display = d === "0" ? "0" : d;
      fresh = false;
    } else if (display === "0" && d !== "0") {
      display = d;
    } else if (display.replace(".", "").length < 14) {
      display += d;
    }
  }

  function inputDecimal() {
    if (fresh) {
      display = "0.";
      fresh = false;
      return;
    }
    if (!display.includes(".")) display += ".";
  }

  function commitPending() {
    const cur = parseFloat(display);
    if (stored === null || !pendingOp) {
      stored = cur;
      return;
    }
    const next = applyOp(stored, cur, pendingOp);
    stored = next;
    display = formatNumber(next);
    fresh = true;
  }

  function setOperator(op) {
    const internal = OP_MAP[op] || op;
    const cur = parseFloat(display);
    if (stored === null) {
      stored = cur;
    } else if (!fresh && pendingOp) {
      commitPending();
    } else if (fresh && pendingOp) {
      stored = cur;
    }
    pendingOp = internal;
    fresh = true;
    updateView();
  }

  function equals() {
    if (pendingOp === null) return;
    commitPending();
    pendingOp = null;
    updateView();
  }

  function clearAll() {
    display = "0";
    stored = null;
    pendingOp = null;
    fresh = true;
    updateView();
  }

  function toggleSign() {
    if (display === "0" || display === "오류") return;
    if (display.startsWith("-")) display = display.slice(1);
    else display = "-" + display;
    updateView();
  }

  function percent() {
    const n = parseFloat(display);
    if (!Number.isFinite(n)) return;
    display = formatNumber(n / 100);
    fresh = true;
    updateView();
  }

  keysEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-digit], button[data-op], button[data-action]");
    if (!btn) return;

    if (display === "오류") clearAll();

    if (btn.dataset.digit !== undefined) {
      inputDigit(btn.dataset.digit);
      updateView();
      return;
    }
    if (btn.dataset.op) {
      setOperator(btn.dataset.op);
      return;
    }
    switch (btn.dataset.action) {
      case "decimal":
        inputDecimal();
        updateView();
        break;
      case "equals":
        equals();
        break;
      case "clear":
        clearAll();
        break;
      case "sign":
        toggleSign();
        break;
      case "percent":
        percent();
        break;
      default:
        break;
    }
  });

  document.addEventListener("keydown", (e) => {
    if (display === "오류" && e.key !== "Escape") return;

    if (e.key >= "0" && e.key <= "9") {
      e.preventDefault();
      inputDigit(e.key);
      updateView();
      return;
    }
    if (e.key === ".") {
      e.preventDefault();
      inputDecimal();
      updateView();
      return;
    }
    if (e.key === "+" || e.key === "-") {
      e.preventDefault();
      setOperator(e.key);
      return;
    }
    if (e.key === "*") {
      e.preventDefault();
      setOperator("×");
      return;
    }
    if (e.key === "/") {
      e.preventDefault();
      e.stopPropagation();
      setOperator("÷");
      return;
    }
    if (e.key === "Enter" || e.key === "=") {
      e.preventDefault();
      equals();
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      clearAll();
      return;
    }
    if (e.key === "Backspace") {
      e.preventDefault();
      if (display === "오류") {
        clearAll();
        return;
      }
      if (fresh) return;
      if (display.length <= 1 || (display.startsWith("-") && display.length === 2)) {
        display = "0";
        fresh = true;
      } else {
        display = display.slice(0, -1);
      }
      updateView();
    }
  });

  updateView();
})();

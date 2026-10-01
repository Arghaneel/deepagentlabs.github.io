const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#site-nav");

toggle?.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", String(!open));
  nav?.classList.toggle("open", !open);
});

nav?.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle?.setAttribute("aria-expanded", "false");
  }),
);

document.querySelector("#year").textContent = String(new Date().getFullYear());

const faqTriggers = [...document.querySelectorAll(".faq-trigger")];

faqTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const open = trigger.getAttribute("aria-expanded") !== "true";

    faqTriggers.forEach((item) => {
      const expanded = item === trigger && open;
      item.setAttribute("aria-expanded", String(expanded));
      item.closest(".faq-item")?.classList.toggle("is-open", expanded);
      const answer = document.getElementById(
        item.getAttribute("aria-controls"),
      );
      answer?.setAttribute("aria-hidden", String(!expanded));
    });
  });
});

(() => {
  const overlay = document.querySelector("#agent-loader");
  if (!overlay) return;
  if (!document.documentElement.classList.contains("agent-loader-enabled")) {
    overlay.remove();
    return;
  }

  const stage = document.querySelector("#agent-loader-stage");
  const stageNumber = document.querySelector("#agent-loader-stage-number");
  const status = document.querySelector("#agent-loader-status");
  const footerState = document.querySelector("#agent-loader-footer-state");
  const progress = document.querySelector(".agent-loader-progress");
  const progressFill = document.querySelector(".agent-loader-progress span");
  const percentage = document.querySelector(".agent-loader-percent");
  const components = new Map(
    [...overlay.querySelectorAll("[data-component]")].map((item) => [
      item.dataset.component,
      item,
    ]),
  );
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const stepDelay = reducedMotion ? 220 : 700;
  const timers = new Set();
  let finished = false;

  const schedule = (callback, delay) => {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      try {
        callback();
      } catch {
        finish();
      }
    }, delay);
    timers.add(timer);
  };

  const setComponent = (name, state) => {
    const item = components.get(name);
    if (!item) return;
    item.dataset.state = state;
    item.querySelector(".agent-loader-check").textContent =
      state === "complete" ? "✓" : state === "processing" ? "◌" : "○";
    item.querySelector(".agent-loader-state-text").textContent = `, ${state}`;
  };

  const setStep = (number, label, message, value, active, complete = []) => {
    overlay.dataset.stage = String(number);
    stageNumber.textContent = `STAGE ${String(number).padStart(2, "0")} / 06`;
    stage.textContent = label;
    status.textContent = message;
    footerState.textContent = number === 6 ? "ONLINE" : "INITIALIZING";
    progress.setAttribute("aria-valuenow", String(value));
    progressFill.style.width = `${value}%`;
    percentage.textContent = `${String(value).padStart(2, "0")}%`;
    components.forEach((_, name) => {
      setComponent(
        name,
        complete.includes(name)
          ? "complete"
          : name === active
            ? "processing"
            : "pending",
      );
    });
  };

  const finish = () => {
    if (finished) return;
    finished = true;
    timers.forEach(window.clearTimeout);
    timers.clear();
    window.removeEventListener("load", onWindowLoad);
    overlay.classList.add("is-exiting");
    schedule(
      () => {
        document.documentElement.classList.remove("agent-loader-enabled");
        window.clearTimeout(window.__agentLoaderFailsafe);
        overlay.remove();
      },
      reducedMotion ? 0 : 420,
    );
  };

  const waitForPageLoad = () => {
    if (document.readyState === "complete") {
      finish();
      return;
    }
    window.addEventListener("load", onWindowLoad, { once: true });
    schedule(finish, 300);
  };

  function onWindowLoad() {
    finish();
  }

  setStep(
    1,
    "INITIALIZING AGENT RUNTIME",
    "Bringing runtime online...",
    0,
    "runtime",
  );
  schedule(() => {
    setStep(
      2,
      "ESTABLISHING OBSERVABILITY",
      "Activating runtime observation...",
      20,
      "observation",
      ["runtime"],
    );
  }, stepDelay);
  schedule(() => {
    setStep(
      3,
      "LOADING EVALUATION LAYER",
      "Linking evaluation signals...",
      40,
      "evaluation",
      ["runtime", "observation"],
    );
  }, stepDelay * 2);
  schedule(() => {
    setStep(
      4,
      "INITIALIZING GOVERNANCE",
      "Bringing governance controls online...",
      60,
      "governance",
      ["runtime", "observation", "evaluation"],
    );
  }, stepDelay * 3);
  schedule(() => {
    setStep(
      5,
      "CONNECTING ECOSYSTEM",
      "Connecting resilience and ecosystem paths...",
      80,
      "connection",
      ["runtime", "observation", "evaluation", "governance"],
    );
  }, stepDelay * 4);
  schedule(() => {
    setStep(
      5,
      "CONNECTING ECOSYSTEM",
      "Finalizing agent network...",
      95,
      "connection",
      ["runtime", "observation", "evaluation", "governance"],
    );
  }, stepDelay * 5);
  schedule(() => {
    setStep(6, "AGENT ONLINE", "Agent operational.", 100, null, [
      ...components.keys(),
    ]);
    schedule(waitForPageLoad, reducedMotion ? 180 : 550);
  }, stepDelay * 6);
})();

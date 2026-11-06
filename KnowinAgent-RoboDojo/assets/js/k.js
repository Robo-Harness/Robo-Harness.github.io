// Shared chrome, language switching and data helpers.
// Static copy carries both languages as sibling elements with lang="en" / lang="zh";
// dynamic copy uses K.L(en, zh) and is re-rendered through K.page(render) on every switch.
(function () {
  const root = document.documentElement;
  const qs = new URLSearchParams(location.search).get("lang");
  let lang = qs === "zh" || qs === "en" ? qs : (localStorage.getItem("ka-lang") || "en");
  root.dataset.lang = lang;
  root.lang = lang === "zh" ? "zh-CN" : "en";

  const PAGES = [
    ["index.html", "Overview", "概览"],
    ["leaderboard.html", "Leaderboard", "榜单"],
    ["results.html", "Per-task", "逐任务"],
    ["showcase.html", "Rollouts", "录像"],
  ];
  const link = ([h, en, zh]) => `<a href="${h}" class="${h === here ? "on" : ""}">${both(en, zh)}</a>`;
  const here = location.pathname.split("/").pop() || "index.html";
  const both = (en, zh) => `<span lang="en">${en}</span><span lang="zh">${zh}</span>`;
  const EVALNOTE = both(
    "Scores on this page are the team's own RoboDojo simulation results, each task variant tested on 5 randomly selected layouts. Leaderboard comparisons use the public RoboDojo leaderboard snapshot of November 3, 2026. These are not official results and are for reference only.",
    "本页成绩为团队在 RoboDojo 仿真环境中的自测结果，每个任务变体随机选取 5 个布局测试；榜单对照采用 2026 年 11 月 3 日的 RoboDojo 公开榜单快照。以上结果并非官方成绩，仅供参考。");
  document.querySelectorAll("[data-evalnote]").forEach((el) => (el.innerHTML = EVALNOTE));

  const top = document.createElement("header");
  top.className = "top";
  top.innerHTML = `<div class="shell">
      <a class="logo" href="index.html"><img src="assets/img/favicon.svg" alt="">KnowinAgent-RoboDojo</a>
      <nav class="links">${PAGES.map(link).join("")}</nav>
      <div class="lang" role="group" aria-label="Language"><button data-l="en">EN</button><button data-l="zh">中文</button></div>
      <button class="menu" aria-label="Menu">${both("Menu", "菜单")}</button>
    </div>`;
  document.body.prepend(top);
  top.querySelector(".menu").addEventListener("click", () => top.classList.toggle("open"));

  const foot = document.createElement("footer");
  foot.className = "foot";
  foot.innerHTML = `<div class="shell">
      <div><b style="color:var(--ink)">KnowinAgent-RoboDojo</b> · Knowin · 2026</div>
      <nav>${PAGES.map(link).join("")}</nav>
      <div class="fine">${EVALNOTE}</div>
    </div>`;
  document.body.append(foot);

  const renders = [];
  function setLang(l) {
    if (l === lang) return;
    lang = l;
    localStorage.setItem("ka-lang", l);
    root.dataset.lang = l;
    root.lang = l === "zh" ? "zh-CN" : "en";
    syncButtons();
    renders.forEach((fn) => fn());
  }
  function syncButtons() {
    top.querySelectorAll(".lang button").forEach((b) => b.classList.toggle("on", b.dataset.l === lang));
    document.querySelectorAll("[data-ph-en]").forEach((el) => (el.placeholder = el.dataset[lang === "zh" ? "phZh" : "phEn"]));
    const t = document.querySelector("meta[name=title-zh]");
    if (t) document.title = lang === "zh" ? t.content : document.querySelector("meta[name=title-en]").content;
  }
  top.querySelector(".lang").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) setLang(b.dataset.l); });
  syncButtons();

  const cache = {};
  const json = (p) => (cache[p] ||= fetch(p, { cache: "no-cache" }).then((r) => {
    if (!r.ok) throw new Error(`${p} ${r.status}`);
    return r.json();
  }));
  const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;

  function meRow(T) {
    const sr = (t) => (t.successes / t.episodes.length) * 100;
    const dim = (id, pred = () => true) => {
      const g = T.tasks.filter((t) => t.dimension === id && pred(t));
      return { score: mean(g.map((t) => t.score)), sr: mean(g.map(sr)) };
    };
    const r = {
      model: "KnowinAgent-RoboDojo", team: "Knowin", type: "agent", me: true,
      generalizationStd: dim("Generalization", (t) => !t.random),
      generalizationRand: dim("Generalization", (t) => t.random),
      precision: dim("Precision"), longHorizon: dim("Long-Horizon"), memory: dim("Memory"), open: dim("Open"),
    };
    r.generalization = { score: (r.generalizationStd.score + r.generalizationRand.score) / 2, sr: (r.generalizationStd.sr + r.generalizationRand.sr) / 2 };
    const avg = (k) => (r.generalization[k] + r.precision[k] + r.longHorizon[k] + r.memory[k] + r.open[k]) / 5;
    r.average = { score: avg("score"), sr: avg("sr") };
    return r;
  }
  function ranked(O, T) {
    O.leaderboard.forEach((r) => {
      r.generalization ||= { score: (r.generalizationStd.score + r.generalizationRand.score) / 2, sr: (r.generalizationStd.sr + r.generalizationRand.sr) / 2 };
    });
    const rows = [...O.leaderboard, meRow(T)].sort((a, b) => b.average.score - a.average.score);
    rows.forEach((r, i) => (r.rank = i + 1));
    return rows;
  }

  const io = "IntersectionObserver" in window
    ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.08 })
    : null;

  window.K = {
    json, mean, meRow, ranked, both,
    get lang() { return lang; },
    L: (en, zh) => (lang === "zh" ? zh : en),
    page(fn) { renders.push(fn); fn(); },
    esc: (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])),
    f2: (x) => (x == null || Number.isNaN(+x) ? "—" : Number(x).toFixed(2)),
    f1: (x) => (x == null || Number.isNaN(+x) ? "—" : Number(x).toFixed(1)),
    srOf: (t) => (t.successes / t.episodes.length) * 100,
    heat: (v) => (v == null ? "transparent" : `rgba(184,149,106,${(0.04 + (v / 100) * 0.46).toFixed(3)})`),
    dim: (id) => ({ Generalization: ["Generalization", "泛化"], Precision: ["Precision", "精度"], "Long-Horizon": ["Long-Horizon", "长程"], Memory: ["Memory", "记忆"], Open: ["Open", "开放"] }[id]),
    seg(el, cb) {
      el.addEventListener("click", (e) => {
        const b = e.target.closest("button"); if (!b) return;
        el.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
        cb(b.dataset.v);
      });
    },
    reveal() { document.querySelectorAll(".reveal:not(.in)").forEach((el) => (io ? io.observe(el) : el.classList.add("in"))); },
    grow(root = document) { root.querySelectorAll("[data-w]").forEach((i) => (i.style.width = i.dataset.w + "%")); },
  };
  document.addEventListener("DOMContentLoaded", () => { K.reveal(); syncButtons(); });
})();

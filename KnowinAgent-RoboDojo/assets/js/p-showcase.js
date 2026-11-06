(async function () {
  const [T, O, R] = await Promise.all(["tasks", "official", "training"].map((n) => K.json(`data/${n}.json`)));
  const $ = (id) => document.getElementById(id);
  const DIMS = ["Generalization", "Precision", "Long-Horizon", "Memory", "Open"];
  const tasks = T.tasks;
  const byId = Object.fromEntries(tasks.map((t) => [t.id, t]));
  const train = Object.fromEntries(R.variants.map((v) => [v.task, v]));
  const state = { q: "", dim: "all" };
  let current = tasks[0];
  let visible = tasks;

  $("dims").innerHTML = [["all", "All", "全部"], ...DIMS.map((d) => [d, ...K.dim(d)])].map(([v, en, zh]) => `<button data-v="${v}" class="${v === "all" ? "on" : ""}">${K.both(en, zh)}</button>`).join("");
  K.seg($("dims"), (v) => { state.dim = v; list(); });
  $("q").addEventListener("input", (e) => { state.q = e.target.value.trim().toLowerCase(); list(); });

  function list() {
    visible = tasks.filter((t) => (state.dim === "all" || t.dimension === state.dim) && (!state.q || t.id.toLowerCase().includes(state.q)));
    $("count").textContent = K.L(`${visible.length} tasks`, `${visible.length} 个任务`);
    $("items").innerHTML = visible.map((t) => `<div class="titem ${t.id === current.id ? "on" : ""}" data-id="${t.id}">
      <b>${t.id}</b><span class="s">${K.f2(t.score)} / ${K.f1(K.srOf(t))}%</span><small>${K.L(...K.dim(t.dimension))} · ${t.episodes.length} ${K.L("episodes", "局")}</small></div>`).join("");
  }

  function detail(ep) {
    const t = current;
    $("items").querySelectorAll(".titem").forEach((x) => x.classList.toggle("on", x.dataset.id === t.id));
    $("items").querySelector(".titem.on")?.scrollIntoView({ block: "nearest" });
    $("d-title").textContent = t.id;
    $("d-meta").textContent = `arx_x5 · ${t.episodes.length} ${K.L("test episodes", "局测试")} · ${t.successes} ${K.L("successful", "局成功")}`;
    $("d-avg").textContent = `${K.f2(t.score)} / ${K.f1(K.srOf(t))}%`;
    const tr = train[t.id];
    $("d-chips").innerHTML = [K.L(...K.dim(t.dimension)), K.L(T.categories_en[t.category], T.categories[t.category]), t.random ? K.L("Randomized layout", "随机布局") : null,
      tr ? (tr.reuses_standard ? K.L("Reuses standard-layout knowledge", "复用标准布局知识") : K.L(`${tr.training} training episodes`, `${tr.training} 个训练回合`)) : null]
      .filter(Boolean).map((x) => `<span>${K.esc(x)}</span>`).join("");
    $("d-desc").textContent = K.L(t.description_en, t.description);

    const bars = [{ m: "KnowinAgent-RoboDojo", v: t.score, me: true }, ...O.compare.map((m) => ({ m, v: O.per_task[m]?.[t.id]?.score })).filter((x) => x.v != null)];
    $("d-cmp").innerHTML = bars.map((b) => `<div class="mb ${b.me ? "me" : ""}"><span class="n">${K.esc(b.m)}</span><div class="t"><i data-w="${b.v}"></i></div><span class="v">${K.f1(b.v)}</span></div>`).join("");
    K.grow($("d-cmp"));

    $("d-clips").innerHTML = t.episodes.map((e) => {
      const tag = e.success ? `<em class="ok">${K.L("success", "成功")}</em>` : `<em class="no">${K.L("not completed", "未完成")}</em>`;
      return `<div class="clip" data-n="${e.n}">${e.video ? `<video src="${e.video}" poster="${e.poster}" controls muted playsinline preload="none"></video>` : `<div class="none">${K.L("No recording for this episode", "该回合未保存录像")}</div>`}
        <div class="c"><span>${K.L(`Episode ${e.n}`, `第 ${e.n} 局`)}</span>${tag}</div></div>`;
    }).join("");
    $("d-clips").querySelectorAll("video").forEach((v) => v.addEventListener("play", () => {
      $("d-clips").querySelectorAll("video").forEach((o) => o !== v && o.pause());
      $("d-clips").querySelectorAll(".clip").forEach((c) => c.classList.toggle("active", c.contains(v)));
      history.replaceState(null, "", `#task=${current.id}&ep=${v.closest(".clip").dataset.n}`);
    }));
    history.replaceState(null, "", `#task=${t.id}${ep ? `&ep=${ep}` : ""}`);
    if (ep) play(ep);
  }

  function select(id, ep) { current = byId[id] || tasks[0]; detail(ep); }
  function play(n) {
    const card = $("d-clips").querySelector(`.clip[data-n="${n}"]`);
    const v = card?.querySelector("video");
    if (!v) return;
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    v.play().catch(() => {});
  }

  $("items").addEventListener("click", (e) => { const it = e.target.closest(".titem"); if (it) select(it.dataset.id); });
  document.addEventListener("keydown", (e) => {
    if (e.target.closest?.("input")) { if (e.key === "Escape") e.target.blur(); return; }
    if (e.key === "/") { e.preventDefault(); $("q").focus(); }
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const i = visible.findIndex((t) => t.id === current.id);
      const n = visible[(i + (e.key === "ArrowDown" ? 1 : -1) + visible.length) % visible.length];
      if (n) select(n.id);
    } else if (/^[1-5]$/.test(e.key)) play(e.key);
  });
  const fromHash = () => { const m = /task=(\w+)(?:&ep=(\d))?/.exec(location.hash); return m && byId[m[1]] ? m : null; };
  window.addEventListener("hashchange", () => { const m = fromHash(); if (m && m[1] !== current.id) select(m[1], m[2]); });

  const h = fromHash();
  if (h) current = byId[h[1]];
  let first = true;
  K.page(() => { list(); detail(first && h ? h[2] : undefined); first = false; });
})();

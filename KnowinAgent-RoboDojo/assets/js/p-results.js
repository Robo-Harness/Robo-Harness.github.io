(async function () {
  const [S, T, O, R] = await Promise.all(["summary", "tasks", "official", "training"].map((n) => K.json(`data/${n}.json`)));
  const $ = (id) => document.getElementById(id);
  const DIMS = ["Generalization", "Precision", "Long-Horizon", "Memory", "Open"];
  const cmp = O.compare;
  const models = Object.keys(O.per_task);
  const tasks = T.tasks;
  const train = Object.fromEntries(R.variants.map((v) => [v.task, v]));
  const state = { dim: "all", metric: "score", merge: "split", sort: "dim" };

  const ours = Object.fromEntries(tasks.map((t) => [t.id, { score: t.score, sr: K.srOf(t) }]));
  const pick = (src, ids) => {
    const xs = ids.map((k) => src?.[k]).filter(Boolean);
    return xs.length ? { score: K.mean(xs.map((x) => x.score)), sr: K.mean(xs.map((x) => x.sr)) } : null;
  };
  function units(merge, metric) {
    const us = merge
      ? [...new Set(tasks.map((t) => t.base))].map((b) => ({ id: b, ids: tasks.filter((t) => t.base === b).map((t) => t.id) }))
      : tasks.map((t) => ({ id: t.id, ids: [t.id] }));
    return us.map((u) => {
      const first = tasks.find((t) => t.id === u.ids[0]);
      let best = null;
      for (const m of models) {
        const v = pick(O.per_task[m], u.ids);
        if (v && (!best || v[metric] > best.v[metric])) best = { m, v };
      }
      const me = pick(ours, u.ids);
      const tr = u.ids.map((i) => train[i]).filter(Boolean);
      return { ...u, link: u.ids[0], dimension: first.dimension, me, best, cols: cmp.map((m) => pick(O.per_task[m], u.ids)),
        training: tr.length ? Math.max(...tr.map((x) => x.training)) : null, reuse: tr.every((x) => x.reuses_standard),
        gap: best ? me[metric] - best.v[metric] : null };
    });
  }

  const base = units(false, "score");
  const atLeast = base.filter((r) => r.gap >= 0).length;

  $("dim").innerHTML = [["all", "All", "全部"], ...DIMS.map((d) => [d, ...K.dim(d)])].map(([v, en, zh]) => `<button data-v="${v}" class="${v === "all" ? "on" : ""}">${K.both(en, zh)}</button>`).join("");
  $("sort").innerHTML = [["dim", "By dimension", "按维度"], ["me", "By score", "按得分"], ["gap", "By margin", "按领先幅度"], ["train", "By evolving", "按进化回合"]]
    .map(([v, en, zh]) => `<button data-v="${v}" class="${v === "dim" ? "on" : ""}">${K.both(en, zh)}</button>`).join("");
  for (const k of ["dim", "metric", "merge", "sort"]) K.seg($(k), (v) => { state[k] = v; table(); });
  $("heat").addEventListener("click", (e) => { const tr = e.target.closest("tr[data-link]"); if (tr) location.href = `showcase.html#task=${tr.dataset.link}`; });

  function table() {
    const m = state.metric;
    let list = units(state.merge === "merge", m).filter((r) => state.dim === "all" || r.dimension === state.dim);
    if (state.sort === "me") list.sort((a, b) => b.me[m] - a.me[m] || (b.gap ?? 0) - (a.gap ?? 0));
    if (state.sort === "gap") list.sort((a, b) => (b.gap ?? -999) - (a.gap ?? -999));
    if (state.sort === "train") list.sort((a, b) => (a.training ?? 99) - (b.training ?? 99) || b.me[m] - a.me[m]);
    const fmt = (c) => (c ? (m === "score" ? K.f2(c.score) : `${K.f1(c.sr)}%`) : "—");
    const td = (c, cls = "") => `<td class="h ${cls}" style="background:${K.heat(c?.[m])}">${fmt(c)}</td>`;
    $("heat").querySelector("thead").innerHTML = `<tr><th>${K.L("Task", "任务")}</th><th class="r" style="white-space:nowrap">${K.L("Evolving eps.", "进化回合")}</th><th class="r">KnowinAgent-RoboDojo</th>
      ${cmp.map((x) => `<th class="r">${K.esc(x)}</th>`).join("")}<th class="r">${K.L("Best published", "官网最佳")}</th><th class="r">Δ</th></tr>`;
    const row = (r) => `<tr class="click" data-link="${r.link}"><td class="tid">${r.id}</td>
      <td class="r" style="color:var(--muted)">${r.reuse ? `0<span class="sub">${K.L("reuses standard", "沿用标准布局")}</span>` : r.training ?? "—"}</td>
      ${td(r.me, "me")}${r.cols.map((c) => td(c)).join("")}
      <td class="r">${fmt(r.best?.v)}<span class="sub">${r.best ? K.esc(r.best.m) : ""}</span></td>
      <td class="r"><span class="delta ${r.gap >= 0 ? "up" : "dn"}">${r.gap == null ? "—" : `${r.gap >= 0 ? "+" : ""}${K.f1(r.gap)}`}</span></td></tr>`;
    let html = "";
    if (state.sort === "dim") {
      for (const d of DIMS) {
        const g = list.filter((r) => r.dimension === d);
        if (g.length) html += `<tr class="grp"><td colspan="${cmp.length + 5}">${K.L(...K.dim(d))}</td></tr>` + g.map(row).join("");
      }
    } else html = list.map(row).join("");
    $("heat").querySelector("tbody").innerHTML = html;
  }

  function render() {
    $("figures").innerHTML = [
      [`${atLeast}<small>/ ${base.length}</small>`, K.L(`variants at or above the best published score (${models.length} methods)`, `个变体不低于官网逐任务最佳（共 ${models.length} 个方法）`)],
      [`+${K.f1(K.mean(base.map((r) => r.gap).filter((g) => g != null)))}`, K.L("mean margin over the best published score", "相对官网逐任务最佳的平均领先")],
      [`${S.full_score_variants}<small>/ ${S.variants}</small>`, K.L("variants at 100 in all five test episodes", "5 局全部满分的变体")],
      [`${R.median_training}`, K.L("median evolving episodes per task", "每个任务进化回合数（中位数）")],
    ].map(([v, k]) => `<div><div class="v">${v}</div><div class="k">${k}</div></div>`).join("");
    $("cap").innerHTML = K.L(
      `<b>Table 2.</b> Per-task results. “Evolving eps.” is the number of practice episodes behind the frozen knowledge; randomized-layout variants marked “reuses standard” use the standard-layout knowledge with no extra evolving. Best published is the maximum over ${models.length} methods with public per-task scores.`,
      `<b>表 2</b>　逐任务成绩。“进化回合”为冻结知识背后的练习回合数；标注“沿用标准布局”的随机布局变体直接使用标准布局的知识，没有额外进化。官网最佳取 ${models.length} 个公开逐任务成绩方法中的最高值。`);
    table();
  }
  K.page(render);
})();

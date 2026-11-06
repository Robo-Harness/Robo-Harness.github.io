(async function () {
  const [S, T, O] = await Promise.all(["summary", "tasks", "official"].map((n) => K.json(`data/${n}.json`)));
  const $ = (id) => document.getElementById(id);
  const rows = K.ranked(O, T);
  const me = rows.find((r) => r.me);
  const top = O.leaderboard[0];
  const COLS = [["average", "Overall", "综合"], ["generalizationStd", "Gen. std", "泛化·标准"], ["generalizationRand", "Gen. rand", "泛化·随机"],
    ["precision", "Precision", "精度"], ["longHorizon", "Long-Horizon", "长程"], ["memory", "Memory", "记忆"], ["open", "Open", "开放"]];
  const GROUPS = [["all", "All", "全部"], ["agent", "Agent", "Agent"], ["agent-wam", "Agent + WAM", "Agent + WAM"], ["vla", "VLA", "VLA"], ["wam", "WAM", "WAM"], ["other", "Other", "其他"]];
  const main = new Set(GROUPS.map((g) => g[0]));
  const state = { type: "all", metric: "score", key: "average", q: "" };
  const inGroup = (r, g) => g === "all" || r.type === g || (g === "other" && !main.has(r.type));

  $("type").innerHTML = GROUPS.map(([v, en, zh]) => `<button data-v="${v}" class="${v === "all" ? "on" : ""}">${K.both(en, zh)} <span style="opacity:.55">${rows.filter((r) => inGroup(r, v)).length}</span></button>`).join("");
  K.seg($("type"), (v) => { state.type = v; body(); });
  K.seg($("metric"), (v) => { state.metric = v; body(); });
  $("q").addEventListener("input", (e) => { state.q = e.target.value.trim().toLowerCase(); body(); });
  $("tbl").addEventListener("click", (e) => {
    const th = e.target.closest("th.sort"); if (!th) return;
    state.key = th.dataset.k; head(); body();
  });

  function head() {
    $("tbl").querySelector("thead").innerHTML = `<tr><th class="r">#</th><th>${K.L("Method", "方法")}</th><th>${K.L("Type", "类型")}</th>` +
      COLS.map(([k, en, zh]) => `<th class="r sort ${state.key === k ? "on" : ""}" data-k="${k}">${K.L(en, zh)}</th>`).join("") + "</tr>";
  }
  function body() {
    const m = state.metric;
    const list = rows.filter((r) => inGroup(r, state.type) && (!state.q || r.model.toLowerCase().includes(state.q) || r.team.toLowerCase().includes(state.q)))
      .sort((a, b) => (b[state.key]?.[m] ?? -1) - (a[state.key]?.[m] ?? -1));
    const fmt = (c) => (c == null ? "—" : m === "sr" ? `${K.f1(c[m])}%` : K.f2(c[m]));
    $("tbl").querySelector("tbody").innerHTML = list.map((r) => `<tr class="${r.me ? "me" : ""}">
      <td class="r" style="color:var(--quiet)">${r.rank}</td>
      <td><span class="tid ${r.me ? "m" : ""}">${K.esc(r.model)}</span>${r.me ? `<span class="badge">${K.L("Ours", "本文")}</span>` : ""}<span class="sub">${K.esc(r.team)}</span></td>
      <td>${r.type ? `<span class="type">${O.type_labels[r.type] || r.type}</span>` : ""}</td>
      ${COLS.map(([k], i) => i === 0
        ? `<td class="r"><span class="cellbar"><i style="width:${r[k][m]}%"></i></span><b style="color:var(--ink)">${fmt(r[k])}</b></td>`
        : `<td class="r">${fmt(r[k])}</td>`).join("")}
    </tr>`).join("");
  }
  function render() {
    $("figures").innerHTML = [
      [K.f2(me.average.score), K.L("KnowinAgent-RoboDojo overall score", "KnowinAgent-RoboDojo 综合得分")],
      [`#${me.rank}<small>/ ${rows.length}</small>`, K.L("rank among all simulation entries", "在全部仿真方法中的排名")],
      [`+${K.f2(me.average.score - top.average.score)}`, K.L(`over the strongest published entry (${top.model})`, `领先官网最高的 ${top.model}`)],
      [(() => { const [y, mo, d] = O.snapshot.split("-").map(Number);
        return K.L(`${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][mo - 1]} ${d}<small>${y}</small>`, `${mo} 月 ${d} 日<small>${y}</small>`); })(),
        K.L("leaderboard snapshot", "榜单快照日期")],
    ].map(([v, k]) => `<div><div class="v">${v}</div><div class="k">${K.esc(k)}</div></div>`).join("");
    $("cap").innerHTML = K.L(
      `<b>Table 1.</b> RoboDojo simulation leaderboard (${rows.length} entries). Click a column to sort; ranks follow the overall score.`,
      `<b>表 1</b>　RoboDojo 仿真榜单（共 ${rows.length} 个方法）。点击表头排序，名次按综合得分。`);
    head(); body();
  }
  K.page(render);
})();

(async function () {
  const [S, T, O, R] = await Promise.all(["summary", "tasks", "official", "training"].map((n) => K.json(`data/${n}.json`)));
  const $ = (id) => document.getElementById(id);
  const rows = K.ranked(O, T);
  const me = rows.find((r) => r.me);
  const top = O.leaderboard[0];
  const DIMS = [["average", "Overall", "综合"], ["generalization", "Generalization", "泛化"], ["precision", "Precision", "精度"],
    ["longHorizon", "Long-Horizon", "长程"], ["memory", "Memory", "记忆"], ["open", "Open", "开放"]];
  const state = { dim: "average", metric: "score", scope: "sel" };
  const fullWithin4 = Object.entries(R.full_score_by_training).filter(([k]) => +k <= 4).reduce((a, [, v]) => a + v, 0);

  $("lb-dim").innerHTML = DIMS.map(([k, en, zh]) => `<button data-v="${k}" class="${k === "average" ? "on" : ""}">${K.both(en, zh)}</button>`).join("");
  K.seg($("lb-dim"), (v) => { state.dim = v; drawRank(); drawRadar(); });
  K.seg($("lb-metric"), (v) => { state.metric = v; drawRank(); drawRadar(); });
  K.seg($("lb-scope"), (v) => { state.scope = v; drawRank(true); });

  const rowEls = new Map();
  function drawRank(rebuild) {
    const pool = state.scope === "sel" ? rows.filter((r) => r.me || O.compare.includes(r.model)) : rows.slice(0, 15);
    const key = (r) => r[state.dim]?.[state.metric] ?? -1;
    const list = pool.slice().sort((a, b) => key(b) - key(a));
    const box = $("rank");
    if (rebuild) { box.innerHTML = ""; rowEls.clear(); }
    box.style.height = `${list.length * 38}px`;
    list.forEach((r, i) => {
      let el = rowEls.get(r.model);
      if (!el) {
        el = document.createElement("div");
        el.className = `row${r.me ? " me" : ""}`;
        el.innerHTML = `<span class="i"></span><span class="n">${K.esc(r.model)}</span><div class="t"><i></i></div><span class="v"></span>`;
        el.style.top = `${i * 38}px`;
        box.append(el);
        rowEls.set(r.model, el);
      }
      const v = key(r);
      el.style.top = `${i * 38}px`;
      el.querySelector(".i").textContent = i + 1;
      el.querySelector(".v").textContent = state.metric === "sr" ? `${K.f1(v)}%` : K.f2(v);
      requestAnimationFrame(() => (el.querySelector(".t i").style.width = `${Math.max(0, v)}%`));
    });
  }

  const AXES = DIMS.slice(1);
  const COLORS = ["#5f7a99", "#7f9c86", "#b08a8f", "#8e86ad", "#b7a06b", "#6f9a9c", "#9a948b"];
  const others = O.compare.map((m, i) => ({ row: rows.find((r) => r.model === m), color: COLORS[i % COLORS.length] })).filter((x) => x.row);
  const shown = new Set([...O.compare.slice(0, 3), "GPT-6-Astra"]);
  let hot = null;

  function drawRadar() {
    const W = 500, H = 420, cx = W / 2, cy = 222, Rad = 150, n = AXES.length;
    const ang = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const at = (i, v) => [cx + Rad * (v / 100) * Math.cos(ang(i)), cy + Rad * (v / 100) * Math.sin(ang(i))];
    const ring = (v) => AXES.map((_, i) => at(i, v).map((x) => x.toFixed(1)).join(",")).join(" ");
    const val = (r, k) => Math.max(0, r[k]?.[state.metric] ?? 0);
    const fmt = (v) => (state.metric === "sr" ? `${K.f1(v)}%` : K.f1(v));
    const poly = (r, color, mine) => {
      const pts = AXES.map(([k], i) => at(i, val(r, k)));
      const tip = `${K.esc(r.model)} — ${AXES.map(([k, en, zh], i) => `${K.L(en, zh)} ${fmt(val(r, k))}`).join(" · ")}`;
      return `<g class="poly${mine ? " me" : ""}${hot === r.model ? " hot" : ""}" data-m="${K.esc(r.model)}" style="transform-origin:${cx}px ${cy}px"><title>${tip}</title>
        <polygon points="${pts.map((p) => p.map((x) => x.toFixed(1)).join(",")).join(" ")}" fill="${color}" fill-opacity="${mine ? 0.16 : 0.04}" stroke="${color}" stroke-width="${mine ? 2.4 : 1.5}" stroke-linejoin="round"/>
        ${pts.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${mine ? 3.6 : 2.4}" fill="${mine ? "#fff" : color}" stroke="${color}" stroke-width="${mine ? 2 : 0}"/>`).join("")}</g>`;
    };
    const grid = [20, 40, 60, 80, 100].map((v) => `<polygon class="ring${v === 100 ? " outer" : " dash"}" points="${ring(v)}"/>`).join("")
      + AXES.map(([k], i) => { const [x, y] = at(i, 100); return `<line class="spoke${state.dim === k ? " on" : ""}" x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`; }).join("")
    const ticks = [20, 40, 60, 80, 100].map((v) => `<text class="tick" x="${cx + 4}" y="${(cy - Rad * v / 100 - 3).toFixed(1)}">${v}</text>`).join("");
    const labels = AXES.map(([k, en, zh], i) => {
      const [x, y] = at(i, 100 + 15), c = Math.cos(ang(i));
      const anchor = Math.abs(c) < 0.2 ? "middle" : c > 0 ? "start" : "end";
      const dy = Math.sin(ang(i)) < -0.5 ? -14 : Math.sin(ang(i)) > 0.5 ? 6 : -4;
      return `<text class="ax${state.dim === k ? " on" : ""}" x="${x.toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="${anchor}">${K.L(en, zh)}</text>
        <text class="axv" x="${x.toFixed(1)}" y="${(y + dy + 17).toFixed(1)}" text-anchor="${anchor}">${fmt(val(me, k))}</text>`;
    }).join("");
    const box = $("radar");
    box.classList.toggle("hl", !!hot);
    box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${K.L("Five-dimension radar chart", "五维雷达图")}">${grid}
      ${others.filter((o) => shown.has(o.row.model)).map((o) => poly(o.row, o.color, false)).join("")}${poly(me, "#8c6b45", true)}${ticks}${labels}</svg>`;

    $("radar-legend").innerHTML = [`<button class="me" data-m="${K.esc(me.model)}"><i style="background:#8c6b45"></i>${K.esc(me.model)}</button>`,
      ...others.map((o) => `<button class="${shown.has(o.row.model) ? "" : "off"}" data-m="${K.esc(o.row.model)}"><i style="background:${o.color}"></i>${K.esc(o.row.model)}</button>`)].join("");
  }
  $("radar-legend").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b || b.classList.contains("me")) return;
    const m = b.dataset.m; shown.has(m) ? shown.delete(m) : shown.add(m); drawRadar();
  });
  const setHot = (m) => { if (hot === m) return; hot = m; $("radar").classList.toggle("hl", !!m); $("radar").querySelectorAll(".poly").forEach((g) => g.classList.toggle("hot", g.dataset.m === m)); };
  $("radar-legend").addEventListener("mouseover", (e) => { const b = e.target.closest("button"); setHot(b && (b.classList.contains("me") || shown.has(b.dataset.m)) ? b.dataset.m : null); });
  $("radar-legend").addEventListener("mouseleave", () => setHot(null));
  $("radar").addEventListener("mouseover", (e) => setHot(e.target.closest(".poly")?.dataset.m ?? null));
  $("radar").addEventListener("mouseleave", () => setHot(null));

  function render() {
    $("figures").innerHTML = [
      [K.f2(me.average.score), K.L(`RoboDojo simulation score — #${me.rank} of ${rows.length} methods`, `RoboDojo 仿真综合得分，${rows.length} 个方法中第 ${me.rank}`)],
      [`${R.median_training}`, K.L("median evolving episodes behind each task's knowledge", "每个任务知识背后的进化回合数（中位数）")],
      [`${S.full_score_variants}<small>/ ${S.variants}</small>`, K.L("task variants at 100 in all five test episodes", "5 局测试全部满分的任务变体")],
      [`${R.random_reuse}<small>/ ${R.random_variants}</small>`, K.L("randomized layouts solved with zero extra evolving", "随机布局变体无需额外进化")],
    ].map(([v, k]) => `<div><div class="v">${v}</div><div class="k">${k}</div></div>`).join("");

    $("lb-lead").innerHTML = K.L(
      `Under the official five-dimension formula, KnowinAgent-RoboDojo scores <b>${K.f2(me.average.score)}</b>, ahead of the strongest published entry, ${K.esc(top.model)} (${K.f2(top.average.score)}), and far above the official reference harness built on the same base model. Switch dimensions to re-rank.`,
      `在官方五维计分公式下，KnowinAgent-RoboDojo 得分 <b>${K.f2(me.average.score)}</b>，高于官网榜单最高的 ${K.esc(top.model)}（${K.f2(top.average.score)}），也远高于同一基座模型的官方参考外壳。切换维度可重新排序。`);

    const budgets = Object.keys(R.variants_by_training).map(Number).sort((a, b) => a - b);
    const maxN = Math.max(...budgets.map((b) => R.variants_by_training[b]));
    $("cols").innerHTML = budgets.map((b) => {
      const n = R.variants_by_training[b];
      const f = R.full_score_by_training[b] || 0;
      return `<div class="col"><span class="lbl">${n}</span><div class="stack" style="height:${(n / maxN) * 88}%">
        <i class="a" style="height:${(f / n) * 100}%"></i><i class="b" style="height:${((n - f) / n) * 100}%"></i></div></div>`;
    }).join("");
    $("cols-x").innerHTML = budgets.map((b) => `<span>${b} ${b === 1 ? "episode" : "episodes"}</span>`).join("");

    $("facts").innerHTML = [
      [`${R.median_training}`, K.L(`<b>Median evolving episodes</b> behind the ${R.knowledge_versions} frozen knowledge versions used at test time.`, `测试所用的 ${R.knowledge_versions} 份冻结知识，<b>进化回合数中位数</b>为 ${R.median_training}。`)],
      [`${fullWithin4}<small>/${R.full_score_variants}</small>`, K.L(`Variants scoring 100 in every test episode that needed <b>four or fewer</b> evolving episodes; ${R.full_score_by_training[2] || 0} of them needed only two.`, `5 局全满分的变体中，<b>不超过 4 个进化回合</b>的占 ${fullWithin4} 个，其中 ${R.full_score_by_training[2] || 0} 个仅用 2 个回合。`)],
      [`${R.within_four}<small>/${R.knowledge_versions}</small>`, K.L("Knowledge versions evolved within the <b>four-episode budget</b>; only a handful of the hardest tasks went further.", `在 <b>4 个回合的进化上限</b>内完成的知识版本；只有少数最难的任务超过上限。`)],
      [`${R.random_reuse}<small>/${R.random_variants}</small>`, K.L("Randomized-layout variants that reuse the standard-layout knowledge with <b>no additional evolving</b>.", `随机布局变体直接复用标准布局的知识，<b>无需额外进化</b>。`)],
    ].map(([v, p]) => `<div><div class="v">${v}</div><p>${p}</p></div>`).join("");

    $("beyond").innerHTML = `<thead><tr><th>${K.L("Task", "任务")}</th><th class="r">${K.L("≤ 4 episodes", "≤ 4 个回合")}</th><th class="r">${K.L("6 episodes", "6 个回合")}</th><th class="r">${K.L("Change", "变化")}</th></tr></thead><tbody>` +
      R.beyond_four.map((b) => {
        const d = b.high.mean - b.low.mean;
        return `<tr><td class="tid">${b.task}</td><td class="r">${K.f1(b.low.mean)} <span style="color:var(--quiet)">(${b.low.training} ${K.L("ep.", "回合")})</span></td>
          <td class="r">${K.f1(b.high.mean)}</td><td class="r"><span class="delta ${d >= 0 ? "up" : "dn"}">${d >= 0 ? "+" : ""}${K.f1(d)}</span></td></tr>`;
      }).join("") + "</tbody>";

    drawRank(true);
    drawRadar();
  }

  const byId = Object.fromEntries(T.tasks.map((t) => [t.id, t]));
  $("tiles").innerHTML = S.featured.map(({ task: id, ep }) => {
    const t = byId[id];
    const e = t.episodes.find((x) => x.n === ep);
    return `<a class="tile" href="showcase.html#task=${id}&ep=${e.n}" data-src="${e.video}"><img src="${e.poster}" alt="${id}" loading="lazy"><div class="c"><span>${id}</span></div></a>`;
  }).join("");
  if (matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".tile").forEach((el) => {
      let v;
      el.addEventListener("mouseenter", () => {
        v ||= el.insertBefore(Object.assign(document.createElement("video"), { src: el.dataset.src, muted: true, loop: true, playsInline: true }), el.firstChild);
        v.play().then(() => el.classList.add("playing")).catch(() => {});
      });
      el.addEventListener("mouseleave", () => { v?.pause(); el.classList.remove("playing"); });
    });
  }

  K.page(render);
  K.reveal();
})();

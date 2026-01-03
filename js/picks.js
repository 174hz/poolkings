// picks.js – handles picks UI for a single pool

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function savePicksToLocal(poolId, state) {
  const raw = localStorage.getItem("pk_saved_picks");
  let arr = [];
  if (raw) {
    try {
      arr = JSON.parse(raw);
      if (!Array.isArray(arr)) arr = [];
    } catch (e) {
      arr = [];
    }
  }
  const entry = {
    poolId: Number(poolId),
    winner: state.winner,
    total: state.total,
    firstToScore: state.firstToScore,
    timestamp: new Date().toISOString()
  };
  arr = arr.filter(x => x.poolId !== entry.poolId);
  arr.push(entry);
  localStorage.setItem("pk_saved_picks", JSON.stringify(arr));
}

function buildPicksForm(pool, poolId) {
  const container = document.getElementById("picks-form");
  const summaryBody = document.getElementById("pick-summary-body");
  if (!container || !summaryBody) return;

  const state = {
    winner: null,
    total: null,
    firstToScore: null
  };

  function updateSummary() {
    summaryBody.innerHTML = `
      <div class="pick-summary-row"><strong>Winner:</strong> ${state.winner || "No selection yet"}</div>
      <div class="pick-summary-row"><strong>Total:</strong> ${state.total || "No selection yet"}</div>
      <div class="pick-summary-row"><strong>First to score:</strong> ${state.firstToScore || "No selection yet"}</div>
    `;
  }

  function optionTemplate(group, value, label) {
    return `<button type="button" class="pick-option" data-group="${group}" data-value="${value}">${label}</button>`;
  }

  container.innerHTML = `
    <div class="pick-group">
      <h3>Pick the winner</h3>
      <div class="pick-options" data-group="winner">
        ${optionTemplate("winner", pool.homeTeam, pool.homeTeam)}
        ${optionTemplate("winner", pool.awayTeam, pool.awayTeam)}
      </div>
    </div>

    <div class="pick-group">
      <h3>Pick the total (over/under ${pool.totalLine})</h3>
      <div class="pick-options" data-group="total">
        ${optionTemplate("total", "Over", `Over ${pool.totalLine}`)}
        ${optionTemplate("total", "Under", `Under ${pool.totalLine}`)}
      </div>
    </div>

    <div class="pick-group">
      <h3>Who scores first?</h3>
      <div class="pick-options" data-group="firstToScore">
        ${pool.firstToScoreOptions.map(opt => optionTemplate("firstToScore", opt, opt)).join("")}
      </div>
    </div>
  `;

  updateSummary();

  container.addEventListener("click", (event) => {
    const btn = event.target.closest(".pick-option");
    if (!btn) return;

    const group = btn.getAttribute("data-group");
    const value = btn.getAttribute("data-value");
    if (!group || !value) return;

    container.querySelectorAll(`.pick-option[data-group="${group}"]`).forEach(b => {
      b.classList.remove("selected");
    });

    btn.classList.add("selected");
    if (group === "winner") state.winner = value;
    if (group === "total") state.total = value;
    if (group === "firstToScore") state.firstToScore = value;

    updateSummary();
  });

  const submitBtn = document.getElementById("submit-picks");
  const statusEl = document.getElementById("submit-status");

  if (submitBtn && statusEl) {
    submitBtn.addEventListener("click", () => {
      if (!state.winner || !state.total || !state.firstToScore) {
        statusEl.textContent = "Please complete all three picks before locking in.";
        statusEl.style.color = "#F97316";
        return;
      }

      savePicksToLocal(poolId, state);
      statusEl.textContent = "Your picks are locked in for this pool and saved under My Picks.";
      statusEl.style.color = "#22C55E";
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const poolId = getQueryParam("poolId");
  const pool = getPoolById ? getPoolById(poolId) : null;

  const titleEl = document.getElementById("pool-title");
  const metaEl = document.getElementById("pool-meta");

  if (!pool) {
    if (titleEl) titleEl.textContent = "Pool not found";
    if (metaEl) metaEl.textContent = "The pool you’re looking for may have expired or no longer exists.";
    return;
  }

  if (titleEl) titleEl.textContent = pool.title;
  if (metaEl) {
    metaEl.textContent = `${pool.league} · ${pool.awayTeam} @ ${pool.homeTeam} · Deadline: ${new Date(pool.deadline).toLocaleString()}`;
  }

  buildPicksForm(pool, pool.id);
});

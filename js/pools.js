// pools.js – loads pool data and builds the multi‑game slate

async function loadPools() {
  const response = await fetch("data/pools.json");
  return response.json();
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

document.addEventListener("DOMContentLoaded", async () => {
  const poolId = getQueryParam("poolId");
  const pools = await loadPools();

  const pool = pools.find(p => String(p.id) === String(poolId));

  const titleEl = document.getElementById("pool-title");
  const metaEl = document.getElementById("pool-meta");
  const slateEl = document.getElementById("games-slate");

  if (!pool) {
    if (titleEl) titleEl.textContent = "Pool not found";
    if (metaEl) metaEl.textContent = "This pool may have expired or no longer exists.";
    return;
  }

  // Set pool header
  if (titleEl) titleEl.textContent = pool.title;
  if (metaEl) {
    metaEl.textContent = `${pool.league} · ${pool.games.length} games · Deadline: ${new Date(pool.deadline).toLocaleString()}`;
  }

  // Build each game row
  pool.games.forEach((game, index) => {
    const row = document.createElement("div");
    row.className = "game-row";
    row.setAttribute("data-game-id", `game-${index + 1}`);

    row.innerHTML = `
      <div class="game-info">
        <div class="game-title">${game.awayTeam} @ ${game.homeTeam}</div>
        <div class="game-meta">${game.startTime}</div>
      </div>

      <div class="game-scroll">

        <!-- Winner -->
        <div class="market-group">
          <div class="market-label">Winner</div>
          <button class="pick-option" data-market="winner" data-value="${game.homeTeam}">${game.homeTeam}</button>
          <button class="pick-option" data-market="winner" data-value="${game.awayTeam}">${game.awayTeam}</button>
        </div>

        <!-- Total -->
        <div class="market-group">
          <div class="market-label">Total ${game.totalLine}</div>
          <button class="pick-option" data-market="total" data-value="Over">Over ${game.totalLine}</button>
          <button class="pick-option" data-market="total" data-value="Under">Under ${game.totalLine}</button>
        </div>

        <!-- First to Score -->
        <div class="market-group">
          <div class="market-label">First to Score</div>
          ${game.firstToScoreOptions
            .map(opt => `<button class="pick-option" data-market="firstToScore" data-value="${opt}">${opt}</button>`)
            .join("")}
        </div>

      </div>
    `;

    slateEl.appendChild(row);
  });
});

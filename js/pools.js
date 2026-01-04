async function loadPools() {
  const response = await fetch("data/pools.json");
  return response.json();
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function getSportIcon(sport) {
  const s = sport.toUpperCase();
  if (s === "NHL") return "🏒";
  if (s === "NFL") return "🏈";
  if (s === "NBA") return "🏀";
  return "🎯";
}

function getStatusBadgeClass(status) {
  return status.toLowerCase() === "live"
    ? "pool-status-live"
    : "pool-status-upcoming";
}

function getTeamLogo(team) {
  return `<img src="img/logos/${team.toLowerCase()}.png" class="team-logo" />`;
}

document.addEventListener("DOMContentLoaded", async () => {
  const poolId = getQueryParam("poolId");
  const pools = await loadPools();
  const pool = pools.find(p => String(p.id) === String(poolId));

  const titleEl = document.getElementById("pool-title");
  const metaEl = document.getElementById("pool-meta");
  const countdownEl = document.getElementById("pool-countdown");
  const slateEl = document.getElementById("games-slate");

  if (!pool) {
    titleEl.textContent = "Pool not found";
    metaEl.textContent = "This pool may have expired or no longer exists.";
    return;
  }

  // Sticky header
  titleEl.innerHTML = `
    <span class="pool-sport-icon">${getSportIcon(pool.sport)}</span>
    ${pool.title}
    <span class="pool-status-badge ${getStatusBadgeClass(pool.status)}">
      ${pool.status}
    </span>
  `;

  metaEl.textContent = `${pool.league} · ${pool.games.length} games`;

  // Countdown timer
  function updateCountdown() {
    const now = new Date();
    const deadline = new Date(pool.deadline);
    const diff = deadline - now;

    if (diff <= 0) {
      countdownEl.textContent = "Deadline passed";
      return;
    }

    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    countdownEl.textContent = `Deadline in ${hrs}h ${mins}m ${secs}s`;
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Build game rows
  pool.games.forEach((game, index) => {
    const row = document.createElement("div");
    row.className = "game-row";
    row.setAttribute("data-game-id", `game-${index + 1}`);

    row.innerHTML = `
      <div class="game-info">
        <div class="game-title">
          ${getTeamLogo(game.awayTeam)} ${game.awayTeam}
          @
          ${getTeamLogo(game.homeTeam)} ${game.homeTeam}
        </div>
        <div class="game-meta">${game.startTime}</div>
      </div>

      <div class="game-scroll">

        <div class="market-group">
          <div class="market-label">Winner</div>
          <button class="pick-option" data-market="winner" data-value="${game.homeTeam}">${game.homeTeam}</button>
          <button class="pick-option" data-market="winner" data-value="${game.awayTeam}">${game.awayTeam}</button>
        </div>

        <div class="market-group">
          <div class="market-label">Total ${game.totalLine}</div>
          <button class="pick-option" data-market="total" data-value="Over">Over ${game.totalLine}</button>
          <button class="pick-option" data-market="total" data-value="Under">Under ${game.totalLine}</button>
        </div>

        <div class="market-group">
          <div class="market-label">First to Score</div>
          ${game.firstToScoreOptions
            .map(opt => `<button class="pick-option" data-market="firstToScore" data-value="${opt}">${opt}</button>`)
            .join("")}
        </div>

      </div>
    `;

    slateEl.appendChild(row);

    // Separator like FanDuel
    if (index < pool.games.length - 1) {
      const sep = document.createElement("div");
      sep.className = "game-separator";
      slateEl.appendChild(sep);
    }
  });

  document.dispatchEvent(new CustomEvent("poolSlateReady"));
});

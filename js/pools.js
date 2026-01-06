 async function loadPool() {
  const urlParams = new URLSearchParams(window.location.search);
  const poolId = urlParams.get("id");

  if (!poolId) {
    document.getElementById("pool-title").textContent = "Pool not found";
    return;
  }

  try {
    const response = await fetch(`pools/${poolId}.json`);
    if (!response.ok) throw new Error("Pool file not found");
    const pool = await response.json();

    renderPool(pool);
    restorePicks(pool.id);
  } catch (err) {
    document.getElementById("pool-title").textContent = "Pool not found";
    console.error(err);
  }
}

function renderPool(pool) {
  const titleEl = document.getElementById("pool-title");
  const metaEl = document.getElementById("pool-meta");
  const cardEl = document.getElementById("pool-card");

  titleEl.textContent = pool.title || "Pool";
  metaEl.textContent = pool.description || "";

  cardEl.innerHTML = "";

  let gameNumber = 1;

  (pool.games || []).forEach((game) => {
    const row = document.createElement("div");
    row.className = "game-row";
    row.dataset.gameId = game.id;

    const ouLine = game.overUnder != null ? game.overUnder : "-";

    row.innerHTML = `
      <span class="game-number">${gameNumber}.</span>

      <span class="matchup">
        ${game.visitor} (V) @ ${game.home} (H)
      </span>

      <span class="prop">
        Winner:
        <button class="pick-option" data-prop="winner" data-value="V">V</button>
        <button class="pick-option" data-prop="winner" data-value="H">H</button>
      </span>

      <span class="prop">
        O/U ${ouLine}:
        <button class="pick-option" data-prop="ou" data-value="Over">O</button>
        <button class="pick-option" data-prop="ou" data-value="Under">U</button>
      </span>

      <span class="prop">
        1st Score:
        <button class="pick-option" data-prop="first" data-value="V">V</button>
        <button class="pick-option" data-prop="first" data-value="H">H</button>
      </span>
    `;

    cardEl.appendChild(row);
    gameNumber++;
  });

  enablePickLogic(pool.id);
}

function enablePickLogic(poolId) {
  const buttons = document.querySelectorAll(".pick-option");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = btn.closest(".game-row");
      const prop = btn.dataset.prop;

      row.querySelectorAll(`.pick-option[data-prop="${prop}"]`)
        .forEach((b) => b.classList.remove("selected"));

      btn.classList.add("selected");

      savePicks(poolId);
    });
  });

  const submitBtn = document.getElementById("submit-picks");
  submitBtn.addEventListener("click", () => {
    savePicks(poolId);
    showToast("Your picks have been submitted.");
  });
}

function savePicks(poolId) {
  const rows = document.querySelectorAll(".game-row");
  const picks = {};

  rows.forEach((row) => {
    const gameId = row.dataset.gameId;
    picks[gameId] = {
      winner:
        row.querySelector('.pick-option[data-prop="winner"].selected')
          ?.dataset.value || null,
      ou:
        row.querySelector('.pick-option[data-prop="ou"].selected')
          ?.dataset.value || null,
      first:
        row.querySelector('.pick-option[data-prop="first"].selected')
          ?.dataset.value || null,
    };
  });

  localStorage.setItem(`picks-${poolId}`, JSON.stringify(picks));
}

function restorePicks(poolId) {
  const stored = localStorage.getItem(`picks-${poolId}`);
  if (!stored) return;

  let picks;
  try {
    picks = JSON.parse(stored);
  } catch {
    return;
  }

  Object.entries(picks).forEach(([gameId, gamePicks]) => {
    const row = document.querySelector(`.game-row[data-game-id="${gameId}"]`);
    if (!row) return;

    if (gamePicks.winner) {
      const btn = row.querySelector(
        `.pick-option[data-prop="winner"][data-value="${gamePicks.winner}"]`
      );
      if (btn) btn.classList.add("selected");
    }

    if (gamePicks.ou) {
      const btn = row.querySelector(
        `.pick-option[data-prop="ou"][data-value="${gamePicks.ou}"]`
      );
      if (btn) btn.classList.add("selected");
    }

    if (gamePicks.first) {
      const btn = row.querySelector(
        `.pick-option[data-prop="first"][data-value="${gamePicks.first}"]`
      );
      if (btn) btn.classList.add("selected");
    }
  });
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hidden");
  }, 2000);
}

loadPool();

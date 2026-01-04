function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

(function setupPoolInteractions() {
  const submitBtn = document.getElementById("submit-pool-picks");
  const statusEl = document.getElementById("submit-status");
  const toast = document.getElementById("toast");
  const poolId = getQueryParam("poolId");

  if (!poolId) return;

  const state = {};

  function ensureGameState(gameId) {
    if (!state[gameId]) {
      state[gameId] = { winner: null, total: null, firstToScore: null };
    }
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.remove("hidden");
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.classList.add("hidden"), 300);
    }, 1500);
  }

  function savePicks() {
    localStorage.setItem(`poolPicks_${poolId}`, JSON.stringify(state));
    showToast("Your picks were saved");
  }

  function loadSavedPicks() {
    const raw = localStorage.getItem(`poolPicks_${poolId}`);
    if (!raw) return;

    const saved = JSON.parse(raw);
    Object.assign(state, saved);

    Object.entries(state).forEach(([gameId, picks]) => {
      const row = document.querySelector(`.game-row[data-game-id="${gameId}"]`);
      if (!row) return;

      ["winner", "total", "firstToScore"].forEach(market => {
        const value = picks[market];
        if (!value) return;

        const btn = row.querySelector(
          `.pick-option[data-market="${market}"][data-value="${value}"]`
        );
        if (btn) btn.classList.add("selected");
      });
    });
  }

  document.addEventListener("poolSlateReady", () => {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".pick-option");
      if (!btn) return;

      const row = btn.closest(".game-row");
      const gameId = row.getAttribute("data-game-id");
      const market = btn.dataset.market;
      const value = btn.dataset.value;

      ensureGameState(gameId);

      row.querySelectorAll(`.pick-option[data-market="${market}"]`)
        .forEach(b => b.classList.remove("selected"));

      btn.classList.add("selected");
      state[gameId][market] = value;

      savePicks();
    });

    loadSavedPicks();
  });

  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      const missing = Object.values(state).some(
        p => !p.winner || !p.total || !p.firstToScore
      );

      if (missing) {
        statusEl.textContent = "Please complete all picks.";
        statusEl.style.color = "#F97316";
        return;
      }

      savePicks();
      statusEl.textContent = "Your picks are locked in.";
      statusEl.style.color = "#22C55E";
    });
  }
})();

// pool-multi.js – handles multi-game Proline-style pick interactions

document.addEventListener("DOMContentLoaded", () => {
  const rows = document.querySelectorAll(".game-row");
  const submitBtn = document.getElementById("submit-pool-picks");
  const statusEl = document.getElementById("submit-status");

  if (!rows.length) return;

  // Track selections for each game
  const state = {};

  rows.forEach(row => {
    const gameId = row.getAttribute("data-game-id");
    if (!gameId) return;

    // Initialize state for this game
    state[gameId] = {
      winner: null,
      total: null,
      firstToScore: null
    };

    // Handle clicks inside this game row
    row.addEventListener("click", (e) => {
      const btn = e.target.closest(".pick-option");
      if (!btn) return;

      const market = btn.dataset.market;
      const value = btn.dataset.value;
      if (!market || !value) return;

      // Unselect other picks in this market for this game
      row.querySelectorAll(`.pick-option[data-market="${market}"]`)
         .forEach(b => b.classList.remove("selected"));

      // Select this one
      btn.classList.add("selected");

      // Update state
      if (market === "winner") state[gameId].winner = value;
      if (market === "total") state[gameId].total = value;
      if (market === "firstToScore") state[gameId].firstToScore = value;
    });
  });

  // Handle submit
  if (submitBtn && statusEl) {
    submitBtn.addEventListener("click", () => {
      // Check if all games have all 3 picks
      const incomplete = Object.entries(state).filter(([_, picks]) => {
        return !picks.winner || !picks.total || !picks.firstToScore;
      });

      if (incomplete.length) {
        statusEl.textContent = "Please make all three picks for every game before submitting.";
        statusEl.style.color = "#F97316";
        return;
      }

      // For now: log the results (later we can save to localStorage or backend)
      console.log("Multi-game picks:", state);

      statusEl.textContent = "Your picks are locked in for this pool.";
      statusEl.style.color = "#22C55E";
    });
  }
});

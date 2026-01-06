let adminPool = null;
let adminEntries = null;
let adminResults = null;

function readJsonFile(input, callback) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target.result);
      callback(json);
    } catch (err) {
      alert("Invalid JSON file.");
      console.error(err);
    }
  };
  reader.readAsText(file);
}

document.getElementById("pool-file").addEventListener("change", (e) => {
  readJsonFile(e.target, (json) => {
    adminPool = json;
    const info = document.getElementById("pool-info");
    info.textContent = `Loaded pool: ${json.id} — ${json.title}`;
  });
});

document.getElementById("entries-file").addEventListener("change", (e) => {
  readJsonFile(e.target, (json) => {
    adminEntries = json;
  });
});

document.getElementById("results-file").addEventListener("change", (e) => {
  readJsonFile(e.target, (json) => {
    adminResults = json;
  });
});

document.getElementById("score-button").addEventListener("click", () => {
  if (!adminPool || !adminEntries || !adminResults) {
    alert("Please load pool, entries, and results.");
    return;
  }

  const leaderboard = scorePool(adminPool, adminEntries, adminResults);
  renderLeaderboardTable(leaderboard);
  renderLeaderboardJson(leaderboard, adminPool.id);
});

function scorePool(pool, entries, results) {
  // entries: [{ userId, username, picks: { gameId: { winner, ou, first } } }]
  const scores = [];

  entries.forEach((entry) => {
    let score = 0;

    Object.entries(entry.picks || {}).forEach(([gameId, userPick]) => {
      const gameResult = results[gameId];
      if (!gameResult) return;

      if (userPick.winner && userPick.winner === gameResult.winner) score++;
      if (userPick.ou && userPick.ou === gameResult.ou) score++;
      if (userPick.first && userPick.first === gameResult.first) score++;
    });

    scores.push({
      userId: entry.userId,
      username: entry.username,
      score,
    });
  });

  scores.sort((a, b) => b.score - a.score);

  return scores.map((s, index) => ({
    rank: index + 1,
    userId: s.userId,
    username: s.username,
    score: s.score,
  }));
}

function renderLeaderboardTable(leaderboard) {
  const tbody = document.querySelector("#leaderboard-table tbody");
  tbody.innerHTML = "";

  leaderboard.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.rank}</td>
      <td>${row.username}</td>
      <td>${row.score}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderLeaderboardJson(leaderboard, poolId) {
  const json = {
    poolId,
    leaderboard,
  };
  document.getElementById("leaderboard-json").value = JSON.stringify(
    json,
    null,
    2
  );
}

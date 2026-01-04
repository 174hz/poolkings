// pools-list.js – displays all pools from pools.json

async function loadPools() {
  const response = await fetch("data/pools.json");
  return response.json();
}

document.addEventListener("DOMContentLoaded", async () => {
  const listEl = document.getElementById("pools-list");
  const pools = await loadPools();

  if (!pools || pools.length === 0) {
    listEl.innerHTML = "<p>No pools available.</p>";
    return;
  }

  pools.forEach(pool => {
    const card = document.createElement("div");
    card.className = "pool-card";

    card.innerHTML = `
      <div class="pool-card-title">${pool.title}</div>
      <div class="pool-card-meta">
        ${pool.league} · ${pool.games.length} game${pool.games.length > 1 ? "s" : ""}
      </div>
      <div class="pool-card-deadline">
        Deadline: ${new Date(pool.deadline).toLocaleString()}
      </div>
      <a class="pool-card-button" href="pools.html?poolId=${pool.id}">
        View Pool
      </a>
    `;

    listEl.appendChild(card);
  });
});

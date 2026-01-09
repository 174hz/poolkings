// pools-list.js – displays all pools from pools/pools.json

async function loadPools() {
  try {
    const response = await fetch("pools/pools.json");
    if (!response.ok) throw new Error("Failed to load pools.json");
    return await response.json();
  } catch (err) {
    console.error("Error loading pools:", err);
    return [];
  }
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
    card.className = "pool-card-list";

    const gameCount = pool.games?.length || 0;
    const deadline = new Date(pool.deadline).toLocaleString();

    card.innerHTML = `
      <div class="pool-card-list-header">
        <span class="pool-card-list-title">${pool.title}</span>
        <span class="pool-card-list-league">${pool.league}</span>
      </div>

      <div class="pool-card-list-meta">
        ${gameCount} game${gameCount !== 1 ? "s" : ""} • Deadline: ${deadline}
      </div>

      <a class="pool-card-list-button" href="pools.html?id=${pool.id}">
        View Pool
      </a>
    `;

    listEl.appendChild(card);
  });
});

// main.js – shared behavior for homepage and pools listing

function formatDeadline(deadlineIso) {
  const d = new Date(deadlineIso);
  if (Number.isNaN(d.getTime())) return "TBD";
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function renderFeaturedPool() {
  const container = document.getElementById("featured-pool");
  if (!container || !Array.isArray(POOLKINGS_POOLS) || POOLKINGS_POOLS.length === 0) return;

  const pool = POOLKINGS_POOLS[0];
  container.innerHTML = `
    <div class="card">
      <div class="card-meta">${pool.league} · ${pool.status}</div>
      <h3>${pool.title}</h3>
      <p class="card-meta">
        ${pool.awayTeam} @ ${pool.homeTeam}<br>
        Deadline: ${formatDeadline(pool.deadline)}
      </p>
      <div class="card-meta">
        Markets: ${pool.markets.join(" · ")}
      </div>
      <div style="margin-top:12px;">
        <a href="picks.html?poolId=${pool.id}" class="btn-primary">Make picks</a>
      </div>
    </div>
  `;
}

function renderHomePoolList() {
  const container = document.getElementById("home-pool-list");
  if (!container) return;

  const poolsToShow = POOLKINGS_POOLS.slice(0, 3);
  container.innerHTML = poolsToShow.map(pool => {
    return `
      <div class="pool-card">
        <div class="pool-card-title">${pool.title}</div>
        <div class="pool-card-meta">${pool.league} · ${pool.status}</div>
        <div class="pool-card-meta">
          ${pool.awayTeam} @ ${pool.homeTeam} · Deadline: ${formatDeadline(pool.deadline)}
        </div>
        <div class="pool-card-meta">
          ${pool.markets.map(m => `<span class="pool-tag">${m}</span>`).join(" ")}
        </div>
        <div class="pool-card-footer">
          <a href="picks.html?poolId=${pool.id}" class="btn-secondary">Enter pool</a>
        </div>
      </div>
    `;
  }).join("");
}

function renderAllPoolsList() {
  const container = document.getElementById("all-pools-list");
  if (!container) return;

  container.innerHTML = POOLKINGS_POOLS.map(pool => {
    return `
      <div class="pool-card">
        <div class="pool-card-title">${pool.title}</div>
        <div class="pool-card-meta">${pool.league} · ${pool.status}</div>
        <div class="pool-card-meta">
          ${pool.awayTeam} @ ${pool.homeTeam} · Deadline: ${formatDeadline(pool.deadline)}
        </div>
        <div class="pool-card-meta">
          ${pool.markets.map(m => `<span class="pool-tag">${m}</span>`).join(" ")}
        </div>
        <div class="pool-card-footer">
          <a href="picks.html?poolId=${pool.id}" class="btn-primary">Make picks</a>
        </div>
      </div>
    `;
  }).join("");
}

// ====== Simple email capture / sign-up ======

function initSignup() {
  const signupBtn = document.getElementById("signup-btn");
  const modal = document.getElementById("signup-modal");
  const submitBtn = document.getElementById("signup-submit");
  const emailInput = document.getElementById("signup-email");
  const statusEl = document.getElementById("signup-status");

  if (!signupBtn || !modal || !submitBtn || !emailInput || !statusEl) return;

  const savedEmail = localStorage.getItem("pk_user_email");
  if (savedEmail) {
    signupBtn.textContent = savedEmail;
    signupBtn.classList.add("active");
    signupBtn.style.pointerEvents = "none";
  } else {
    signupBtn.addEventListener("click", (e) => {
      e.preventDefault();
      modal.classList.remove("hidden");
    });
  }

  submitBtn.addEventListener("click", () => {
    const email = emailInput.value.trim();
    if (!email || !email.includes("@")) {
      statusEl.textContent = "Please enter a valid email.";
      statusEl.style.color = "#F97316";
      return;
    }

    localStorage.setItem("pk_user_email", email);
    statusEl.textContent = "You're signed up! Welcome to PoolKings.";
    statusEl.style.color = "#22C55E";

    setTimeout(() => {
      modal.classList.add("hidden");
      signupBtn.textContent = email;
      signupBtn.classList.add("active");
      signupBtn.style.pointerEvents = "none";
    }, 800);
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderFeaturedPool();
  renderHomePoolList();
  renderAllPoolsList();
  initSignup();
});

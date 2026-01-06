// Load pool JSON
async function loadPool() {
    const urlParams = new URLSearchParams(window.location.search);
    const poolId = urlParams.get("id");

    const response = await fetch(`pools/${poolId}.json`);
    const pool = await response.json();

    document.getElementById("pool-title").textContent = pool.title;

    const container = document.getElementById("pool-card");
    container.innerHTML = "";

    let gameNumber = 1;

    pool.games.forEach(game => {
        const row = document.createElement("div");
        row.className = "game-row";
        row.dataset.gameId = game.id;

        row.innerHTML = `
            <span class="game-number">${gameNumber}.</span>

            <span class="matchup">
                ${game.visitor} (V) @ ${game.home} (H)
            </span>

            <span class="prop">
                Winner:
                <button class="pill" data-prop="winner" data-value="V">V</button>
                <button class="pill" data-prop="winner" data-value="H">H</button>
            </span>

            <span class="prop">
                O/U ${game.overUnder}:
                <button class="pill" data-prop="ou" data-value="Over">O</button>
                <button class="pill" data-prop="ou" data-value="Under">U</button>
            </span>

            <span class="prop">
                1st Score:
                <button class="pill" data-prop="first" data-value="V">V</button>
                <button class="pill" data-prop="first" data-value="H">H</button>
            </span>
        `;

        container.appendChild(row);
        gameNumber++;
    });

    enablePillLogic(pool.id);
}

loadPool();


// Pill selection + storage
function enablePillLogic(poolId) {
    const pills = document.querySelectorAll(".pill");

    pills.forEach(pill => {
        pill.addEventListener("click", () => {
            const row = pill.closest(".game-row");
            const prop = pill.dataset.prop;
            const value = pill.dataset.value;

            // Unselect siblings
            row.querySelectorAll(`.pill[data-prop="${prop}"]`)
                .forEach(p => p.classList.remove("selected"));

            // Select clicked pill
            pill.classList.add("selected");

            savePick(poolId);
        });
    });
}


// Save picks to localStorage
function savePick(poolId) {
    const rows = document.querySelectorAll(".game-row");
    const picks = {};

    rows.forEach(row => {
        const gameId = row.dataset.gameId;

        picks[gameId] = {
            winner: row.querySelector('.pill[data-prop="winner"].selected')?.dataset.value || null,
            ou: row.querySelector('.pill[data-prop="ou"].selected')?.dataset.value || null,
            first: row.querySelector('.pill[data-prop="first"].selected')?.dataset.value || null
        };
    });

    localStorage.setItem(`picks-${poolId}`, JSON.stringify(picks));
}


// Submit button
document.getElementById("submit-picks").addEventListener("click", () => {
    alert("Your picks have been submitted!");
});

const API_BASE = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ethiscan-backend.onrender.com";
const HISTORY_KEY = "ethiscan_search_history";
const HISTORY_TIMEOUT_MS = 6000;

function getLocalHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch (error) {
        localStorage.removeItem(HISTORY_KEY);
        return [];
    }
}

function normalizeStatus(status) {
    const normalized = String(status || "WARNING").toUpperCase();
    if (normalized === "ETHICAL") return "ETHICAL";
    if (normalized === "UNETHICAL") return "UNETHICAL";
    return "WARNING";
}

function normalizeHistoryItem(item) {
    return {
        query: item.query || item.brandName || "Unknown brand",
        status: normalizeStatus(item.status),
        createdAt: item.createdAt || item.timestamp || new Date().toISOString()
    };
}

function mergeHistory(remoteHistory, localHistory) {
    const seen = new Set();

    return [...localHistory, ...remoteHistory]
        .map(normalizeHistoryItem)
        .filter(item => {
            const key = String(item.query).toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 25);
}

async function fetchHistory(url, options) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), HISTORY_TIMEOUT_MS);

    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        window.clearTimeout(timeout);
    }
}

async function loadDashboard() {
    const localHistory = getLocalHistory();

    try {
        const token = localStorage.getItem("ethiscan_token");

        const response = await fetchHistory(`${API_BASE}/api/history`, {
            headers: {
                Authorization: token ? `Bearer ${token}` : ""
            }
        });

        if (!response.ok) {
            throw new Error("Failed to load history");
        }

        const history = mergeHistory(await response.json(), localHistory);
        const tableBody = document.getElementById("searchHistoryTableBody");

        tableBody.innerHTML = "";

        let ethical = 0;
        let warning = 0;
        let unethical = 0;

        if (history.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                        No search history yet.
                    </td>
                </tr>
            `;
        }

        history.forEach(item => {
            if (item.status === "ETHICAL") {
                ethical++;
            } else if (item.status === "WARNING") {
                warning++;
            } else if (item.status === "UNETHICAL") {
                unethical++;
            }

            const statusClass = item.status.toLowerCase();

            const resultUrl = `index.html?brand=${encodeURIComponent(item.query)}`;

            tableBody.innerHTML += `
                <tr>
                    <td><strong>${item.query}</strong></td>
                    <td style="color: var(--text-muted); font-size: 0.9rem;">
                        ${new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            ${item.status}
                        </span>
                    </td>
                    <td>
                        <a class="history-action-link" href="${resultUrl}">
                            View result
                        </a>
                    </td>
                </tr>
            `;
        });

        const total = history.length;

        document.getElementById("totalBrands").textContent = total;
        document.getElementById("ethicalCount").textContent = ethical;
        document.getElementById("warningCount").textContent = warning;
        document.getElementById("unethicalCount").textContent = unethical;

        document.getElementById("ethicalPct").textContent = total
            ? `${Math.round((ethical / total) * 100)}% of catalog`
            : "0% of catalog";

        document.getElementById("warningPct").textContent = total
            ? `${Math.round((warning / total) * 100)}% of catalog`
            : "0% of catalog";

        document.getElementById("unethicalPct").textContent = total
            ? `${Math.round((unethical / total) * 100)}% of catalog`
            : "0% of catalog";
    } catch (error) {
        console.error("Dashboard error:", error);
        renderLocalDashboard(localHistory);
    }
}

function renderLocalDashboard(localHistory) {
    const history = mergeHistory([], localHistory);
    const tableBody = document.getElementById("searchHistoryTableBody");
    let ethical = 0;
    let warning = 0;
    let unethical = 0;

    history.forEach(item => {
        if (item.status === "ETHICAL") ethical++;
        else if (item.status === "UNETHICAL") unethical++;
        else warning++;
    });

    const total = history.length;

    document.getElementById("totalBrands").textContent = total;
    document.getElementById("ethicalCount").textContent = ethical;
    document.getElementById("warningCount").textContent = warning;
    document.getElementById("unethicalCount").textContent = unethical;
    document.getElementById("ethicalPct").textContent = total ? `${Math.round((ethical / total) * 100)}% of searches` : "0% of searches";
    document.getElementById("warningPct").textContent = total ? `${Math.round((warning / total) * 100)}% of searches` : "0% of searches";
    document.getElementById("unethicalPct").textContent = total ? `${Math.round((unethical / total) * 100)}% of searches` : "0% of searches";

    if (!tableBody) return;

    if (!history.length) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    No search history yet. Analyze a brand to add it here.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = history.map(item => {
        const resultUrl = `index.html?brand=${encodeURIComponent(item.query)}`;

        return `
            <tr>
                <td><strong>${item.query}</strong></td>
                <td style="color: var(--text-muted); font-size: 0.9rem;">
                    ${new Date(item.createdAt).toLocaleString()}
                </td>
                <td>
                    <span class="status-badge ${item.status.toLowerCase()}">
                        ${item.status}
                    </span>
                </td>
                <td>
                    <a class="history-action-link" href="${resultUrl}">
                        View result
                    </a>
                </td>
            </tr>
        `;
    }).join("");
}

async function clearHistory() {
    const token = localStorage.getItem("ethiscan_token");

    const confirmed = confirm("Are you sure you want to clear your entire search history?\n\nThis action cannot be undone.");

    if (!confirmed) {
        return;
    }

    if (!token) {
        localStorage.removeItem(HISTORY_KEY);
        loadDashboard();
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/history`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to clear history");
        }

        localStorage.removeItem(HISTORY_KEY);
        alert("Your search history has been cleared successfully.");
        loadDashboard();
    } catch (error) {
        console.error("Clear history error:", error);
        alert("Unable to clear search history. Please try again.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const clearButton = document.getElementById("clearHistoryBtn");

    if (clearButton) {
        clearButton.addEventListener("click", clearHistory);
    }

    loadDashboard();
});

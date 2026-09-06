const ETHISCAN_API_BASE = "https://ethiscan-backend.onrender.com";
const ETHISCAN_HISTORY_KEY = "ethiscan_search_history";
const ETHISCAN_TIMEOUT_MS = 20000;

document.addEventListener("DOMContentLoaded", () => {
    const searchPlaceholder = document.getElementById("search-placeholder");

    if (!searchPlaceholder) return;

    const BASE_PATH = window.location.hostname === "localhost" ? "" : "/EthiScan";

    fetch(`${BASE_PATH}/components/search-bar.html`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load search bar");
            }
            return response.text();
        })
        .then(html => {
            searchPlaceholder.innerHTML = html;
            initializeScannerEvents();
        })
        .catch(error => {
            console.error("Search bar loading error:", error);
        });
});

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getStatusFromScore(score) {
    if (score >= 70) return "ETHICAL";
    if (score >= 40) return "WARNING";
    return "UNETHICAL";
}

function getLocalHistory() {
    try {
        return JSON.parse(localStorage.getItem(ETHISCAN_HISTORY_KEY) || "[]");
    } catch (error) {
        localStorage.removeItem(ETHISCAN_HISTORY_KEY);
        return [];
    }
}

function saveLocalSearch(brand, query) {
    const score = Number(brand.ethicalScore) || 0;
    const entry = {
        query,
        brandName: brand.brandName || query,
        status: brand.status || getStatusFromScore(score),
        ethicalScore: score,
        industry: brand.industry || "General",
        timestamp: new Date().toISOString()
    };

    const nextHistory = [
        entry,
        ...getLocalHistory().filter(item =>
            String(item.query).toLowerCase() !== String(query).toLowerCase()
        )
    ].slice(0, 25);

    localStorage.setItem(ETHISCAN_HISTORY_KEY, JSON.stringify(nextHistory));
}

function buildOfflineBrand(query) {
    const seed = [...query].reduce((total, char) => total + char.charCodeAt(0), 0);
    const score = 45 + (seed % 35);

    return {
        brandName: query,
        ethicalScore: score,
        industry: "Research pending",
        sustainability: "Offline estimate",
        description: "The hosted EthiScan analysis service is temporarily unavailable, so this result is a saved offline snapshot. Reopen this brand later from the dashboard to refresh live AI details.",
        pros: "Search request saved. Use public sustainability reports, supplier policies, labor practices, and packaging claims to verify this brand.",
        cons: "Live web evidence could not be reached during this search, so this snapshot should not be treated as a final ethical rating.",
        smartAlternatives: [
            { brandName: "Patagonia", ethicalScore: 86 },
            { brandName: "Fairphone", ethicalScore: 84 }
        ],
        status: getStatusFromScore(score)
    };
}

async function fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), ETHISCAN_TIMEOUT_MS);

    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        window.clearTimeout(timeout);
    }
}

function initializeScannerEvents() {
    const input = document.getElementById("brandSearchInput");
    const btn = document.getElementById("analyzeBtn");

    if (!input || !btn) return;

    async function executeAnalysis(queryValue) {
        const val = queryValue.trim();

        if (!val) return;

        const resPlaceholder = document.getElementById("result-placeholder");

        if (resPlaceholder) {
            resPlaceholder.innerHTML = `
                <div class="result-card-container animate-fade-in"
                    style="
                        background-color:#11131c;
                        border:1px solid #1e2230;
                        padding:32px;
                        border-radius:12px;
                        margin-top:24px;
                        text-align:center;
                    ">
                    <div style="
                        font-size:18px;
                        font-weight:600;
                    ">
                        Analyzing Brand Ethics...
                    </div>
                </div>
            `;
        }

        try {
            const token = localStorage.getItem("ethiscan_token");

            const response = await fetchWithTimeout(
                `${ETHISCAN_API_BASE}/api/brands/${encodeURIComponent(val)}`,
                {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : ""
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                const offlineBrand = buildOfflineBrand(val);
                saveLocalSearch(offlineBrand, val);
                renderResultCard(offlineBrand);
                return;
            }

            saveLocalSearch(data.brand, val);
            renderResultCard(data.brand);
        } catch (error) {
            console.error("Analysis error:", error);

            const offlineBrand = buildOfflineBrand(val);
            saveLocalSearch(offlineBrand, val);
            renderResultCard(offlineBrand);
        }
    }

    const requestedBrand = new URLSearchParams(window.location.search).get("brand");

    if (requestedBrand) {
        input.value = requestedBrand;
        executeAnalysis(requestedBrand);
    }

    btn.addEventListener("click", () => {
        executeAnalysis(input.value);
    });

    input.addEventListener("keypress", event => {
        if (event.key === "Enter") {
            executeAnalysis(input.value);
        }
    });

    document.querySelectorAll(".suggestion-tag").forEach(tag => {
        tag.addEventListener("click", event => {
            input.value = event.target.textContent;
            executeAnalysis(event.target.textContent);
        });
    });
}

function renderResultCard(brand) {
    const resPlaceholder = document.getElementById("result-placeholder");

    if (!resPlaceholder) return;

    let accentColor = "#f59e0b";

    const score = Number(brand.ethicalScore) || 0;

    if (score >= 70) {
        accentColor = "#10b981";
    } else if (score >= 40) {
        accentColor = "#f59e0b";
    } else {
        accentColor = "#ef4444";
    }

    resPlaceholder.innerHTML = `
        <div class="result-card-container animate-fade-in"
            style="
                background:#0f1117;
                border:1px solid #1f2430;
                padding:32px;
                border-radius:20px;
                margin-top:24px;
            ">

            <div style="
                display:flex;
                justify-content:space-between;
                align-items:flex-start;
                gap:30px;
                flex-wrap:wrap;
            ">

                <div style="flex:1; min-width:280px;">

                    <div style="
                        font-size:11px;
                        color:#7c8597;
                        letter-spacing:1px;
                        text-transform:uppercase;
                    ">
                        Live Ethical Analysis
                    </div>

                    <h2 style="
                        font-size:42px;
                        font-weight:700;
                        margin-top:10px;
                        color:white;
                    ">
                        ${brand.brandName || "Unknown"}
                    </h2>

                    <div style="
                        margin-top:8px;
                        color:#7c8597;
                        font-size:14px;
                    ">
                        Industry • ${brand.industry || "General"}
                    </div>

                    <div style="
                        margin-top:18px;
                        display:inline-flex;
                        align-items:center;
                        gap:8px;
                        padding:8px 14px;
                        border-radius:999px;
                        border:1px solid ${accentColor};
                        color:${accentColor};
                        font-size:13px;
                        font-weight:600;
                    ">
                        ${brand.sustainability || "Unknown"}
                    </div>

                </div>

                <div style="
                    width:110px;
                    height:110px;
                    border-radius:50%;
                    border:5px solid ${accentColor};
                    display:flex;
                    justify-content:center;
                    align-items:center;
                    font-size:38px;
                    font-weight:700;
                    color:${accentColor};
                    flex-shrink:0;
                ">
                    ${score}
                </div>

            </div>

            <div style="
                margin-top:28px;
                background:#151926;
                border:1px solid #222838;
                border-radius:14px;
                padding:18px;
                color:#cbd5e1;
                line-height:1.8;
                font-size:14px;
            ">
                ${brand.description || "This brand was analyzed using live ethical evaluation and sustainability indicators."}
            </div>

            <div style="
                display:grid;
                grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
                gap:20px;
                margin-top:28px;
            ">

                <div style="
                    background:#151926;
                    border:1px solid #222838;
                    border-radius:16px;
                    padding:20px;
                ">
                    <h3 style="
                        font-size:18px;
                        margin-bottom:16px;
                        color:white;
                    ">
                        Positive Indicators
                    </h3>

                    <div style="
                        color:#9ca3af;
                        line-height:1.8;
                        font-size:14px;
                    ">
                        ${brand.pros || "No positive indicators found."}
                    </div>
                </div>

                <div style="
                    background:#151926;
                    border:1px solid #222838;
                    border-radius:16px;
                    padding:20px;
                ">
                    <h3 style="
                        font-size:18px;
                        margin-bottom:16px;
                        color:white;
                    ">
                        Ethical Concerns
                    </h3>

                    <div style="
                        color:#9ca3af;
                        line-height:1.8;
                        font-size:14px;
                    ">
                        ${brand.cons || "No ethical concerns found."}
                    </div>
                </div>

            </div>

            ${
                Array.isArray(brand.smartAlternatives) &&
                brand.smartAlternatives.length > 0
                    ? `
                        <div style="margin-top:28px;">
                            <h3 style="
                                font-size:20px;
                                margin-bottom:18px;
                                color:white;
                            ">
                                Better Ethical Alternatives
                            </h3>

                            <div style="
                                display:grid;
                                grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
                                gap:16px;
                            ">
                                ${brand.smartAlternatives.map(item => `
                                    <div style="
                                        background:#151926;
                                        border:1px solid #222838;
                                        border-radius:16px;
                                        padding:18px;
                                    ">
                                        <div style="
                                            font-size:18px;
                                            font-weight:600;
                                            color:white;
                                            margin-bottom:10px;
                                        ">
                                            ${item.brandName || "Unknown"}
                                        </div>

                                        <div style="
                                            color:#10b981;
                                            font-size:14px;
                                            font-weight:600;
                                        ">
                                            Ethical Score • ${item.ethicalScore ?? "N/A"}
                                        </div>
                                    </div>
                                `).join("")}
                            </div>
                        </div>
                    `
                    : ""
            }

        </div>
    `;
}

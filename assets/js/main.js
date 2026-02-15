const yearEl = document.getElementById("year");
const updatedEl = document.getElementById("updated");
yearEl.textContent = new Date().getFullYear();
updatedEl.textContent = new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });

const grid = document.getElementById("projectGrid");
const searchInput = document.getElementById("projectSearch");
const filterSelect = document.getElementById("projectFilter");

let PROJECTS = [];

function normalize(str) {
  return (str || "").toLowerCase().trim();
}

function matches(project, q, filter) {
  const haystack = normalize([
    project.title,
    project.description,
    (project.tags || []).join(" "),
    project.category
  ].join(" "));

  const okQuery = !q || haystack.includes(q);
  const okFilter = (filter === "all") || project.category === filter;
  return okQuery && okFilter;
}

function projectCard(p) {
  const tags = (p.tags || []).map(t => `<span class="badge">${t}</span>`).join("");
  const repo = p.repo ? `<a class="btn btn-small" href="${p.repo}" target="_blank" rel="noreferrer">Repo</a>` : "";
  const demo = p.demo ? `<a class="btn btn-small btn-ghost" href="${p.demo}" target="_blank" rel="noreferrer">Demo</a>` : "";
  const writeup = p.writeup ? `<a class="btn btn-small btn-ghost" href="${p.writeup}" target="_blank" rel="noreferrer">Writeup</a>` : "";

  return `
    <article class="card">
      <h3 class="project-title">${p.title}</h3>
      <p class="project-desc">${p.description}</p>
      <div class="badges">${tags}</div>
      <div class="card-actions">${repo}${writeup}${demo}</div>
    </article>
  `;
}

function render() {
  const q = normalize(searchInput.value);
  const filter = filterSelect.value;

  const visible = PROJECTS.filter(p => matches(p, q, filter));
  grid.innerHTML = visible.map(projectCard).join("");

  if (visible.length === 0) {
    grid.innerHTML = `
      <div class="card">
        <h3 class="project-title">No matches</h3>
        <p class="project-desc">Try a different search term or set Filter to “All”.</p>
      </div>
    `;
  }
}

async function loadProjects() {
  try {
    const res = await fetch("assets/data/projects.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    PROJECTS = await res.json();
  } catch (e) {
    // Fallback: keep page functional even if JSON missing
    PROJECTS = [
      {
        title: "Security-AI-Lab (PoC)",
        description: "A small proof-of-concept for log-based anomaly exploration and feature extraction.",
        category: "ai",
        tags: ["Python", "Notebook", "Logs"],
        repo: "https://github.com/MrR3bu5"
      }
    ];
    console.warn("Could not load projects.json; using fallback.", e);
  }

  render();
}

const writeupGrid = document.getElementById("writeupGrid");
let WRITEUPS = [];

function writeupCard(w) {
  const tags = (w.tags || []).map(t => `<span class="badge">${t}</span>`).join("");
  return `
    <article class="card">
      <h4 class="project-title">${w.title}</h4>
      <p class="muted small">${w.summary}</p>
      <div class="badges">${tags}</div>
      <div class="card-actions">
        <a class="btn btn-small" href="${w.link}" target="_blank" rel="noreferrer noopener">Read</a>
      </div>
    </article>
  `;
}

async function loadWriteups() {
  if (!writeupGrid) return;

  try {
    const res = await fetch("assets/data/writeups.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    WRITEUPS = await res.json();
  } catch (e) {
    WRITEUPS = [];
    console.warn("Could not load writeups.json", e);
  }

  if (WRITEUPS.length === 0) {
    writeupGrid.innerHTML = `
      <div class="card">
        <h4 class="project-title">Writeups loading</h4>
        <p class="muted small">If this persists, verify assets/data/writeups.json exists and is valid JSON.</p>
      </div>
    `;
    return;
  }

  writeupGrid.innerHTML = WRITEUPS.map(writeupCard).join("");
}

loadWriteups();


searchInput.addEventListener("input", render);
filterSelect.addEventListener("change", render);

loadProjects();


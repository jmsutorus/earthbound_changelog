import { join } from "node:path";
import { existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { copySync } from "std/fs";
import { marked } from "marked";
import { Layout, getAllChangelogs } from "./main.tsx";

const DIST_DIR = join(Deno.cwd(), "dist");

// 1. Clean and prepare dist directory
if (existsSync(DIST_DIR)) {
  rmSync(DIST_DIR, { recursive: true, force: true });
}
mkdirSync(DIST_DIR, { recursive: true });

// 2. Get data
const repos = getAllChangelogs();

// 3. Generate Home Page
const homeHtml = (
  <Layout repos={repos} isStatic={true}>
    <div class="home-container">
      <header class="hero">
        <h1>Central Changelog Hub</h1>
        <p class="hero-subtitle">Tracking evolution across the entire Earthbound ecosystem.</p>
      </header>

      <div class="features-grid">
        <div class="feature-card glass-card">
          <h3>Real-time Updates</h3>
          <p>Instantly see the latest changes pushed from all connected repositories.</p>
        </div>
        <div class="feature-card glass-card">
          <h3>Centralized History</h3>
          <p>A reliable audit trail of every release, bug fix, and feature addition.</p>
        </div>
        <div class="feature-card glass-card">
          <h3>Ecosystem Vision</h3>
          <p>Understand how different components of the app evolve together.</p>
        </div>
      </div>
    </div>
  </Layout>
).toString();

writeFileSync(join(DIST_DIR, "index.html"), "<!DOCTYPE html>" + homeHtml);

// 4. Generate Repo Pages
repos.forEach((repo) => {
  const repoDir = join(DIST_DIR, "repo", repo.slug);
  mkdirSync(repoDir, { recursive: true });

  const htmlContent = marked.parse(repo.content);
  const repoHtml = (
    <Layout repos={repos} currentSlug={repo.slug} isStatic={true}>
      <div class="repo-container">
        <header class="repo-header">
          <div class="header-content">
            <h1>{repo.metadata.title}</h1>
            <p class="description">{repo.metadata.description}</p>
          </div>
          
          {repo.metadata.repository && (
            <a href={repo.metadata.repository} target="_blank" class="repo-link glass-card">
              <span>Source Code</span>
            </a>
          )}
        </header>

        <article class="changelog-content glass-card" dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    </Layout>
  ).toString();

  writeFileSync(join(repoDir, "index.html"), "<!DOCTYPE html>" + repoHtml);
});

// 5. Copy static assets
const staticDist = join(DIST_DIR, "static");
if (existsSync("static")) {
  copySync("static", staticDist, { overwrite: true });
}

console.log(`✅ Build complete! Static site generated in ${DIST_DIR}`);

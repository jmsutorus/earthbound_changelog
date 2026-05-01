import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const app = new Hono();

// Content Path
const CONTENT_PATH = join(Deno.cwd(), "content/repos");

interface RepoMetadata {
  title: string;
  description: string;
  repository?: string;
}

interface ChangelogData {
  slug: string;
  metadata: RepoMetadata;
  content: string;
}

// Utility to get all changelogs
function getAllChangelogs(): ChangelogData[] {
  if (!existsSync(CONTENT_PATH)) return [];
  
  const repoDirs = Array.from(Deno.readDirSync(CONTENT_PATH));
  
  return repoDirs
    .filter(entry => entry.isDirectory)
    .map((entry) => {
      const slug = entry.name;
      const filePath = join(CONTENT_PATH, slug, "CHANGELOG.md");
      if (!existsSync(filePath)) return null;
      
      const fileContent = readFileSync(filePath, "utf8");
      const { data, content } = matter(fileContent);
      
      return {
        slug,
        metadata: data as RepoMetadata,
        content,
      };
    })
    .filter(Boolean) as ChangelogData[];
}

// Layout Component
const Layout = ({ children, repos, currentSlug }: { children: any, repos: ChangelogData[], currentSlug?: string }) => (
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Earthbound Changelog Hub</title>
      <link rel="stylesheet" href="/static/style.css" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Outfit:wght@700&display=swap" rel="stylesheet" />
    </head>
    <body>
      <div class="layout">
        <aside class="sidebar">
          <div class="sidebar-header">
            <a href="/" class="logo">
              <span class="logo-icon">◈</span>
              <span>Earthbound Hub</span>
            </a>
          </div>

          <nav class="sidebar-nav">
            <div class="nav-section">
              <p class="nav-label">Repositories</p>
              <ul class="nav-list">
                {repos.map((repo) => (
                  <li>
                    <a
                      href={`/repo/${repo.slug}`}
                      class={`nav-link ${currentSlug === repo.slug ? 'active' : ''}`}
                    >
                      <span>{repo.metadata.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div class="sidebar-footer">
            <a href="https://github.com/jmsutorus" class="footer-link">
              <span>Github</span>
            </a>
          </div>
        </aside>
        
        <main class="main-content">
          {children}
        </main>
      </div>
    </body>
  </html>
);

// Routes
app.use("/static/*", serveStatic({ root: "./" }));

app.get("/", (c) => {
  const repos = getAllChangelogs();
  return c.html(
    <Layout repos={repos}>
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
  );
});

app.get("/repo/:slug", (c) => {
  const slug = c.req.param("slug");
  const repos = getAllChangelogs();
  const repo = repos.find(r => r.slug === slug);
  
  if (!repo) return c.notFound();
  
  const htmlContent = marked.parse(repo.content);

  return c.html(
    <Layout repos={repos} currentSlug={slug}>
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
  );
});

Deno.serve(app.fetch);

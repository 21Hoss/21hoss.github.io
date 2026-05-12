# 21hoss.github.io

Source for **kelvin // ctf** — a dark, terminal-styled blog for publishing
Capture The Flag write-ups.

- **Live site:** <https://21hoss.github.io>
- **Generator:** [Jekyll 4](https://jekyllrb.com) (custom theme, no remote
  themes), deployed via GitHub Actions.
- **Highlighter:** Rouge, with a hand-tuned Tokyo Night-ish palette tuned for
  GDB, Volatility 3, Ghidra output, and Python.

## Local development

```bash
bundle install
bundle exec jekyll serve --livereload
```

Then open <http://localhost:4000>.

## Adding a write-up

1. Copy `ctf-template.md` into
   `_writeups/<platform>/<category>/<YYYY-MM-DD>-<slug>.md`.
2. Fill in the front matter (`title`, `platform`, `category`, `difficulty`,
   `date`, `tags`, etc.).
3. Write the body in Markdown. Fenced code blocks get the terminal treatment
   automatically; use the language hint that best matches the tool (e.g.
   `gdb`, `python`, `bash`, `console`, `nasm`, `http`).
4. Commit and push. GitHub Actions will build and deploy.

## Adding a competition

Drop a Markdown file in `_competitions/`:

```yaml
---
title: "CyberGame KE 2026"
slug:  "cybergame-ke-2026"
start_date: 2026-03-01
end_date:   2026-05-09
status:     "upcoming"   # active | upcoming | archived
team:       "Solo"
url:        "https://example.com"
description: "Ten-week Kenyan cybersecurity challenge."
---
```

Write-ups whose `ctf:` front-matter field matches the competition `title` get
auto-linked on the event page.

## Project structure

```
.
├── _config.yml
├── _layouts/          # default, page, post, writeup, competition, home
├── _includes/         # head, header, footer, writeup-card, competition-card
├── _writeups/         # CTF write-ups grouped by platform/category
├── _competitions/     # one file per CTF event
├── assets/
│   ├── css/main.scss
│   └── js/site.js
├── ctf/               # /ctf/ listing
├── competitions/      # /competitions/ listing
├── about/  blog/  research/
├── categories.md      # /categories/
├── tags.md            # /tags/
├── ctf-template.md    # write-up scaffold
└── .github/workflows/pages.yml
```

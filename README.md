# DeepAgentLabs organization website

Static source for [deepagentlabs.io](https://deepagentlabs.io/), served by GitHub Pages
from this repository. Plain HTML, CSS and JavaScript: no build step, no dependencies.

## Structure

```
index.html        Homepage
roadmap.html      Roadmap page
assets/css/       Stylesheets
assets/js/        Scripts
assets/img/       Images
docs/             Architecture notes, changelog, ecosystem engineering docs
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for what every file does, and
[docs/CHANGELOG.md](docs/CHANGELOG.md) for what has changed.

## Local preview

Serve this folder with any static file server, for example the VS Code
**Live Server** extension, then open `index.html`.

## Publish

Push to `main`. GitHub Pages deploys the repository root (**Settings → Pages →
Deploy from a branch → `main` / root**). `CNAME` points the site at `deepagentlabs.io`.

## `docs/ecosystem/`

Internal architecture and audit notes about the DeepAgentLabs repositories. They are
not part of the website, not linked from it, and not written as public copy.

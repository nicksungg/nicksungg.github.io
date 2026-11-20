# nicksungg.github.io

Personal website of Nicholas Sung: https://nicksungg.github.io/

Plain static HTML, CSS and JavaScript, served by GitHub Pages from the `main` branch. No build step.

| File | What it is |
|---|---|
| `index.html` | Home: about, featured live demos, news, contact |
| `publications.html` | Papers, with links, and manuscripts under review |
| `projects.html` | Projects, datasets and code |
| `demos.html` | The live demos, embedded |
| `experience.html` | Research, teaching, education, honors |
| `assets/css/style.css` | All styles, light and dark |
| `assets/js/main.js` | Theme toggle, menu, tabs |
| `assets/js/live.js` | Finds the live demos and shows whether each one is up |

## Live demos

The BlendedNet and BlendedNet++ demos run on a workstation and reach
visitors through tunnels whose addresses can change. The workstation writes the current addresses to
`live.json` on the `live` branch of this repository. `assets/js/live.js` reads that file, checks from the
visitor's browser whether each demo answers, and either embeds it or shows that it is offline.
The `live.json` in `main` is only a fallback copy.

## Editing

Each page is a complete HTML file. The header, navigation and footer are repeated in every page, so a
change to the navigation has to be made in all of them.

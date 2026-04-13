# SonarQube / SonarCloud — Cab-Roaster-Mobile

This project uses **SonarQube** rules for JavaScript/React Native (bugs, vulnerabilities, code smells, duplication, coverage) with **`sonar-project.properties`** at the repo root and **Jest** LCOV reports.

## Quick start (SonarCloud — recommended for GitHub)

1. Sign in at [SonarCloud](https://sonarcloud.io) with GitHub.
2. **Create a project** → Analyze project → **GitHub Actions** (follow the wizard).
3. Copy **Organization key** and **Project key** from SonarCloud → Project Information.
4. In GitHub: **Settings → Secrets and variables → Actions**, add:

   | Secret | Where to find it |
   |--------|------------------|
   | `SONAR_TOKEN` | SonarCloud → avatar → **My Account** → **Security** → Generate token |
   | `SONAR_ORGANIZATION` | Project → **Administration** → **Update Key** / onboarding wizard |
   | `SONAR_PROJECT_KEY` | Same (e.g. `yourorg_Cab-Roaster-Mobile`) |

5. Push to `main` or a branch matching `VT276-*` (see `.github/workflows/sonarqube.yml`). The workflow runs tests, then uploads analysis + coverage.

### Quality Gate (“high standard”)

In SonarCloud: **Administration → Quality Gates** (or project **Quality Gate**).

Suggested direction for production-grade JS apps:

- **New issues** → 0 on new code (or very low threshold with review).
- **Coverage on new code** → set a realistic minimum (e.g. 60–80%) once the suite grows.
- **Security Hotspots** → reviewed.
- **Reliability / Maintainability** → Sonar default “Sonar way” for JS.

Tune thresholds as you add tests; failing the pipeline until coverage exists is often too strict for day one.

---

## Local run

```bash
npm ci
npm run test:coverage
```

Install the [SonarScanner CLI](https://docs.sonarqube.org/latest/analyzing-source-code/scanners/sonarscanner/) and run from the project root (SonarCloud: also pass organization and project key):

```bash
sonar-scanner \
  -Dsonar.organization=YOUR_ORG \
  -Dsonar.projectKey=YOUR_PROJECT_KEY \
  -Dsonar.host.url=https://sonarcloud.io
```

Use a **SonarCloud token** as `SONAR_TOKEN` in the environment.

---

## Self-hosted SonarQube Server

1. Deploy SonarQube (Docker or installer); create a project and a **user token**.
2. Do **not** set `sonar.organization` (SonarQube Server uses `sonar.projectKey` only).
3. Set environment when scanning:

   ```bash
   export SONAR_HOST_URL=https://your-sonar.company.com
   export SONAR_TOKEN=your_token
   sonar-scanner -Dsonar.projectKey=Cab-Roaster-Mobile
   ```

4. For GitHub Actions, use the same `SonarSource/sonarqube-scan-action` with:

   ```yaml
   env:
     SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
     SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
   with:
     args: -Dsonar.projectKey=YOUR_KEY
   ```

   Remove `-Dsonar.organization=...` from `args` for Server.

---

## What is analyzed

- **Sources:** `App.js`, `index.js`, `src/**` (see `sonar-project.properties`).
- **Excluded:** `node_modules`, `coverage`, `.expo`, native build outputs, mocks (see `sonar.exclusions`).
- **Coverage:** `coverage/lcov.info` from `npm run test:coverage`.

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| “Project not found” | `SONAR_PROJECT_KEY` / `SONAR_ORGANIZATION` match SonarCloud exactly. |
| No coverage in Sonar | Run `npm run test:coverage` before scan; ensure `coverage/lcov.info` exists. |
| Too many issues | Narrow `sonar.sources` or add `sonar.exclusions`; fix gradually with Quality Gate on **new code** only. |

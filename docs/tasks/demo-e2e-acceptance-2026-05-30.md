# Demo E2E Acceptance — 2026-05-30

> Status: passed for local demo readiness
> Scope: local `dev:demo` on port 3010, core demo flow only.

## 1. Purpose

This acceptance run checks whether ZhiLiao is ready for a basic live product demo:

1. public entry points are visible;
2. AI formula conversation works;
3. regulation conversation works;
4. user auth and saved recipes work;
5. admin entry and auth gate work;
6. local smoke and build verification remain green.

## 2. Environment

- Date: 2026-05-30
- Local server: `npm run dev:demo`
- URL: `http://127.0.0.1:3010`
- Branch: `main`
- Latest related commit: `20e9bd2 fix: expose demo workflow entry points`

## 3. Results

| Area | Check | Result | Notes |
|---|---|---:|---|
| Home | `/` returns 200 and exposes core entries | PASS | Includes AI formula, regulation, user recipes, supplier entry, admin entry |
| Navigation | top nav exposes primary demo routes | PASS | `AI 推荐`, `原料库`, `法规`, `我的配方`, supplier/admin entries |
| AI formula | `/recommend` renders chat input and formula workbench | PASS | Textarea and send action present |
| AI formula API | `/api/ai-recommend` streams SSE chunks | PASS | Stream returned formula content for high-protein sports drink query |
| Regulation | `/regulations` renders chat input and evidence workbench | PASS | Textarea and send action present |
| Regulation API | `/api/regulations` streams database result + AI chunks | PASS | Natural-language query produced db result and streamed explanation |
| User auth | register + `/api/auth/me` | PASS | Temporary E2E user was created and then local data was restored |
| Saved recipes | POST + GET `/api/recipes` with user cookie | PASS | Temporary saved recipe was readable and then local data was restored |
| Admin | `/admin` renders auth screen | PASS | Admin auth endpoint returned success with local configured credential |
| Local smoke | `npm run smoke:local` | PASS | Page/API smoke passed |
| Build verify | `npm run verify` | PASS | Formula Brief test, TypeScript, and production build passed |

## 4. Residual Issues

1. Regulation natural-language extraction is still shallow.
   - Example: `DHA 能不能用于普通食品？` first matched the whole sentence as an ingredient.
   - The answer still streams, but the retrieval layer should extract `DHA` before database matching.

2. Not every section has a chat assistant.
   - Current chat surfaces are `/recommend` and `/regulations`.
   - Product pages, search, recipes, supplier dashboard, and admin are workbench pages, not conversational modules.
   - A full-site assistant should be treated as a product decision, not a bug fix.

3. Browser visual QA remains manual.
   - Static and API checks passed.
   - A future pass should include desktop/mobile visual screenshots for the home entry grid and chat workbench.

## 5. Next Actions

1. Add regulation query extraction for common natural-language questions.
2. Decide whether to add a lightweight full-site assistant shell or keep chat limited to formula/regulation workbenches.
3. Prepare deployment checklist and run server-side smoke after deploy.
4. Continue data work on real supplier/spec coverage for demo-priority cases.

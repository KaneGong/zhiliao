const DEFAULT_BASE_URL = "http://127.0.0.1:3010";

const baseUrl = (process.env.SMOKE_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");

const checks = [
  { label: "home", path: "/", type: "html" },
  { label: "recommend", path: "/recommend", type: "html" },
  { label: "search", path: "/search", type: "html" },
  { label: "recipes", path: "/recipes", type: "html" },
  { label: "regulations", path: "/regulations", type: "html" },
  { label: "supplier-ang", path: "/supplier/ang", type: "html" },
  { label: "filters-api", path: "/api/filters", type: "json" },
  { label: "products-api", path: "/api/products", type: "json" },
  { label: "recipes-api-auth-gate", path: "/api/recipes", type: "json", expectedStatus: 401 },
];

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

for (const check of checks) {
  const url = `${baseUrl}${check.path}`;

  try {
    const response = await fetch(url, { redirect: "manual" });
    const contentType = response.headers.get("content-type") || "";
    const body = await response.text();

    const expectedStatus = check.expectedStatus || 200;

    if (response.status !== expectedStatus) {
      fail(`${check.label}: expected ${expectedStatus}, got ${response.status} (${url})`);
      continue;
    }

    if (check.type === "json") {
      try {
        JSON.parse(body);
      } catch {
        fail(`${check.label}: expected valid JSON (${url})`);
        continue;
      }
    }

    if (check.type === "html" && !contentType.includes("text/html")) {
      fail(`${check.label}: expected HTML content-type, got ${contentType || "empty"} (${url})`);
      continue;
    }

    if (check.type === "html" && (!body || body.length < 100)) {
      fail(`${check.label}: response body too small (${body.length} bytes, ${url})`);
      continue;
    }

    console.log(`${check.label}: OK ${response.status} ${body.length} bytes`);
  } catch (error) {
    fail(`${check.label}: request failed (${url})\n${error instanceof Error ? error.message : String(error)}`);
  }
}

if (process.exitCode) {
  process.exit();
}

console.log(`local smoke passed: ${baseUrl}`);

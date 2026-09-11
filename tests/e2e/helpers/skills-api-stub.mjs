// A tiny, dependency-free stand-in for `erebus-api`'s `/v1/skills` and
// `/v1/skills/:id`, used only by the skills E2E suite (LLD §10.5 explicitly
// allows "a running erebus-api or a stub server").
//
// Why a stub and not the real `erebus-api`: `erebus-api` registers no CORS
// middleware yet (PLAN.md §3.3 "erebus-app → CORS on erebus-api", `erebus-app`
// LLD §15 item 8, `chore/erebus-api-cors`) — deliberately out of this US's
// scope. A `vite preview` build calls its configured `VITE_API_BASE_URL`
// directly, cross-origin, with no dev-server proxy to hide behind, so a real
// `erebus-api` would fail every request in a real browser today. This stub
// serves the same 13-record fixture used by the integration suite
// (`tests/helpers/fixtures/skill.fixtures.ts`, itself copied verbatim from a
// real `GET /v1/skills` run — PLAN.md risk R12) with permissive CORS headers,
// so the E2E suite exercises the real, assembled, built application in a real
// browser without needing the CORS chore or a live `erebus-api` process.
//
// Plain Node `http`, no framework and no new dependency (LLD §2.2 closed set).

import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const fixturePath = fileURLToPath(
  new URL('../../helpers/fixtures/skills.raw.json', import.meta.url),
);
const skills = JSON.parse(readFileSync(fixturePath, 'utf-8'));

const PORT = Number(process.env.SKILLS_API_STUB_PORT ?? 4001);

/** Direct children, by parent id — mirrors the real detail endpoint's
 * `subgroups[]` (CONTRACT §2.2), built from this same curated fixture. */
function subgroupsOf(parentId) {
  return skills
    .filter((skill) => skill.parentSkillId === parentId)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));
}

function notFoundProblem(id, instance) {
  return {
    type: 'https://erebus.dev/problems/not-found',
    title: 'Resource not found',
    status: 404,
    detail: `Skill with id ${id} was not found.`,
    instance,
  };
}

function send(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': status === 404 ? 'application/problem+json' : 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Cache-Control': 'no-store', // the E2E suite must never see a stale fixture
  });
  res.end(json);
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    });
    res.end();
    return;
  }

  if (url.pathname === '/v1/health') {
    send(res, 200, { status: 'ok', version: 'e2e-stub', uptimeMs: 1 });
    return;
  }

  if (url.pathname === '/v1/skills') {
    // The app requests the whole catalogue with no query parameter and
    // filters in memory (PLAN D8) — the stub always returns everything.
    send(res, 200, skills);
    return;
  }

  const detailMatch = /^\/v1\/skills\/(\d+)$/.exec(url.pathname);
  if (detailMatch) {
    const id = Number(detailMatch[1]);
    const skill = skills.find((candidate) => candidate.id === id);

    if (skill === undefined) {
      send(res, 404, notFoundProblem(id, url.pathname));
      return;
    }

    send(res, 200, { ...skill, subgroups: subgroupsOf(id) });
    return;
  }

  send(res, 404, notFoundProblem(url.pathname, url.pathname));
});

server.listen(PORT, () => {
  console.log(`skills-api-stub listening on http://localhost:${PORT}`);
});

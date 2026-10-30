import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const required = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME", "GEMINI_API_KEY"];
const safeEnv = Object.fromEntries(required.map(name => [name, `offline-test-${name}`]));
function run(code, overrides = {}) {
  return spawnSync(process.execPath, ["--input-type=module", "-e", code], {
    cwd: root,
    env: { ...process.env, ...safeEnv, ...overrides },
    encoding: "utf8",
    timeout: 5000,
  });
}

test("required values are supplied unchanged without credential defaults", () => {
  const result = run(`
    import assert from 'node:assert/strict';
    import { config, requireEnv } from './config.js';
    assert.equal(config.db.password, process.env.DB_PASSWORD);
    assert.equal(config.geminiApiKey, process.env.GEMINI_API_KEY);
    assert.equal(requireEnv('PASSWORD', { PASSWORD: '  test-only  ' }), '  test-only  ');
    assert.throws(() => requireEnv('MISSING', {}), /Missing required environment variable: MISSING/);
    assert.ok(Object.isFrozen(config));
    assert.ok(Object.isFrozen(config.db));
  `);
  assert.equal(result.status, 0, result.stderr);
});

for (const name of required) {
  for (const value of ["", "   "]) {
    test(`${name} rejects ${value === "" ? "empty" : "whitespace"} values before startup`, () => {
      const result = run("await import('./config.js');", { [name]: value });
      assert.notEqual(result.status, 0);
      assert.ok(result.stderr.includes(`Missing required environment variable: ${name}`));
      for (const sentinel of Object.values(safeEnv)) assert.ok(!result.stderr.includes(sentinel));
    });
  }
}

test("database receives environment configuration without contacting a real database", () => {
  const result = run(`
    import assert from 'node:assert/strict';
    import mysql from 'mysql2/promise';
    let calls = 0;
    mysql.createConnection = async options => {
      calls++;
      assert.equal(options.password, process.env.DB_PASSWORD);
      assert.equal(options.host, process.env.DB_HOST);
      assert.equal(options.user, process.env.DB_USER);
      assert.equal(options.database, process.env.DB_NAME);
      return { offline: true };
    };
    const { db } = await import('./db.js');
    assert.equal(db.offline, true);
    assert.equal(calls, 1);
  `);
  assert.equal(result.status, 0, result.stderr);
});

test("database failure does not expose driver error credentials", () => {
  const result = run(`
    import assert from 'node:assert/strict';
    import mysql from 'mysql2/promise';
    mysql.createConnection = async () => { throw new Error('DO-NOT-EXPOSE-DRIVER-DETAILS'); };
    await assert.rejects(import('./db.js'), error => {
      assert.equal(error.message, 'Database connection failed; check database configuration.');
      assert.ok(!error.stack.includes('DO-NOT-EXPOSE-DRIVER-DETAILS'));
      return true;
    });
  `);
  assert.equal(result.status, 0, result.stderr);
});

test("Gemini credentials are sent in a header, not URL or error details", () => {
  for (const file of ["server.js", "test.js"]) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    assert.ok(source.includes('"x-goog-api-key": config.geminiApiKey'));
    assert.ok(!source.includes("?key="));
    assert.ok(!source.includes("err.message"));
  }
});

test("environment example contains only empty placeholders", () => {
  const example = readFileSync(new URL("../.env.example", import.meta.url), "utf8");
  const entries = example.split(/\r?\n/).filter(line => line && !line.startsWith("#"));
  assert.deepEqual(entries.sort(), required.map(name => `${name}=`).sort());
});

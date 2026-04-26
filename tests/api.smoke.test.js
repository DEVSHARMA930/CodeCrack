const assert = require("node:assert/strict");
const http = require("node:http");
const test = require("node:test");
const { MongoMemoryServer } = require("mongodb-memory-server");

process.env.NODE_ENV = "test";
process.env.JWT_ACCESS_SECRET = "test_access_secret_value";
process.env.JWT_REFRESH_SECRET = "test_refresh_secret_value";
process.env.ACCESS_TOKEN_EXPIRES_IN = "15m";
process.env.REFRESH_TOKEN_EXPIRES_IN = "7d";
process.env.PISTON_URL = "https://mock.piston.local/execute";
process.env.SEED_CONTENT_ON_START = "true";

const { startServer } = require("../server/index");
const { disconnectDatabase } = require("../server/config/db");

let mongoServer;
let server;
let baseUrl;
let originalFetch;

function request(path, { method = "GET", headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const requestHeaders = { ...headers };

    if (payload) {
      requestHeaders["Content-Type"] = "application/json";
      requestHeaders["Content-Length"] = Buffer.byteLength(payload);
    }

    const req = http.request(
      `${baseUrl}${path}`,
      {
        method,
        headers: requestHeaders
      },
      (res) => {
        let raw = "";

        res.on("data", (chunk) => {
          raw += chunk;
        });

        res.on("end", () => {
          let parsed = {};

          if (raw) {
            try {
              parsed = JSON.parse(raw);
            } catch (error) {
              parsed = { raw };
            }
          }

          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        });
      }
    );

    req.on("error", reject);

    if (payload) {
      req.write(payload);
    }

    req.end();
  });
}

function toCookieHeader(setCookie) {
  const list = Array.isArray(setCookie) ? setCookie : [];
  return list.map((cookie) => cookie.split(";")[0]).join("; ");
}

test.before(async () => {
  originalFetch = global.fetch;

  global.fetch = async (url, options = {}) => {
    if (String(url).startsWith("https://mock.piston.local/execute")) {
      const payload = JSON.parse(options.body || "{}");
      const sourceCode = payload.files?.[0]?.content || "";
      const output = sourceCode.includes("print") ? "mock-output\n" : "mock-result\n";

      return new Response(
        JSON.stringify({
          language: payload.language,
          run: {
            code: 0,
            stdout: output,
            stderr: "",
            output
          }
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    return originalFetch(url, options);
  };

  mongoServer = await MongoMemoryServer.create();
  const started = await startServer({
    mongoUri: mongoServer.getUri(),
    port: 0,
    seedContent: true
  });

  server = started.server;
  baseUrl = `http://127.0.0.1:${started.port}`;
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => {
      server.close(resolve);
    });
  }

  await disconnectDatabase();

  if (mongoServer) {
    await mongoServer.stop();
  }

  global.fetch = originalFetch;
});

test("health endpoint returns ok", async () => {
  const response = await request("/api/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.status, "ok");
});

test("auth lifecycle works with HttpOnly cookies", async () => {
  const registerResponse = await request("/api/auth/register", {
    method: "POST",
    body: {
      name: "Test Student",
      email: "student@example.com",
      password: "password123"
    }
  });

  assert.equal(registerResponse.status, 201);
  assert.ok(Array.isArray(registerResponse.headers["set-cookie"]));

  const cookieHeader = toCookieHeader(registerResponse.headers["set-cookie"]);
  assert.ok(cookieHeader.includes("cc_access"));
  assert.ok(cookieHeader.includes("cc_refresh"));

  const meResponse = await request("/api/auth/me", {
    headers: {
      Cookie: cookieHeader
    }
  });

  assert.equal(meResponse.status, 200);
  assert.equal(meResponse.body.user.email, "student@example.com");

  const refreshResponse = await request("/api/auth/refresh", {
    method: "POST",
    headers: {
      Cookie: cookieHeader
    }
  });

  assert.equal(refreshResponse.status, 200);

  const logoutResponse = await request("/api/auth/logout", {
    method: "POST",
    headers: {
      Cookie: cookieHeader
    }
  });

  assert.equal(logoutResponse.status, 200);
});

test("content listing endpoints return seeded data", async () => {
  const notesResponse = await request("/api/notes");
  const pyqResponse = await request("/api/pyq");

  assert.equal(notesResponse.status, 200);
  assert.equal(pyqResponse.status, 200);
  assert.ok(Array.isArray(notesResponse.body.items));
  assert.ok(Array.isArray(pyqResponse.body.items));
  assert.ok(notesResponse.body.items.length > 0);
  assert.ok(pyqResponse.body.items.length > 0);
});

test("search endpoint returns global matches", async () => {
  const response = await request("/api/search?query=data");

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body.items));
  assert.ok(response.body.items.length > 0);
  assert.ok(response.body.items.some((item) => item.type === "note" || item.type === "pyq"));
});

test("execute endpoint validates and runs through mocked piston", async () => {
  const invalidResponse = await request("/api/execute", {
    method: "POST",
    body: {
      language: "ruby",
      code: "System.out.println('x');"
    }
  });

  assert.equal(invalidResponse.status, 400);

  const validResponse = await request("/api/execute", {
    method: "POST",
    body: {
      language: "python",
      code: "print('hello')"
    }
  });

  assert.equal(validResponse.status, 200);
  assert.equal(validResponse.body.success, true);
  assert.match(validResponse.body.run.output, /mock-output/i);
});

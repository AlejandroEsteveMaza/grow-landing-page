import assert from "node:assert/strict";
import test from "node:test";
import { explicit404, onRequestGet, onRequestHead } from "../functions/404.ts";
import {
  onRequestGet as onRequestHtmlGet,
  onRequestHead as onRequestHtmlHead,
} from "../functions/404.html.ts";

const assetHeaders = {
  "Cache-Control": "public, max-age=60",
  "Content-Type": "text/html; charset=utf-8",
  "X-Asset-Header": "preserved",
};

const invoke = async (pathname: string, method: "GET" | "HEAD") => {
  const assetRequests: Request[] = [];
  const response = await explicit404({
    request: new Request(`https://tunorteweb.com${pathname}?source=test`, {
      method,
    }),
    env: {
      ASSETS: {
        fetch: async (request) => {
          assetRequests.push(request);
          return new Response(
            method === "HEAD" ? null : "<main>Custom 404</main>",
            {
              status: 200,
              headers: assetHeaders,
            },
          );
        },
      },
    },
  });

  return { assetRequests, response };
};

test("explicit 404 routes reuse the same GET and HEAD handlers", () => {
  assert.equal(onRequestGet, explicit404);
  assert.equal(onRequestHead, explicit404);
  assert.equal(onRequestHtmlGet, explicit404);
  assert.equal(onRequestHtmlHead, explicit404);
});

for (const pathname of ["/404", "/404.html"]) {
  test(`${pathname} fetches the pretty-path asset and returns its body and headers with status 404`, async () => {
    const { assetRequests, response } = await invoke(pathname, "GET");

    assert.equal(response.status, 404);
    assert.equal(await response.text(), "<main>Custom 404</main>");
    assert.equal(
      response.headers.get("Content-Type"),
      assetHeaders["Content-Type"],
    );
    assert.equal(
      response.headers.get("Cache-Control"),
      assetHeaders["Cache-Control"],
    );
    assert.equal(
      response.headers.get("X-Asset-Header"),
      assetHeaders["X-Asset-Header"],
    );
    assert.equal(assetRequests.length, 1);
    assert.equal(assetRequests[0]?.url, "https://tunorteweb.com/404");
    assert.equal(assetRequests[0]?.method, "GET");
  });
}

test("HEAD preserves status and headers without a response body", async () => {
  const { assetRequests, response } = await invoke("/404.html", "HEAD");

  assert.equal(response.status, 404);
  assert.equal(await response.text(), "");
  assert.equal(
    response.headers.get("Content-Type"),
    assetHeaders["Content-Type"],
  );
  assert.equal(assetRequests[0]?.url, "https://tunorteweb.com/404");
  assert.equal(assetRequests[0]?.method, "HEAD");
});

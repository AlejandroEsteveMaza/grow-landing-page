interface PagesContext {
  request: Request;
  env: {
    ASSETS: {
      fetch(request: Request): Promise<Response>;
    };
  };
}

export const explicit404 = async ({
  request,
  env,
}: PagesContext): Promise<Response> => {
  const assetUrl = new URL("/404", request.url);
  const assetRequest = new Request(assetUrl, {
    method: request.method,
    headers: request.headers,
  });
  const assetResponse = await env.ASSETS.fetch(assetRequest);

  return new Response(request.method === "HEAD" ? null : assetResponse.body, {
    status: 404,
    headers: assetResponse.headers,
  });
};

export const onRequestGet = explicit404;
export const onRequestHead = explicit404;

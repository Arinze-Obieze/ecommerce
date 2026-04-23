"use client";

function isPlainObject(value) {
  return Boolean(value) && Object.prototype.toString.call(value) === "[object Object]";
}

export async function apiJson(url, options = {}) {
  const {
    method = "GET",
    headers = {},
    body,
    cache = "no-store",
    credentials = "same-origin",
    signal,
    next,
  } = options;

  const init = {
    method,
    headers: { ...headers },
    credentials,
    signal,
  };

  if (cache !== undefined) init.cache = cache;
  if (next !== undefined) init.next = next;

  if (body !== undefined) {
    if (body instanceof FormData || body instanceof Blob || typeof body === "string") {
      init.body = body;
    } else if (isPlainObject(body) || Array.isArray(body)) {
      init.body = JSON.stringify(body);
      if (!Object.keys(init.headers).some((key) => key.toLowerCase() === "content-type")) {
        init.headers["Content-Type"] = "application/json";
      }
    } else {
      init.body = body;
    }
  }

  const response = await fetch(url, init);
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.error || data?.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data;
}

export function withContentType(headers = {}, contentType = "application/json") {
  return {
    "Content-Type": contentType,
    ...headers,
  };
}

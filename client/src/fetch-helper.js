async function Call(baseUri, useCase, dtoIn, method) {
  let response;
  if (!method || method === "get") {
    response = await fetch(
      `${baseUri}/${useCase}${
        dtoIn && Object.keys(dtoIn).length
          ? `?${new URLSearchParams(dtoIn)}`
          : ""
      }`
    );
  } else {
    response = await fetch(`${baseUri}/${useCase}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dtoIn),
    });
  }
  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}

const baseUri = "http://localhost:8000";

const FetchHelper = {
  film: {
    get: async (dtoIn) => Call(baseUri, "film/get", dtoIn, "get"),
    create: async (dtoIn) => Call(baseUri, "film/create", dtoIn, "post"),
    update: async (dtoIn) => Call(baseUri, "film/update", dtoIn, "post"),
    delete: async (dtoIn) => Call(baseUri, "film/delete", dtoIn, "post"),
    list: async () => Call(baseUri, "film/list", null, "get"),
  },
  promitani: {
    get: async (dtoIn) => Call(baseUri, "promitani/get", dtoIn, "get"),
    create: async (dtoIn) => Call(baseUri, "promitani/create", dtoIn, "post"),
    update: async (dtoIn) => Call(baseUri, "promitani/update", dtoIn, "post"),
    delete: async (dtoIn) => Call(baseUri, "promitani/delete", dtoIn, "post"),
    list: async () => Call(baseUri, "promitani/list", null, "get"),
  },
};

export default FetchHelper;

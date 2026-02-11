(function (global) {
  const host = global.location?.hostname || "";
  const protocol = global.location?.protocol || "";
  const isLocal = host === "localhost" || host === "127.0.0.1" || host === "" || protocol === "file:";
  const defaultApi = isLocal
    ? "http://localhost:5001/api"
    : "https://linguaspro-api.fly.dev/api";
  const runtimeApi = global.__API_URL__ || global.API_URL || defaultApi;
  global.API_URL = runtimeApi;
})(window);

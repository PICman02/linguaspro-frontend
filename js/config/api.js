(function (global) {
  const isLocal =
    global.location &&
    (global.location.hostname === "localhost" || global.location.hostname === "127.0.0.1");
  const defaultApi = isLocal
    ? "http://localhost:5001/api"
    : "https://linguaspro-api.fly.dev/api";
  const runtimeApi = global.__API_URL__ || global.API_URL || defaultApi;
  global.API_URL = runtimeApi;
})(window);

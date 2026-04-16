export default async function handler(req, res) {
  const targetHost = process.env.VITE_API_BASE_URL || "http://localhost:8080";
  // Forward all requests starting with /api to the backend
  const targetPath = req.url.replace(/^\/api/, "") || "/";
  const targetUrl = `${targetHost}${targetPath}`;

  console.log(`Proxying: ${req.method} ${req.url} -> ${targetUrl}`);

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
      },
    };

    // Forward the body for POST/PUT/PATCH requests
    if (!["GET", "HEAD"].includes(req.method)) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const contentType = response.headers.get("content-type");
    const text = await response.text();

    res.status(response.status);
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }
    res.send(text);
  } catch (error) {
    console.error("Proxy Error:", error);
    res.status(500).json({ error: "Proxy Error", message: error.message });
  }
}

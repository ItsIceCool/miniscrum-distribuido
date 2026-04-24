const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const PHP_API_URL = process.env.PHP_API_URL || "http://php-api";
const PYTHON_ML_URL = process.env.PYTHON_ML_URL || "http://python-ml:8000";

async function readUpstreamResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const rawBody = await response.text();

  if (contentType.includes("application/json")) {
    return JSON.parse(rawBody);
  }

  return {
    error: "El servicio devolvio una respuesta invalida",
    details: rawBody.slice(0, 300)
  };
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/tasks", async (req, res) => {
  try {
    const response = await fetch(`${PHP_API_URL}/tasks`);
    const data = await readUpstreamResponse(response);
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({
      error: "No se pudo consultar el servicio PHP",
      details: error.message
    });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const response = await fetch(`${PHP_API_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });

    const data = await readUpstreamResponse(response);
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({
      error: "No se pudo crear la tarea",
      details: error.message
    });
  }
});

app.put("/api/tasks/:id/status", async (req, res) => {
  try {
    const response = await fetch(`${PHP_API_URL}/tasks/${req.params.id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });

    const data = await readUpstreamResponse(response);
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({
      error: "No se pudo actualizar la tarea",
      details: error.message
    });
  }
});

app.post("/api/predict", async (req, res) => {
  try {
    const response = await fetch(`${PYTHON_ML_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });

    const data = await readUpstreamResponse(response);
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({
      error: "No se pudo consultar el servicio Python",
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Gateway ejecutandose en puerto ${PORT}`);
});

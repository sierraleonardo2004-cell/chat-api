const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10kb" }));

// Solo se sirve la carpeta "public" (antes se exponía todo el proyecto)
app.use(express.static(path.join(__dirname, "public")));

// ---- Persistencia simple en archivo (los mensajes sobreviven a reinicios) ----
// En Azure App Service (Linux) la carpeta /home persiste: usa DATA_DIR=/home/data
const DATA_DIR = process.env.DATA_DIR || __dirname;
const ARCHIVO = path.join(DATA_DIR, "mensajes.json");
const MAX_MENSAJES = 200;

let mensajes = [];
let siguienteId = 1;

try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(ARCHIVO)) {
        mensajes = JSON.parse(fs.readFileSync(ARCHIVO, "utf8"));
        siguienteId = mensajes.reduce((max, m) => Math.max(max, m.id), 0) + 1;
    }
} catch (e) {
    console.error("No se pudo leer el historial:", e.message);
    mensajes = [];
}

function guardar() {
    fs.writeFile(ARCHIVO, JSON.stringify(mensajes), (err) => {
        if (err) console.error("No se pudo guardar el historial:", err.message);
    });
}

// ---- API ----
// GET /mensajes            -> todos los mensajes
// GET /mensajes?desde=15   -> solo los mensajes con id > 15 (para actualizar sin recargar todo)
app.get("/mensajes", (req, res) => {
    const desde = parseInt(req.query.desde, 10);
    res.json(Number.isNaN(desde) ? mensajes : mensajes.filter((m) => m.id > desde));
});

app.post("/mensaje", (req, res) => {
    const usuario = String(req.body.usuario || "").trim().slice(0, 30);
    const mensaje = String(req.body.mensaje || "").trim().slice(0, 500);

    if (!usuario || !mensaje) {
        return res.status(400).json({ error: "El nombre y el mensaje son obligatorios" });
    }

    const nuevo = { id: siguienteId++, usuario, mensaje, fecha: new Date() };

    mensajes.push(nuevo);
    if (mensajes.length > MAX_MENSAJES) mensajes = mensajes.slice(-MAX_MENSAJES);
    guardar();

    res.status(201).json(nuevo);
});

// Ruta de salud (útil para Azure / AWS / Render)
app.get("/salud", (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("Servidor corriendo en puerto " + port);
});

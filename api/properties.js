// api/properties.js
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "Properties.json");

function loadProperties() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    // If file doesn’t exist or is bad, start with empty list
    console.error("Error reading Properties.json, using []", err.message);
    return [];
  }
}

function saveProperties(props) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(props, null, 2));
}

module.exports = (app) => {
  // GET all properties
  app.get("/api/properties", (req, res) => {
    const props = loadProperties();
    res.json(props);
  });

  // ADD new property
  app.post("/api/properties", (req, res) => {
    const props = loadProperties();
    const newProperty = {
      id: Date.now(), // simple ID
      ...req.body,
    };
    props.push(newProperty);
    saveProperties(props);
    res.status(201).json(newProperty);
  });

  // UPDATE property
  app.put("/api/properties/:id", (req, res) => {
    const id = Number(req.params.id);
    const props = loadProperties();
    const index = props.findIndex((p) => Number(p.id) === id);

    if (index === -1) {
      return res.status(404).json({ error: "Property not found" });
    }

    props[index] = { ...props[index], ...req.body };
    saveProperties(props);
    res.json(props[index]);
  });

  // DELETE property
  app.delete("/api/properties/:id", (req, res) => {
    const id = Number(req.params.id);
    let props = loadProperties();
    const lenBefore = props.length;
    props = props.filter((p) => Number(p.id) !== id);

    if (props.length === lenBefore) {
      return res.status(404).json({ error: "Property not found" });
    }

    saveProperties(props);
    res.json({ ok: true });
  });
};

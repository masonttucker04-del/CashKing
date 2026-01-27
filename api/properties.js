module.exports = (app) => {
  const fs = require("fs");
  const dataPath = "./data/Properties.json";

  function load() {
    return JSON.parse(fs.readFileSync(dataPath));
  }

  function save(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  }

  // GET all properties
  app.get("/api/properties", (req, res) => {
    res.json(load());
  });

  // ADD a property
  app.post("/api/properties", (req, res) => {
    const properties = load();
    const newProp = { id: Date.now(), ...req.body };
    properties.push(newProp);
    save(properties);
    res.json({ ok: true, property: newProp });
  });

  // DELETE property
  app.delete("/api/properties/:id", (req, res) => {
    const properties = load();
    const updated = properties.filter(p => p.id != req.params.id);
    save(updated);
    res.json({ ok: true });
  });
};

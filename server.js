const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = 5000;

// Parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Session middleware
app.use(session({
  secret: "supersecretkey",
  resave: false,
  saveUninitialized: true
}));

// -----------------------
// TEMPORARY PROPERTIES DATA
// -----------------------
let properties = [
  {
    id: 1,
    title: "Charming Bungalow in Ardmore",
    address: "123 Maple St",
    city: "Ardmore, OK",
    price: 185000,
    status: "For Sale",
    beds: 3,
    baths: 2,
    sqft: 1450,
    tag: "Updated & move-in ready",
    description: "Beautiful updated bungalow in a quiet Ardmore neighborhood.",
    image: "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg"
  },
  {
    id: 2,
    title: "Cozy Starter Home",
    address: "456 Oak Ave",
    city: "Ardmore, OK",
    price: 1200,
    status: "For Rent",
    beds: 3,
    baths: 1,
    sqft: 1100,
    tag: "Great rental opportunity",
    description: "Nice rental home close to schools and shopping.",
    image: "https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg"
  }
];

let leads = [];

app.get("/api/properties", (req, res) => {
  res.json(properties);
});

app.post("/api/properties", (req, res) => {
  const newProperty = { id: Date.now(), ...req.body };
  properties.push(newProperty);
  res.json(newProperty);
});

app.delete("/api/properties/:id", (req, res) => {
  properties = properties.filter(p => p.id != req.params.id);
  res.json({ success: true });
});

// -----------------------
// ADMIN AUTH ROUTES
// -----------------------
require("./api/auth/login")(app, session);
require("./api/auth/logout")(app, session);

// -----------------------
// LEADS
// -----------------------
app.post("/api/leads", (req, res) => {
  const lead = {
    id: leads.length + 1,
    createdAt: new Date().toISOString(),
    ...req.body
  };
  leads.push(lead);
  console.log("New lead:", lead);
  res.json({ ok: true });
});
// ADMIN PAGES
app.get("/admin/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/Admin/Login.html"));
});

app.get("/admin/properties", (req, res) => {
  res.sendFile(path.join(__dirname, "public/Admin/properties.html"));
});

app.get("/admin/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public/Admin/dashboard.html"));
});

app.get("/admin/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public/Admin/dashboard.html"));
});

// -----------------------
// FALLBACK ROUTE (MUST BE LAST)
// -----------------------
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// -----------------------
// START SERVER
// -----------------------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


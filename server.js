// server.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const nodemailer = require("nodemailer");
require("dotenv").config(); // load .env

const app = express();
const PORT = 5000;

// -----------------------
// PROPERTIES DATA (JSON FILE)
// -----------------------
const DATA_PATH = path.join(__dirname, "data", "Properties.json");
let properties = [];

function loadProperties() {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw);
    properties = Array.isArray(parsed) ? parsed : [];
    console.log(`Loaded ${properties.length} properties from Properties.json`);
  } catch (err) {
    console.error(
      "Could not load Properties.json, starting with empty list:",
      err.message
    );
    properties = [];
  }
}

function saveProperties() {
  fs.writeFile(DATA_PATH, JSON.stringify(properties, null, 2), (err) => {
    if (err) {
      console.error("Error saving Properties.json:", err.message);
    } else {
      console.log("✅ Properties saved to Properties.json");
    }
  });
}

// Load properties once on startup
loadProperties();

// -----------------------
// LEADS (IN MEMORY)
// -----------------------
let leads = [];

// -----------------------
// EMAIL (Nodemailer)
// -----------------------
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // e.g. "smtp.ionos.com"
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: process.env.EMAIL_SECURE === "true", // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER, // your login email
    pass: process.env.EMAIL_PASS,
  },
});

// Optional: verify config on startup
emailTransporter.verify((err, success) => {
  if (err) {
    console.error("⚠️ Email transporter not ready:", err.message);
  } else {
    console.log("✅ Email transporter is ready to send mail");
  }
});

// -----------------------
// MIDDLEWARE
// -----------------------
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: true,
  })
);

// -----------------------
// PROPERTIES API
// -----------------------

// Get all properties
app.get("/api/properties", (req, res) => {
  res.json(properties);
});

// Add new property
app.post("/api/properties", (req, res) => {
  const newProperty = {
    id: Date.now(),
    ...req.body,
  };
  properties.push(newProperty);
  saveProperties();
  res.json(newProperty);
});

// Update existing property
app.put("/api/properties/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = properties.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Property not found" });
  }

  properties[index] = { ...properties[index], ...req.body };
  saveProperties();
  res.json(properties[index]);
});

// Delete property
app.delete("/api/properties/:id", (req, res) => {
  const id = Number(req.params.id);
  const beforeCount = properties.length;
  properties = properties.filter((p) => p.id !== id);

  if (properties.length === beforeCount) {
    return res.status(404).json({ error: "Property not found" });
  }

  saveProperties();
  res.json({ success: true });
});

// -----------------------
// ADMIN AUTH ROUTES
// -----------------------
require("./api/auth/login")(app, session);
require("./api/auth/logout")(app, session);

// -----------------------
// LEADS + EMAIL
// -----------------------
app.post("/api/leads", async (req, res) => {
  const lead = {
    id: leads.length + 1,
    createdAt: new Date().toISOString(),
    ...req.body,
  };

  leads.push(lead);
  console.log("New lead:", lead);

  const subjectName = lead.name || "New Website Lead";

  const emailBody = `
New website lead from CashKingProperties.com

Name:    ${lead.name || "N/A"}
Phone:   ${lead.phone || "N/A"}
Email:   ${lead.email || "N/A"}
Address: ${lead.address || "N/A"}
Kind:    ${lead.kind || "N/A"}

Message:
${lead.message || lead.notes || ""}

Received at: ${lead.createdAt}
`.trim();

  const mailOptions = {
    from: `"CashKing Website" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: "austin@CashKingProperties.com", // where leads go
    subject: `New website lead: ${subjectName}`,
    text: emailBody,
  };

  try {
    await emailTransporter.sendMail(mailOptions);
    console.log("✅ Lead email sent to austin@CashKingProperties.com");
  } catch (err) {
    console.error("❌ Error sending lead email:", err.message);
    // still show success to the user
  }

  res.json({ ok: true });
});

// -----------------------
// ADMIN PAGES
// -----------------------
app.get("/admin/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/Admin/Login.html"));
});

app.get("/admin/properties", (req, res) => {
  res.sendFile(path.join(__dirname, "public/Admin/properties.html"));
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

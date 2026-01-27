module.exports = function (app, session) {
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;

    // Your admin login credentials
    const adminEmail = "Audieking97@icloud.com";
    const adminPassword = "Cashswadeking21$";

    if (email === adminEmail && password === adminPassword) {
      req.session.auth = true;
      return res.json({ success: true });
    }

    return res.status(401).json({ error: "Invalid email or password" });
  });
};

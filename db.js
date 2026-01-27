// db.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "database.sqlite");
const db = new sqlite3.Database(dbPath);

function initDb() {
  db.serialize(() => {
    // Properties table
    db.run(`
      CREATE TABLE IF NOT EXISTS properties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT,
        state TEXT,
        zip TEXT,
        price INTEGER,
        beds INTEGER,
        baths REAL,
        sqft INTEGER,
        status TEXT,
        tag TEXT,
        description TEXT,
        image TEXT,
        is_archived INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Leads table
    db.run(`
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kind TEXT,
        name TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        message TEXT,
        property_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Admin user table (very basic auth)
    db.run(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
      )
    `);

    // Seed default admin user if none
    db.get(`SELECT COUNT(*) AS count FROM admin_users`, (err, row) => {
      if (err) {
        console.error("Error checking admin_users:", err);
        return;
      }
      if (row.count === 0) {
        db.run(
          `INSERT INTO admin_users (email, password) VALUES (?, ?)`,
          ["admin@example.com", "changeme123"],
          (err2) => {
            if (err2) {
              console.error("Error seeding admin user:", err2);
            } else {
              console.log(
                "Seeded default admin user: admin@example.com / changeme123"
              );
            }
          }
        );
      }
    });

    // Seed sample properties if table empty
    db.get(`SELECT COUNT(*) AS count FROM properties`, (err, row) => {
      if (err) {
        console.error("Error checking properties:", err);
        return;
      }
      if (row.count === 0) {
        const sampleProps = [
          {
            title: "Cozy 3-Bed Brick Home",
            address: "1224 G St NW",
            city: "Ardmore",
            state: "OK",
            zip: "73401",
            price: 149000,
            beds: 3,
            baths: 2,
            sqft: 1450,
            status: "For Sale",
            tag: "Move-in ready",
            description: "Updated flooring, newer roof, large fenced backyard.",
            image:
              "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800"
          },
          {
            title: "Investor Special – Fixer Upper",
            address: "417 F St SE",
            city: "Ardmore",
            state: "OK",
            zip: "73401",
            price: 79000,
            beds: 2,
            baths: 1,
            sqft: 980,
            status: "For Sale",
            tag: "Great flip or rental",
            description:
              "Needs cosmetic updates but solid bones in a quiet street.",
            image:
              "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800"
          },
          {
            title: "4-Bed Family Home Near Schools",
            address: "723 I St NE",
            city: "Ardmore",
            state: "OK",
            zip: "73401",
            price: 189000,
            beds: 4,
            baths: 2,
            sqft: 1720,
            status: "For Sale",
            tag: "Great location",
            description:
              "Spacious layout, close to parks, schools, and shopping.",
            image:
              "https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=800"
          },
          {
            title: "2-Bed Rental in Quiet Area",
            address: "201 Moore St SE",
            city: "Ardmore",
            state: "OK",
            zip: "73401",
            price: 1100,
            beds: 2,
            baths: 1,
            sqft: 900,
            status: "For Rent",
            tag: "Available soon",
            description: "Clean and simple, ideal for long-term tenants.",
            image:
              "https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=800"
          },
          {
            title: "Updated 3-Bed Rental",
            address: "1029 K St NE",
            city: "Ardmore",
            state: "OK",
            zip: "73401",
            price: 1350,
            beds: 3,
            baths: 2,
            sqft: 1300,
            status: "For Rent",
            tag: "Newly updated",
            description: "Fresh paint, LVP flooring, and modern kitchen.",
            image:
              "https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=800"
          }
        ];

        const stmt = db.prepare(`
          INSERT INTO properties
          (title, address, city, state, zip, price, beds, baths, sqft, status, tag, description, image)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        sampleProps.forEach((p) => {
          stmt.run(
            p.title,
            p.address,
            p.city,
            p.state,
            p.zip,
            p.price,
            p.beds,
            p.baths,
            p.sqft,
            p.status,
            p.tag,
            p.description,
            p.image
          );
        });

        stmt.finalize(() => {
          console.log("Seeded sample properties.");
        });
      }
    });
  });
}

module.exports = {
  db,
  initDb
};

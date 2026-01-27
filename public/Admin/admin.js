
// LOGIN
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!res.ok) {
    document.getElementById("error").style.display = "block";
    document.getElementById("error").innerText = data.error;
    return;
  }

  window.location.href = "/admin/dashboard.html";
}

// LOGOUT
async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/admin/login.html";
}

// FETCH PROPERTIES
async function loadProperties() {
  const res = await fetch("/api/properties");
  const properties = await res.json();

  const container = document.getElementById("propertyList");
  if (!container) return;

  container.innerHTML = "";

  properties.forEach((p) => {
    container.innerHTML += `
      <div class="property-card">
        <b>${p.title}</b><br>
        ${p.address}, ${p.city}<br>
        ${p.beds} beds | ${p.baths} baths | ${p.sqft} sqft<br>
        $${p.price}<br>
        Status: ${p.status}<br><br>

        <button onclick="deleteProperty(${p.id})">Delete</button>
      </div>
    `;
  });
}

if (window.location.pathname.includes("dashboard")) {
  loadProperties();
}

// ADD PROPERTY
async function addProperty() {
  const body = {
    title: title.value,
    address: address.value,
    city: city.value,
    price: price.value,
    beds: beds.value,
    baths: baths.value,
    sqft: sqft.value,
    image: image.value,
    description: description.value,
    status: status.value
  };

  await fetch("/api/properties", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  loadProperties();
}

// DELETE
async function deleteProperty(id) {
  await fetch(`/api/properties/${id}`, { method: "DELETE" });
  loadProperties();
}


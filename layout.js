fetch("header.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("header").innerHTML = data;

    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user) {
      const headerContainer = document.getElementById("header");
      const navInner = headerContainer.querySelector(".nav-inner");

      const actions = document.createElement("div");
      actions.className = "nav-actions";
      actions.innerHTML = `
        <span>Hola, ${user.name}</span>
        <button id="logoutBtn" class="btn btn-ghost">Salir</button>
      `;

      navInner.appendChild(actions);

      actions.querySelector("#logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("currentUser");
        window.location = "home.html";
      });
    }
  });

fetch("footer.html")
  .then(res => res.text())
  .then(data => document.getElementById("footer").innerHTML = data);

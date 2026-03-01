const user = JSON.parse(localStorage.getItem("currentUser"));


if (user) {
  fetch("header.html")
    .then(res => res.text())
    .then(data => {
      const headerContainer = document.getElementById("header");

      if (headerContainer) {
        headerContainer.innerHTML = data;

        const navInner = headerContainer.querySelector(".nav-inner");

       

        const actions = document.createElement("div");
        actions.className = "nav-actions";
        actions.innerHTML = `
          <span>Hola, ${user.name}</span>
          <button id="logoutBtn" class=" btn-outline-purple">Salir</button>
        `;

        navInner.appendChild(actions);

        actions.querySelector("#logoutBtn").addEventListener("click", () => {
          localStorage.removeItem("currentUser");
          window.location = "login.html";
        });
      }
    });
}

/* Footer puede mostrarse siempre */
fetch("footer.html")
  .then(res => res.text())
  .then(data => {
    const footerContainer = document.getElementById("footer");
    if (footerContainer) {
      footerContainer.innerHTML = data;
    }
  });

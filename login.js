const users = [
    { email: "fatima@taskhub.com", password: "1234" }
];

function login(event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        window.location = "dashboard.html";
    } else {
        alert("Credenciales incorrectas");
    }




}
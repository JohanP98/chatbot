document.addEventListener("DOMContentLoaded", () => {

    if (window.location.pathname.includes("login.html")) {

        const loginForm = document.getElementById("login-form");

        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const errorBox = document.getElementById("login-error");

            if (!email || !password) {
                errorBox.style.display = "block";
                errorBox.textContent = "Por favor completa todos los campos.";
                return;
            }

            if (!email.endsWith("@universidadean.edu.co")) {
                errorBox.style.display = "block";
                errorBox.textContent = "Solo se permite correos terminados en @universidadean.edu.co";
                return;
            }

            try {
                const res = await fetch("http://localhost:3000/api/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (!res.ok) {
                    errorBox.style.display = "block";
                    errorBox.textContent = data.error || "Error en el inicio de sesión.";
                    return;
                }

                localStorage.setItem("ean_email", email);

                window.location.href = "index.html";

            } catch (error) {
                errorBox.style.display = "block";
                errorBox.textContent = "Error de conexión con el servidor.";
            }
        });

        return;
    }

    initChatApp();
});

function initChatApp() {
    const email = localStorage.getItem("ean_email");
    if (!email) window.location.href = "login.html";

    const userInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");
    const chatContainer = document.getElementById("chatContainer");
    const historyList = document.getElementById("chatHistory");
    const logoutBtn = document.querySelector(".logout-btn");
    const profileIcon = document.querySelector(".profile-icon");
    const profileMenu = document.querySelector(".profile-icon-menu");
    const newChatBtn = document.getElementById("newChatBtn");
    const SaveConv = "ean_chat_history_" + email;
    const imgbtn = document.getElementById("img-input");
    const imgupd = document.getElementById("img-upd");

    let history = JSON.parse(localStorage.getItem(SaveConv)) || [];
    let ActiveChatIndex = history.length - 1;

    function saveHistory() {
        localStorage.setItem(SaveConv, JSON.stringify(history));
    }

    function renderHistory() {
        historyList.innerHTML = "";
        history.forEach((chat, index) => {
            const li = document.createElement("li");
            li.textContent = chat.title;
            li.addEventListener("click", () => loadChat(index));
            historyList.appendChild(li);
            if (index === ActiveChatIndex) {
                li.classList.add("active-chat");
            }
        });
    }

    let currentChat;

    if (history.length === 0) {
        history.push({
            title: "Nueva conversación",
            messages: []
        });

        ActiveChatIndex = 0;
        saveHistory();
    }

    currentChat = history[ActiveChatIndex];
    renderHistory();

    function appendMessage(text, sender = "bot") {
        const msg = document.createElement("div");
        msg.classList.add("message");
        msg.classList.add(sender === "user" ? "user-msg" : "bot-msg");
        msg.innerHTML = text;

        chatContainer.appendChild(msg);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        if (window.MathJax) MathJax.typesetPromise();
    }

    async function sendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        appendMessage(text, "user");
        currentChat.messages.push({ role: "user", content: text });

        if (currentChat.title === "Nueva conversación") {
            currentChat.title = text.substring(0, 30) + (text.length > 30 ? "…" : "");
            saveHistory();
            renderHistory();
        }

        userInput.value = "";

        const temp = document.createElement("div");
        temp.classList.add("message", "bot-msg");
        temp.textContent = "Procesando...";
        chatContainer.appendChild(temp);

        try {
            const response = await fetch("http://localhost:3000/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text })
            });

            const data = await response.json();
            const botMessage = data.answer || "No se pudo obtener respuesta.";

            temp.remove();
            appendMessage(botMessage, "bot");

            currentChat.messages.push({ role: "bot", content: botMessage });
            saveHistory();

        } catch (err) {
            temp.remove();
            appendMessage("Error al conectarse con el servidor.", "bot");
        }
    }

    function loadChat(index) {
        currentChat = history[index];
        chatContainer.innerHTML = "";
        currentChat.messages.forEach(msg => {
            appendMessage(msg.content, msg.role === "user" ? "user" : "bot");
        });
        ActiveChatIndex = index;
        renderHistory();
    }
    

    sendBtn.addEventListener("click", sendMessage);

    userInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
        sendMessage();
        }
    });

    logoutBtn.addEventListener("click", () => {

        const email = localStorage.getItem("ean_email");
        const SaveConv = "ean-chat_history_" + email;

        localStorage.removeItem("ean_email");
        localStorage.removeItem(SaveConv);
        window.location.href = "login.html";
    });

    profileIcon.addEventListener("click", () => {
        profileMenu.classList.toggle("active");
    });

    newChatBtn.addEventListener("click", () => {
        history.push({
            title: "Nueva conversación",
            messages: []
        });
        currentChat = history[history.length - 1];
        chatContainer.innerHTML = "";
        saveHistory();
        ActiveChatIndex = history.length - 1;
        renderHistory();
    })
}

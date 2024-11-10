import { Peer } from 'peerjs';
import './style.css';

// helper functions
function randomID() {
    return Math.random().toString(16).substring(2, 8);
}

function formatLog(key, value) {
    const element = document.getElementById(`messages-log-${key}`);

    if (element) {
        element.innerText = value;
    }
}

function createMessage(text, type = "message") {
    const element = document.createElement("span");

    element.className = `messages-log-${type}`;
    element.innerText = text;

    log.appendChild(element);
    element.scrollIntoView();
}

// variables
const log = document.getElementById("messages-log");
const button = document.getElementById("messages-log-connect");
const input = document.getElementById("messages-input");

const id = randomID();
const name = prompt("Enter your name:") || "Guest";

const peer = new Peer(`chatochka-${id}`, {
    config: {
        iceServers: [
            { urls: "stun:stun.relay.metered.ca:80" },
            { urls: "turn:global.relay.metered.ca:443", username: "99970a8195f9abaac29787b8", credential: "Wh0+MvctX+HfCjsr" },
            { urls: "turns:global.relay.metered.ca:443?transport=tcp", username: "99970a8195f9abaac29787b8", credential: "Wh0+MvctX+HfCjsr" }
        ]
    }
});

let connection = null;
let connectionID = "";

// format the log
formatLog("id", id);
formatLog("name", name);

// connection event handlers
function onConnectionData(data) {
    createMessage(`<${data.name}> ${data.text}`);
}

function onConnectionClose() {
    createMessage(`A peer (ID: ${connectionID}) disconnected from the chat`, "system");

    connection = null;
    connectionID = "";
}

// other event handlers
peer.on("connection", (incoming) => {
    if (!incoming.peer.startsWith("chatochka-")) {
        return;
    }

    if (connection) {
        return;
    }

    connection = incoming;
    connectionID = connection.peer.slice(10);

    connection.on("data", onConnectionData);
    connection.on("close", onConnectionClose);

    createMessage(`A peer (ID: ${connectionID}) connected to the chat`, "system");
});

button.addEventListener("click", () => {
    connectionID = prompt("Enter the peer's ID:");

    if (connection) {
        connection.close();
    }

    connection = peer.connect(`chatochka-${connectionID}`);

    connection.on("data", onConnectionData);
    connection.on("close", onConnectionClose);

    createMessage(`Connected to a peer (ID: ${connectionID})`, "system");
});

input.addEventListener("change", () => {
    const text = input.value;

    if (!text) {
        return;
    }

    input.value = "";

    if (connection) {
        connection.send({name: name, text: text});
    }

    createMessage(`<${name}> ${text}`);
});
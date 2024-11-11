// imports
import { Peer } from "peerjs";
import markdownit from "markdown-it";
import DOMPurify from "dompurify";

const md = markdownit({ linkify: true });

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
    element.innerHTML = text.replace("<p>", "").replace("</p>", "");

    log.appendChild(element);
    element.scrollIntoView();
}

function joinPeer(connectionID) {
    if (connection) {
        connection.close();
    }

    if (!connectionID.match(/^[0-9a-f]{6}$/)) {
        createMessage("Unable to connect, invalid peer ID specified", "error"); return;
    }

    connection = peer.connect(`chatochka-${connectionID}`);

    connection.on("data", onConnectionData);
    connection.on("close", onConnectionClose);

    createMessage(`Connected to a peer (ID: ${connectionID})`, "system");
}

function changeName(newName) {
    name = DOMPurify.sanitize(newName);

    createMessage(`Name changed to "${name}"`, "system");
    formatLog("name", name);
}

// variables
const log = document.getElementById("messages-log");
const button = document.getElementById("messages-log-connect");
const input = document.getElementById("messages-input");

const id = randomID();
let name = prompt("Enter your name:") || "Guest";

const peer = new Peer(`chatochka-${id}`, {
    config: {
        iceServers: [
            { urls: "stun:stun.relay.metered.ca:80" },
            { urls: "turn:global.relay.metered.ca:443", username: "99970a8195f9abaac29787b8", credential: "Wh0+MvctX+HfCjsr" },
            { urls: "turns:global.relay.metered.ca:443?transport=tcp", username: "99970a8195f9abaac29787b8", credential: "Wh0+MvctX+HfCjsr" }
        ]
    }
});
//const peer = new Peer(`chatochka-${id}`);

let connection = null;
let connectionID = "";

// format the log
formatLog("id", id);
formatLog("name", name);

// connection event handlers
function onConnectionData(data) {
    createMessage(`&lt;${data.name}&gt;: ${md.render(data.text)}`);
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
    joinPeer(prompt("Enter the peer's ID:"));
});

input.addEventListener("change", () => {
    const text = input.value;

    if (!text) {
        return;
    }

    input.value = "";

    if (text.startsWith("/")) {
        const command = text.slice(1).split(" ");

        switch (command[0]) {
            case "join":
                if (command.length < 2) {
                    createMessage("Usage: /join &lt;id&gt;", "error");
                } else {
                    joinPeer(command[1]);
                }

                break;

            case "name":
                if (command.length < 2) {
                    createMessage("Usage: /name &lt;name&gt;", "error");
                } else {
                    changeName(command[1]);
                }

                break;

            default:
                createMessage(`Command "${command[0]}" not found`, "error"); break;
        }

        return;
    }

    if (connection) {
        connection.send({ name: name, text: text });
    }

    createMessage(`&lt;${name}&gt;: ${md.render(text)}`);
});
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

// commands
function connectToPeer(peerID) {
    if (connection) {
        connection.close();
    }

    if (!peerID.match(/^[0-9a-f]{6}$/)) {
        createMessage("Unable to connect, invalid peer ID specified", "error"); return;
    }

    connection = peer.connect(`chatochka-${peerID}`);
    connectionID = peerID;

    connection.on("data", onConnectionData);
    connection.on("close", onConnectionClose);

    createMessage(`Connected to a peer (ID: ${peerID})`, "system");
}

function disconnectFromPeer() {
    if (!connection) {
        createMessage("Unable to disconnect, no active connection found", "error"); return;
    }

    let peerID = connectionID;
    connectionID = "";

    connection.close();
    connection = null;

    createMessage(`Disconnected from a peer (ID: ${peerID})`, "system");
}

function changeName(newName) {
    name = DOMPurify.sanitize(newName);

    createMessage(`Name changed to "${name}"`, "system");
    formatLog("name", name);
}

// constants
const log = document.getElementById("messages-log");
const button = document.getElementById("messages-log-connect");
const input = document.getElementById("messages-input");

const id = randomID();
const peer = new Peer(`chatochka-${id}`);

// variables
let connection = null;
let connectionID = "";

let name = prompt("Enter your name:") || "Guest";

// format the log
formatLog("id", id);
formatLog("name", name);

// connection event handlers
function onConnectionData(data) {
    createMessage(`&lt;${DOMPurify.sanitize(data.name)}&gt;: ${md.render(data.text)}`);
}

function onConnectionClose() {
    if (!connectionID) {
        return;
    }

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
    connectToPeer(prompt("Enter the peer's ID:"));
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
            case "connect":
                if (command.length < 2) {
                    createMessage("Usage: /connect &lt;id&gt;", "error");
                } else {
                    connectToPeer(command[1]);
                }

                break;

            case "disconnect":
                disconnectFromPeer(); break;

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
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

function createMessage(content, type = "message") {
    const element = document.createElement("span");

    element.className = `messages-log-${type}`;
    element.innerHTML = content.replace("<p>", "").replace("</p>", "");

    log.appendChild(element);
    element.scrollIntoView();
}

// commands
function connectToPeer(peerID) {
    if (peerID === id) {
        createMessage("Unable to connect, cannot establish a connection with self", "error"); return;
    } else if (!peerID.match(/^[0-9a-f]{6}$/)) {
        createMessage("Unable to connect, invalid peer ID specified", "error"); return;
    }

    const connection = peer.connect(`chatochka-${peerID}`);

    connection.on("open", () => {
        connection.on("data", onConnectionData);
        connection.on("close", onConnectionClose);

        createMessage(`Connected to a peer (ID: ${peerID})`, "system");
    });

    connections.push(connection);
}

function disconnectFromPeer() {
    if (connections.length === 0) {
        createMessage("Unable to disconnect, no active connections found", "error"); return;
    } else if (connections.length > 1) {
        createMessage("Unable to disconnect, multiple active connections found", "error"); return;
    }

    const connection = connections[0];
    //const peerID = connection.peer.slice(10);

    connection.close();
    connections.pop();

    if (isHost) {
        isHost = false;
    }

    //createMessage(`Disconnected from a peer (ID: ${peerID})`, "system");
}

/*
function changeName(newName) {
    name = DOMPurify.sanitize(newName);

    createMessage(`Name changed to "${name}"`, "system");
    formatLog("name", name);
}
*/

// constants and variables
const log = document.getElementById("messages-log");
const button = document.getElementById("messages-log-connect");
const input = document.getElementById("messages-input");

const id = randomID();
const name = prompt("Enter your name:") || "Guest";

const peer = new Peer(`chatochka-${id}`, {
    host: "frog.bemxio.xyz",
    secure: true,
    debug: 3
});

const connections = [];
let isHost = false;

// format the log
formatLog("id", id);
formatLog("name", name);

// connection event handlers
function onConnectionData(data) {
    switch (data.type) {
        case 0:
            if (isHost) {
                for (const connection of connections) {
                    connection.send(data);
                }
            }

            createMessage(`&lt;${DOMPurify.sanitize(data.author)}&gt;: ${md.render(data.content)}`); break;
        case 1:
            createMessage(data.content, "system"); break;
        case 2:
            createMessage(data.content, "error"); break;
    }
}

function onConnectionClose() {
    const connection = this;
    const peerID = connection.peer.slice(10);

    connection.close();
    connections.splice(connections.indexOf(connection), 1);

    if (isHost) {
        if (connections.length === 0) {
            isHost = false;
        } else {
            for (const connection of connections) {
                connection.send({ type: 1, content: `A peer (ID: ${peerID}) disconnected from the chat` });
            }
        }
    }

    createMessage(`A peer (ID: ${peerID}) disconnected from the chat`, "system");
}

// other event handlers
peer.on("connection", (connection) => {
    if (!connection.peer.startsWith("chatochka-")) {
        connection.close(); return;
    }

    if (!isHost && connections.length === 1) {
        connection.on("open", () => {
            connection.send({ type: 2, content: "Unable to connect, another peer is already connected" });
            connection.close();
        });

        return;
    }

    isHost = true;

    connection.on("open", () => {
        const peerID = connection.peer.slice(10);

        connection.on("data", onConnectionData);
        connection.on("close", onConnectionClose);

        if (isHost) {
            for (const connection of connections) {
                connection.send({ type: 1, content: `A peer (ID: ${peerID}) connected to the chat` });
            }
        }

        createMessage(`A peer (ID: ${peerID}) connected to the chat`, "system");
    });

    connections.push(connection);
});

button.addEventListener("click", () => {
    connectToPeer(prompt("Enter the peer's ID:"));
});

input.addEventListener("change", () => {
    const content = input.value;

    if (!content) {
        return;
    }

    input.value = "";

    if (content.startsWith("/")) {
        const command = content.slice(1).split(" ");

        switch (command[0]) {
            case "connect":
            case "join":
                if (command.length < 2) {
                    createMessage("Usage: /connect &lt;id&gt;", "error"); break;
                }

                connectToPeer(command[1]); break;

            case "disconnect":
            case "leave":
                disconnectFromPeer(); break;

            /*
            case "name":
                if (command.length < 2) {
                    createMessage("Usage: /name &lt;name&gt;", "error"); break;
                }

                changeName(command[1]); break;
            */

            default:
                createMessage(`Command "${command[0]}" not found`, "error"); break;
        }

        return;
    }

    if (connections.length === 0) return;

    for (const connection of connections) {
        connection.send({ type: 0, author: name, content: content });
    }

    if (isHost) {
        createMessage(`&lt;${name}&gt;: ${md.render(content)}`);
    }
});
# Chatochka
Chatochka is a simple peer-to-peer chat website that allows two people to, well, chat with each other. It is made using ~~the classic HTML, CSS, and JavaScript trio~~ [Vite](https://vite.dev) (shoutouts to [NISZOgen](https://github.com/niszogen)), [PeerJS](https://peerjs.com) for the connection between the peers, [markdown-it](https://github.com/markdown-it/markdown-it) for rendering the messages and [DOMPurify](https://github.com/cure53/DOMPurify) for sanitizing them.

## Building
To build the project, you'll need a JavaScript runtime and a package manager (I personally use the classic [Node.js](https://nodejs.org) and [npm](https://www.npmjs.com) duo, though any other combination should work). Simply clone the repository, install the dependencies and build the project:
```bash
git clone https://github.com/bemxio/chatochka && cd chatochka

npm install
npm run build
```
This will create a `dist` folder containing the built files. You can then host these files on any static file server.

## Usage
Go to the [official link](https://chat.bemxio.xyz) or build and host the website yourself.

You'll be asked to enter your name. After that, Chatochka will give you a peer ID. Share it with the person you want to chat with. To connect with you, they'll have to enter your peer ID in the input field and click the "here" button. If everything goes well, you'll both get a message that you're connected and you'll be able to chat with each other.

### Troubleshooting
If you are on a network where a public IP address is not available (for example, [CGNAT](https://en.wikipedia.org/wiki/Carrier-grade_NAT)), Chatochka will most likely refuse to work. In that case, you can try using a proxy server or a VPN.

For any other problems, please create an issue [here](https://github.com/bemxio/chatochka/issues/new), specifying your browser, operating system and providing any error messages and/or console logs.

## License
This project is licensed under the MIT License - see the [`LICENSE`](LICENSE) file for details.

Contributions are welcome! If you want to contribute, whether it's an issue you've encountered or a pull request with new features, feel free to do so.
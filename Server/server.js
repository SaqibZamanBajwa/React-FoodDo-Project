const http = require("http");
const app = require("./app");

const server = http.createServer(app)

app.listen(8000, () => console.log("Server running on port 8000"));

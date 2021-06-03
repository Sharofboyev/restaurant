const express = require("express");
const app = express();
const chief = require("./routers/chief");
const error = require("./middleware/error");
const db = require("./models/db");
const client = require("./routers/client");
const manager = require("./routers/manager");
const waiter = require("./routers/waiter");
const auth = require("./routers/auth");
const config = require("config");
const users = require("./models/users.model");


db.connect()
  .then(() => {
    console.log("Connected to DB...");
  })
  .catch(() => {
    console.log("Can't connect to DB...");
  });

if (!config.get("jwtPrivateKey")) {
  console.log("jwtPrivateKey is not defined!");
  process.exit();
}
app.use(express.json());
app.use(chief);
app.use(manager);
app.use(client);
app.use(waiter);
app.use(auth);
app.use(users);
app.use(error);

app.listen(3000, () => {
  console.log("Listening on 3000...");
});

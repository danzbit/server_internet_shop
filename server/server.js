const fs = require("fs");
const boydParser = require("body-parser");
const jsonServer = require("json-server");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const server = jsonServer.create();
const userdb = JSON.parse(fs.readFileSync("./user.json", "utf-8"));

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(jsonServer.defaults());

const SECRET_KEY = "578923527";

const expiresIn = "1h";

function createToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

function isLoginAuth({ email, password }) {
  return (
    userdb.users.findIndex(
      (user) => user.email === email && user.password === password
    ) !== -1
  );
}

function isRegAuth({ email }) {
  return userdb.users.findIndex((user) => user.email === email) !== -1;
}

server.post("/api/auth/register", (req, res) => {
  const { email, password } = req.body;
  if (isRegAuth({ email })) {
    const status = 401;
    const message = "Email & password already exist";
    res.status(status).json({ status, message });
    return;
  }

  fs.readFile("./user.json", (err, data) => {
    if (err) {
      const status = 401;
      const message = err;
      res.status(status).json({ status, message });
      return;
    }
    data = JSON.parse(data.toString());

    let last_item_id = data.users[data.users.length - 1].id;

    data.users.push({ id: last_item_id + 1, email: email, password: password });
    let writeData = fs.writeFile(
      "./user.json",
      JSON.stringify(data),
      (err, result) => {
        if (err) {
          const status = 401;
          const message = "Email already exist";
          res.status(status).json({ status, message });
          return;
        }
      }
    );
  });
  const access_token = createToken({ email, password });
  res.status(200).json({ access_token });
});

server.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!isLoginAuth({ email, password })) {
    const status = 401;
    const message = "Incorect email or password";
    res.status(status).json({ status, message });
    return;
  }
  const access_token = createToken({ email, password });
  res.status(200).json({ access_token });
});

server.listen(5000, () => {
  console.log("Running api json server");
});

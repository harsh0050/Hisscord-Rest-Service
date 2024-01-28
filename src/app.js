const express = require("express");
const bodyParser = require("body-parser");
const { clearDatabase } = require("./utils/firebaseSetup");

const authRouter = require("./routes/authRouter");
const dmRouter = require("./routes/dmRouter");
const serverRouter = require("./routes/serverRouter");

const app = express();
const PORT = process.env.PORT || 8000;

//Body parser Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//clear database:
app.delete("/", async (req, res) => {
  await clearDatabase();
  res.send("success");
});

//Routes:
app.use("/auth", authRouter);
app.use("/dm", dmRouter);
app.use("/server", serverRouter);

app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
});

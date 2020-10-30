require("dotenv").config();

const path = require("path");

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json({ extended: false }));
app.use("/images", express.static(path.join(__dirname, "Images")));

connectDB();

app.use("/adverts", require("./routes/adverts"));
app.use("/users", require("./routes/users"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server Running on PORT ${PORT}`));

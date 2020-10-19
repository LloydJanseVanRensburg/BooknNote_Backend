require("dotenv").config();

const express = require("express");

const connectDB = require("./config/db");

const app = express();

app.use(express.json({ extended: false }));

connectDB();

app.use("/adverts", require("./routes/adverts"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server Running on PORT ${PORT}`));

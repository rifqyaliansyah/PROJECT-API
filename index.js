const express = require("express");
const dotenv = require("dotenv");
const db = require("./config/database");
const cors = require("cors");
const path = require('path');

const produkRoutes = require("./routes/produk/routerProduk");
const transaksiRoutes = require("./routes/transaksi/routerTransaksi");
const userRoutes = require("./routes/user/routerUser");

const User = require("./models/userModels");
const Product = require("./models/produkModels");
const Transaksi = require("./models/transaksiModels");
const DetailTransaksi = require("./models/detailtransaksiModels");
const cookieParser = require("cookie-parser");

dotenv.config();
const app = express();

app.use(
  cors({
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', produkRoutes);
app.use('/api', transaksiRoutes);
app.use('/api', userRoutes);

// db.authenticate()
//   .then(async () => {
//     console.log("Connection success");
//     await db.sync({ alter: true });
//   })
//   .catch((err) => console.log("Error: " + err));

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

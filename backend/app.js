require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require("cors");
const connectDB = require('./config/database');
const config = require('./config/config');
const globalerrorhandle = require('./middleWares/globalError');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true
  }
});

// Middleware to attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});


// Middleware
app.use(cors({
    credentials: true,
    origin: ['http://localhost:5173']
}))
// keep raw body for Stripe webhook endpoint
app.use((req, res, next) => {
    if (req.originalUrl === '/api/tenant/webhook') {
        // collect raw body
        let data = '';
        req.setEncoding('utf8');
        req.on('data', chunk => { data += chunk; });
        req.on('end', () => {
            req.rawBody = data;
            try { req.body = JSON.parse(data); } catch (e) { req.body = {}; }
            next();
        });
    } else {
        express.json()(req, res, next);
    }
});
app.use(cookieParser());

connectDB();
const PORT =config.port;




// root endpoint
app.get('/', (req, res) => {
    res.json({message: 'welcome to the POS system'});
})

app.use("/api/user", require("./routes/userRoute"));
app.use("/api/order", require("./routes/orderRoute"));
app.use("/api/table",require("./routes/tableRoute"));
app.use("/api/menu", require("./routes/menuRoute"));
app.use("/api/payment", require("./routes/paymentRoute"));
app.use("/api/category", require("./routes/categoryRoute"));
app.use('/api/tenant', require('./routes/tenantRoute'));

//global error
app.use(globalerrorhandle)
//server
httpServer.listen(PORT, () => {
    console.log(`POS Server is running on port ${PORT}`);
})
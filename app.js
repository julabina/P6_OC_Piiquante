const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();
const userRoutes = require('./routes/User');

const app = express();

mongoose.connect('mongodb+srv://' + process.env.DB_CONNECT + '@cluster0.9vlpb.mongodb.net/piiquante?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Successful database connection'))
    .catch(() => console.log('Database connection failed'));

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(morgan('dev'));

app.use('/api/auth', userRoutes);

module.exports = app;
const express = require('express');
const Book = require('../model/books');
const router = express.Router();

router.get('/', async (req, res) => {
    let books
    try{
        books = await Book.find({}).sort({ createdAt: 'desc'} ).limit(10).exec();
    }catch{
        books = []
    }
    res.render('index', { books });
    // res.send('Hello World');
})

module.exports = router;
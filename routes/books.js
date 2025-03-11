const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const Book = require('../model/books');
const uploadPath = path.join('public', Book.coverImageBasePath);
const Author = require('../model/author');

const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif'];
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => { callback(null, imageMimeTypes.includes(file.mimetype)) }
})

// All Books Route
router.get('/', async (req, res) => {
    let query = Book.find(), rQuery = req.query;
    if(rQuery.title != null && rQuery.title != ''){
        query = query.regex('title', new RegExp(rQuery.title, 'i'))
    }
    if(rQuery.publishedBefore != null && rQuery.publishedBefore != ''){
        query = query.lte('publishDate', rQuery.publishedBefore) // .lte() is a mongoose method that means less than or equal to.
    }
    if(rQuery.publishedAfter != null && rQuery.publishedAfter != ''){
        query = query.gte('publishDate', rQuery.publishedAfter) // .gte() is a mongoose method that means greater than or equal to.
    }
    try{
        // const books = await Book.find({})
        const books = await query.exec()
        res.render('books/index', { books, bookObj: rQuery })
    }catch{
        res.redirect('/')
    }
//    res.send('All Books');
})

// New Book Route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book())
})

// Create Book Route
router.post('/', upload.single('cover'), async (req, res) => {
    let formBody = req.body, getFile = req.file == null ? null : req.file.filename;
    const book = new Book({
        title: formBody.title,
        author: formBody.author,
        publishDate: new Date(formBody.publishDate),
        pageCount: formBody.pageCount,
        coverImageName: getFile,
        description: formBody.description
    })

    try{
        const newBook = await book.save();
        // res.redirect(`books/${newBook.id}`);
        res.redirect(`books`);
    }catch(err){
        if(book.coverImageName != null) removeBookCover(book.coverImageName);
        // res.send({err, Body: formBody, File: getFile});
        renderNewPage(res, book, true)
    }
    // res.send('Create Book');
})


async function renderNewPage(res, book, hasError=false){
    try{
        const authors = await Author.find({});
        const params = { authors, book };
        if(hasError) params.errorMessage = 'Error Creating Book';
        // console.log('bookSchema:', { authors, book })
        res.render('books/new', params);
    }catch(err){
        res.redirect('/books');
    }
}
function removeBookCover(imageName){
    fs.unlink(path.join(uploadPath, imageName), err => { if (err) console.error(err) })
}

module.exports = router;
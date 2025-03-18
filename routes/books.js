const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs'); // File System
const router = express.Router();
const Book = require('../model/books');
// const uploadPath = path.join('public', Book.coverImageBasePath);
const Author = require('../model/author');

const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif'];
/* const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => { callback(null, imageMimeTypes.includes(file.mimetype)) }
}) */

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
        const authors = await Author.find({});
        // const books = await Book.find({})
        const books = await query.exec()
        // res.render('books/index', { books, bookObj: rQuery })
        res.render('books/index', { books, bookObj: rQuery, authors })
    }catch{
        res.redirect('/')
    }
//    res.send('All Books');
})

// New Book Route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book())
})

// Show Book Route
router.get('/:id', async (req, res) => {
    try{
        const book = await Book.findById(req.params.id).populate('author').exec()
        // console.log(book)
        res.render('books/show', { book })
    }catch{
        res.redirect('/')
    }
})

// Edit Book Route
router.get('/:id/edit', async (req, res) => {
    try{
        const book = await Book.findById(req.params.id)
        renderEditPage(res, book)
    }catch{
        res.redirect('/')
    }
})

// Create Book Route
// router.post('/', upload.single('cover'), async (req, res) => {
router.post('/', async (req, res) => {
    let formBody = req.body/* , getFile = req.file == null ? null : req.file.filename */;
    const book = new Book({
        title: formBody.title,
        author: formBody.author,
        publishDate: new Date(formBody.publishDate),
        pageCount: formBody.pageCount,
        // coverImageName: getFile,
        description: formBody.description
    })
    saveCover(book, formBody.cover)

    try{
        const newBook = await book.save();
        res.redirect(`books/${newBook.id}`);
        // res.redirect(`books`);
    }catch(err){
        // if(book.coverImageName != null) removeBookCover(book.coverImageName);
        renderNewPage(res, book, true)
    }
    // res.send('Create Book');
})

// Update Book Route
router.put('/:id', async (req, res) => {
    let book
    try{
        book = await Book.findById(req.params.id);
        book.title = req.body.title;
        book.author = req.body.author;
        book.publishDate = new Date(req.body.publishDate);
        book.pageCount = req.body.pageCount;
        book.description = req.body.description;
        if(req.body.cover != null && req.body.cover !== '') saveCover(book, req.body.cover);
        book.save();
        res.redirect(`/books/${book.id}`);
        // res.redirect(`books`);
    }catch(err){
        console.log(err)
        // if(book.coverImageName != null) removeBookCover(book.coverImageName);
        if(book != null){
            renderEditPage(res, book, true)
        }else{
            res.redirect('/')
        }
    }
    // res.send('Create Book');
})
router.delete('/:id', async (req, res) => {
    let books
    let book
    try{
        book = await Book.findById(req.params.id).exec()
        await book.deleteOne({ id: req.params.id }).exec()
        // console.log(req.params)
        
        res.redirect('/books')
    }catch(err){
        console.log(err, book);
        // book = await books.findOne({ id: req.params.id })
        if(book != null){
            res.redirect('books/show', { book, errorMessage: 'Could not remove book' });
        }else{ 
            res.redirect(`/`)
        }
    }
})


async function renderNewPage(res, book, hasError=false){
    /* try{
        const authors = await Author.find({});
        const params = { authors, book };
        if(hasError) params.errorMessage = 'Error Creating Book';
        // console.log('bookSchema:', { authors, book })
        res.render('books/new', params);
    }catch(err){
        res.redirect('/books');
    } */
    renderFormPage(res, book, 'new', hasError)
}
async function renderEditPage(res, book, hasError=false){
    renderFormPage(res, book, 'edit', hasError)
}
async function renderFormPage(res, book, form, hasError=false){
    try{
        const authors = await Author.find({});
        // const params = { authors, book };
        const params = { authors, bookObj: book };
        let errPrefix = form === 'new' ? 'Crea' : 'Upda';
        if(hasError) params.errorMessage = 'Error '+errPrefix+'ting Book';
        // console.log('bookSchema:', { authors, book })
        res.render(`books/${form}`, params);
    }catch(err){
        res.redirect('/books');
    }
}
/* function removeBookCover(imageName){
    fs.unlink(path.join(uploadPath, imageName), err => { if (err) console.error(err) })
} */

function saveCover(book, coverEncoded){
    if(coverEncoded == null) return
    
    const cover = JSON.parse(coverEncoded)
    
    if(cover != null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}

module.exports = router;
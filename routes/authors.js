const express = require('express');
const router = express.Router();
const Author = require('../model/author');
const Book = require('../model/books');

// All Authurs Route
router.get('/', async (req, res) => {
    let searchOptions = {}
    if(req.query.name != null && req.query.name !== ''){ // get uses query, post uses body
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try{
        const authors = await Author.find(searchOptions);
        // res.render('authors/index', { authors, searchOptions: req.query});
        res.render('authors/index', { authors, authorObj: req.query});
    }catch(err){
        res.redirect('/');
    }
    // res.render('authors/index');
})

// New Authur Route
router.get('/new', async (req, res) => {
    // let author = new Author(); // create a new author object
    let authorObj = new Author(); // create a new/blanc author object
    const authors = await Author.find({}); // get all authors, returns an array
    // res.render('authors/new', { author });
    res.render('authors/new', { authors, authorObj });
})

// Create Authur Route
router.post('/', (req, res) => {
    const author = new Author({
        name: req.body.name // get uses req.query, post uses req.body & request strings ?name=value&name=value uses req.params
    })
    author.save().then(newAuthor => {
        res.redirect(`/authors/${newAuthor.id}`);
        // res.redirect('authors');
    }).catch(err => {
        res.render('authors/new', {
            authorObj: author,
            errorMessage: 'Error creating Author'
        });
    });
})

router.get('/:id', async (req, res) => {
    try{
        const author = await Author.findById(req.params.id)
        const books = await Book.find({ author: author.id }).limit(6).exec()
        res.render('authors/show', { booksByAuthor: books, authorObj: author })
    }catch(err){
        // console.log(err);
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req, res) => {
    try{
        const author = await Author.findById(req.params.id)
        res.render('authors/edit', { authorObj: author})
    }catch{
        res.redirect('/author')
    }
})
router.put('/:id', (req, res) => {
    let author = Author.findById(req.params.id).then(record => {
        record.name = req.body.name
        record.save().then(updatedAuthor => {
            res.redirect(`/authors/${updatedAuthor.id}`)
        }).catch(err => {
            if(author == null){
                res.redirect('/');
            }else{ 
                res.render('authors/edit', {
                    authorObj: author,
                    errorMessage: 'Error updating Author'
                })
            }
        })
    }).catch(err => {})
})
router.delete('/:id', async (req, res) => { // Never use a GET request to delete data. Because it can be accessed by a search engine and a user can accidentally click on it.
    let author
    try{
        author = await Author.findOne({ id: req.params.id })
        await author.deleteOne()
        
        // Check whether this Author already have books
        /* Book.find({ author: author.id }).then(async (books) => {
            if(books.length > 0){
                console.log(new Error('This author has books still'))
                res.redirect(`/authors/${author.id}`)
            }else{
                    await author.deleteOne()
                    res.redirect('/authors')
                }
            }, (err) => {
                new Error(err)
            }) */
            
         res.redirect('/authors')
    }catch(err){
        console.log(err);
        if(author == null){
            res.redirect('/');
        }else{ 
            res.redirect(`/authors/${author.id}`)
        }
    }
})

module.exports = router;
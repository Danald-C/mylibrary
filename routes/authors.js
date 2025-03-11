const express = require('express');
const router = express.Router();
const Author = require('../model/author');

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
// router.get('/new', (req, res) => {
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
        name: req.body.name // get uses query, post uses body
    })
    author.save().then(newAuthor => {
        // res.redirect(`authors/${newAuthor.id}`);
        res.redirect('authors');
    }).catch(err => {
        res.render('authors/new', {
            author,
            errorMessage: 'Error creating Author'
        });
    });
})

module.exports = router;
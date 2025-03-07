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
        res.render('authors/index', { authors, searchOptions: req.query});
    }catch(err){
        conssole.log(err);
        res.redirect('/');
    }
    // res.render('authors/index');
})

// New Authur Route
router.get('/new', (req, res) => {
    res.render('authors/new', {author: new Author() });
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
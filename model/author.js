const mongoose = require('mongoose')
const Book = require('./books')

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})


// Run this only & before everytime we remove an author
authorSchema.pre('deleteOne', { document: true, query: false }, function(next){
    Book.find({ author: this.id }).then((books) => {
        // console.log(books)
        if(books.length > 0){
            next(new Error('This author has books still')) // This gets sent to the commandline
        }else{
            next()
        }
    }, (err) => {
        next(err)
    })/* .catch(err => {
        next(err)
    }) */
})

module.exports = mongoose.model('Author', authorSchema)

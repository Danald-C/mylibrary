const mongoose = require('mongoose')
const Book = require('./books')

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

// Run this only & before everytime we remove an author
authorSchema.pre('remove', function(next){
    Book.find({ author: this.id }, (err, books) => {
        if(err){
            next(error)
        }else if(books.length > 0){
            next(new Error('This author has books still'))
        }else{
            next()
        }
    })
})

module.exports = mongoose.model('Author', authorSchema)

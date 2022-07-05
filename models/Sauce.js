const mongoose = (require('mongoose'));

const SauceSchema = mongoose.Schema({
    userId: {type: String, require: true},
    SauceName: {type: String, require: true},
    manufacturer: {type: String, require: true},
    description: {type: String, require: true},
    mainPepper: {type: String, require: true},
    imageUrl: {type: String, require: true},
    heat: {type: Number, require: true},
    likes: {type: Number, require: true},
    dislikes: {type: Number, require: true},
    userLiked: {type: Array, require: true},
    userDisliked:  {type: Array, require: true},
});

module.exports = mongoose.model('Sauce', SauceSchema);
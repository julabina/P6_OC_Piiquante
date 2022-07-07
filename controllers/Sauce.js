const Sauce = require('../models/Sauce');
const fs = require('fs');

/**
 * get all sauces
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getAllSauces = (req, res, next) => {

    Sauce.find()
        .then(sauces => res.status(200).json( sauces ))
        .catch(error => res.status(400).json({ error }));

};

/**
 * get one sauce, filtered by id
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getOneSauce = (req, res, next) => {

    Sauce.findOne({_id : req.params.id})
        .then(sauce => {
            const message = "Une sauce a bien été trouvée.";
            res.status(200).json(sauce);
        })
        .catch(error => res.status(404).json({ error }));

}

/**
 * add one new sauce
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.createSauce = (req, res, next) => {

    const sauceObj = JSON.parse(req.body.sauce);
    delete sauceObj._id;
    delete sauceObj._userId;

    const sauce = new Sauce({
        ...sauceObj,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/assets/${req.file.filename}`,
        usersLiked : [],
        usersDisliked : [],
        likes: 0,
        dislikes: 0
    });
    sauce.save()
        .then(() => {
            const message = "Sauce enregistrée.";
            res.status(201).json({ message });
        })
        .catch(error => res.status(400).json({ error }));

};

/**
 * modify one sauce
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.modifySauce = (req, res, next) => {

    const sauceObj = req.file ? {
        ...sauceObj,
        imageUrl: `${req.protocol}://${req.get('host')}/assets/${req.file.filename}`,
    } : { ...req.body };

    delete sauceObj._userId;

    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            if(!sauce) {
                return res.status(404).json({ error : new error('Sauce non trouvée.') });
            }
            if(sauce.userId !== req.auth.userId) {
                return res.status(403).json({ error : new error('Requete non authorisée.') });
            }
            Sauce.updateOne({_id: req.params.id}, { sauceObj, _id: req.params.id })
                .then(() => {
                    const message = "Sauce bien modifiée.";
                    res.status(200).json({ message });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));

};

/**
 * delete one sauce
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.deleteSauce = (req, res, next) => {

    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            if(!sauce) {
                return res.status(404).json({ error : new error('Sauce non trouvée.') });
            }
            if(sauce.userId !== req.auth.userId) {
                return res.status(403).json({ error : new error('Requete non authorisée.') });
            }
            const filename = sauce.imageUrl.split('/assets/')[1];
            fs.unlink(`assets/${filename}`, () => {
                Sauce.deleteOne({_id: req.params.id})
                .then(() => {
                    const message = "La sauce a bien été supprimer.";
                    res.status(200).json({ message });
                })
                .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));

};

/**
 * add and remove like or dislike to one sauce
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.handleLike = (req, res, next) => {

    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            if(!sauce) {
                return res.status(404).json({ error : new error('Sauce non trouvée.') });
            }
            if(req.body.like === 1) {
                    const newLikes = sauce.likes + 1;
                    let newDislikes = sauce.dislikes;
                    let usersLikedArr = sauce.usersLiked;
                    usersLikedArr.push(req.body.userId);
                    if(sauce.usersDisliked.includes(req.body.userId)) {
                        newDislikes -= 1; 
                    }
                    let newArr = sauce.usersDisliked;
                    const usersDislikeArr = newArr.filter(el => el!== req.body.userId);
                    Sauce.updateOne({_id: req.params.id}, {
                        likes: newLikes,
                        dislikes: newDislikes, 
                        usersLiked: usersLikedArr,
                        usersDisliked: usersDislikeArr
                     })
                        .then(() => {
                            const message = "Like bien ajouté.";
                            return res.status(200).json({ message });
                        })
                        .catch(error => { 
                            return res.status(400).json({ error })
                        });
            } else if(req.body.like === -1) {
                    const newDislikes = sauce.dislikes + 1;
                    let newLikes = sauce.likes;
                    let usersDislikeArr = sauce.usersDisliked;
                    usersDislikeArr.push(req.body.userId);
                    if(sauce.usersLiked.includes(req.body.userId)) {
                        newLikes -= 1; 
                    }
                    let newArr = sauce.usersLiked;
                    const usersLikedArr = newArr.filter(el => el!== req.body.userId); 
                    Sauce.updateOne({_id: req.params.id}, {
                        likes: newLikes,
                        dislikes: newDislikes, 
                        usersLiked: usersLikedArr,
                        usersDisliked: usersDislikeArr
                    })
                        .then(() => {
                            const message = "Dislike bien ajouté.";
                            return res.status(200).json({ message });
                        })
                        .catch(error => { 
                            return res.status(400).json({ error })
                        });
            } else if (req.body.like === 0) {
                let newLikes = sauce.likes;
                let newDislikes = sauce.dislikes;
                if(sauce.usersDisliked.includes(req.body.userId)) {
                    newDislikes -= 1; 
                } else if(sauce.usersLiked.includes(req.body.userId)) {
                    newLikes -= 1; 
                }
                let newLikeArr = sauce.usersLiked;
                let newDislikeArr = sauce.usersDisliked;
                const usersLikedArr = newLikeArr.filter(el => el!== req.body.userId); 
                const usersDislikeArr = newDislikeArr.filter(el => el!== req.body.userId); 
                Sauce.updateOne({_id: req.params.id}, {
                    likes: newLikes,
                    dislikes: newDislikes, 
                    usersLiked: usersLikedArr,
                    usersDisliked: usersDislikeArr
                })
                    .then(() => {
                        const message = "Like bien modifiée.";
                        return res.status(200).json({ message });
                    })
                    .catch(error => { 
                        return res.status(400).json({ error })
                    });
            }
        })
        .catch(error => res.status(500).json({ error }));

};
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, 'AdkeRet54eEazeYTmpo');
        const userId = decodedToken.userId;
        req.auth = { userId : userId};
        if(req.body.userId && req.body.userId !== userId) {
            throw 'Invalid user id';
        } else {
            next();
        }
    } catch (error) {
        res.status(403).json({ error: error | 'Unauthenticated request' });
    }
}
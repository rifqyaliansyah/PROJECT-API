const router = require("express").Router();
const { createUser, Login, } = require("../../controllers/user/user");

router.post('/register', createUser);
router.post('/login', Login);

module.exports = router;
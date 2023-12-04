const auth = require('../controllers/auth');
const { router } = require('../services/imports');

router.post('/signup', auth.signup);
router.post('/signin', auth.signin);
router.post('/auth/user-create', auth.userCreate)
router.post('/change/password', auth.changePassword);
router.get('/pro', (req, res) => {
    return res.success({ msg: 'data fetched successfully' })
})
module.exports = router;

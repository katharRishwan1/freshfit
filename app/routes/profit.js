const { profit } = require('../controllers');
const { router } = require('../services/imports');

router.get('/profit', profit.getProfit);
router.get('/profit-get', profit.profitWithProducts)
module.exports = router;

const { product } = require('../controllers');
const { router } = require('../services/imports');

router.post('/product', product.createProduct);
router.get('/product/:id?', product.getProduct);
router.get('/auth/product/:id?', product.getProduct)
router.put('/product/:id', product.updateProduct);
router.delete('/product/:id', product.deleteProduct);
router.post('/rate/update/:id', product.rateUpdate);
router.post('/product-status/:id', product.statusUpdate);
module.exports = router;

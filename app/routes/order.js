const { order } = require('../controllers');
const { cardUpdate } = require('../controllers/order');
const { router } = require('../services/imports');

router.post('/order', order.createOrder);
router.get('/order/:id?', order.getOrder);
router.put('/order/:id', order.updateOrder);
router.delete('/order/:id', order.deleteOrder);
router.post('/rating/:id', order.createRating);
router.post('/delivery/:id', order.delivery);
router.get('/today-needed-products', order.todayNeededProducts);
router.post('/toady-orders-delivery', order.todayAllProductsDelivery);
router.post('/add-cart', order.addCart);
router.post('/order-confirm/:id', order.orderConfirm);
router.get('/last-order-get', order.lastOrderGet);
router.post('/cart-delete/:id', order.cartDelete);
module.exports = router;

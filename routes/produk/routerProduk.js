const router = require("express").Router();
const { getProdukByCategory, createProduk, updateProduk, deleteProduk } = require("../../controllers/produk/produk");
 const upload = require('../../middelware/multerConfig');
const protect = require('../../middelware/auth');

// Rute produk
router.get('/getProduk/:category', getProdukByCategory);
router.post('/createProduk', upload.single('image'), createProduk);
router.patch('/updateProduk/:id', upload.single('image'), updateProduk);
router.delete('/deleteProduk/:id', deleteProduk);

module.exports = router;

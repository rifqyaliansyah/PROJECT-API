const router = require("express").Router();
const { createTransaksi,
    getAllTransaksi,
    deleteTransaksi,
    getAllDetailTransaksi,
    deleteDetailTransaksi,
    getDetailTransaksiById,
    updateDetailTransaksiStatus, } = require ("../../controllers/transaksi/transaksi");

router.post('/transaksi', createTransaksi);
router.get('/transaksi', getAllTransaksi);
router.delete('/transaksi/:id', deleteTransaksi);
router.get('/detailtransaksi', getAllDetailTransaksi);
router.delete('/detail-transaksi/:id', deleteDetailTransaksi);
router.get('/detail-transaksi/:id', getDetailTransaksiById);
router.put('/transaksi/:transaksiId/status', updateDetailTransaksiStatus);

module.exports = router;
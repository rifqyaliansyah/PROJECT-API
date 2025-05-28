const Transaksi = require('../../models/transaksiModels');
const DetailTransaksi = require('../../models/detailtransaksiModels');
const Produk = require('../../models/produkModels');
const { sequelize } = require('../../models/transaksiModels');  // Import sequelize to use transaction

const createTransaksi = async (req, res) => {
    const { biaya_layanan, detail_transaksi } = req.body;

    const transaction = await sequelize.transaction(); // Start a transaction
    try {
        const newTransaksi = await Transaksi.create({
            biaya_layanan
        }, { transaction });

        let total_harga = 0;

        const detailPromises = detail_transaksi.map(async (item) => {
            const produk = await Produk.findOne({ where: { id: item.produk_id }, transaction });
            if (!produk) {
                throw new Error(`Product with ID ${item.produk_id} not found`);
            }

            const total = item.kuantitas * produk.sale_price;
            total_harga += total;

            await DetailTransaksi.create({
                transaksi_id: newTransaksi.id,
                produk_id: item.produk_id,
                kuantitas: item.kuantitas,
                harga_satuan: produk.sale_price,
                total: total,
            }, { transaction });
        });

        await Promise.all(detailPromises);

        const total_with_service = total_harga + biaya_layanan;
        await Transaksi.update({ total_harga: total_with_service }, {
            where: { id: newTransaksi.id },
            transaction
        });

        await transaction.commit(); // Commit the transaction if everything is successful

        res.status(201).json({
            message: "Transaction created successfully",
            transaksiId: newTransaksi.id,
            total_harga: total_with_service
        });
    } catch (error) {
        await transaction.rollback(); // Rollback if any error occurs
        console.error("Error creating transaction:", error);
        res.status(500).json({ message: "Error creating transaction", error: error.message });
    }
};

const getAllTransaksi = async (req, res) => {
    try {
        const transaksi = await Transaksi.findAll({
            include: [
                {
                    model: DetailTransaksi,
                    include: [Produk],
                },
            ],
        });
        res.status(200).json(transaksi);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Error fetching transactions", error: error.message });
    }
};

const deleteTransaksi = async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await Transaksi.destroy({ where: { id } });

        if (!deleted) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.status(200).json({ message: "Transaction deleted successfully" });
    } catch (error) {
        console.error("Error deleting transaction:", error);
        res.status(500).json({ message: "Error deleting transaction", error: error.message });
    }
};

// Mengambil semua detail transaksi
const getAllDetailTransaksi = async (req, res) => {
    try {
        const transaksiList = await Transaksi.findAll();

        if (transaksiList.length === 0) {
            return res.status(404).json({ message: "No transactions found" });
        }

        const allDetailTransaksi = []; // Array untuk menyimpan detail transaksi

        await Promise.all(
            transaksiList.map(async (transaksi) => {
                const detailTransaksi = await DetailTransaksi.findAll({
                    where: { transaksi_id: transaksi.id },
                    include: [{
                        model: Produk,
                        attributes: ['product_name', 'description', 'sale_price']
                    }]
                });

                let totalHarga = 0;
                const uniqueProducts = new Set();

                detailTransaksi.forEach((detail) => {
                    totalHarga += parseFloat(detail.total); 
                    uniqueProducts.add(detail.produk.product_name);
                });

                const subtotal = totalHarga + parseFloat(transaksi.biaya_layanan);
                const totalProduk = uniqueProducts.size;

                // Menambahkan objek detail transaksi ke array
                allDetailTransaksi.push({
                    transaksi: {
                        id: transaksi.id,
                        tanggal_transaksi: transaksi.tanggal_transaksi
                    },
                    detailTransaksi: detailTransaksi.map(detail => ({
                        id: detail.id,
                        produk_id: detail.produk_id,
                        kuantitas: detail.kuantitas,
                        harga_satuan: detail.harga_satuan,
                        total: detail.total,
                        status: detail.status,
                        produk: {
                            product_name: detail.produk.product_name,
                            description: detail.produk.description,
                            sale_price: detail.produk.sale_price
                        }
                    })),
                    totalProduk: totalProduk,
                    totalHarga: totalHarga,
                    biayaLayanan: transaksi.biaya_layanan,
                    subtotal: subtotal
                });
            })
        );

        res.status(200).json(allDetailTransaksi);
    } catch (error) {
        console.error("Error fetching detail transactions:", error);
        res.status(500).json({ message: "Error fetching detail transactions", error: error.message });
    }
};


// Menghapus detail transaksi
const deleteDetailTransaksi = async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await DetailTransaksi.destroy({ where: { id } });

        if (!deleted) {
            return res.status(404).json({ message: "Detail transaction not found" });
        }

        res.status(200).json({ message: "Detail transaction deleted successfully" });
    } catch (error) {
        console.error("Error deleting detail transaction:", error);
        res.status(500).json({ message: "Error deleting detail transaction", error: error.message });
    }
};

const getDetailTransaksiById = async (req, res) => { 
    const transaksiId = req.params.id;

    try {
        const transaksi = await Transaksi.findOne({
            where: { id: transaksiId }
        });

        if (!transaksi) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        const detailTransaksi = await DetailTransaksi.findAll({
            where: { transaksi_id: transaksiId },
            include: [{
                model: Produk,
                attributes: ['product_name', 'description', 'sale_price']
            }]
        });

        if (detailTransaksi.length === 0) {
            return res.status(404).json({ message: "No details found for this transaction" });
        }

        let totalHarga = 0;
        const uniqueProducts = new Set();

        detailTransaksi.forEach((detail) => {
            totalHarga += parseFloat(detail.total); 
            uniqueProducts.add(detail.produk.product_name); 
        });

        const subtotal = totalHarga + parseFloat(transaksi.biaya_layanan);  
        const totalProduk = uniqueProducts.size;  

        res.status(200).json({
            transaksi: {
                id: transaksi.id,
                tanggal_transaksi: transaksi.tanggal_transaksi
            },
            detailTransaksi: detailTransaksi.map(detail => ({
                id: detail.id,
                produk_id: detail.produk_id,
                kuantitas: detail.kuantitas,
                harga_satuan: detail.harga_satuan,
                total: detail.total,
                status: detail.status,  
                produk: {
                    product_name: detail.produk.product_name,
                    description: detail.produk.description,
                    sale_price: detail.produk.sale_price
                }
            })),
            totalProduk: totalProduk,  
            totalHarga: totalHarga, 
            biayaLayanan: transaksi.biaya_layanan,  
            subtotal: subtotal  
        });
    } catch (error) {
        console.error("Error getting transaction details:", error);
        res.status(500).json({ message: "Error getting transaction details", error: error.message });
    }
};



const updateDetailTransaksiStatus = async (req, res) => {
    const transaksiId = req.params.transaksiId; 
    const { status } = req.body; 

    try {
        const transaksi = await Transaksi.findOne({
            where: { id: transaksiId }
        });

        if (!transaksi) {
            return res.status(404).json({ message: "Transaksi tidak ditemukan" });
        }

        await DetailTransaksi.update(
            { status: status },
            { where: { transaksi_id: transaksiId } }
        );

        const updatedDetails = await DetailTransaksi.findAll({
            where: { transaksi_id: transaksiId },
            include: [{
                model: Produk,
                attributes: ['product_name', 'description', 'sale_price']
            }]
        });

        let totalHarga = 0;
        const uniqueProducts = new Set();

        updatedDetails.forEach((detail) => {
            totalHarga += parseFloat(detail.total);
            uniqueProducts.add(detail.produk.product_name);
        });

        const subtotal = totalHarga + parseFloat(transaksi.biaya_layanan);
        const totalProduk = uniqueProducts.size;

        res.status(200).json({
            message: "Status berhasil diperbarui",
            transaksi: {
                id: transaksi.id,
                tanggal_transaksi: transaksi.tanggal_transaksi
            },
            detailTransaksi: updatedDetails.map(detail => ({
                id: detail.id,
                produk_id: detail.produk_id,
                kuantitas: detail.kuantitas,
                harga_satuan: detail.harga_satuan,
                total: detail.total,
                status: detail.status,
                produk: {
                    product_name: detail.produk.product_name,
                    description: detail.produk.description,
                    sale_price: detail.produk.sale_price
                }
            })),
            totalProduk: totalProduk,
            totalHarga: totalHarga,
            biayaLayanan: transaksi.biaya_layanan,
            subtotal: subtotal
        });
    } catch (error) {
        console.error("Error updating status of detail transaksi:", error);
        res.status(500).json({ message: "Error updating status", error: error.message });
    }
};

module.exports = {
    createTransaksi,
    getAllTransaksi,
    deleteTransaksi,
    getAllDetailTransaksi,
    deleteDetailTransaksi,
    getDetailTransaksiById,
    updateDetailTransaksiStatus,
};

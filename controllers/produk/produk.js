const Produk = require('../../models/produkModels');

const getProdukByCategory = async (req, res) => {
    try {
        // Ambil kategori dari parameter URL
        const category = req.params.category;

        // Validasi kategori agar hanya menerima "makanan" atau "minuman"
        if (category !== 'makanan' && category !== 'minuman') {
            return res.status(400).json({
                message: 'Kategori harus berupa "makanan" atau "minuman"'
            });
        }

        // Ambil semua produk berdasarkan kategori
        const response = await Produk.findAll({
            where: {
                category: category
            }
        });

        if (response.length === 0) {
            return res.status(404).json({
                message: `Tidak ada produk ditemukan untuk kategori ${category}`
            });
        }

        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan',
            error: error.message
        });
    }
};



const createProduk = async (req, res) => {
    try {
        const { product_name, description, category, sku, stock_quantity, regular_price, sale_price } = req.body;

        // Validasi kategori agar hanya menerima "makanan" atau "minuman"
        if (category !== 'makanan' && category !== 'minuman') {
            return res.status(400).json({
                message: 'Kategori harus berupa "makanan" atau "minuman"'
            });
        }

        // Dapatkan URL gambar jika file diunggah
        const image_url = req.file ? `/uploads/${req.file.filename}` : null;

        const newProduct = await Produk.create({
            product_name,
            description,
            category,
            sku,
            stock_quantity,
            regular_price,
            sale_price,
            image_url
        });

        res.status(201).json({
            message: 'Produk berhasil ditambahkan',
            data: newProduct
        });
    } catch (error) {
        res.status(500).json({
            message: 'Terjadi kesalahan',
            error: error.message
        });
    }
};




const updateProduk = async (req, res) => {
    try {
        const { id } = req.params;
        const { product_name, description, category, sku, stock_quantity, regular_price, sale_price } = req.body;

        // Cari produk berdasarkan ID
        const produk = await Produk.findByPk(id);
        if (!produk) {
            return res.status(404).json({ message: "Produk tidak ditemukan" });
        }

        // Dapatkan URL gambar jika ada file baru yang diunggah
        const image_url = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : produk.image_url;

        // Update produk
        await produk.update({
            product_name,
            description,
            category,
            sku,
            stock_quantity,
            regular_price,
            sale_price,
            image_url
        });

        res.status(200).json({
            message: 'Produk berhasil diperbarui',
            data: produk
        });
    } catch (error) {
        res.status(500).json({
            message: 'Terjadi kesalahan',
            error: error.message
        });
    }
};

const deleteProduk = async (req, res) => {
    try {
        const { id } = req.params;
        const produk = await Produk.findByPk(id);
        if (!produk) {
            return res.status(404).json({ message: "Produk tidak ditemukan" });
        }

        await produk.destroy();
        res.status(200).json({ message: "Produk berhasil dihapus" });
    } catch (error) {
        res.status(500).json({
            message: 'Terjadi kesalahan',
            error: error.message
        });
    }
};

module.exports = { getProdukByCategory, createProduk, updateProduk, deleteProduk };
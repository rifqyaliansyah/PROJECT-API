const User = require('../../models/userModels');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const validRoles = ['admin', 'user', 'kasir', 'superadmin'];

const createUser = async (req, res) => {
    const { name, username, email, password, role } = req.body;
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    try {
        await User.create({
            name: name,
            username: username,
            email: email,
            password: hash,
            role: role
        });
        res.json({ message: 'User Created' });
    } catch (error) {
        console.log(error);
    }
};

const Login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: "Username tidak ditemukan" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password salah" });
    }

    if (isMatch === false) {
      return res.status(401).json({ message: "Password salah" });
    }

    // Generate JWT without expiration
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.SECRET_KEY // No expiration time
    );

    // Set token akses tanpa refresh token
    res.cookie('token', token, { httpOnly: true, sameSite: "None", secure: true, path: "/" });

    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { createUser, Login };
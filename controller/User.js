const { User } = require("../model/User");

exports.fetchUserById = async (req, res) => {
    const { id } = req.user;
    try {
      const user = await User.findById(id);
      res.status(200).json({
        id: user.id,
        name: user.name,
        addresses: user.addresses,
        email: user.email,
        role: user.role,
        gender: user.gender
      });
    } catch (err) {
      res.status(400).json(err);
    }
  }

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const addresses = req.body;
  try {
    const user = await User.findByIdAndUpdate(id, addresses, { new: true });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json(error);
  }
}

exports.profileUpdate = async (req, res) => {
  const { id } = req.params;
  const { name, email, gender } = req.body;

  try {
    const updatedProfile = await User.findByIdAndUpdate(
      id,
      { name, email, gender },
      { new: true }
    );
    res.json(updatedProfile);
  } catch (error) {
    res.status(500).send({ message: "Error updating quantity", error });
  }
}



exports.roleUpdate = async (req, res) => {
   try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = user.role === 'admin' ? 'user' : 'admin';
    await user.save();

    res.json({ message: 'Role switched successfully', newRole: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}



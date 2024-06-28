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
  const { name, email, bio } = req.body;

  try {
    const updatedProfile = await User.findByIdAndUpdate(
      id,
      { name, email, bio },
      { new: true }
    );
    res.json(updatedProfile);
  } catch (error) {
    res.status(500).send({ message: "Error updating quantity", error });
  }
}
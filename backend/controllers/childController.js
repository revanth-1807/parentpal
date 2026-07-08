const Child = require("../models/Child");

// @route POST /api/children
const createChild = async (req, res, next) => {
  try {
    const { childName, age, gender, interests, learningStyle, challenges, avatar } = req.body;
    if (!childName || !age) return res.status(400).json({ message: "childName and age are required" });

    const child = await Child.create({
      parentId: req.parent._id,
      childName,
      age,
      gender,
      interests: interests || [],
      learningStyle: learningStyle || "visual",
      challenges: challenges || [],
      avatar,
    });

    res.status(201).json({ child });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/children
const getChildren = async (req, res, next) => {
  try {
    const children = await Child.find({ parentId: req.parent._id }).sort({ createdAt: -1 });
    res.json({ children });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/children/:id
const getChildById = async (req, res) => {
  res.json({ child: req.child });
};

// @route PUT /api/children/:id
const updateChild = async (req, res, next) => {
  try {
    const updates = (({ childName, age, gender, interests, learningStyle, challenges, avatar }) => ({
      childName,
      age,
      gender,
      interests,
      learningStyle,
      challenges,
      avatar,
    }))(req.body);

    Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

    const updated = await Child.findByIdAndUpdate(req.child._id, updates, { new: true });
    res.json({ child: updated });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/children/:id
const deleteChild = async (req, res, next) => {
  try {
    await Child.findByIdAndDelete(req.child._id);
    res.json({ message: "Child profile deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createChild, getChildren, getChildById, updateChild, deleteChild };

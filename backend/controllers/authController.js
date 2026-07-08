const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const Parent = require("../models/Parent");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;

    const existing = await Parent.findOne({ email });
    if (existing) return res.status(409).json({ message: "An account with this email already exists" });

    const parent = await Parent.create({ name, email, password });
    const token = signToken(parent._id);

    res.status(201).json({ token, parent: parent.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    const parent = await Parent.findOne({ email });
    if (!parent) return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await parent.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    const token = signToken(parent._id);
    res.json({ token, parent: parent.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ parent: req.parent.toSafeObject ? req.parent.toSafeObject() : req.parent });
};

module.exports = { register, login, getMe };

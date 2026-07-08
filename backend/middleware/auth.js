const jwt = require("jsonwebtoken");
const Parent = require("../models/Parent");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const parent = await Parent.findById(decoded.id).select("-password");
    if (!parent) {
      return res.status(401).json({ message: "Not authorized, parent not found" });
    }

    req.parent = parent;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

// Confirms the requested child belongs to the logged-in parent
const verifyChildOwnership = async (req, res, next) => {
  const Child = require("../models/Child");
  try {
    const childId =
      req.params.id ||
      req.params.childId ||
      req.query.childId ||
      req.body.childId;
    if (!childId) return res.status(400).json({ message: "childId is required" });

    const child = await Child.findById(childId);
    if (!child) return res.status(404).json({ message: "Child not found" });

    if (child.parentId.toString() !== req.parent._id.toString()) {
      return res.status(403).json({ message: "Not authorized for this child profile" });
    }

    req.child = child;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error verifying child ownership" });
  }
};

module.exports = { protect, verifyChildOwnership };

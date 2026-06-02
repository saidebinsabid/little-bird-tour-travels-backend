/**
 * User administration (admin-only): list users, change role, delete.
 * Self-service profile lives under /api/auth.
 */
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const COLLECTION = "users";
const ROLES = ["user", "agent", "admin", "super-admin"];

const project = { projection: { password: 0 } };

// GET /api/users  (admin)
const listUsers = asyncHandler(async (req, res) => {
  const { search, role, page = 1, limit = 20 } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search)
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, parseInt(limit, 10) || 20);
  const db = getDB();
  const [data, total] = await Promise.all([
    db
      .collection(COLLECTION)
      .find(query, project)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .toArray(),
    db.collection(COLLECTION).countDocuments(query),
  ]);
  return res.json({
    data,
    pagination: { page: pageNum, limit: limitNum, total },
  });
});

// PATCH /api/users/:id/role  (admin)  { role }
const updateRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!ObjectId.isValid(id)) throw new ApiError(400, "Invalid id");
  if (!ROLES.includes(role)) throw new ApiError(400, "Invalid role");

  const db = getDB();
  const result = await db
    .collection(COLLECTION)
    .updateOne(
      { _id: new ObjectId(id) },
      { $set: { role, updatedAt: new Date() } }
    );
  if (!result.matchedCount) throw new ApiError(404, "User not found");
  return res.json({ message: "Role updated" });
});

// DELETE /api/users/:id  (admin)
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) throw new ApiError(400, "Invalid id");
  const db = getDB();
  const result = await db
    .collection(COLLECTION)
    .deleteOne({ _id: new ObjectId(id) });
  if (!result.deletedCount) throw new ApiError(404, "User not found");
  return res.json({ message: "Deleted" });
});

module.exports = { listUsers, updateRole, deleteUser };

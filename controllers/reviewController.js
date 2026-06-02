/**
 * Reviews. Logged-in users submit (status starts "pending"); admin approves;
 * the public endpoint only ever returns approved reviews for a given item.
 */
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const COLLECTION = "reviews";

// GET /api/reviews?refId=...&refType=package  (public — approved only)
const listReviews = asyncHandler(async (req, res) => {
  const { refId, refType } = req.query;
  const query = { status: "approved" };
  if (refId) query.refId = refId;
  if (refType) query.refType = refType;

  const db = getDB();
  const data = await db
    .collection(COLLECTION)
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();
  return res.json({ data });
});

// POST /api/reviews  (auth)
const createReview = asyncHandler(async (req, res) => {
  const { refId, refType = "package", rating, comment, photos = [] } = req.body;
  if (!refId) throw new ApiError(400, "refId is required");
  const r = Number(rating);
  if (!r || r < 1 || r > 5) throw new ApiError(400, "rating must be 1-5");

  const doc = {
    refId,
    refType,
    rating: r,
    comment: comment || "",
    photos,
    author: { name: req.user?.name || req.decoded.email, email: req.decoded.email },
    status: "pending", // admin moderates before it shows publicly
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const db = getDB();
  const result = await db.collection(COLLECTION).insertOne(doc);
  return res
    .status(201)
    .json({ message: "Review submitted for approval", id: result.insertedId });
});

// GET /api/reviews/all  (admin) — every status
const listAllReviews = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = {};
  if (status) query.status = status;
  const db = getDB();
  const data = await db
    .collection(COLLECTION)
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();
  return res.json({ data });
});

// PATCH /api/reviews/:id  (admin)  { status: "approved" | "rejected" }
const moderateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) throw new ApiError(400, "Invalid id");
  const { status } = req.body;
  if (!["approved", "rejected", "pending"].includes(status))
    throw new ApiError(400, "Invalid status");

  const db = getDB();
  const result = await db
    .collection(COLLECTION)
    .updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );
  if (!result.matchedCount) throw new ApiError(404, "Review not found");
  return res.json({ message: "Updated" });
});

// DELETE /api/reviews/:id  (admin)
const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) throw new ApiError(400, "Invalid id");
  const db = getDB();
  const result = await db
    .collection(COLLECTION)
    .deleteOne({ _id: new ObjectId(id) });
  if (!result.deletedCount) throw new ApiError(404, "Review not found");
  return res.json({ message: "Deleted" });
});

module.exports = {
  listReviews,
  createReview,
  listAllReviews,
  moderateReview,
  deleteReview,
};

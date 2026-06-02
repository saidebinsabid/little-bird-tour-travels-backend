/**
 * Inquiries = the lead pipeline (CRM-lite). Anyone can CREATE one (the contact /
 * quote / "book this package" forms all funnel here). Reading, status changes and
 * follow-up notes are admin/agent only.
 *
 * type: "tour" | "hajj" | "umrah" | "air-ticket" | "visa" | "hotel" | "contact" | "general"
 * status: "new" | "in-progress" | "converted" | "closed"
 */
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const COLLECTION = "inquiries";
const STATUSES = ["new", "in-progress", "converted", "closed"];

// POST /api/inquiries  (public)
const createInquiry = asyncHandler(async (req, res) => {
  const {
    type = "general",
    name,
    email,
    phone,
    message,
    subject,
    refId, // optional: package/hotel/etc the lead is about
    refType,
    travelDate,
    travelers,
    meta, // free-form extras (route, country, etc.)
  } = req.body;

  if (!name || !phone)
    throw new ApiError(400, "name and phone are required");

  const doc = {
    type,
    name,
    email: email || "",
    phone,
    subject: subject || "",
    message: message || "",
    refId: refId || null,
    refType: refType || null,
    travelDate: travelDate || null,
    travelers: travelers || null,
    meta: meta || {},
    status: "new",
    assignedTo: null,
    notes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const db = getDB();
  const result = await db.collection(COLLECTION).insertOne(doc);
  // TODO(notifications): email/SMS the office here (lib/email, lib/sms).
  return res
    .status(201)
    .json({ message: "Inquiry received. We'll get back to you shortly.", id: result.insertedId });
});

// GET /api/inquiries  (admin/agent)
const listInquiries = asyncHandler(async (req, res) => {
  const { type, status, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (type) query.type = type;
  if (status) query.status = status;
  if (search)
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, parseInt(limit, 10) || 20);
  const db = getDB();
  const [data, total] = await Promise.all([
    db
      .collection(COLLECTION)
      .find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .toArray(),
    db.collection(COLLECTION).countDocuments(query),
  ]);
  return res.json({ data, pagination: { page: pageNum, limit: limitNum, total } });
});

// PATCH /api/inquiries/:id  (admin/agent)  { status, assignedTo, note }
const updateInquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) throw new ApiError(400, "Invalid id");
  const { status, assignedTo, note } = req.body;

  const set = { updatedAt: new Date() };
  if (status) {
    if (!STATUSES.includes(status)) throw new ApiError(400, "Invalid status");
    set.status = status;
  }
  if (assignedTo !== undefined) set.assignedTo = assignedTo;

  const update = { $set: set };
  if (note)
    update.$push = {
      notes: { text: note, by: req.user?.email || "system", at: new Date() },
    };

  const db = getDB();
  const result = await db
    .collection(COLLECTION)
    .updateOne({ _id: new ObjectId(id) }, update);
  if (!result.matchedCount) throw new ApiError(404, "Inquiry not found");
  return res.json({ message: "Updated" });
});

// DELETE /api/inquiries/:id  (admin)
const deleteInquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) throw new ApiError(400, "Invalid id");
  const db = getDB();
  const result = await db
    .collection(COLLECTION)
    .deleteOne({ _id: new ObjectId(id) });
  if (!result.deletedCount) throw new ApiError(404, "Inquiry not found");
  return res.json({ message: "Deleted" });
});

module.exports = {
  createInquiry,
  listInquiries,
  updateInquiry,
  deleteInquiry,
};

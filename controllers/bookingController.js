/**
 * Bookings. Payment integration is intentionally deferred (Phase 2) but the
 * whole structure is in place: every booking carries paymentStatus/paymentMethod/
 * transactions[] so wiring bKash/Nagad/SSLCommerz later is just filling fields,
 * not reshaping the model.
 *
 * status:        "pending" | "confirmed" | "completed" | "cancelled"
 * paymentStatus: "unpaid"  | "partial"   | "paid"      | "refunded"
 */
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const COLLECTION = "bookings";
const STATUSES = ["pending", "confirmed", "completed", "cancelled"];
const PAY_STATUSES = ["unpaid", "partial", "paid", "refunded"];

// Human-friendly reference: LB-<YYMMDD>-<random4>. Derived from the current
// time at call-time (allowed here — this is a request handler, not the workflow
// engine).
function bookingNo() {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `LB-${ymd}-${rand}`;
}

// POST /api/bookings  (auth)
const createBooking = asyncHandler(async (req, res) => {
  const {
    itemType = "package", // package | hajj | hotel | air-ticket
    itemId,
    itemTitle,
    travelDate,
    travelers = [],
    pax = 1,
    amount = 0,
    currency = "BDT",
    contact = {},
    notes,
  } = req.body;

  if (!itemId) throw new ApiError(400, "itemId is required");

  const db = getDB();
  const doc = {
    bookingNo: bookingNo(),
    userId: req.decoded.id ? String(req.decoded.id) : null,
    userEmail: req.decoded.email,
    itemType,
    itemId,
    itemTitle: itemTitle || "",
    travelDate: travelDate || null,
    travelers,
    pax: Number(pax) || 1,
    amount: Number(amount) || 0,
    currency,
    contact,
    notes: notes || "",
    status: "pending",
    paymentStatus: "unpaid",
    paymentMethod: null,
    transactions: [], // Phase 2: each gateway settlement pushes here
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const result = await db.collection(COLLECTION).insertOne(doc);
  return res.status(201).json({
    message: "Booking created",
    id: result.insertedId,
    bookingNo: doc.bookingNo,
  });
});

// GET /api/bookings/me  (auth) — the caller's own bookings
const myBookings = asyncHandler(async (req, res) => {
  const db = getDB();
  const data = await db
    .collection(COLLECTION)
    .find({ userEmail: req.decoded.email })
    .sort({ createdAt: -1 })
    .toArray();
  return res.json({ data });
});

// GET /api/bookings  (admin)
const listBookings = asyncHandler(async (req, res) => {
  const { status, paymentStatus, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;
  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (search)
    query.$or = [
      { bookingNo: { $regex: search, $options: "i" } },
      { userEmail: { $regex: search, $options: "i" } },
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

// GET /api/bookings/:id  (auth — owner or admin)
const getBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) throw new ApiError(400, "Invalid id");
  const db = getDB();
  const booking = await db
    .collection(COLLECTION)
    .findOne({ _id: new ObjectId(id) });
  if (!booking) throw new ApiError(404, "Booking not found");

  const isOwner = booking.userEmail === req.decoded.email;
  const isStaff = ["admin", "super-admin", "agent"].includes(req.decoded.role);
  if (!isOwner && !isStaff) throw new ApiError(403, "forbidden access");

  return res.json(booking);
});

// PATCH /api/bookings/:id  (admin)  { status, paymentStatus, amount }
const updateBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) throw new ApiError(400, "Invalid id");
  const { status, paymentStatus, amount } = req.body;

  const set = { updatedAt: new Date() };
  if (status) {
    if (!STATUSES.includes(status)) throw new ApiError(400, "Invalid status");
    set.status = status;
  }
  if (paymentStatus) {
    if (!PAY_STATUSES.includes(paymentStatus))
      throw new ApiError(400, "Invalid paymentStatus");
    set.paymentStatus = paymentStatus;
  }
  if (amount !== undefined) set.amount = Number(amount);

  const db = getDB();
  const result = await db
    .collection(COLLECTION)
    .updateOne({ _id: new ObjectId(id) }, { $set: set });
  if (!result.matchedCount) throw new ApiError(404, "Booking not found");
  return res.json({ message: "Updated" });
});

module.exports = {
  createBooking,
  myBookings,
  listBookings,
  getBooking,
  updateBooking,
};

/**
 * Reusable CRUD factory.
 *
 * The starter convention is "copy a controller per domain" — that's perfect for
 * resources with bespoke logic (auth, bookings). But this app has ~10 plain
 * content resources (packages, destinations, hotels, visas, blogs, ...) that
 * share the exact same list/get/create/update/delete shape. Re-typing that 10×
 * is noise, so those resources are generated here and wired straight into their
 * route files. Anything that needs custom behaviour still gets its own
 * hand-written controller.
 *
 * Returns { list, getOne, create, update, remove } — all asyncHandler-wrapped,
 * all throwing ApiError, exactly like a hand-written controller.
 *
 * Options:
 *   searchFields   [String]  fields matched by ?search= (case-insensitive regex)
 *   filterFields   [String]  query params allowed as exact-match filters
 *   rangeParam     {param, field}  enables ?<param>_min / ?<param>_max numeric range
 *   defaultSort    Object    Mongo sort when ?sort is absent (default newest-first)
 *   slugFrom       String    field whose value seeds a unique `slug` on create
 *   allowedFields  [String]  whitelist for create/update (null = take body as-is)
 *   requiredFields [String]  must be present (and non-empty) on create
 *   publicFilter   Object    always-AND'd into list() queries (e.g. only published)
 *   transformIn    fn(body)  last-chance mutation before insert/update
 */
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { slugify, uniqueSlug } = require("../utils/slugify");

// Pull a value out of an object by dot-path: get({a:{b:1}}, "a.b") -> 1
function getPath(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
}

// Keep only whitelisted keys. null whitelist = pass everything except protected.
const PROTECTED = ["_id", "createdAt", "updatedAt", "slug"];
function pick(body = {}, allowed) {
  if (!allowed) {
    const out = { ...body };
    PROTECTED.forEach((k) => delete out[k]);
    return out;
  }
  const out = {};
  allowed.forEach((k) => {
    if (body[k] !== undefined) out[k] = body[k];
  });
  return out;
}

function makeCrud(collectionName, opts = {}) {
  const {
    searchFields = [],
    filterFields = [],
    rangeParam = null,
    defaultSort = { createdAt: -1 },
    slugFrom = null,
    allowedFields = null,
    requiredFields = [],
    publicFilter = {},
    transformIn = null,
  } = opts;

  const col = () => getDB().collection(collectionName);

  // GET /  — list with search + filter + range + sort + pagination
  const list = asyncHandler(async (req, res) => {
    const {
      search,
      sort,
      order = "desc",
      page = 1,
      limit = 12,
      ...rest
    } = req.query;

    const query = { ...publicFilter };

    filterFields.forEach((f) => {
      if (rest[f] !== undefined && rest[f] !== "") {
        // Query params arrive as strings — coerce "true"/"false" to booleans so
        // boolean fields (featured, popular, active) match what's stored in Mongo.
        let v = rest[f];
        if (v === "true") v = true;
        else if (v === "false") v = false;
        query[f] = v;
      }
    });

    if (search && searchFields.length) {
      query.$or = searchFields.map((f) => ({
        [f]: { $regex: String(search), $options: "i" },
      }));
    }

    if (rangeParam) {
      const min = rest[`${rangeParam.param}_min`];
      const max = rest[`${rangeParam.param}_max`];
      if (min || max) {
        query[rangeParam.field] = {};
        if (min) query[rangeParam.field].$gte = Number(min);
        if (max) query[rangeParam.field].$lte = Number(max);
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));
    const sortSpec = sort ? { [sort]: order === "asc" ? 1 : -1 } : defaultSort;

    const [data, total] = await Promise.all([
      col()
        .find(query)
        .sort(sortSpec)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .toArray(),
      col().countDocuments(query),
    ]);

    return res.json({
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1,
      },
    });
  });

  // GET /:id  — accepts a Mongo ObjectId OR a slug
  const getOne = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const or = [{ slug: id }];
    if (ObjectId.isValid(id)) or.push({ _id: new ObjectId(id) });

    const item = await col().findOne({ $or: or });
    if (!item) throw new ApiError(404, `${collectionName} item not found`);
    return res.json(item);
  });

  // POST /
  const create = asyncHandler(async (req, res) => {
    const body = pick(req.body, allowedFields);

    requiredFields.forEach((f) => {
      const v = getPath(body, f);
      if (v === undefined || v === "" || v === null)
        throw new ApiError(400, `${f} is required`);
    });

    if (slugFrom) {
      const seed = getPath(body, slugFrom);
      if (seed) body.slug = await uniqueSlug(col(), slugify(seed));
    }

    const doc = transformIn ? transformIn(body) : body;
    doc.createdAt = new Date();
    doc.updatedAt = new Date();

    const result = await col().insertOne(doc);
    return res
      .status(201)
      .json({ message: "Created", id: result.insertedId, slug: doc.slug });
  });

  // PATCH /:id
  const update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) throw new ApiError(400, "Invalid id");

    const body = pick(req.body, allowedFields);
    const doc = transformIn ? transformIn(body) : body;
    doc.updatedAt = new Date();

    const result = await col().updateOne(
      { _id: new ObjectId(id) },
      { $set: doc }
    );
    if (result.matchedCount === 0)
      throw new ApiError(404, `${collectionName} item not found`);
    return res.json({ message: "Updated" });
  });

  // DELETE /:id
  const remove = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) throw new ApiError(400, "Invalid id");

    const result = await col().deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0)
      throw new ApiError(404, `${collectionName} item not found`);
    return res.json({ message: "Deleted" });
  });

  return { list, getOne, create, update, remove };
}

module.exports = { makeCrud, pick };

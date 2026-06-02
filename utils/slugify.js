/**
 * Tiny slug helper + uniqueness guard.
 *   slugify("Cox's Bazar Tour!") -> "coxs-bazar-tour"
 */
function slugify(str = "") {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // strip punctuation
    .replace(/[\s_-]+/g, "-") // collapse whitespace/underscores to a single dash
    .replace(/^-+|-+$/g, ""); // trim leading/trailing dashes
}

// Ensure the slug is unique within a collection by appending -2, -3, ...
async function uniqueSlug(collection, base) {
  let slug = base || "item";
  let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await collection.findOne({ slug })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

module.exports = { slugify, uniqueSlug };

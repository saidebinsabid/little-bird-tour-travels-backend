/**
 * Site settings = a single document (key: "site"). Public GET returns the
 * non-sensitive identity/contact/social/SEO bits the frontend renders; admin
 * PATCH upserts. Secret gateway keys belong in env, NOT here.
 */
const { getDB } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

const COLLECTION = "settings";
const KEY = "site";

const DEFAULTS = {
  key: KEY,
  identity: {
    name: { en: "Little Bird Travels", bn: "লিটল বার্ড ট্রావ্যেলস" },
    tagline: { en: "The smiling agent for travel.", bn: "ভ্রমণের হাসিমাখা সঙ্গী।" },
    logo: "",
  },
  contact: {
    phone: "",
    whatsapp: "",
    email: "",
    address: { en: "Dhaka, Bangladesh", bn: "ঢাকা, বাংলাদেশ" },
    mapEmbed: "",
    officeHours: "Sat–Thu, 10:00 AM – 7:00 PM",
  },
  social: { facebook: "https://www.facebook.com/Littlebirdtoursandtravels", instagram: "", youtube: "", linkedin: "" },
  seo: {
    title: "Little Bird Tours & Travels",
    description: "Tour packages, air tickets, visa, Hajj & Umrah and hotel booking in Bangladesh.",
    keywords: "tour, travel, hajj, umrah, air ticket, visa, bangladesh",
  },
  licenses: { atab: "", iata: "", civilAviation: "" },
};

// GET /api/settings  (public)
const getSettings = asyncHandler(async (req, res) => {
  const db = getDB();
  const doc = await db.collection(COLLECTION).findOne({ key: KEY });
  return res.json(doc || DEFAULTS);
});

// PATCH /api/settings  (admin) — deep-ish merge via $set on provided top keys
const updateSettings = asyncHandler(async (req, res) => {
  const allowed = ["identity", "contact", "social", "seo", "licenses"];
  const set = { updatedAt: new Date() };
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) set[k] = req.body[k];
  });

  const db = getDB();
  await db
    .collection(COLLECTION)
    .updateOne(
      { key: KEY },
      { $set: set, $setOnInsert: { key: KEY, createdAt: new Date() } },
      { upsert: true }
    );
  const doc = await db.collection(COLLECTION).findOne({ key: KEY });
  return res.json({ message: "Settings updated", settings: doc });
});

module.exports = { getSettings, updateSettings, DEFAULTS };

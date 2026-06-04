/**
 * Seed script — fills the DB with realistic bilingual sample data + one admin.
 *
 *   node seed/seed.js              # reseed content, upsert admin
 *
 * Idempotent: content collections are wiped and refilled; the admin user is
 * upserted by email so re-running never creates duplicates. Admin credentials
 * come from env (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD) with safe defaults.
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");
const { connectDB, getDB } = require("../config/db");

const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

// ── Destinations (referenced by packages) ────────────────────────────────
const destIds = {
  coxsbazar: new ObjectId(),
  sajek: new ObjectId(),
  bandarban: new ObjectId(),
  sundarbans: new ObjectId(),
  saintmartin: new ObjectId(),
  maldives: new ObjectId(),
  thailand: new ObjectId(),
  malaysia: new ObjectId(),
  dubai: new ObjectId(),
  nepal: new ObjectId(),
};

const destinations = [
  { _id: destIds.coxsbazar, name: { en: "Cox's Bazar", bn: "কক্সবাজার" }, slug: "coxs-bazar", country: "Bangladesh", region: "domestic", popular: true, status: "published", image: img("1589802829985-817e51171b92"), description: { en: "The world's longest natural sea beach.", bn: "বিশ্বের দীর্ঘতম প্রাকৃতিক সমুদ্র সৈকত।" } },
  { _id: destIds.sajek, name: { en: "Sajek Valley", bn: "সাজেক ভ্যালি" }, slug: "sajek-valley", country: "Bangladesh", region: "domestic", popular: true, status: "published", image: img("1593181629936-11c609b8db9b"), description: { en: "The queen of hills, above the clouds.", bn: "মেঘের রাজ্য, পাহাড়ের রাণী।" } },
  { _id: destIds.bandarban, name: { en: "Bandarban", bn: "বান্দরবান" }, slug: "bandarban", country: "Bangladesh", region: "domestic", popular: true, status: "published", image: img("1605640840605-14ac1855827b"), description: { en: "Hills, waterfalls and tribal culture.", bn: "পাহাড়, ঝর্ণা ও আদিবাসী সংস্কৃতি।" } },
  { _id: destIds.sundarbans, name: { en: "Sundarbans", bn: "সুন্দরবন" }, slug: "sundarbans", country: "Bangladesh", region: "domestic", popular: false, status: "published", image: img("1516026672322-bc52d61a55d5"), description: { en: "World's largest mangrove forest, home of the Royal Bengal Tiger.", bn: "বিশ্বের বৃহত্তম ম্যানগ্রোভ বন, রয়েল বেঙ্গল টাইগারের আবাস।" } },
  { _id: destIds.saintmartin, name: { en: "Saint Martin", bn: "সেন্ট মার্টিন" }, slug: "saint-martin", country: "Bangladesh", region: "domestic", popular: true, status: "published", image: img("1507525428034-b723cf961d3e"), description: { en: "Bangladesh's only coral island.", bn: "বাংলাদেশের একমাত্র প্রবাল দ্বীপ।" } },
  { _id: destIds.maldives, name: { en: "Maldives", bn: "মালদ্বীপ" }, slug: "maldives", country: "Maldives", region: "international", popular: true, status: "published", image: img("1514282401047-d79a71a590e8"), description: { en: "Turquoise lagoons and overwater villas.", bn: "নীল লেগুন ও পানির উপর ভিলা।" } },
  { _id: destIds.thailand, name: { en: "Thailand", bn: "থাইল্যান্ড" }, slug: "thailand", country: "Thailand", region: "international", popular: true, status: "published", image: img("1528181304800-259b08848526"), description: { en: "Beaches, temples and street food.", bn: "সৈকত, মন্দির ও স্ট্রিট ফুড।" } },
  { _id: destIds.malaysia, name: { en: "Malaysia", bn: "মালয়েশিয়া" }, slug: "malaysia", country: "Malaysia", region: "international", popular: true, status: "published", image: img("1596422846543-75c6fc197f07"), description: { en: "Kuala Lumpur, Langkawi and rainforests.", bn: "কুয়ালালামপুর, লংকাউই ও রেইনফরেস্ট।" } },
  { _id: destIds.dubai, name: { en: "Dubai", bn: "দুবাই" }, slug: "dubai", country: "UAE", region: "international", popular: true, status: "published", image: img("1512453979798-5ea266f8880c"), description: { en: "Skyscrapers, desert safari and luxury.", bn: "আকাশচুম্বী ভবন, ডেজার্ট সাফারি ও বিলাসিতা।" } },
  { _id: destIds.nepal, name: { en: "Nepal", bn: "নেপাল" }, slug: "nepal", country: "Nepal", region: "international", popular: false, status: "published", image: img("1544735716-392fe2489ffa"), description: { en: "Himalayas and the city of Kathmandu.", bn: "হিমালয় ও কাঠমান্ডু শহর।" } },
];

// ── Tour packages ────────────────────────────────────────────────────────
const dayPlan = (en, bn) => ({ title: { en, bn } });
const packages = [
  {
    title: { en: "Cox's Bazar 3 Days 2 Nights", bn: "কক্সবাজার ৩ দিন ২ রাত" },
    summary: { en: "Beach getaway with sea-view hotel, Himchari & Inani.", bn: "সমুদ্র-ভিউ হোটেল, হিমছড়ি ও ইনানীসহ সৈকত ভ্রমণ।" },
    type: "domestic", destinationId: String(destIds.coxsbazar), location: { en: "Cox's Bazar", bn: "কক্সবাজার" },
    price: { amount: 8500, currency: "BDT", unit: "per person" }, durationDays: 3, durationNights: 2, maxGroup: 25,
    featured: true, status: "published", rating: 4.7, cover: img("1589802829985-817e51171b92"),
    gallery: [img("1589802829985-817e51171b92"), img("1507525428034-b723cf961d3e")],
    itinerary: [dayPlan("Arrival & beach evening", "আগমন ও সৈকতে সন্ধ্যা"), dayPlan("Himchari, Inani & Marine Drive", "হিমছড়ি, ইনানী ও মেরিন ড্রাইভ"), dayPlan("Sunrise & departure", "সূর্যোদয় ও প্রস্থান")],
    inclusions: { en: ["AC transport", "Sea-view hotel (2 nights)", "Daily breakfast", "Guide"], bn: ["এসি পরিবহন", "সমুদ্র-ভিউ হোটেল (২ রাত)", "দৈনিক নাস্তা", "গাইড"] },
    exclusions: { en: ["Lunch & dinner", "Personal expenses"], bn: ["দুপুর ও রাতের খাবার", "ব্যক্তিগত খরচ"] },
  },
  {
    title: { en: "Sajek Valley 3 Days Tour", bn: "সাজেক ভ্যালি ৩ দিনের ট্যুর" },
    summary: { en: "Above-the-clouds hill retreat with jeep ride.", bn: "জিপ রাইডসহ মেঘের উপরে পাহাড়ি ভ্রমণ।" },
    type: "adventure", destinationId: String(destIds.sajek), location: { en: "Sajek, Rangamati", bn: "সাজেক, রাঙ্গামাটি" },
    price: { amount: 7200, currency: "BDT", unit: "per person" }, durationDays: 3, durationNights: 2, maxGroup: 20,
    featured: true, status: "published", rating: 4.8, cover: img("1593181629936-11c609b8db9b"),
    gallery: [img("1593181629936-11c609b8db9b")],
    itinerary: [dayPlan("Khagrachari to Sajek by jeep", "খাগড়াছড়ি থেকে জিপে সাজেক"), dayPlan("Sunrise, Konglak hill, Helipad", "সূর্যোদয়, কংলাক পাহাড়, হেলিপ্যাড"), dayPlan("Return via Alutila cave", "আলুটিলা গুহা হয়ে ফেরা")],
    inclusions: { en: ["Reserved jeep", "Cottage stay", "Breakfast & dinner", "Guide"], bn: ["রিজার্ভ জিপ", "কটেজে থাকা", "নাস্তা ও রাতের খাবার", "গাইড"] },
    exclusions: { en: ["Lunch", "Entry fees"], bn: ["দুপুরের খাবার", "প্রবেশ ফি"] },
  },
  {
    title: { en: "Maldives Honeymoon 4 Days", bn: "মালদ্বীপ হানিমুন ৪ দিন" },
    summary: { en: "Overwater villa, candle-light dinner & speedboat transfer.", bn: "পানির উপর ভিলা, ক্যান্ডেল-লাইট ডিনার ও স্পিডবোট ট্রান্সফার।" },
    type: "honeymoon", destinationId: String(destIds.maldives), location: { en: "Malé, Maldives", bn: "মালে, মালদ্বীপ" },
    price: { amount: 98000, currency: "BDT", unit: "per couple" }, durationDays: 4, durationNights: 3, maxGroup: 2,
    featured: true, status: "published", rating: 4.9, cover: img("1514282401047-d79a71a590e8"),
    gallery: [img("1514282401047-d79a71a590e8")],
    itinerary: [dayPlan("Arrival & resort transfer", "আগমন ও রিসোর্ট ট্রান্সফার"), dayPlan("Island & water sports", "দ্বীপ ও ওয়াটার স্পোর্টস"), dayPlan("Snorkeling & spa", "স্নরকেলিং ও স্পা"), dayPlan("Departure", "প্রস্থান")],
    inclusions: { en: ["Return air ticket", "Resort (3 nights)", "All meals", "Airport transfer"], bn: ["রিটার্ন বিমান টিকিট", "রিসোর্ট (৩ রাত)", "সব বেলার খাবার", "এয়ারপোর্ট ট্রান্সফার"] },
    exclusions: { en: ["Visa fee", "Travel insurance"], bn: ["ভিসা ফি", "ভ্রমণ বীমা"] },
  },
  {
    title: { en: "Thailand Bangkok–Pattaya 5 Days", bn: "থাইল্যান্ড ব্যাংকক–পাতায়া ৫ দিন" },
    summary: { en: "City tour, Coral Island & Safari World.", bn: "সিটি ট্যুর, কোরাল আইল্যান্ড ও সাফারি ওয়ার্ল্ড।" },
    type: "family", destinationId: String(destIds.thailand), location: { en: "Bangkok & Pattaya", bn: "ব্যাংকক ও পাতায়া" },
    price: { amount: 62000, currency: "BDT", unit: "per person" }, durationDays: 5, durationNights: 4, maxGroup: 30,
    featured: false, status: "published", rating: 4.6, cover: img("1528181304800-259b08848526"),
    gallery: [img("1528181304800-259b08848526")],
    itinerary: [dayPlan("Arrival Bangkok", "ব্যাংককে আগমন"), dayPlan("Transfer to Pattaya", "পাতায়ায় ট্রান্সফার"), dayPlan("Coral Island tour", "কোরাল আইল্যান্ড ট্যুর"), dayPlan("Safari World", "সাফারি ওয়ার্ল্ড"), dayPlan("Shopping & departure", "শপিং ও প্রস্থান")],
    inclusions: { en: ["Return air ticket", "4-star hotels", "Breakfast", "Tours with guide"], bn: ["রিটার্ন বিমান টিকিট", "৪-তারকা হোটেল", "নাস্তা", "গাইডসহ ট্যুর"] },
    exclusions: { en: ["Visa", "Lunch & dinner"], bn: ["ভিসা", "দুপুর ও রাতের খাবার"] },
  },
  {
    title: { en: "Bandarban Adventure 3 Days", bn: "বান্দরবান অ্যাডভেঞ্চার ৩ দিন" },
    summary: { en: "Nilgiri, Nilachal & Boga Lake trek.", bn: "নীলগিরি, নীলাচল ও বগা লেক ট্রেক।" },
    type: "adventure", destinationId: String(destIds.bandarban), location: { en: "Bandarban", bn: "বান্দরবান" },
    price: { amount: 6900, currency: "BDT", unit: "per person" }, durationDays: 3, durationNights: 2, maxGroup: 20,
    featured: false, status: "published", rating: 4.5, cover: img("1605640840605-14ac1855827b"),
    gallery: [img("1605640840605-14ac1855827b")],
    itinerary: [dayPlan("Nilachal & Meghla", "নীলাচল ও মেঘলা"), dayPlan("Nilgiri & Chimbuk", "নীলগিরি ও চিম্বুক"), dayPlan("Local market & return", "স্থানীয় বাজার ও ফেরা")],
    inclusions: { en: ["Chander Gari transport", "Hotel", "Breakfast", "Guide"], bn: ["চাঁদের গাড়ি", "হোটেল", "নাস্তা", "গাইড"] },
    exclusions: { en: ["Lunch & dinner", "Entry fees"], bn: ["দুপুর ও রাতের খাবার", "প্রবেশ ফি"] },
  },
  {
    title: { en: "Dubai City & Desert 5 Days", bn: "দুবাই সিটি ও ডেজার্ট ৫ দিন" },
    summary: { en: "Burj Khalifa, desert safari & dhow cruise.", bn: "বুর্জ খলিফা, ডেজার্ট সাফারি ও ধো ক্রুজ।" },
    type: "family", destinationId: String(destIds.dubai), location: { en: "Dubai, UAE", bn: "দুবাই, সংযুক্ত আরব আমিরাত" },
    price: { amount: 89000, currency: "BDT", unit: "per person" }, durationDays: 5, durationNights: 4, maxGroup: 25,
    featured: true, status: "published", rating: 4.7, cover: img("1512453979798-5ea266f8880c"),
    gallery: [img("1512453979798-5ea266f8880c")],
    itinerary: [dayPlan("Arrival & Marina", "আগমন ও মেরিনা"), dayPlan("City tour & Burj Khalifa", "সিটি ট্যুর ও বুর্জ খলিফা"), dayPlan("Desert safari", "ডেজার্ট সাফারি"), dayPlan("Abu Dhabi day trip", "আবুধাবি ডে ট্রিপ"), dayPlan("Shopping & departure", "শপিং ও প্রস্থান")],
    inclusions: { en: ["Return air ticket", "Hotel", "Breakfast", "Tours"], bn: ["রিটার্ন বিমান টিকিট", "হোটেল", "নাস্তা", "ট্যুর"] },
    exclusions: { en: ["Visa", "Lunch & dinner"], bn: ["ভিসা", "দুপুর ও রাতের খাবার"] },
  },
];

// ── Hajj & Umrah ─────────────────────────────────────────────────────────
const HAJJ_DOCS = { en: ["Valid passport (8+ months)", "Photo (white background)", "Vaccine certificate", "NID & birth certificate", "Mahram documents (if applicable)"], bn: ["বৈধ পাসপোর্ট (৮+ মাস)", "ছবি (সাদা ব্যাকগ্রাউন্ড)", "টিকা সনদ", "এনআইডি ও জন্মনিবন্ধন", "মাহরাম ডকুমেন্ট (প্রযোজ্য হলে)"] };
const UMRAH_DOCS = { en: ["Valid passport (6+ months)", "Photo (white background)", "Vaccine certificate", "NID copy"], bn: ["বৈধ পাসপোর্ট (৬+ মাস)", "ছবি (সাদা ব্যাকগ্রাউন্ড)", "টিকা সনদ", "এনআইডি কপি"] };

// Hajj & Umrah package data — prices/inclusions/exclusions reflect the real
// Bangladesh market (Govt Hajj 2025: Tk 4.67–6.90 lakh; HAAB private min Tk 5.10
// lakh; BD Umrah: Tk 1.15–3.20 lakh, 14 days = 7+7 nights).
const hajj = [
  // ── Hajj (3) ──
  {
    title: { en: "Hajj Package 2026 — Economy", bn: "হজ্জ প্যাকেজ ২০২৬ — ইকোনমি" },
    type: "hajj", packageClass: "economy", status: "published",
    price: { amount: 525000, currency: "BDT", unit: "per person" }, durationDays: 38,
    cover: img("1513072064285-240f87fa81e8"),
    hotelMakkah: { en: "Aziziyah, ~3 km from Haram (shuttle)", bn: "আজিজিয়া, হারাম থেকে ~৩ কিমি (শাটল)" },
    hotelMadinah: { en: "1 km from Masjid an-Nabawi", bn: "মসজিদে নববী থেকে ১ কিমি" },
    inclusions: { en: ["Return air ticket", "Hajj visa & processing", "Shared hotel (4–6 per room)", "Mina & Arafah tent (D category)", "Train/bus transport in KSA", "Experienced Moallem (guide)", "Ziyarah in Makkah & Madinah"], bn: ["রিটার্ন বিমান টিকিট", "হজ্জ ভিসা ও প্রসেসিং", "শেয়ার্ড হোটেল (৪–৬ জন/রুম)", "মিনা ও আরাফাহ তাঁবু (ডি ক্যাটাগরি)", "সৌদিতে ট্রেন/বাস পরিবহন", "অভিজ্ঞ মুয়াল্লিম (গাইড)", "মক্কা ও মদিনায় জিয়ারাহ"] },
    exclusions: { en: ["Qurbani / sacrifice (~750 SAR)", "Meals (carry ~BDT 40,000 spending)", "Personal expenses & shopping", "Extra / overweight baggage charges"], bn: ["কুরবানি / দম (~৭৫০ রিয়াল)", "খাবার (~৪০,০০০ টাকা সাথে রাখুন)", "ব্যক্তিগত খরচ ও কেনাকাটা", "অতিরিক্ত / ওজন-বেশি লাগেজ চার্জ"] },
    documents: HAJJ_DOCS,
  },
  {
    title: { en: "Hajj Package 2026 — Standard", bn: "হজ্জ প্যাকেজ ২০২৬ — স্ট্যান্ডার্ড" },
    type: "hajj", packageClass: "standard", status: "published",
    price: { amount: 695000, currency: "BDT", unit: "per person" }, durationDays: 32,
    cover: img("1591004272853-1462c050dca8"),
    hotelMakkah: { en: "4-star, 1.2–1.5 km from Haram", bn: "৪-তারকা, হারাম থেকে ১.২–১.৫ কিমি" },
    hotelMadinah: { en: "Markaziyah, 500 m from Masjid an-Nabawi", bn: "মারকাজিয়া, মসজিদে নববী থেকে ৫০০ মি" },
    inclusions: { en: ["Return air ticket", "Hajj visa & processing", "4-star hotel (quad room)", "Mina & Arafah tent (D+ category)", "AC transport in KSA", "Daily breakfast & dinner", "Experienced Moallem (guide)", "Ziyarah in Makkah & Madinah"], bn: ["রিটার্ন বিমান টিকিট", "হজ্জ ভিসা ও প্রসেসিং", "৪-তারকা হোটেল (কোয়াড রুম)", "মিনা ও আরাফাহ তাঁবু (ডি+ ক্যাটাগরি)", "সৌদিতে এসি পরিবহন", "দৈনিক নাস্তা ও রাতের খাবার", "অভিজ্ঞ মুয়াল্লিম (গাইড)", "মক্কা ও মদিনায় জিয়ারাহ"] },
    exclusions: { en: ["Qurbani / sacrifice (~750 SAR)", "Lunch", "Personal expenses & shopping", "Extra / overweight baggage charges"], bn: ["কুরবানি / দম (~৭৫০ রিয়াল)", "দুপুরের খাবার", "ব্যক্তিগত খরচ ও কেনাকাটা", "অতিরিক্ত / ওজন-বেশি লাগেজ চার্জ"] },
    documents: HAJJ_DOCS,
  },
  {
    title: { en: "Hajj Package 2026 — Premium (VIP)", bn: "হজ্জ প্যাকেজ ২০২৬ — প্রিমিয়াম (ভিআইপি)" },
    type: "hajj", packageClass: "premium", status: "published",
    price: { amount: 1150000, currency: "BDT", unit: "per person" }, durationDays: 25,
    cover: img("1580418827493-f2b22c0a76cb"),
    hotelMakkah: { en: "5-star, within 300 m of Haram", bn: "৫-তারকা, হারাম থেকে ৩০০ মি-র মধ্যে" },
    hotelMadinah: { en: "5-star, beside Masjid an-Nabawi", bn: "৫-তারকা, মসজিদে নববীর পাশে" },
    inclusions: { en: ["Premium return air ticket", "Hajj visa & processing", "5-star hotel (double room)", "VIP Mina & Arafah tent (A category)", "Private AC transport", "Full-board meals", "Dedicated guide", "Full Ziyarah in Makkah & Madinah"], bn: ["প্রিমিয়াম রিটার্ন বিমান টিকিট", "হজ্জ ভিসা ও প্রসেসিং", "৫-তারকা হোটেল (ডাবল রুম)", "ভিআইপি মিনা ও আরাফাহ তাঁবু (এ ক্যাটাগরি)", "প্রাইভেট এসি পরিবহন", "ফুল-বোর্ড খাবার", "ডেডিকেটেড গাইড", "মক্কা ও মদিনায় সম্পূর্ণ জিয়ারাহ"] },
    exclusions: { en: ["Qurbani / sacrifice (~750 SAR)", "Personal shopping & laundry", "Travel insurance (optional)", "Anything not mentioned above"], bn: ["কুরবানি / দম (~৭৫০ রিয়াল)", "ব্যক্তিগত কেনাকাটা ও লন্ড্রি", "ভ্রমণ বীমা (ঐচ্ছিক)", "উপরে উল্লেখ নেই এমন কিছু"] },
    documents: HAJJ_DOCS,
  },
];

// ── Visa services ────────────────────────────────────────────────────────
const visas = [
  {
    title: { en: "Thailand Tourist Visa", bn: "থাইল্যান্ড ট্যুরিস্ট ভিসা" },
    country: "Thailand", visaType: "tourist", status: "published", flag: "🇹🇭",
    fee: { amount: 5500, currency: "BDT" },
    processingTime: "7–15 working days",
    validity: { en: "Single entry, valid 3 months", bn: "সিঙ্গেল এন্ট্রি, ৩ মাস মেয়াদ" },
    stayDuration: { en: "Up to 60 days", bn: "সর্বোচ্চ ৬০ দিন" },
    overview: { en: "Apply for a Thailand tourist visa from Bangladesh through the Thai e-Visa portal or VFS Dhaka — perfect for beaches, city tours and shopping.", bn: "থাই ই-ভিসা পোর্টাল বা VFS ঢাকা-র মাধ্যমে বাংলাদেশ থেকে থাইল্যান্ড ট্যুরিস্ট ভিসা — সৈকত, সিটি ট্যুর ও শপিংয়ের জন্য উপযুক্ত।" },
    requirements: {
      en: ["Passport valid 6+ months with at least 2 blank pages", "2 recent photos (3.5×4.5 cm, white background)", "Completed visa application form", "Confirmed return air ticket", "Hotel booking / accommodation proof", "Bank statement (last 6 months) with solvency", "Trade license / employment proof / student ID", "National ID (NID) copy"],
      bn: ["পাসপোর্ট (৬+ মাস মেয়াদ, কমপক্ষে ২টি খালি পৃষ্ঠা)", "সাম্প্রতিক ২ কপি ছবি (৩.৫×৪.৫ সেমি, সাদা ব্যাকগ্রাউন্ড)", "পূরণকৃত ভিসা আবেদন ফর্ম", "কনফার্ম রিটার্ন বিমান টিকিট", "হোটেল বুকিং / থাকার প্রমাণ", "ব্যাংক স্টেটমেন্ট (৬ মাস) ও সলভেন্সি", "ট্রেড লাইসেন্স / চাকরির প্রমাণ / স্টুডেন্ট আইডি", "জাতীয় পরিচয়পত্র (এনআইডি)"],
    },
    note: { en: "Bangladeshi citizens are NOT eligible for Visa on Arrival — a visa must be obtained before travel.", bn: "বাংলাদেশি নাগরিকদের জন্য ভিসা-অন-অ্যারাইভাল নেই — ভ্রমণের আগেই ভিসা নিতে হবে।" },
  },
  {
    title: { en: "Malaysia Tourist eVisa", bn: "মালয়েশিয়া ট্যুরিস্ট ই-ভিসা" },
    country: "Malaysia", visaType: "tourist", status: "published", flag: "🇲🇾",
    fee: { amount: 6000, currency: "BDT" },
    processingTime: "2–3 working days (eVisa)",
    validity: { en: "Single entry, valid 3 months", bn: "সিঙ্গেল এন্ট্রি, ৩ মাস মেয়াদ" },
    stayDuration: { en: "Up to 30 days", bn: "সর্বোচ্চ ৩০ দিন" },
    overview: { en: "Malaysia requires Bangladeshi nationals to obtain an eVisa online before travel. Quick processing and a fully online application.", bn: "বাংলাদেশি নাগরিকদের ভ্রমণের আগে অনলাইনে মালয়েশিয়া ই-ভিসা নিতে হয়। দ্রুত প্রসেসিং ও সম্পূর্ণ অনলাইন আবেদন।" },
    requirements: {
      en: ["Passport valid 6+ months with 3 blank pages", "Passport-size photo (white background)", "Bank statement (last 6 months) + solvency letter", "Confirmed return flight ticket", "Hotel reservation", "National ID (NID)", "Employment / trade license proof"],
      bn: ["পাসপোর্ট (৬+ মাস মেয়াদ, ৩টি খালি পৃষ্ঠা)", "পাসপোর্ট সাইজ ছবি (সাদা ব্যাকগ্রাউন্ড)", "ব্যাংক স্টেটমেন্ট (৬ মাস) + সলভেন্সি লেটার", "কনফার্ম রিটার্ন ফ্লাইট টিকিট", "হোটেল রিজার্ভেশন", "জাতীয় পরিচয়পত্র (এনআইডি)", "চাকরি / ট্রেড লাইসেন্স প্রমাণ"],
    },
    note: { en: "Apply via Malaysia's official eVisa system; print the approved eVisa to show at the entry checkpoint.", bn: "মালয়েশিয়ার অফিসিয়াল ই-ভিসা সিস্টেমে আবেদন; অনুমোদিত ই-ভিসা প্রিন্ট করে এন্ট্রি চেকপয়েন্টে দেখাতে হবে।" },
  },
  {
    title: { en: "Dubai (UAE) Tourist Visa", bn: "দুবাই (আমিরাত) ট্যুরিস্ট ভিসা" },
    country: "UAE", visaType: "tourist", status: "published", flag: "🇦🇪",
    fee: { amount: 18000, currency: "BDT" },
    processingTime: "3–5 working days (express 24–48 hrs)",
    validity: { en: "Enter within 60 days of issue", bn: "ইস্যুর ৬০ দিনের মধ্যে প্রবেশ" },
    stayDuration: { en: "30 days (14 / 30 / 60 / 90-day options)", bn: "৩০ দিন (১৪ / ৩০ / ৬০ / ৯০ দিনের অপশন)" },
    overview: { en: "UAE e-Visa for Bangladeshi travellers — explore Dubai's skyline, desert safari and shopping. Fast, fully online processing.", bn: "বাংলাদেশি ভ্রমণকারীদের জন্য আমিরাত ই-ভিসা — দুবাইয়ের আকাশচুম্বী ভবন, ডেজার্ট সাফারি ও শপিং। দ্রুত, সম্পূর্ণ অনলাইন প্রসেসিং।" },
    requirements: {
      en: ["Passport valid 6+ months", "Recent colour photo (white background, 35×45 mm)", "Confirmed return air ticket", "Hotel booking confirmation", "Bank statement (if requested)"],
      bn: ["পাসপোর্ট (৬+ মাস মেয়াদ)", "সাম্প্রতিক রঙিন ছবি (সাদা ব্যাকগ্রাউন্ড, ৩৫×৪৫ মিমি)", "কনফার্ম রিটার্ন বিমান টিকিট", "হোটেল বুকিং কনফার্মেশন", "ব্যাংক স্টেটমেন্ট (প্রয়োজনে)"],
    },
    note: { en: "The e-Visa is emailed after approval — carry a printed copy. Validity is entry window; stay counts from the entry date.", bn: "অনুমোদনের পর ই-ভিসা ইমেইলে আসে — প্রিন্ট কপি সাথে রাখুন। মেয়াদ হলো প্রবেশের সময়সীমা; থাকার হিসাব প্রবেশের তারিখ থেকে।" },
  },
  {
    title: { en: "India Tourist e-Visa", bn: "ভারত ট্যুরিস্ট ই-ভিসা" },
    country: "India", visaType: "tourist", status: "published", flag: "🇮🇳",
    fee: { amount: 1500, currency: "BDT" },
    processingTime: "3–7 working days (e-Visa)",
    validity: { en: "Up to 5 years, multiple entry (e-Tourist)", bn: "সর্বোচ্চ ৫ বছর, মাল্টিপল এন্ট্রি (ই-ট্যুরিস্ট)" },
    stayDuration: { en: "Up to 90 days per visit", bn: "প্রতি ভিজিটে সর্বোচ্চ ৯০ দিন" },
    overview: { en: "India e-Tourist visa for Bangladeshi citizens — apply fully online, no embassy visit needed. Great for treatment, family visits and tourism.", bn: "বাংলাদেশি নাগরিকদের জন্য ভারত ই-ট্যুরিস্ট ভিসা — সম্পূর্ণ অনলাইনে আবেদন, দূতাবাসে যাওয়ার দরকার নেই। চিকিৎসা, পারিবারিক ভ্রমণ ও পর্যটনের জন্য আদর্শ।" },
    requirements: {
      en: ["Passport valid 6+ months", "2 photos (2×2 inch, white background)", "National ID / citizenship proof (with English translation)", "Utility bill — electricity / gas / landline (any one)", "Bank statement (last 6 months, min ৳25,000)", "Proof of income above ৳20,000/month"],
      bn: ["পাসপোর্ট (৬+ মাস মেয়াদ)", "২ কপি ছবি (২×২ ইঞ্চি, সাদা ব্যাকগ্রাউন্ড)", "জাতীয় পরিচয়পত্র / নাগরিকত্বের প্রমাণ (ইংরেজি অনুবাদসহ)", "ইউটিলিটি বিল — বিদ্যুৎ / গ্যাস / ল্যান্ডলাইন (যেকোনো একটি)", "ব্যাংক স্টেটমেন্ট (৬ মাস, ন্যূনতম ৳২৫,০০০)", "মাসিক ৳২০,০০০+ আয়ের প্রমাণ"],
    },
    note: { en: "Government visa fee is FREE for Bangladeshi nationals — only our service fee applies. e-Visa entry is via authorized airports/seaports only.", bn: "বাংলাদেশি নাগরিকদের জন্য সরকারি ভিসা ফি ফ্রি — শুধু আমাদের সার্ভিস ফি প্রযোজ্য। ই-ভিসা শুধু অনুমোদিত এয়ারপোর্ট/সিপোর্ট দিয়ে প্রবেশযোগ্য।" },
  },
];

// ── Hotels ───────────────────────────────────────────────────────────────
const hotels = [
  { name: { en: "Sayeman Beach Resort", bn: "সায়মন বিচ রিসোর্ট" }, city: "Cox's Bazar", country: "Bangladesh", rating: 5, status: "published", price: { amount: 9500, currency: "BDT", unit: "per night" }, cover: img("1566073771259-6a8506099945"), amenities: ["Sea view", "Pool", "Restaurant", "WiFi"] },
  { name: { en: "Hotel Sea Crown", bn: "হোটেল সি ক্রাউন" }, city: "Cox's Bazar", country: "Bangladesh", rating: 4, status: "published", price: { amount: 5500, currency: "BDT", unit: "per night" }, cover: img("1551882547-ff40c63fe5fa"), amenities: ["Sea view", "Restaurant", "WiFi"] },
  { name: { en: "Sajek Resort", bn: "সাজেক রিসোর্ট" }, city: "Sajek", country: "Bangladesh", rating: 4, status: "published", price: { amount: 4500, currency: "BDT", unit: "per night" }, cover: img("1571896349842-33c89424de2d"), amenities: ["Hill view", "Restaurant", "Bonfire"] },
];

// ── Air-ticket featured fares ────────────────────────────────────────────
const airtickets = [
  { from: "Dhaka (DAC)", to: "Kuala Lumpur (KUL)", airline: "Malaysia Airlines", tripType: "round-trip", status: "published", price: { amount: 48000, currency: "BDT" }, cover: img("1436491865332-7a61a109cc05") },
  { from: "Dhaka (DAC)", to: "Bangkok (BKK)", airline: "Thai Airways", tripType: "round-trip", status: "published", price: { amount: 42000, currency: "BDT" }, cover: img("1474302770737-173ee21bab63") },
  { from: "Dhaka (DAC)", to: "Dubai (DXB)", airline: "Emirates", tripType: "round-trip", status: "published", price: { amount: 65000, currency: "BDT" }, cover: img("1583416750470-965b2707b355") },
  { from: "Dhaka (DAC)", to: "Jeddah (JED)", airline: "Saudia", tripType: "round-trip", status: "published", price: { amount: 78000, currency: "BDT" }, cover: img("1610642372651-fe6e7bc60ba6") },
];

// ── Blog ─────────────────────────────────────────────────────────────────
const blogs = [
  { title: { en: "Top 7 Tourist Spots in Cox's Bazar", bn: "কক্সবাজারের সেরা ৭ পর্যটন স্পট" }, category: "travel-guide", status: "published", cover: img("1589802829985-817e51171b92"), tags: ["coxsbazar", "beach", "bangladesh"], excerpt: { en: "From Himchari to Inani — a quick guide to the best of Cox's Bazar.", bn: "হিমছড়ি থেকে ইনানী — কক্সবাজারের সেরা জায়গাগুলোর গাইড।" }, content: { en: "Cox's Bazar offers the world's longest sea beach...", bn: "কক্সবাজারে রয়েছে বিশ্বের দীর্ঘতম সমুদ্র সৈকত..." } },
  { title: { en: "Umrah Checklist: What to Prepare", bn: "উমরাহ চেকলিস্ট: কী কী প্রস্তুত করবেন" }, category: "hajj-umrah", status: "published", cover: img("1565019011521-b0575cbb57c8"), tags: ["umrah", "hajj", "guide"], excerpt: { en: "Documents, clothing and tips for a smooth Umrah journey.", bn: "সুন্দর উমরাহ যাত্রার জন্য ডকুমেন্ট, পোশাক ও টিপস।" }, content: { en: "Before your Umrah, prepare these documents...", bn: "উমরাহর আগে এই ডকুমেন্টগুলো প্রস্তুত করুন..." } },
  { title: { en: "Maldives on a Budget: Is It Possible?", bn: "কম খরচে মালদ্বীপ: সম্ভব কি?" }, category: "tips", status: "published", cover: img("1514282401047-d79a71a590e8"), tags: ["maldives", "budget"], excerpt: { en: "Local islands and guesthouses make Maldives affordable.", bn: "লোকাল আইল্যান্ড ও গেস্টহাউস মালদ্বীপকে সাশ্রয়ী করে তোলে।" }, content: { en: "Skip the resort and stay on a local island...", bn: "রিসোর্ট বাদ দিয়ে লোকাল আইল্যান্ডে থাকুন..." } },
];

// ── Banners ──────────────────────────────────────────────────────────────
const banners = [
  { position: "hero", active: true, order: 1, image: img("1469854523086-cc02fe5d8800"), title: { en: "Explore the World with Little Bird", bn: "লিটল বার্ডের সাথে ঘুরুন সারা বিশ্ব" }, subtitle: { en: "Tour packages, air tickets, visa & more", bn: "ট্যুর প্যাকেজ, বিমান টিকিট, ভিসা ও আরও অনেক কিছু" }, link: "/packages" },
  { position: "hero", active: true, order: 2, image: img("1507525428034-b723cf961d3e"), title: { en: "Cox's Bazar from ৳8,500", bn: "কক্সবাজার ৮,৫০০ টাকা থেকে" }, subtitle: { en: "Book your beach holiday today", bn: "আজই বুক করুন আপনার সৈকত ছুটি" }, link: "/packages" },
];

// ── Reviews (approved samples) ───────────────────────────────────────────
const reviews = [
  { refType: "package", refId: "general", rating: 5, comment: "Excellent service, very well organized trip to Cox's Bazar!", status: "approved", author: { name: "Rakib Hasan", email: "rakib@example.com" }, video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" },
  { refType: "package", refId: "general", rating: 5, comment: "Our Umrah journey was smooth and hassle-free. Highly recommended.", status: "approved", author: { name: "Ayesha Siddiqua", email: "ayesha@example.com" }, video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
  { refType: "package", refId: "general", rating: 4, comment: "Great Maldives honeymoon package. Loved the resort!", status: "approved", author: { name: "Tanvir & Mim", email: "tanvir@example.com" }, video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
];

// ════════════════════════════════════════════════════════════════════════
// Extra demo data — fills every section so the homepage & admin look complete.
// (Images reuse verified IDs to avoid broken/slow image loads.)
// ════════════════════════════════════════════════════════════════════════
const moreDest = { singapore: new ObjectId(), turkey: new ObjectId(), bali: new ObjectId(), kashmir: new ObjectId() };
destinations.push(
  { _id: moreDest.singapore, name: { en: "Singapore", bn: "সিঙ্গাপুর" }, slug: "singapore", country: "Singapore", region: "international", popular: true, status: "published", image: img("1525625293386-3f8f99389edd"), description: { en: "The garden city of the future.", bn: "ভবিষ্যতের বাগান শহর।" } },
  { _id: moreDest.turkey, name: { en: "Turkey", bn: "তুরস্ক" }, slug: "turkey", country: "Turkey", region: "international", popular: true, status: "published", image: img("1541432901042-2d8bd64b4a9b"), description: { en: "Where East meets West.", bn: "পূর্ব ও পশ্চিমের মিলনস্থল।" } },
  { _id: moreDest.bali, name: { en: "Bali", bn: "বালি" }, slug: "bali", country: "Indonesia", region: "international", popular: true, status: "published", image: img("1537996194471-e657df975ab4"), description: { en: "Island of the gods.", bn: "দেবতাদের দ্বীপ।" } },
  { _id: moreDest.kashmir, name: { en: "Kashmir", bn: "কাশ্মীর" }, slug: "kashmir", country: "India", region: "international", popular: false, status: "published", image: img("1566837497312-7be4a47b3a4b"), description: { en: "Paradise on earth.", bn: "ভূস্বর্গ।" } },
);

packages.push(
  { title: { en: "Saint Martin 2 Days Island Trip", bn: "সেন্ট মার্টিন ২ দিনের দ্বীপ ভ্রমণ" }, summary: { en: "Coral island, beach & fresh seafood.", bn: "প্রবাল দ্বীপ, সৈকত ও তাজা সি-ফুড।" }, type: "domestic", destinationId: String(destIds.saintmartin), location: { en: "Saint Martin", bn: "সেন্ট মার্টিন" }, price: { amount: 6500, currency: "BDT", unit: "per person" }, durationDays: 2, durationNights: 1, maxGroup: 30, featured: true, status: "published", rating: 4.6, cover: img("1507525428034-b723cf961d3e"), itinerary: [dayPlan("Ship to island", "জাহাজে দ্বীপে"), dayPlan("Chera Dwip & return", "ছেঁড়া দ্বীপ ও ফেরা")], inclusions: { en: ["Ship ticket", "Resort", "Breakfast"], bn: ["জাহাজ টিকিট", "রিসোর্ট", "নাস্তা"] }, exclusions: { en: ["Lunch", "Dinner"], bn: ["দুপুর", "রাত"] } },
  { title: { en: "Sundarbans 3 Days Wildlife Cruise", bn: "সুন্দরবন ৩ দিনের ওয়াইল্ডলাইফ ক্রুজ" }, summary: { en: "Mangrove forest cruise & tiger spotting.", bn: "ম্যানগ্রোভ বনে ক্রুজ ও বাঘ দেখা।" }, type: "adventure", destinationId: String(destIds.sundarbans), location: { en: "Sundarbans", bn: "সুন্দরবন" }, price: { amount: 11500, currency: "BDT", unit: "per person" }, durationDays: 3, durationNights: 2, maxGroup: 24, featured: false, status: "published", rating: 4.5, cover: img("1516026672322-bc52d61a55d5"), itinerary: [dayPlan("Khulna to forest", "খুলনা থেকে বনে"), dayPlan("Kotka & Karamjal", "কটকা ও করমজল"), dayPlan("Return", "ফেরা")], inclusions: { en: ["Boat (full board)", "Guide", "All meals"], bn: ["বোট (ফুল বোর্ড)", "গাইড", "সব খাবার"] }, exclusions: { en: ["Transport to Khulna"], bn: ["খুলনা পর্যন্ত পরিবহন"] } },
  { title: { en: "Nepal Kathmandu–Pokhara 5 Days", bn: "নেপাল কাঠমান্ডু–পোখারা ৫ দিন" }, summary: { en: "Himalayan views, lakes & temples.", bn: "হিমালয় ভিউ, হ্রদ ও মন্দির।" }, type: "family", destinationId: String(destIds.nepal), location: { en: "Kathmandu & Pokhara", bn: "কাঠমান্ডু ও পোখারা" }, price: { amount: 54000, currency: "BDT", unit: "per person" }, durationDays: 5, durationNights: 4, maxGroup: 25, featured: true, status: "published", rating: 4.7, cover: img("1544735716-392fe2489ffa"), itinerary: [dayPlan("Arrival Kathmandu", "কাঠমান্ডুতে আগমন"), dayPlan("City & Swayambhunath", "সিটি ও স্বয়ম্ভুনাথ"), dayPlan("Drive to Pokhara", "পোখারায় যাত্রা"), dayPlan("Sarangkot sunrise", "সারাংকোট সূর্যোদয়"), dayPlan("Return", "ফেরা")], inclusions: { en: ["Air ticket", "Hotels", "Breakfast", "Tours"], bn: ["বিমান টিকিট", "হোটেল", "নাস্তা", "ট্যুর"] }, exclusions: { en: ["Visa on arrival fee"], bn: ["অন-অ্যারাইভাল ভিসা ফি"] } },
  { title: { en: "Malaysia KL–Langkawi 5 Days", bn: "মালয়েশিয়া কেএল–লংকাউই ৫ দিন" }, summary: { en: "City, cable car & island hopping.", bn: "সিটি, কেবল কার ও আইল্যান্ড হপিং।" }, type: "family", destinationId: String(moreDest.singapore), location: { en: "Kuala Lumpur & Langkawi", bn: "কুয়ালালামপুর ও লংকাউই" }, price: { amount: 67000, currency: "BDT", unit: "per person" }, durationDays: 5, durationNights: 4, maxGroup: 30, featured: false, status: "published", rating: 4.5, cover: img("1596422846543-75c6fc197f07"), itinerary: [dayPlan("Arrival KL", "কেএল-এ আগমন"), dayPlan("City tour & Twin Towers", "সিটি ট্যুর ও টুইন টাওয়ার"), dayPlan("Fly to Langkawi", "লংকাউই ফ্লাইট"), dayPlan("Island hopping", "আইল্যান্ড হপিং"), dayPlan("Return", "ফেরা")], inclusions: { en: ["Air ticket", "Hotels", "Breakfast"], bn: ["বিমান টিকিট", "হোটেল", "নাস্তা"] }, exclusions: { en: ["Visa", "Lunch & dinner"], bn: ["ভিসা", "দুপুর ও রাত"] } },
  { title: { en: "Singapore 4 Days City Break", bn: "সিঙ্গাপুর ৪ দিন সিটি ব্রেক" }, summary: { en: "Sentosa, Gardens by the Bay & Universal.", bn: "সেন্টোসা, গার্ডেনস বাই দ্য বে ও ইউনিভার্সাল।" }, type: "family", destinationId: String(moreDest.singapore), location: { en: "Singapore", bn: "সিঙ্গাপুর" }, price: { amount: 78000, currency: "BDT", unit: "per person" }, durationDays: 4, durationNights: 3, maxGroup: 25, featured: true, status: "published", rating: 4.8, cover: img("1525625293386-3f8f99389edd"), itinerary: [dayPlan("Arrival & Marina Bay", "আগমন ও মেরিনা বে"), dayPlan("Sentosa & Universal", "সেন্টোসা ও ইউনিভার্সাল"), dayPlan("Gardens by the Bay", "গার্ডেনস বাই দ্য বে"), dayPlan("Shopping & departure", "শপিং ও প্রস্থান")], inclusions: { en: ["Air ticket", "Hotel", "Breakfast", "Tours"], bn: ["বিমান টিকিট", "হোটেল", "নাস্তা", "ট্যুর"] }, exclusions: { en: ["Visa", "Lunch & dinner"], bn: ["ভিসা", "দুপুর ও রাত"] } },
  { title: { en: "Turkey Istanbul–Cappadocia 6 Days", bn: "তুরস্ক ইস্তাম্বুল–ক্যাপাডোসিয়া ৬ দিন" }, summary: { en: "Hagia Sophia, Bosphorus & hot-air balloon.", bn: "হায়া সোফিয়া, বসফরাস ও হট-এয়ার বেলুন।" }, type: "honeymoon", destinationId: String(moreDest.turkey), location: { en: "Istanbul & Cappadocia", bn: "ইস্তাম্বুল ও ক্যাপাডোসিয়া" }, price: { amount: 132000, currency: "BDT", unit: "per couple" }, durationDays: 6, durationNights: 5, maxGroup: 16, featured: true, status: "published", rating: 4.9, cover: img("1541432901042-2d8bd64b4a9b"), itinerary: [dayPlan("Arrival Istanbul", "ইস্তাম্বুলে আগমন"), dayPlan("Old city tour", "ওল্ড সিটি ট্যুর"), dayPlan("Bosphorus cruise", "বসফরাস ক্রুজ"), dayPlan("Fly to Cappadocia", "ক্যাপাডোসিয়া ফ্লাইট"), dayPlan("Balloon ride", "বেলুন রাইড"), dayPlan("Return", "ফেরা")], inclusions: { en: ["Air ticket", "Hotels", "Breakfast", "Tours"], bn: ["বিমান টিকিট", "হোটেল", "নাস্তা", "ট্যুর"] }, exclusions: { en: ["Visa", "Balloon fee"], bn: ["ভিসা", "বেলুন ফি"] } },
  { title: { en: "Bali Honeymoon 5 Days", bn: "বালি হানিমুন ৫ দিন" }, summary: { en: "Private pool villa, waterfalls & beaches.", bn: "প্রাইভেট পুল ভিলা, ঝর্ণা ও সৈকত।" }, type: "honeymoon", destinationId: String(moreDest.bali), location: { en: "Bali, Indonesia", bn: "বালি, ইন্দোনেশিয়া" }, price: { amount: 115000, currency: "BDT", unit: "per couple" }, durationDays: 5, durationNights: 4, maxGroup: 2, featured: false, status: "published", rating: 4.8, cover: img("1537996194471-e657df975ab4"), itinerary: [dayPlan("Arrival & villa", "আগমন ও ভিলা"), dayPlan("Ubud & rice terraces", "উবুদ ও রাইস টেরেস"), dayPlan("Waterfalls", "ঝর্ণা"), dayPlan("Beach day", "সৈকত দিবস"), dayPlan("Return", "ফেরা")], inclusions: { en: ["Air ticket", "Pool villa", "Breakfast", "Transfers"], bn: ["বিমান টিকিট", "পুল ভিলা", "নাস্তা", "ট্রান্সফার"] }, exclusions: { en: ["Visa", "Lunch & dinner"], bn: ["ভিসা", "দুপুর ও রাত"] } },
  { title: { en: "Kashmir 5 Days Valley Tour", bn: "কাশ্মীর ৫ দিন ভ্যালি ট্যুর" }, summary: { en: "Srinagar, Gulmarg & Pahalgam.", bn: "শ্রীনগর, গুলমার্গ ও পাহালগাম।" }, type: "family", destinationId: String(moreDest.kashmir), location: { en: "Srinagar, Kashmir", bn: "শ্রীনগর, কাশ্মীর" }, price: { amount: 72000, currency: "BDT", unit: "per person" }, durationDays: 5, durationNights: 4, maxGroup: 20, featured: false, status: "published", rating: 4.7, cover: img("1566837497312-7be4a47b3a4b"), itinerary: [dayPlan("Arrival Srinagar", "শ্রীনগরে আগমন"), dayPlan("Gulmarg gondola", "গুলমার্গ গন্ডোলা"), dayPlan("Pahalgam", "পাহালগাম"), dayPlan("Shikara & gardens", "শিকারা ও বাগান"), dayPlan("Return", "ফেরা")], inclusions: { en: ["Air ticket", "Houseboat + hotels", "Breakfast & dinner"], bn: ["বিমান টিকিট", "হাউসবোট + হোটেল", "নাস্তা ও রাত"] }, exclusions: { en: ["Visa", "Lunch"], bn: ["ভিসা", "দুপুর"] } },
);

hajj.push(
  {
    title: { en: "Economy Umrah Package 14 Days", bn: "ইকোনমি উমরাহ প্যাকেজ ১৪ দিন" },
    type: "umrah", packageClass: "economy", status: "published",
    price: { amount: 135000, currency: "BDT", unit: "per person" }, durationDays: 14,
    cover: img("1519817650390-64a93db51149"),
    hotelMakkah: { en: "3-star, ~1 km from Haram (shared)", bn: "৩-তারকা, হারাম থেকে ~১ কিমি (শেয়ার্ড)" },
    hotelMadinah: { en: "3-star, ~800 m from Masjid an-Nabawi", bn: "৩-তারকা, মসজিদে নববী থেকে ~৮০০ মি" },
    inclusions: { en: ["Return air ticket", "Umrah visa", "3-star shared hotel", "Airport & inter-city transport", "Ziyarah in Makkah & Madinah", "Group guide"], bn: ["রিটার্ন বিমান টিকিট", "উমরাহ ভিসা", "৩-তারকা শেয়ার্ড হোটেল", "এয়ারপোর্ট ও আন্তঃশহর পরিবহন", "মক্কা ও মদিনায় জিয়ারাহ", "গ্রুপ গাইড"] },
    exclusions: { en: ["Meals", "Personal expenses & shopping", "Travel insurance", "Extra / overweight baggage charges"], bn: ["খাবার", "ব্যক্তিগত খরচ ও কেনাকাটা", "ভ্রমণ বীমা", "অতিরিক্ত / ওজন-বেশি লাগেজ চার্জ"] },
    documents: UMRAH_DOCS,
  },
  {
    title: { en: "Standard Umrah Package 12 Days", bn: "স্ট্যান্ডার্ড উমরাহ প্যাকেজ ১২ দিন" },
    type: "umrah", packageClass: "standard", status: "published",
    price: { amount: 185000, currency: "BDT", unit: "per person" }, durationDays: 12,
    cover: img("1542816417-0983c9c9ad53"),
    hotelMakkah: { en: "4-star, ~600 m from Haram", bn: "৪-তারকা, হারাম থেকে ~৬০০ মি" },
    hotelMadinah: { en: "4-star, ~400 m from Masjid an-Nabawi", bn: "৪-তারকা, মসজিদে নববী থেকে ~৪০০ মি" },
    inclusions: { en: ["Return air ticket", "Umrah visa", "4-star hotel (triple/quad)", "Daily breakfast", "AC transport", "Ziyarah in Makkah & Madinah", "Group guide"], bn: ["রিটার্ন বিমান টিকিট", "উমরাহ ভিসা", "৪-তারকা হোটেল (ট্রিপল/কোয়াড)", "দৈনিক নাস্তা", "এসি পরিবহন", "মক্কা ও মদিনায় জিয়ারাহ", "গ্রুপ গাইড"] },
    exclusions: { en: ["Lunch & dinner", "Personal expenses & shopping", "Travel insurance", "Extra / overweight baggage charges"], bn: ["দুপুর ও রাতের খাবার", "ব্যক্তিগত খরচ ও কেনাকাটা", "ভ্রমণ বীমা", "অতিরিক্ত / ওজন-বেশি লাগেজ চার্জ"] },
    documents: UMRAH_DOCS,
  },
  {
    title: { en: "Premium Umrah Package 10 Days", bn: "প্রিমিয়াম উমরাহ প্যাকেজ ১০ দিন" },
    type: "umrah", packageClass: "premium", status: "published",
    price: { amount: 265000, currency: "BDT", unit: "per person" }, durationDays: 10,
    cover: img("1627728734379-a5f8c099763e"),
    hotelMakkah: { en: "5-star, within 300 m of Haram", bn: "৫-তারকা, হারাম থেকে ৩০০ মি-র মধ্যে" },
    hotelMadinah: { en: "5-star, beside Masjid an-Nabawi", bn: "৫-তারকা, মসজিদে নববীর পাশে" },
    inclusions: { en: ["Return air ticket", "Umrah visa", "5-star hotel (double room)", "Full-board meals", "Private AC transport", "Full Ziyarah in Makkah & Madinah", "Dedicated guide"], bn: ["রিটার্ন বিমান টিকিট", "উমরাহ ভিসা", "৫-তারকা হোটেল (ডাবল রুম)", "ফুল-বোর্ড খাবার", "প্রাইভেট এসি পরিবহন", "মক্কা ও মদিনায় সম্পূর্ণ জিয়ারাহ", "ডেডিকেটেড গাইড"] },
    exclusions: { en: ["Personal shopping & laundry", "Travel insurance (optional)", "Extra / overweight baggage charges", "Anything not mentioned above"], bn: ["ব্যক্তিগত কেনাকাটা ও লন্ড্রি", "ভ্রমণ বীমা (ঐচ্ছিক)", "অতিরিক্ত / ওজন-বেশি লাগেজ চার্জ", "উপরে উল্লেখ নেই এমন কিছু"] },
    documents: UMRAH_DOCS,
  },
);

visas.push(
  {
    title: { en: "Singapore Tourist Visa", bn: "সিঙ্গাপুর ট্যুরিস্ট ভিসা" },
    country: "Singapore", visaType: "tourist", status: "published", flag: "🇸🇬",
    fee: { amount: 6500, currency: "BDT" },
    processingTime: "3 working days (often 10–20 from Dhaka)",
    validity: { en: "Typically up to 35 days", bn: "সাধারণত সর্বোচ্চ ৩৫ দিন" },
    stayDuration: { en: "As granted on arrival (usually 30 days)", bn: "আগমনে প্রদত্ত (সাধারণত ৩০ দিন)" },
    overview: { en: "Singapore visa for Bangladeshi citizens must be lodged through an authorized agent. We handle the Form 14A, Letter of Introduction and submission for you.", bn: "বাংলাদেশি নাগরিকদের সিঙ্গাপুর ভিসা অনুমোদিত এজেন্টের মাধ্যমে জমা দিতে হয়। আমরা ফর্ম 14A, লেটার অব ইন্ট্রোডাকশন ও জমা সব করে দিই।" },
    requirements: {
      en: ["Passport valid 6+ months", "2 photos (35×45 mm, white background)", "Completed Form 14A", "Letter of Introduction (LOI) from a local contact", "Travel itinerary with flight tickets", "Hotel booking / invitation", "Bank statement (last 6 months, signed & stamped)"],
      bn: ["পাসপোর্ট (৬+ মাস মেয়াদ)", "২ কপি ছবি (৩৫×৪৫ মিমি, সাদা ব্যাকগ্রাউন্ড)", "পূরণকৃত ফর্ম 14A", "লোকাল কন্টাক্টের লেটার অব ইন্ট্রোডাকশন (LOI)", "ফ্লাইট টিকিটসহ ভ্রমণসূচি", "হোটেল বুকিং / আমন্ত্রণপত্র", "ব্যাংক স্টেটমেন্ট (৬ মাস, স্বাক্ষর ও সিলসহ)"],
    },
    note: { en: "Bangladesh is an Assessment Level II country — citizens cannot self-apply for an e-Visa and must apply via an authorized visa agent.", bn: "বাংলাদেশ Assessment Level II দেশ — নাগরিকরা নিজে ই-ভিসা করতে পারে না, অনুমোদিত এজেন্টের মাধ্যমে আবেদন করতে হয়।" },
  },
  {
    title: { en: "Turkey e-Visa / Sticker Visa", bn: "তুরস্ক ই-ভিসা / স্টিকার ভিসা" },
    country: "Turkey", visaType: "tourist", status: "published", flag: "🇹🇷",
    fee: { amount: 9500, currency: "BDT" },
    processingTime: "7–12 working days (sticker)",
    validity: { en: "e-Visa valid 180 days", bn: "ই-ভিসা ১৮০ দিন মেয়াদ" },
    stayDuration: { en: "Up to 30 days", bn: "সর্বোচ্চ ৩০ দিন" },
    overview: { en: "Turkey offers an e-Visa to Bangladeshi citizens who hold a valid Schengen/US/UK/Ireland visa or residence permit; otherwise a sticker visa from the embassy is required.", bn: "যাদের বৈধ Schengen/US/UK/Ireland ভিসা বা রেসিডেন্স পারমিট আছে তাদের জন্য তুরস্ক ই-ভিসা দেয়; অন্যথায় দূতাবাস থেকে স্টিকার ভিসা নিতে হয়।" },
    requirements: {
      en: ["Passport valid 6+ months beyond departure", "For e-Visa: valid Schengen / US / UK / Ireland visa or residence permit", "Recent photo (sticker: 80% face, white background)", "All previous passports (for sticker visa)", "NID / birth certificate", "Hotel booking & return ticket"],
      bn: ["পাসপোর্ট (প্রস্থানের পর ৬+ মাস মেয়াদ)", "ই-ভিসার জন্য: বৈধ Schengen / US / UK / Ireland ভিসা বা রেসিডেন্স পারমিট", "সাম্প্রতিক ছবি (স্টিকার: ৮০% মুখ, সাদা ব্যাকগ্রাউন্ড)", "সব পুরনো পাসপোর্ট (স্টিকার ভিসার জন্য)", "এনআইডি / জন্মনিবন্ধন", "হোটেল বুকিং ও রিটার্ন টিকিট"],
    },
    note: { en: "Without a Schengen/US/UK/Ireland visa, Bangladeshi citizens must obtain a sticker visa from the Turkish Embassy.", bn: "Schengen/US/UK/Ireland ভিসা না থাকলে বাংলাদেশি নাগরিকদের তুর্কি দূতাবাস থেকে স্টিকার ভিসা নিতে হবে।" },
  },
  {
    title: { en: "China Tourist Visa (L)", bn: "চীন ট্যুরিস্ট ভিসা (L)" },
    country: "China", visaType: "tourist", status: "published", flag: "🇨🇳",
    fee: { amount: 8000, currency: "BDT" },
    processingTime: "4–5 working days (express 2–3)",
    validity: { en: "Single / double / multiple entry options", bn: "সিঙ্গেল / ডাবল / মাল্টিপল এন্ট্রি অপশন" },
    stayDuration: { en: "Usually up to 30 days per entry", bn: "সাধারণত প্রতি এন্ট্রিতে সর্বোচ্চ ৩০ দিন" },
    overview: { en: "China L (tourist) visa for Bangladeshi citizens — applied online via CVASC, then documents submitted to the visa centre in Dhaka.", bn: "বাংলাদেশি নাগরিকদের জন্য চীন L (ট্যুরিস্ট) ভিসা — CVASC-এ অনলাইনে আবেদন, এরপর ঢাকার ভিসা সেন্টারে ডকুমেন্ট জমা।" },
    requirements: {
      en: ["Passport valid 6+ months with blank pages (submit all old passports)", "2 photos (48×33 mm, white background, lab-printed, no glasses)", "Completed online application form", "Round-trip air ticket + hotel reservation (or invitation letter)", "Bank statement", "Detailed travel itinerary"],
      bn: ["পাসপোর্ট (৬+ মাস মেয়াদ, খালি পৃষ্ঠাসহ; সব পুরনো পাসপোর্ট জমা)", "২ কপি ছবি (৪৮×৩৩ মিমি, সাদা ব্যাকগ্রাউন্ড, ল্যাব-প্রিন্ট, চশমা ছাড়া)", "পূরণকৃত অনলাইন আবেদন ফর্ম", "রাউন্ড-ট্রিপ টিকিট + হোটেল রিজার্ভেশন (বা আমন্ত্রণপত্র)", "ব্যাংক স্টেটমেন্ট", "বিস্তারিত ভ্রমণসূচি"],
    },
    note: { en: "First-time applicants with no travel history may require an interview; those with prior US/UK/Schengen/China travel are usually exempt.", bn: "ভ্রমণ-ইতিহাসহীন প্রথমবারের আবেদনকারীদের ইন্টারভিউ লাগতে পারে; আগে US/UK/Schengen/China ভ্রমণ থাকলে সাধারণত লাগে না।" },
  },
  {
    title: { en: "Schengen Tourist Visa", bn: "শেনজেন ট্যুরিস্ট ভিসা" },
    country: "Europe", visaType: "tourist", status: "published", flag: "🇪🇺",
    fee: { amount: 12000, currency: "BDT" },
    processingTime: "15–30 calendar days",
    validity: { en: "As granted (short-stay, up to 90 days / 180 days)", bn: "প্রদত্ত অনুযায়ী (শর্ট-স্টে, ১৮০ দিনে সর্বোচ্চ ৯০ দিন)" },
    stayDuration: { en: "Up to 90 days within 180 days", bn: "১৮০ দিনে সর্বোচ্চ ৯০ দিন" },
    overview: { en: "Schengen visa lets you visit 29 European countries on one visa. Applications are submitted through VFS Global in Dhaka — we prepare your full file.", bn: "একটি শেনজেন ভিসায় ২৯টি ইউরোপীয় দেশ ভ্রমণ করা যায়। ঢাকায় VFS Global-এর মাধ্যমে আবেদন — আমরা আপনার সম্পূর্ণ ফাইল প্রস্তুত করি।" },
    requirements: {
      en: ["Passport valid 3+ months beyond return, issued within 10 years", "2 recent photos (35×45 mm)", "Travel medical insurance (min €30,000 coverage)", "Confirmed round-trip flight reservation", "Hotel booking for all nights", "Bank statement (last 6 months) + solvency", "Employment / trade license proof", "Cover letter & day-by-day itinerary"],
      bn: ["পাসপোর্ট (রিটার্নের পর ৩+ মাস মেয়াদ, ১০ বছরের মধ্যে ইস্যু)", "সাম্প্রতিক ২ কপি ছবি (৩৫×৪৫ মিমি)", "ট্রাভেল মেডিকেল ইন্স্যুরেন্স (ন্যূনতম €৩০,০০০ কভারেজ)", "কনফার্ম রাউন্ড-ট্রিপ ফ্লাইট রিজার্ভেশন", "সব রাতের হোটেল বুকিং", "ব্যাংক স্টেটমেন্ট (৬ মাস) + সলভেন্সি", "চাকরি / ট্রেড লাইসেন্স প্রমাণ", "কভার লেটার ও দিনভিত্তিক ভ্রমণসূচি"],
    },
    note: { en: "Government visa fee is around €90 plus VFS service charge. Apply via VFS Global; the passport stays with the embassy during processing.", bn: "সরকারি ভিসা ফি প্রায় €৯০ + VFS সার্ভিস চার্জ। VFS Global-এ আবেদন; প্রসেসিং চলাকালীন পাসপোর্ট দূতাবাসে থাকে।" },
  },
);

hotels.push(
  { name: { en: "Long Beach Hotel", bn: "লং বিচ হোটেল" }, city: "Cox's Bazar", country: "Bangladesh", rating: 5, status: "published", price: { amount: 8000, currency: "BDT", unit: "per night" }, cover: img("1566073771259-6a8506099945"), amenities: ["Sea view", "Pool", "Gym", "WiFi"] },
  { name: { en: "Hotel The Cox Today", bn: "হোটেল দ্য কক্স টুডে" }, city: "Cox's Bazar", country: "Bangladesh", rating: 4, status: "published", price: { amount: 6000, currency: "BDT", unit: "per night" }, cover: img("1551882547-ff40c63fe5fa"), amenities: ["Restaurant", "WiFi", "Parking"] },
  { name: { en: "Pan Pacific Sonargaon", bn: "প্যান প্যাসিফিক সোনারগাঁও" }, city: "Dhaka", country: "Bangladesh", rating: 5, status: "published", price: { amount: 12500, currency: "BDT", unit: "per night" }, cover: img("1542314831-068cd1dbfeeb"), amenities: ["Pool", "Spa", "Restaurant", "Gym", "WiFi"] },
  { name: { en: "Hotel Hilltop Bandarban", bn: "হোটেল হিলটপ বান্দরবান" }, city: "Bandarban", country: "Bangladesh", rating: 3, status: "published", price: { amount: 3500, currency: "BDT", unit: "per night" }, cover: img("1605640840605-14ac1855827b"), amenities: ["Hill view", "Restaurant"] },
  { name: { en: "Meghbari Resort Sajek", bn: "মেঘবাড়ি রিসোর্ট সাজেক" }, city: "Sajek", country: "Bangladesh", rating: 4, status: "published", price: { amount: 5000, currency: "BDT", unit: "per night" }, cover: img("1571896349842-33c89424de2d"), amenities: ["Cloud view", "Bonfire", "Restaurant"] },
);

airtickets.push(
  { from: "Dhaka (DAC)", to: "Singapore (SIN)", airline: "Singapore Airlines", tripType: "round-trip", status: "published", price: { amount: 58000, currency: "BDT" }, cover: img("1436491865332-7a61a109cc05") },
  { from: "Dhaka (DAC)", to: "Istanbul (IST)", airline: "Turkish Airlines", tripType: "round-trip", status: "published", price: { amount: 92000, currency: "BDT" }, cover: img("1474302770737-173ee21bab63") },
  { from: "Dhaka (DAC)", to: "Kolkata (CCU)", airline: "US-Bangla", tripType: "round-trip", status: "published", price: { amount: 14500, currency: "BDT" }, cover: img("1583416750470-965b2707b355") },
  { from: "Dhaka (DAC)", to: "Kathmandu (KTM)", airline: "Biman Bangladesh", tripType: "round-trip", status: "published", price: { amount: 27000, currency: "BDT" }, cover: img("1610642372651-fe6e7bc60ba6") },
  { from: "Dhaka (DAC)", to: "Doha (DOH)", airline: "Qatar Airways", tripType: "round-trip", status: "published", price: { amount: 71000, currency: "BDT" }, cover: img("1436491865332-7a61a109cc05") },
  { from: "Dhaka (DAC)", to: "Riyadh (RUH)", airline: "Saudia", tripType: "round-trip", status: "published", price: { amount: 76000, currency: "BDT" }, cover: img("1610642372651-fe6e7bc60ba6") },
  { from: "Dhaka (DAC)", to: "London (LHR)", airline: "Emirates", tripType: "round-trip", status: "published", price: { amount: 135000, currency: "BDT" }, cover: img("1474302770737-173ee21bab63") },
  { from: "Dhaka (DAC)", to: "Muscat (MCT)", airline: "Oman Air", tripType: "round-trip", status: "published", price: { amount: 64000, currency: "BDT" }, cover: img("1583416750470-965b2707b355") },
  { from: "Dhaka (DAC)", to: "Male (MLE)", airline: "US-Bangla", tripType: "round-trip", status: "published", price: { amount: 49000, currency: "BDT" }, cover: img("1436491865332-7a61a109cc05") },
  { from: "Dhaka (DAC)", to: "Cox's Bazar (CXB)", airline: "Novoair", tripType: "one-way", status: "published", price: { amount: 5200, currency: "BDT" }, cover: img("1610642372651-fe6e7bc60ba6") },
  { from: "Chittagong (CGP)", to: "Dhaka (DAC)", airline: "US-Bangla", tripType: "one-way", status: "published", price: { amount: 4200, currency: "BDT" }, cover: img("1583416750470-965b2707b355") },
);

blogs.push(
  { title: { en: "How to Pack Light for Any Trip", bn: "যেকোনো ভ্রমণে কম জিনিসে প্যাক করার উপায়" }, category: "advice", status: "published", cover: img("1488646953014-85cb44e25828"), tags: ["packing", "tips"], excerpt: { en: "Roll your clothes, pick versatile pieces and limit shoes.", bn: "কাপড় রোল করুন, বহুমুখী পোশাক নিন, জুতা কম নিন।" }, content: { en: "Smart packing starts with a list...", bn: "স্মার্ট প্যাকিং শুরু হয় একটি তালিকা দিয়ে..." } },
  { title: { en: "Best Time to Visit Cox's Bazar", bn: "কক্সবাজার ভ্রমণের সেরা সময়" }, category: "advice", status: "published", cover: img("1589802829985-817e51171b92"), tags: ["coxsbazar", "season"], excerpt: { en: "November to February offers the best weather.", bn: "নভেম্বর থেকে ফেব্রুয়ারি সেরা আবহাওয়া।" }, content: { en: "The winter months are ideal...", bn: "শীতকাল আদর্শ..." } },
  { title: { en: "Visa Interview Tips That Actually Work", bn: "ভিসা ইন্টারভিউয়ের কার্যকর টিপস" }, category: "advice", status: "published", cover: img("1569154941061-e231b4725ef1"), tags: ["visa", "tips"], excerpt: { en: "Be honest, carry strong documents and stay calm.", bn: "সৎ থাকুন, শক্ত ডকুমেন্ট রাখুন, শান্ত থাকুন।" }, content: { en: "Preparation is everything...", bn: "প্রস্তুতিই সব..." } },
  { title: { en: "5 Mistakes First-Time Travelers Make", bn: "প্রথমবার ভ্রমণকারীদের ৫টি ভুল" }, category: "advice", status: "published", cover: img("1469854523086-cc02fe5d8800"), tags: ["tips", "beginner"], excerpt: { en: "Overpacking, no insurance, tight schedules and more.", bn: "বেশি প্যাকিং, বীমা না নেওয়া, টাইট সিডিউল ইত্যাদি।" }, content: { en: "Avoid these common pitfalls...", bn: "এই সাধারণ ভুলগুলো এড়িয়ে চলুন..." } },
  { title: { en: "How to Find Cheap Flight Tickets", bn: "সস্তায় বিমান টিকিট খোঁজার উপায়" }, category: "advice", status: "published", cover: img("1436491865332-7a61a109cc05"), tags: ["flight", "budget"], excerpt: { en: "Book early, be flexible with dates and compare fares.", bn: "আগে বুক করুন, তারিখে নমনীয় হোন, ভাড়া তুলনা করুন।" }, content: { en: "Timing and flexibility are key...", bn: "সময় ও নমনীয়তাই মূল..." } },
);

reviews.push(
  { refType: "package", refId: "general", rating: 5, comment: "Best Singapore trip ever, everything was perfectly arranged!", status: "approved", author: { name: "Sadia Afrin", email: "sadia@example.com" } },
  { refType: "package", refId: "general", rating: 5, comment: "Turkey honeymoon was a dream. Thank you Little Bird!", status: "approved", author: { name: "Imran & Nusrat", email: "imran@example.com" } },
  { refType: "package", refId: "general", rating: 4, comment: "Smooth visa processing and quick response.", status: "approved", author: { name: "Mahmudul Hasan", email: "mahmud@example.com" } },
  { refType: "package", refId: "general", rating: 5, comment: "Sajek tour was beautifully managed. Highly recommend.", status: "approved", author: { name: "Farzana Akter", email: "farzana@example.com" } },
  { refType: "package", refId: "general", rating: 5, comment: "Great Hajj management, very caring team.", status: "approved", author: { name: "Abdul Karim", email: "karim@example.com" } },
);

// Demo leads (admin Inquiries) and bookings (admin Bookings + dashboard stats).
const inquiries = [
  { type: "tour", name: "Hasan Mahmud", email: "hasan@example.com", phone: "+8801711000001", subject: "Cox's Bazar 3 Days", message: "Family of 4, need quote for December.", status: "new", assignedTo: null, notes: [], refType: "packages", meta: {} },
  { type: "hajj", name: "Sumaiya Islam", email: "sumaiya@example.com", phone: "+8801711000002", subject: "Umrah package", message: "Looking for premium 12-day Umrah.", status: "in-progress", assignedTo: null, notes: [], refType: "hajj", meta: {} },
  { type: "air-ticket", name: "Rakibul Hasan", email: "rakibul@example.com", phone: "+8801711000003", subject: "DAC → DXB", message: "Round trip for 2, mid-July.", status: "new", assignedTo: null, notes: [], meta: { from: "Dhaka (DAC)", to: "Dubai (DXB)" } },
  { type: "visa", name: "Nadia Rahman", email: "nadia@example.com", phone: "+8801711000004", subject: "Thailand visa", message: "Need tourist visa help.", status: "converted", assignedTo: null, notes: [], refType: "visas", meta: {} },
  { type: "hotel", name: "Tofazzal Hossain", email: "tofa@example.com", phone: "+8801711000005", subject: "Sayeman Beach Resort", message: "2 nights, sea view room.", status: "new", assignedTo: null, notes: [], refType: "hotels", meta: {} },
  { type: "tour", name: "Ishrat Jahan", email: "ishrat@example.com", phone: "+8801711000006", subject: "Maldives honeymoon", message: "Budget around 1 lakh per couple.", status: "in-progress", assignedTo: null, notes: [], meta: {} },
  { type: "contact", name: "Jubayer Ahmed", email: "jubayer@example.com", phone: "+8801711000007", subject: "General inquiry", message: "Do you offer corporate group tours?", status: "closed", assignedTo: null, notes: [], meta: {} },
  { type: "air-ticket", name: "Mehzabin Chowdhury", email: "mehzabin@example.com", phone: "+8801711000008", subject: "DAC → SIN", message: "Best fare for next month?", status: "new", assignedTo: null, notes: [], meta: { from: "Dhaka (DAC)", to: "Singapore (SIN)" } },
];

const bk = (n) => `LB-260${n}`;
const bookings = [
  { bookingNo: bk("101"), userEmail: "hasan@example.com", itemType: "package", itemId: "demo", itemTitle: "Cox's Bazar 3 Days 2 Nights", travelDate: "2026-07-12", travelers: [], pax: 4, amount: 34000, currency: "BDT", contact: {}, notes: "", status: "confirmed", paymentStatus: "partial", paymentMethod: null, transactions: [] },
  { bookingNo: bk("102"), userEmail: "sadia@example.com", itemType: "package", itemId: "demo", itemTitle: "Singapore 4 Days City Break", travelDate: "2026-08-02", travelers: [], pax: 2, amount: 156000, currency: "BDT", contact: {}, notes: "", status: "pending", paymentStatus: "unpaid", paymentMethod: null, transactions: [] },
  { bookingNo: bk("103"), userEmail: "imran@example.com", itemType: "package", itemId: "demo", itemTitle: "Turkey Istanbul–Cappadocia 6 Days", travelDate: "2026-09-15", travelers: [], pax: 2, amount: 132000, currency: "BDT", contact: {}, notes: "", status: "confirmed", paymentStatus: "paid", paymentMethod: null, transactions: [] },
  { bookingNo: bk("104"), userEmail: "sumaiya@example.com", itemType: "hajj", itemId: "demo", itemTitle: "Premium Umrah Package 12 Days", travelDate: "2026-10-01", travelers: [], pax: 1, amount: 235000, currency: "BDT", contact: {}, notes: "", status: "completed", paymentStatus: "paid", paymentMethod: null, transactions: [] },
  { bookingNo: bk("105"), userEmail: "farzana@example.com", itemType: "package", itemId: "demo", itemTitle: "Sajek Valley 3 Days Tour", travelDate: "2026-06-20", travelers: [], pax: 3, amount: 21600, currency: "BDT", contact: {}, notes: "", status: "cancelled", paymentStatus: "refunded", paymentMethod: null, transactions: [] },
  { bookingNo: bk("106"), userEmail: "ishrat@example.com", itemType: "package", itemId: "demo", itemTitle: "Maldives Honeymoon 4 Days", travelDate: "2026-11-05", travelers: [], pax: 2, amount: 98000, currency: "BDT", contact: {}, notes: "", status: "confirmed", paymentStatus: "partial", paymentMethod: null, transactions: [] },
];

async function seed() {
  await connectDB();
  const db = getDB();

  const now = new Date();
  const stamp = (arr) => arr.map((d) => ({ createdAt: now, updatedAt: now, ...d }));

  const sets = [
    ["destinations", destinations],
    ["packages", packages],
    ["hajj", hajj],
    ["visas", visas],
    ["hotels", hotels],
    ["airtickets", airtickets],
    ["banners", banners],
    ["reviews", reviews],
    ["inquiries", inquiries],
    ["bookings", bookings],
  ];

  for (const [name, docs] of sets) {
    await db.collection(name).deleteMany({});
    if (docs.length) await db.collection(name).insertMany(stamp(docs));
    console.log(`seeded ${name}: ${docs.length}`);
  }

  // Blog / travel-tips feature removed — drop any legacy data.
  await db.collection("blogs").deleteMany({});
  console.log("removed blogs (deprecated feature)");

  // Settings (upsert single doc)
  const { DEFAULTS } = require("../controllers/settingsController");
  await db.collection("settings").updateOne(
    { key: "site" },
    {
      $set: {
        ...DEFAULTS,
        contact: { ...DEFAULTS.contact, phone: "01918288388", whatsapp: "8801918288388", email: "info@littlebirdtours.com" },
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true }
  );
  console.log("seeded settings");

  // Admin user (upsert by email — never duplicated)
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@littlebirdtours.com").toLowerCase();
  const adminPass = process.env.SEED_ADMIN_PASSWORD || "Admin@123";
  const hash = await bcrypt.hash(adminPass, 10);
  await db.collection("users").updateOne(
    { email: adminEmail },
    {
      $set: { name: "Site Admin", role: "super-admin", phone: "", avatar: "", isVerified: true, password: hash, updatedAt: now },
      $setOnInsert: { email: adminEmail, createdAt: now },
    },
    { upsert: true }
  );
  console.log(`seeded admin: ${adminEmail} / ${adminPass}`);

  // Helpful indexes
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("packages").createIndex({ slug: 1 });
  await db.collection("packages").createIndex({ type: 1, destinationId: 1 });
  await db.collection("inquiries").createIndex({ status: 1, createdAt: -1 });
  await db.collection("bookings").createIndex({ userEmail: 1, createdAt: -1 });
  console.log("created indexes");

  console.log("\n✅ Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

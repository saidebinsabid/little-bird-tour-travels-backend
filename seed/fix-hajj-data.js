/**
 * One-off: set realistic, market-researched Hajj & Umrah package data for
 * Bangladesh — price, hotels, inclusions, exclusions and a verified Islamic
 * cover. Sources: Bangladesh govt Hajj 2025 packages (Tk 4.67–6.90 lakh),
 * HAAB private minimum (Tk 5.10 lakh), and BD Umrah market (Tk 1.15–3.20 lakh,
 * 14 days = 7+7 nights, incl. airfare, hotel, visa, transport, Ziyarah).
 *
 * Targeted update by title.en — no other data is touched.
 *   node seed/fix-hajj-data.js
 */
require("dotenv").config();
const { connectDB, getDB } = require("../config/db");

const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

const PACKAGES = [
  // ── Hajj ──
  {
    title: "Hajj Package 2026 — Economy",
    price: 525000, durationDays: 38, cover: img("1513072064285-240f87fa81e8"),
    hotelMakkah: { en: "Aziziyah, ~3 km from Haram (shuttle)", bn: "আজিজিয়া, হারাম থেকে ~৩ কিমি (শাটল)" },
    hotelMadinah: { en: "1 km from Masjid an-Nabawi", bn: "মসজিদে নববী থেকে ১ কিমি" },
    inclusions: {
      en: ["Return air ticket", "Hajj visa & processing", "Shared hotel (4–6 per room)", "Mina & Arafah tent (D category)", "Train/bus transport in KSA", "Experienced Moallem (guide)", "Ziyarah in Makkah & Madinah"],
      bn: ["রিটার্ন বিমান টিকিট", "হজ্জ ভিসা ও প্রসেসিং", "শেয়ার্ড হোটেল (৪–৬ জন/রুম)", "মিনা ও আরাফাহ তাঁবু (ডি ক্যাটাগরি)", "সৌদিতে ট্রেন/বাস পরিবহন", "অভিজ্ঞ মুয়াল্লিম (গাইড)", "মক্কা ও মদিনায় জিয়ারাহ"],
    },
    exclusions: {
      en: ["Qurbani / sacrifice (~750 SAR)", "Meals (carry ~BDT 40,000 spending)", "Personal expenses & shopping", "Extra / overweight baggage charges"],
      bn: ["কুরবানি / দম (~৭৫০ রিয়াল)", "খাবার (~৪০,০০০ টাকা সাথে রাখুন)", "ব্যক্তিগত খরচ ও কেনাকাটা", "অতিরিক্ত / ওজন-বেশি লাগেজ চার্জ"],
    },
  },
  {
    title: "Hajj Package 2026 — Standard",
    price: 695000, durationDays: 32, cover: img("1591004272853-1462c050dca8"),
    hotelMakkah: { en: "4-star, 1.2–1.5 km from Haram", bn: "৪-তারকা, হারাম থেকে ১.২–১.৫ কিমি" },
    hotelMadinah: { en: "Markaziyah, 500 m from Masjid an-Nabawi", bn: "মারকাজিয়া, মসজিদে নববী থেকে ৫০০ মি" },
    inclusions: {
      en: ["Return air ticket", "Hajj visa & processing", "4-star hotel (quad room)", "Mina & Arafah tent (D+ category)", "AC transport in KSA", "Daily breakfast & dinner", "Experienced Moallem (guide)", "Ziyarah in Makkah & Madinah"],
      bn: ["রিটার্ন বিমান টিকিট", "হজ্জ ভিসা ও প্রসেসিং", "৪-তারকা হোটেল (কোয়াড রুম)", "মিনা ও আরাফাহ তাঁবু (ডি+ ক্যাটাগরি)", "সৌদিতে এসি পরিবহন", "দৈনিক নাস্তা ও রাতের খাবার", "অভিজ্ঞ মুয়াল্লিম (গাইড)", "মক্কা ও মদিনায় জিয়ারাহ"],
    },
    exclusions: {
      en: ["Qurbani / sacrifice (~750 SAR)", "Lunch", "Personal expenses & shopping", "Extra / overweight baggage charges"],
      bn: ["কুরবানি / দম (~৭৫০ রিয়াল)", "দুপুরের খাবার", "ব্যক্তিগত খরচ ও কেনাকাটা", "অতিরিক্ত / ওজন-বেশি লাগেজ চার্জ"],
    },
  },
  {
    title: "Hajj Package 2026 — Premium (VIP)",
    price: 1150000, durationDays: 25, cover: img("1580418827493-f2b22c0a76cb"),
    hotelMakkah: { en: "5-star, within 300 m of Haram", bn: "৫-তারকা, হারাম থেকে ৩০০ মি-র মধ্যে" },
    hotelMadinah: { en: "5-star, beside Masjid an-Nabawi", bn: "৫-তারকা, মসজিদে নববীর পাশে" },
    inclusions: {
      en: ["Premium return air ticket", "Hajj visa & processing", "5-star hotel (double room)", "VIP Mina & Arafah tent (A category)", "Private AC transport", "Full-board meals", "Dedicated guide", "Full Ziyarah in Makkah & Madinah"],
      bn: ["প্রিমিয়াম রিটার্ন বিমান টিকিট", "হজ্জ ভিসা ও প্রসেসিং", "৫-তারকা হোটেল (ডাবল রুম)", "ভিআইপি মিনা ও আরাফাহ তাঁবু (এ ক্যাটাগরি)", "প্রাইভেট এসি পরিবহন", "ফুল-বোর্ড খাবার", "ডেডিকেটেড গাইড", "মক্কা ও মদিনায় সম্পূর্ণ জিয়ারাহ"],
    },
    exclusions: {
      en: ["Qurbani / sacrifice (~750 SAR)", "Personal shopping & laundry", "Travel insurance (optional)", "Anything not mentioned above"],
      bn: ["কুরবানি / দম (~৭৫০ রিয়াল)", "ব্যক্তিগত কেনাকাটা ও লন্ড্রি", "ভ্রমণ বীমা (ঐচ্ছিক)", "উপরে উল্লেখ নেই এমন কিছু"],
    },
  },
  // ── Umrah ──
  {
    title: "Economy Umrah Package 14 Days",
    price: 135000, durationDays: 14, cover: img("1519817650390-64a93db51149"),
    hotelMakkah: { en: "3-star, ~1 km from Haram (shared)", bn: "৩-তারকা, হারাম থেকে ~১ কিমি (শেয়ার্ড)" },
    hotelMadinah: { en: "3-star, ~800 m from Masjid an-Nabawi", bn: "৩-তারকা, মসজিদে নববী থেকে ~৮০০ মি" },
    inclusions: {
      en: ["Return air ticket", "Umrah visa", "3-star shared hotel", "Airport & inter-city transport", "Ziyarah in Makkah & Madinah", "Group guide"],
      bn: ["রিটার্ন বিমান টিকিট", "উমরাহ ভিসা", "৩-তারকা শেয়ার্ড হোটেল", "এয়ারপোর্ট ও আন্তঃশহর পরিবহন", "মক্কা ও মদিনায় জিয়ারাহ", "গ্রুপ গাইড"],
    },
    exclusions: {
      en: ["Meals", "Personal expenses & shopping", "Travel insurance", "Extra / overweight baggage charges"],
      bn: ["খাবার", "ব্যক্তিগত খরচ ও কেনাকাটা", "ভ্রমণ বীমা", "অতিরিক্ত / ওজন-বেশি লাগেজ চার্জ"],
    },
  },
  {
    title: "Standard Umrah Package 12 Days",
    price: 185000, durationDays: 12, cover: img("1542816417-0983c9c9ad53"),
    hotelMakkah: { en: "4-star, ~600 m from Haram", bn: "৪-তারকা, হারাম থেকে ~৬০০ মি" },
    hotelMadinah: { en: "4-star, ~400 m from Masjid an-Nabawi", bn: "৪-তারকা, মসজিদে নববী থেকে ~৪০০ মি" },
    inclusions: {
      en: ["Return air ticket", "Umrah visa", "4-star hotel (triple/quad)", "Daily breakfast", "AC transport", "Ziyarah in Makkah & Madinah", "Group guide"],
      bn: ["রিটার্ন বিমান টিকিট", "উমরাহ ভিসা", "৪-তারকা হোটেল (ট্রিপল/কোয়াড)", "দৈনিক নাস্তা", "এসি পরিবহন", "মক্কা ও মদিনায় জিয়ারাহ", "গ্রুপ গাইড"],
    },
    exclusions: {
      en: ["Lunch & dinner", "Personal expenses & shopping", "Travel insurance", "Extra / overweight baggage charges"],
      bn: ["দুপুর ও রাতের খাবার", "ব্যক্তিগত খরচ ও কেনাকাটা", "ভ্রমণ বীমা", "অতিরিক্ত / ওজন-বেশি লাগেজ চার্জ"],
    },
  },
  {
    title: "Premium Umrah Package 10 Days",
    price: 265000, durationDays: 10, cover: img("1627728734379-a5f8c099763e"),
    hotelMakkah: { en: "5-star, within 300 m of Haram", bn: "৫-তারকা, হারাম থেকে ৩০০ মি-র মধ্যে" },
    hotelMadinah: { en: "5-star, beside Masjid an-Nabawi", bn: "৫-তারকা, মসজিদে নববীর পাশে" },
    inclusions: {
      en: ["Return air ticket", "Umrah visa", "5-star hotel (double room)", "Full-board meals", "Private AC transport", "Full Ziyarah in Makkah & Madinah", "Dedicated guide"],
      bn: ["রিটার্ন বিমান টিকিট", "উমরাহ ভিসা", "৫-তারকা হোটেল (ডাবল রুম)", "ফুল-বোর্ড খাবার", "প্রাইভেট এসি পরিবহন", "মক্কা ও মদিনায় সম্পূর্ণ জিয়ারাহ", "ডেডিকেটেড গাইড"],
    },
    exclusions: {
      en: ["Personal shopping & laundry", "Travel insurance (optional)", "Extra / overweight baggage charges", "Anything not mentioned above"],
      bn: ["ব্যক্তিগত কেনাকাটা ও লন্ড্রি", "ভ্রমণ বীমা (ঐচ্ছিক)", "অতিরিক্ত / ওজন-বেশি লাগেজ চার্জ", "উপরে উল্লেখ নেই এমন কিছু"],
    },
  },
];

(async () => {
  await connectDB();
  const db = getDB();
  let modified = 0;
  for (const p of PACKAGES) {
    const { title, price, ...rest } = p;
    const res = await db.collection("hajj").updateOne(
      { "title.en": title },
      { $set: { ...rest, price: { amount: price, currency: "BDT", unit: "per person" }, updatedAt: new Date() } }
    );
    console.log(`${title} → matched ${res.matchedCount}, modified ${res.modifiedCount}`);
    modified += res.modifiedCount;
  }
  console.log(`Done. Updated ${modified} Hajj/Umrah package(s).`);
  process.exit(0);
})().catch((e) => {
  console.error("fix-hajj-data failed:", e.message);
  process.exit(1);
});

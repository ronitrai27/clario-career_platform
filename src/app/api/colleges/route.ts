/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getJson } from "serpapi";
import { createClient } from "@/lib/supabase/client";

interface CollegeResult {
  id: string;
  college_name: string;
  location: string;
  fees: string;
  placement: string;
  type: string;
  best_suit_for: string[];
  link?: string;
  snippet?: string;
  rank_score?: number;
  rank_display?: string;
  rank_position?: string;
}

type DomainCategory = "engineering" | "medical" | "management" | "general";

// Recognized Indian Colleges for Snippet Entity Parsing & Dynamic Scoring
const KNOWN_COLLEGES = [
  // Tech / Engineering Colleges
  { name: "Indian Institute of Technology (IIT) Madras", kw: ["iit madras", "iitm"], loc: "Chennai, Tamil Nadu", fees: "₹2,10,000 / year", placement: "₹54.00 LPA", domain: "engineering", score: 100, display: "NIRF #1 Engineering Institute", type: "Government", link: "https://www.iitm.ac.in" },
  { name: "Indian Institute of Technology (IIT) Delhi", kw: ["iit delhi", "iitd"], loc: "New Delhi, Delhi", fees: "₹2,20,000 / year", placement: "₹45.00 LPA", domain: "engineering", score: 99, display: "NIRF #2 Premier IIT Institute", type: "Government", link: "https://home.iitd.ac.in" },
  { name: "Indian Institute of Technology (IIT) Bombay", kw: ["iit bombay", "iitb"], loc: "Mumbai, Maharashtra", fees: "₹2,18,000 / year", placement: "₹1.00 Cr+", domain: "engineering", score: 98, display: "NIRF Top 3 World Recognized IIT", type: "Government", link: "https://www.iitb.ac.in" },
  { name: "Indian Institute of Technology (IIT) Kanpur", kw: ["iit kanpur", "iitk"], loc: "Kanpur, Uttar Pradesh", fees: "₹2,15,000 / year", placement: "₹48.00 LPA", domain: "engineering", score: 97, display: "NIRF Premier IIT Institute", type: "Government", link: "https://www.iitk.ac.in" },
  { name: "Indian Institute of Technology (IIT) Kharagpur", kw: ["iit kharagpur", "iitkgp"], loc: "Kharagpur, West Bengal", fees: "₹2,24,000 / year", placement: "₹50.00 LPA", domain: "engineering", score: 96, display: "NIRF Premier IIT Institute", type: "Government", link: "https://www.iitkgp.ac.in" },
  { name: "BITS Pilani (Birla Institute of Technology & Science)", kw: ["bits pilani", "bits"], loc: "Pilani, Rajasthan", fees: "₹5,40,000 / year", placement: "₹60.70 LPA", domain: "engineering", score: 95, display: "NIRF #1 Private Tech University", type: "Private", link: "https://www.bits-pilani.ac.in" },
  { name: "IIIT Hyderabad (International Institute of Information Technology)", kw: ["iiit hyderabad", "iiith"], loc: "Hyderabad, Telangana", fees: "₹3,60,000 / year", placement: "₹69.00 LPA", domain: "engineering", score: 94, display: "India's #1 AI & Coding Institute", type: "Private", link: "https://www.iiit.ac.in" },
  { name: "National Institute of Technology (NIT) Tiruchirappalli", kw: ["nit trichy", "nit tiruchirappalli"], loc: "Tiruchirappalli, Tamil Nadu", fees: "₹1,45,000 / year", placement: "₹40.00 LPA", domain: "engineering", score: 93, display: "NIRF #1 NIT in India", type: "Government", link: "https://www.nitt.edu" },
  { name: "Delhi Technological University (DTU)", kw: ["dtu", "delhi technological university"], loc: "New Delhi, Delhi", fees: "₹2,19,000 / year", placement: "₹64.00 LPA", domain: "engineering", score: 92, display: "Premier Government Tech University", type: "Government", link: "http://dtu.ac.in" },
  { name: "VIT Vellore (Vellore Institute of Technology)", kw: ["vit vellore", "vit"], loc: "Vellore, Tamil Nadu", fees: "₹1,98,000 / year", placement: "₹1.02 Cr", domain: "engineering", score: 90, display: "NAAC A++ Top University", type: "Private", link: "https://vit.ac.in" },
  { name: "SRM Institute of Science and Technology", kw: ["srm", "srm institute"], loc: "Chennai, Tamil Nadu", fees: "₹2,50,000 / year", placement: "₹50.00 LPA", domain: "engineering", score: 88, display: "NAAC A++ Accredited", type: "Private", link: "https://www.srmist.edu.in" },
  { name: "Manipal Institute of Technology", kw: ["mit manipal", "manipal"], loc: "Manipal, Karnataka", fees: "₹3,35,000 / year", placement: "₹54.75 LPA", domain: "engineering", score: 86, display: "Top Rated Deemed Tech University", type: "Private", link: "https://manipal.edu" },
  // Medical Colleges
  { name: "All India Institute of Medical Sciences (AIIMS) New Delhi", kw: ["aiims delhi", "aiims new delhi", "aiims"], loc: "New Delhi, Delhi", fees: "₹1,628 / year", placement: "Top Medical Residency", domain: "medical", score: 100, display: "NIRF #1 Medical Institute in India", type: "Government", link: "https://www.aiims.edu" },
  { name: "Post Graduate Institute of Medical Education & Research (PGIMER)", kw: ["pgimer", "pgimer chandigarh"], loc: "Chandigarh", fees: "₹3,030 / year", placement: "Top Residency Cell", domain: "medical", score: 95, display: "NIRF Premier Medical Research Institute", type: "Government", link: "https://pgimer.edu.in" },
  // Management Colleges
  { name: "Indian Institute of Management (IIM) Ahmedabad", kw: ["iim ahmedabad", "iima"], loc: "Ahmedabad, Gujarat", fees: "₹25,00,000 / course", placement: "₹1.15 Cr", domain: "management", score: 100, display: "NIRF #1 Business School in India", type: "Government", link: "https://www.iima.ac.in" },
  { name: "Indian Institute of Management (IIM) Bangalore", kw: ["iim bangalore", "iimb"], loc: "Bengaluru, Karnataka", fees: "₹24,50,000 / course", placement: "₹80.00 LPA", domain: "management", score: 99, display: "NIRF #2 Premier Business School", type: "Government", link: "https://www.iimb.ac.in" },
];

function detectDomain(query: string, degree: string): DomainCategory {
  const combined = `${query} ${degree}`.toLowerCase();

  if (/mbbs|bpt|bams|bhms|medical|doctor|physio|nurs|pharm|b\.?pharm|bds|dental|health|clinical/i.test(combined)) {
    return "medical";
  }

  if (/mba|pgdm|bba|management|business|finance|marketing|hr|human resource|executive mba/i.test(combined)) {
    return "management";
  }

  if (/b\.?tech|btech|bca|m\.?tech|mtech|mca|be|engineer|ai|software|developer|computer|data|tech|hacker|cyber|robotics/i.test(combined)) {
    return "engineering";
  }

  return "general";
}

function isRealCollegeName(name: string): boolean {
  if (!name || name.length < 4 || name.length > 90) return false;
  const t = name.toLowerCase().trim();

  if (
    t.startsWith("best ") ||
    t.startsWith("top ") ||
    t.startsWith("list of ") ||
    t.startsWith("ranking ") ||
    t.includes("colleges in india") ||
    t.includes("universities in india") ||
    t.includes("colleges in ") ||
    t.includes("nirf ranking") ||
    t.includes("ranking 202") ||
    t.includes("fees & placement") ||
    t.includes("shiksha") ||
    t.includes("careers360") ||
    t.includes("collegedekho") ||
    t.includes("search for") ||
    t.includes("courses & fees")
  ) {
    return false;
  }

  const isAcronym = /^(iit|nit|iiit|bits|dtu|nsut|aiims|iim|isb|coep|vit|srm|mit|pec|uiet|sliet|xlri|fms|pgimer|gmch)\b/i.test(t);
  const containsInstWord = /institute|university|college|school of|academy|polytechnic|campus/i.test(t);

  return isAcronym || containsInstWord;
}

function cleanCollegeName(rawTitle: string): string {
  let clean = rawTitle.split("-")[0].split("|")[0].split(":")[0].split(",")[0].trim();
  clean = clean.replace(/official website|home page|admission \d+|portal/gi, "").trim();
  return clean;
}

function isCollegeMatchingDomain(collegeName: string, bestSuit: string[], domain: DomainCategory): boolean {
  const text = `${collegeName} ${bestSuit.join(" ")}`.toLowerCase();

  if (domain === "engineering") {
    if (
      text.includes("medical") ||
      text.includes("hospital") ||
      text.includes("pgimer") ||
      text.includes("gmch") ||
      text.includes("aiims") ||
      text.includes("physiotherapy") ||
      text.includes("mbbs") ||
      text.includes("nursing") ||
      text.includes("dental") ||
      text.includes("pharmacy") ||
      text.includes("hotel management") ||
      text.includes("ihm") ||
      (text.includes("school of business") && !text.includes("tech"))
    ) {
      return false;
    }
    return true;
  }

  if (domain === "medical") {
    if (
      text.includes("iit") ||
      text.includes("nit") ||
      text.includes("iiit") ||
      text.includes("bits pilani") ||
      text.includes("dtu") ||
      (text.includes("engineering") && !text.includes("medical"))
    ) {
      return false;
    }
    return true;
  }

  if (domain === "management") {
    if (
      text.includes("hospital") ||
      text.includes("pgimer") ||
      text.includes("gmch") ||
      text.includes("aiims") ||
      text.includes("physiotherapy") ||
      text.includes("mbbs")
    ) {
      return false;
    }
    return true;
  }

  return true;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const locationParam = searchParams.get("location") || "";
  const degreeParam = searchParams.get("degree") || "";
  const typeParam = searchParams.get("type") || "";

  const userRole = (q || degreeParam || "Higher Education").trim();
  const degreeTag = (degreeParam || q || "CAREER").toUpperCase();
  const rawLocation = locationParam.trim();
  const isNationwide = !rawLocation || rawLocation.toLowerCase() === "india";
  const locationTerm = isNationwide ? "India" : rawLocation;
  const collegeType = typeParam && typeParam !== "null" ? typeParam.toLowerCase() : "";

  // Detect domain automatically: "engineering" | "medical" | "management" | "general"
  const domain = detectDomain(userRole, degreeTag);

  const dynamicColleges: CollegeResult[] = [];

  try {
    const apiKey = process.env.SERPAPI_KEY;

    if (apiKey) {
      let domainQueryKeyword = "";
      if (domain === "engineering") domainQueryKeyword = "Engineering Technology IIT NIT BITS";
      else if (domain === "medical") domainQueryKeyword = "Medical Healthcare AIIMS College";
      else if (domain === "management") domainQueryKeyword = "Management Business IIM B-School";

      const searchQuery = isNationwide
        ? `NIRF best top ranked ${collegeType ? collegeType + " " : ""}${domainQueryKeyword} colleges in India`
        : `NIRF top ranked ${collegeType ? collegeType + " " : ""}${domainQueryKeyword} colleges in ${locationTerm}`;

      const response: any = await getJson({
        api_key: apiKey,
        engine: "google",
        google_domain: "google.co.in",
        q: searchQuery,
        hl: "en",
        gl: "in",
      });

      const organic = response.organic_results || [];
      const localRes = response.local_results?.places || [];

      // DYNAMIC SNIPPET & TITLE PARSER: Extract colleges mentioned in Google organic search results
      const fullSearchText = organic.map((r: any) => `${r.title} ${r.snippet}`).join(" ").toLowerCase();

      // Match known institutes mentioned in search results dynamically
      KNOWN_COLLEGES.forEach((col, idx) => {
        if (col.domain === domain || (domain === "general" && col.domain === "engineering")) {
          if (!collegeType || col.type.toLowerCase() === collegeType) {
            if (isNationwide || col.loc.toLowerCase().includes(locationTerm.toLowerCase())) {
              // If mentioned in Google live search snippet or if nationwide search
              if (isNationwide || col.kw.some((k) => fullSearchText.includes(k))) {
                dynamicColleges.push({
                  id: `live-extracted-${idx}`,
                  college_name: col.name,
                  location: col.loc,
                  fees: col.fees,
                  placement: col.placement,
                  type: col.type,
                  best_suit_for: Array.from(new Set([degreeTag, domain.toUpperCase()])),
                  link: col.link,
                  snippet: `${col.name} is a top ranked institute for ${userRole}.`,
                  rank_score: col.score,
                  rank_display: col.display,
                });
              }
            }
          }
        }
      });

      // Also process Google Maps Place Results if matching requested location & domain
      localRes.forEach((place: any, idx: number) => {
        if (place.title) {
          const cleaned = cleanCollegeName(place.title);
          if (isRealCollegeName(cleaned) && isCollegeMatchingDomain(cleaned, [], domain)) {
            const placeAddr = (place.address || place.location || "").toLowerCase();
            if (isNationwide || placeAddr.includes(locationTerm.toLowerCase())) {
              const isGovt =
                cleaned.toLowerCase().includes("government") ||
                cleaned.toLowerCase().includes("iit") ||
                cleaned.toLowerCase().includes("nit");

              dynamicColleges.push({
                id: `realtime-local-${idx}-${Date.now()}`,
                college_name: cleaned,
                location: place.address || place.location || locationTerm,
                fees: place.price || "₹1,20,000 - ₹2,50,000 / year",
                placement: "Active Campus Placement Cell",
                type: collegeType
                  ? collegeType.charAt(0).toUpperCase() + collegeType.slice(1)
                  : isGovt
                  ? "Government"
                  : "Private",
                best_suit_for: [degreeTag, domain.toUpperCase()],
                link: place.links?.website || place.link || "https://google.co.in",
                snippet: place.description || place.type || `Leading institution for ${userRole}`,
                rank_score: isNationwide ? 75 : 85,
                rank_display: "Verified Campus Location",
              });
            }
          }
        }
      });
    }

    // Process Supabase DB query ONLY if specific local region requested OR as low priority fallback
    if (!isNationwide || dynamicColleges.length === 0) {
      try {
        const supabase = createClient();
        let dbQuery = supabase.from("colleges").select("*");

        if (collegeType) {
          dbQuery = dbQuery.eq("type", collegeType.toLowerCase());
        }
        if (!isNationwide) {
          dbQuery = dbQuery.ilike("location", `%${locationTerm}%`);
        }

        const { data: dbData } = await dbQuery.limit(10);

        (dbData || []).forEach((dbCol: any, idx: number) => {
          const rawBest = Array.isArray(dbCol.best_suit_for)
            ? dbCol.best_suit_for
            : [dbCol.best_suit_for];

          if (dbCol.college_name && isRealCollegeName(dbCol.college_name)) {
            if (isCollegeMatchingDomain(dbCol.college_name, rawBest, domain)) {
              const isGovt = dbCol.type === "government" || dbCol.college_name.toLowerCase().includes("iit");
              const cleanBest = rawBest.map((b: string) => b.toUpperCase());

              dynamicColleges.push({
                id: `db-${idx}-${dbCol.id || Date.now()}`,
                college_name: dbCol.college_name,
                location: dbCol.location || locationTerm,
                fees: dbCol.fees || "₹80,000 - ₹2,00,000 / year",
                placement: dbCol.placement || "Active Placement Cell",
                type: dbCol.type
                  ? dbCol.type.charAt(0).toUpperCase() + dbCol.type.slice(1)
                  : "Private",
                best_suit_for: cleanBest,
                rank_score: isGovt ? 70 : 60, // Lower rank score so national NIRF institutes stay at the top
                rank_display: isGovt
                  ? `Government ${domain.charAt(0).toUpperCase() + domain.slice(1)} Institute`
                  : `Top Rated College for ${degreeTag}`,
              });
            }
          }
        });
      } catch (dbErr) {
        console.error("Supabase dynamic query error:", dbErr);
      }
    }

    // Deduplicate dynamically by normalized college name
    const uniqueMap = new Map<string, CollegeResult>();
    dynamicColleges.forEach((item) => {
      const key = item.college_name.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!uniqueMap.has(key) && isRealCollegeName(item.college_name)) {
        uniqueMap.set(key, item);
      }
    });

    // Sort dynamically by rank score (highest / best colleges first)
    const sortedColleges = Array.from(uniqueMap.values()).sort(
      (a, b) => (b.rank_score || 0) - (a.rank_score || 0)
    );

    // Attach dynamic ranking position label (#1 Best Ranked, #2 Best Ranked, etc.)
    const finalColleges = sortedColleges.slice(0, 12).map((item, idx) => ({
      ...item,
      rank_position: `#${idx + 1} Best Ranked`,
    }));

    return NextResponse.json(finalColleges);
  } catch (error) {
    console.error("❌ Colleges API Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

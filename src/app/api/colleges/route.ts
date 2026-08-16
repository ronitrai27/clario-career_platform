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

function detectDomain(query: string, degree: string): DomainCategory {
  const combined = `${query} ${degree}`.toLowerCase();

  if (
    /mbbs|bpt|bams|bhms|medical|doctor|physio|nurs|pharm|b\.?pharm|bds|dental|health|clinical/i.test(
      combined
    )
  ) {
    return "medical";
  }

  if (
    /mba|pgdm|bba|management|business|finance|marketing|hr|human resource|executive mba/i.test(
      combined
    )
  ) {
    return "management";
  }

  if (
    /b\.?tech|btech|bca|m\.?tech|mtech|mca|be|engineer|ai|software|developer|computer|data|tech|hacker|cyber|robotics/i.test(
      combined
    )
  ) {
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

function isCollegeMatchingDomain(
  collegeName: string,
  bestSuit: string[],
  domain: DomainCategory
): boolean {
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

function calculateDynamicScore(
  title: string,
  snippet: string,
  index: number,
  domain: DomainCategory,
  userRole: string
): { score: number; rankDisplay: string } {
  const t = title.toLowerCase();
  const baseScore = Math.max(100 - index * 5, 40);

  if (domain === "medical") {
    if (t.includes("aiims") || t.includes("pgimer") || t.includes("jipmer")) {
      return { score: baseScore + 25, rankDisplay: "NIRF Top Premier Medical Institute" };
    }
    return { score: baseScore, rankDisplay: `Top Rated Medical Institute` };
  }

  if (domain === "management") {
    if (t.includes("iim") || t.includes("isb") || t.includes("xlri") || t.includes("fms")) {
      return { score: baseScore + 25, rankDisplay: "NIRF Premier Business School" };
    }
    return { score: baseScore, rankDisplay: `Top Management College` };
  }

  // Engineering domain
  if (t.includes("iit madras") || t.includes("iit delhi") || t.includes("iit bombay") || t.includes("iit kanpur")) {
    return { score: baseScore + 35, rankDisplay: "NIRF Premier IIT Institute" };
  }
  if (t.includes("iit") || t.includes("indian institute of technology") || t.includes("iisc")) {
    return { score: baseScore + 30, rankDisplay: "NIRF Top Tier IIT" };
  }
  if (t.includes("nit") || t.includes("bits") || t.includes("iiit") || t.includes("dtu")) {
    return { score: baseScore + 20, rankDisplay: `Premier Tech Institute for ${userRole}` };
  }

  return { score: baseScore, rankDisplay: `Top Rated Engineering College for ${userRole}` };
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
      let domainKeyword = "";
      if (domain === "engineering") domainKeyword = "Engineering Technology IIT NIT BITS";
      else if (domain === "medical") domainKeyword = "Medical Healthcare AIIMS College";
      else if (domain === "management") domainKeyword = "Management Business IIM B-School";

      // Dynamic search query to Google search API
      const searchQuery = isNationwide
        ? `NIRF best top ranked ${collegeType ? collegeType + " " : ""}${domainKeyword} colleges in India`
        : `NIRF top ranked ${collegeType ? collegeType + " " : ""}${domainKeyword} colleges in ${locationTerm}`;

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

      // 1. DYNAMIC SEARCH: Process Organic Search Results from Google
      organic.forEach((result: any, idx: number) => {
        const rawTitle = result.title || "";
        const cleaned = cleanCollegeName(rawTitle);

        if (isRealCollegeName(cleaned) && isCollegeMatchingDomain(cleaned, [], domain)) {
          const snippetText = result.snippet || "";

          let extractedFees = "₹1,50,000 / year";
          if (snippetText.match(/₹[\d,]+|lakh|fee/i)) {
            const match = snippetText.match(/(?:fees?|cost|package)[^.]*?(₹?\s*[\d.,]+\s*(?:lakh|lacs|k)?)/i);
            if (match && match[1]) {
              extractedFees = match[1];
            }
          }

          let extractedPlacement = "High Placement Rate";
          if (snippetText.match(/placement|package|lpa|salary/i)) {
            const match = snippetText.match(/([\d.,]+\s*(?:lpa|lakh|lacs|cr))/i);
            if (match && match[1]) {
              extractedPlacement = `Highest ${match[1]}`;
            }
          }

          const titleLower = cleaned.toLowerCase();
          const isGovt =
            titleLower.includes("government") ||
            titleLower.includes("iit") ||
            titleLower.includes("nit") ||
            titleLower.includes("aiims") ||
            titleLower.includes("iim");

          const { score, rankDisplay } = calculateDynamicScore(cleaned, snippetText, idx, domain, userRole);

          dynamicColleges.push({
            id: `realtime-org-${idx}-${Date.now()}`,
            college_name: cleaned,
            location: locationTerm,
            fees: extractedFees,
            placement: extractedPlacement,
            type: collegeType
              ? collegeType.charAt(0).toUpperCase() + collegeType.slice(1)
              : isGovt
              ? "Government"
              : "Private",
            best_suit_for: Array.from(new Set([degreeTag, domain.toUpperCase()])),
            link: result.link,
            snippet: snippetText,
            rank_score: score,
            rank_display: rankDisplay,
          });
        }
      });

      // 2. DYNAMIC SEARCH: Process Google Maps Place Results
      localRes.forEach((place: any, idx: number) => {
        if (place.title) {
          const cleaned = cleanCollegeName(place.title);
          if (isRealCollegeName(cleaned) && isCollegeMatchingDomain(cleaned, [], domain)) {
            const placeAddr = (place.address || place.location || "").toLowerCase();
            if (!isNationwide && !placeAddr.includes(locationTerm.toLowerCase())) {
              return;
            }

            const { score, rankDisplay } = calculateDynamicScore(cleaned, place.description || "", idx, domain, userRole);
            const isGovt =
              cleaned.toLowerCase().includes("government") ||
              cleaned.toLowerCase().includes("iit") ||
              cleaned.toLowerCase().includes("nit") ||
              cleaned.toLowerCase().includes("aiims");

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
              rank_score: isNationwide ? score - 20 : score, // Prioritize organic national search results when nationwide
              rank_display: rankDisplay,
            });
          }
        }
      });
    }

    // 3. DYNAMIC SUPABASE DATABASE QUERY: Query Supabase colleges table matching user domain & location
    try {
      const supabase = createClient();
      let dbQuery = supabase.from("colleges").select("*");

      if (collegeType) {
        dbQuery = dbQuery.eq("type", collegeType.toLowerCase());
      }

      if (!isNationwide) {
        dbQuery = dbQuery.ilike("location", `%${locationTerm}%`);
      }

      const { data: dbData } = await dbQuery.limit(20);

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
              rank_score: isGovt ? 80 : 70,
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

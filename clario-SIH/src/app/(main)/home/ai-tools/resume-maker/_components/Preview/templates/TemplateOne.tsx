// components/resume/Preview/templates/TemplateOne.tsx

import { Separator } from "@/components/ui/separator";
import { ResumeState } from "@/lib/store/useResumeStore";
import { Linkedin, Phone, Mail, Github, Globe } from "lucide-react";

export default function TemplateOne({ resume }: { resume: ResumeState }) {
  const { bio, sections, themeColor } = resume;

  return (
    <div className="text-[12px] leading-5 font-inter">
      {/* ======== BIO PART ======= */}
      <div className="text-center mb-4">
        <h1
          className="text-3xl font-bold capitalize"
          style={{ color: themeColor }}
        >
          {bio.name || "Your Name"}
        </h1>

        {/* ===== CONTACT INFO WITH ICONS ===== */}
        <div className="flex items-center justify-center gap-3 text-neutral-600 text-sm tracking-tight mt-1 flex-wrap">
          {bio.email && (
            <span className="flex items-center gap-1">
              <Mail size={14} /> {bio.email}
            </span>
          )}

          {bio.phone && (
            <span className="flex items-center gap-1">
              <Phone size={14} /> {bio.phone}
            </span>
          )}

          {bio.linkedin && (
            <span className="flex items-center gap-1">
              <Linkedin size={14} /> {bio.linkedin}
            </span>
          )}

          {bio.github && (
            <span className="flex items-center gap-1">
              <Github size={14} /> {bio.github}
            </span>
          )}

          {bio.website && (
            <span className="flex items-center gap-1">
              <Globe size={14} /> {bio.website}
            </span>
          )}
        </div>
      </div>

      {/* ======ALL THE SECTIONS========= */}
      {sections.map((section) => {
        // ============== SUMMARY========================
        if (section.id === "summary" && section.data) {
          return (
            <section key={section.id} className="mb-4">
              <h2
                className="font-semibold text-base border-b pb-1"
                style={{ borderColor: themeColor, color: themeColor }}
              >
                {section.title}
              </h2>
              <p className="whitespace-pre-line mt-1">{section.data}</p>
            </section>
          );
        }

        // ===================SKILLS===============================
        if (section.id === "skills" && section.data.length > 0) {
          return (
            <section key={section.id} className="mb-4">
              <h2
                className="font-semibold text-base border-b pb-1"
                style={{ borderColor: themeColor, color: themeColor }}
              >
                {section.title}
              </h2>

              <p className="mt-1 text-[12px] leading-relaxed capitalize">
                {section.data.join(" • ")}
              </p>
            </section>
          );
        }

        return null;
      })}
    </div>
  );
}

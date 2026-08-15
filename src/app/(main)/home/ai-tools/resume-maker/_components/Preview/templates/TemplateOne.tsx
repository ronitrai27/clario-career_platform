// components/resume/Preview/templates/TemplateOne.tsx

import { Separator } from "@/components/ui/separator";
import {
  CustomItem,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  ResumeState,
} from "@/lib/store/useResumeStore";
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

        // =============== EDUCATION ==================
        if (
          section.id === "education" &&
          Array.isArray(section.data) &&
          section.data.some(
            (edu: EducationItem) =>
              edu.institution.trim() ||
              edu.description.trim() ||
              edu.startDate.trim() ||
              edu.endDate.trim() ||
              edu.location.trim()
          )
        ) {
          return (
            <section key={section.id} className="mb-4 font-inter">
              <h2
                className="font-semibold text-base border-b pb-1"
                style={{ borderColor: themeColor, color: themeColor }}
              >
                {section.title}
              </h2>

              {section.data.map((edu, idx) => (
                <div key={idx} className="mt-2">
                  <div className="flex justify-between">
                    <div className="font-semibold capitalize text-[12px]">
                      {edu.institution}
                      {edu.description && (
                        <p className="  text-[12px] text-neutral-700">
                          {edu.description}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-neutral-500 text-right">
                      {edu.location && <div>{edu.location}</div>}
                      {edu.startDate && edu.endDate && (
                        <div>
                          {edu.startDate} - {edu.endDate}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </section>
          );
        }

        // =============== EXPERIENCE ==================
        if (
          section.id === "experience" &&
          Array.isArray(section.data) &&
          section.data.some(
            (exp: ExperienceItem) =>
              exp.role.trim() ||
              exp.company.trim() ||
              exp.description.trim() ||
              exp.startDate.trim() ||
              exp.endDate.trim() ||
              exp.location.trim()
          )
        ) {
          return (
            <section key={section.id} className="mb-4">
              <h2
                className="font-semibold text-base border-b pb-1"
                style={{ borderColor: themeColor, color: themeColor }}
              >
                {section.title}
              </h2>

              {section.data.map((exp, idx) => (
                <div key={idx} className="mt-2">
                  <div className="flex justify-between">
                    <div className="font-semibold capitalize">
                      {exp.role}
                      {exp.company && ` — ${exp.company}`}

                      {exp.description && (
                        <p className="mt-1 text-[11px] text-neutral-700 whitespace-pre-line">
                          {exp.description}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-neutral-500 text-right">
                      {exp.location && <div>{exp.location}</div>}
                      {exp.startDate && exp.endDate && (
                        <div>
                          {exp.startDate} - {exp.endDate}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </section>
          );
        }

        // ========================PROJECTS==================
        if (
          section.id === "projects" &&
          Array.isArray(section.data) &&
          section.data.some(
            (proj: ProjectItem) =>
              proj.title.trim() || proj.description.trim() || proj.date.trim()
          )
        ) {
          return (
            <section key={section.id} className="mb-4 font-inter">
              <h2
                className="font-semibold text-base border-b pb-1"
                style={{ borderColor: themeColor, color: themeColor }}
              >
                {section.title}
              </h2>

              {section.data.map((proj: ProjectItem, idx: number) => {
                const hasData =
                  proj.title.trim() ||
                  proj.description.trim() ||
                  proj.date.trim();
                if (!hasData) return null;

                return (
                  <div key={idx} className="mt-2">
                    <div className="flex justify-between">
                      <div className="font-semibold capitalize">
                        {proj.title}
                      </div>
                      <div className="text-xs text-neutral-500 text-right">
                        {proj.date}
                      </div>
                    </div>

                    {proj.description && (
                      <p className="mt-1 text-[11px] text-neutral-700 whitespace-pre-line">
                        {proj.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </section>
          );
        }

        // =============== CUSTOM SECTION (DYNAMIC) ==================
        if (
          section.id === "custom" &&
          Array.isArray(section.data) &&
          section.data.some(
            (item: CustomItem) =>
              (item.title && item.title.trim()) ||
              (item.description && item.description.trim()) ||
              (item.date && item.date.trim())
          )
        ) {
          return (
            <section key={section.id} className="mb-4 font-inter">
              <h2
                className="font-semibold text-base border-b pb-1"
                style={{ borderColor: themeColor, color: themeColor }}
              >
                {section.title}
              </h2>

              {section.data.map((item: CustomItem, idx: number) => {
                const hasData =
                  (item.title && item.title.trim()) ||
                  (item.description && item.description.trim()) ||
                  (item.date && item.date.trim());
                if (!hasData) return null;

                return (
                  <div key={idx} className="mt-2">
                    <div className="flex justify-between items-start">
                      <div className="font-semibold capitalize text-[12px]">
                        {item.title}
                      </div>
                      <div className="text-xs text-neutral-500 text-right">
                        {item.date}
                      </div>
                    </div>
                    {item.description && (
                      <p className="mt-1 text-[11px] text-neutral-700 whitespace-pre-line">
                        {item.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </section>
          );
        }

        return null;
      })}
    </div>
  );
}

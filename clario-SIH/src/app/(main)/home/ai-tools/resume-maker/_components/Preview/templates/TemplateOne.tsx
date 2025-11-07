// components/resume/Preview/templates/TemplateOne.tsx
// ================ RESUME TEMPLATE ONE =================
import { ResumeState } from "@/lib/store/useResumeStore";

export default function TemplateOne({ resume }: { resume: ResumeState }) {
  const { bio, sections } = resume;

  return (
    <div className="text-[12px] leading-5">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold">{bio.name || "Your Name"}</h1>
        <p className="text-sm text-neutral-600">
          {bio.email} • {bio.phone} • {bio.linkedin}
          {bio.github ? ` • ${bio.github}` : ""}{bio.website ? ` • ${bio.website}` : ""}
        </p>
      </div>

      {sections.map((section) => {
        if (section.id === "summary" && section.type === "summary" && section.data) {
          return (
            <section key={section.id} className="mb-4">
              <h2 className="font-semibold text-base border-b pb-1">Summary</h2>
              <p className="whitespace-pre-line mt-1">{section.data}</p>
            </section>
          );
        }
        return null;
      })}
    </div>
  );
}

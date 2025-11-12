import { create } from "zustand";

export type Bio = {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github?: string;
  website?: string;
};

export type SummarySection = {
  id: "summary";
  type: "summary";
  title: string;
  data: string;
};

export type SkillsSection = {
  id: "skills";
  type: "skills";
  title: string;
  data: string[];
};

export type EducationItem = {
  institution: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
};

export type ExperienceItem = {
  role: string;
  company: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
};

export type ProjectItem = {
  title: string;
  description: string;
  date: string;
};

export type CustomItem = {
  title: string;
  description: string;
};

export type Section =
  | SummarySection
  | SkillsSection
  | {
      id: "education";
      type: "education";
      title: string;
      data: EducationItem[];
    }
  | {
      id: "experience";
      type: "experience";
      title: string;
      data: ExperienceItem[];
    }
  | {
      id: "projects";
      type: "projects";
      title: string;
      data: ProjectItem[];
    }
  // achievements/certifications OR patents/publications OR hobbies OR languages
  | {
      id: "custom";
      type: "custom";
      title: string;
      data: CustomItem[];
    };

export interface ResumeState {
  title: string;
  bio: Bio;
  sections: Section[];
  themeColor: any;
}

interface ResumeStore {
  resume: ResumeState;
  setBio: (bio: Partial<ResumeState["bio"]>) => void;
  setTitle: (title: string) => void;
  updateSection: (id: string, data: Partial<Section>) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  setThemeColor: (color: any) => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
  resume: {
    title: "",
    bio: {
      name: "",
      email: "",
      phone: "",
      linkedin: "",
      github: undefined,
      website: undefined,
    },
    sections: [
      {
        id: "summary",
        type: "summary",
        title: "Summary",
        data: "",
      },
      {
        id: "skills",
        type: "skills",
        title: "Skills",
        data: [],
      },
      {
        id: "education",
        type: "education",
        title: "Education",
        data: [
          {
            institution: "",
            description: "",
            startDate: "",
            endDate: "",
            location: "",
          },
        ],
      },
      {
        id: "experience",
        type: "experience",
        title: "Experience",
        data: [
          {
            role: "",
            company: "",
            description: "",
            startDate: "",
            endDate: "",
            location: "",
          },
        ],
      },
      {
        id: "projects",
        type: "projects",
        title: "Projects",
        data: [
          {
            title: "",
            description: "",
            date: "",
          },
        ],
      },
      {
        id: "custom",
        type: "custom",
        title: "Others",
        data: [
          {
            title: "",
            description: "",
          },
        ],
      },
    ],
    themeColor: "#000",
  },

  // =============================
  //  Update only changed fields in BIO
  setBio: (bio) =>
    set((state) => ({
      resume: {
        ...state.resume,
        bio: { ...state.resume.bio, ...bio },
      },
    })),

  // =============================
  // Update title
  setTitle: (title) =>
    set((state) => ({
      resume: { ...state.resume, title },
    })),

  // ==========================
  // theme color
  setThemeColor: (color: any) =>
    set((state) => ({
      resume: {
        ...state.resume,
        themeColor: color,
      },
    })),

  // ===============================
  //  Update a section (type-safe)
  updateSection: (id, updatedSection) =>
    set((state) => {
      const updatedSections = state.resume.sections.map((section) =>
        section.id === id
          ? ({ ...section, ...updatedSection } as Section)
          : section
      );

      return {
        resume: {
          ...state.resume,
          sections: updatedSections,
        },
      };
    }),

  // ==========================================
  // Reorder sections (drag & drop using indexes)
  reorderSections: (fromIndex, toIndex) =>
    set((state) => {
      const updated = [...state.resume.sections];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);

      return { resume: { ...state.resume, sections: updated } };
    }),
}));

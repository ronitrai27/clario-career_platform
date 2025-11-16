// components/resume/EditorSidebar/BioForm.tsx
// ==============BIO FORM BINDING TO ZUSTAND================
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResumeStore } from "@/lib/store/useResumeStore";

export default function BioForm() {
  const bio = useResumeStore(s => s.resume.bio);
  const setBio = useResumeStore(s => s.setBio);

  return (
    <div className="space-y-4 font-inter text-sm">
      <div>
        <Label>Name</Label>
        <Input value={bio.name} onChange={(e) => setBio({ name: e.target.value })} />
      </div>
      <div>
        <Label>Email</Label>
        <Input type="email" value={bio.email} onChange={(e) => setBio({ email: e.target.value })} />
      </div>
      <div>
        <Label>Phone</Label>
        <Input value={bio.phone} onChange={(e) => setBio({ phone: e.target.value })} />
      </div>
      <div>
        <Label>LinkedIn</Label>
        <Input value={bio.linkedin} onChange={(e) => setBio({ linkedin: e.target.value })} />
      </div>
      <div>
        <Label>GitHub (optional)</Label>
        <Input value={bio.github ?? ""} onChange={(e) => setBio({ github: e.target.value || undefined })} />
      </div>
      <div>
        <Label>Website (optional)</Label>
        <Input value={bio.website ?? ""} onChange={(e) => setBio({ website: e.target.value || undefined })} />
      </div>
    </div>
  );
}

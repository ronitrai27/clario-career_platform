/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandInput,
  CommandEmpty,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { LuActivity, LuChevronRight } from "react-icons/lu";
import { createClient } from "@/lib/supabase/client";
import { useUserData } from "@/context/UserDataProvider";
import { useRouter } from "next/navigation";
import { LucideLoader2 } from "lucide-react";

type MentorOnboardingData = {
  fullName: string;
  phone: string;
  linkedAccount?: string;
  bio: string;
  occupation: string;
  expertise: string[];
};

const OCCUPATIONS = [
  "Teacher",
  "College Professor",
  "Tutor",
  "Academic Researcher",
  "Software Engineer",
  "Business Analyst",
  "AI Engineer",
  "Product Manager",
  "Marketing Specialist",
  "HR Professional",
  "Finance / Accountant",
  "Startup Founder",
  "JEE / NEET Mentor",
  "UPSC / Govt Exam Mentor",
  "Competitive Exam Coach",
  "Entrepreneur",
  "Career Coach",
  "DevOps Engineer",
  "Cybersecurity Specialist",
  "Tech Consultant",
  "MBBS Doctor",
  "Nursing Professional",
  "Pharma Expert",
] as const;

const EXPERTISE_OPTIONS = [
  "Career/ Path guidance",
  "Skill building",
  "Crack competitive exams",
  "Choose career paths",
  "Counseling & guidance",
  "Job placement",
  "Job/Internship opportunities",
  "Higher studies",
  "Research opportunities",
] as const;

const MIN_EXPERTISE = 1;
const MAX_EXPERTISE = 3;

export function MentorOnboarding({
  className,
  initial,
}: {
  className?: string;
  initial?: Partial<MentorOnboardingData>;
}) {
  const [step, setStep] = React.useState(1);
  const total = 3;
  const supabase = createClient();
  const { mentor } = useUserData();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  const [data, setData] = React.useState<MentorOnboardingData>({
    fullName: initial?.fullName ?? "",
    phone: initial?.phone ?? "",
    linkedAccount: initial?.linkedAccount ?? "",
    bio: initial?.bio ?? "",
    occupation: initial?.occupation ?? "",
    expertise: initial?.expertise ?? [],
  });

  const [expertiseOpen, setExpertiseOpen] = React.useState(false);

  const update = <K extends keyof MentorOnboardingData>(
    key: K,
    value: MentorOnboardingData[K]
  ) => {
    setData((d) => ({ ...d, [key]: value }));
  };

  const toggleExpertise = (
    value: string,
    checked: boolean | "indeterminate"
  ) => {
    setData((d) => {
      const isChecked = checked === true;
      const alreadySelected = d.expertise.includes(value);
      if (isChecked) {
        if (!alreadySelected && d.expertise.length >= MAX_EXPERTISE) {
          return d; // at max, ignore new additions
        }
        if (!alreadySelected) {
          return { ...d, expertise: [...d.expertise, value] };
        }
        return d;
      } else {
        // removal
        if (alreadySelected) {
          return { ...d, expertise: d.expertise.filter((v) => v !== value) };
        }
        return d;
      }
    });
  };

  const stepValid = React.useMemo(() => {
    if (step === 1) {
      return data.fullName.trim().length >= 2 && data.phone.trim().length >= 7;
    }
    if (step === 2) {
      return data.occupation.trim().length > 0;
    }
    if (step === 3) {
      return (
        data.expertise.length >= MIN_EXPERTISE &&
        data.expertise.length <= MAX_EXPERTISE
      );
    }
    return false;
  }, [step, data]);

  const next = () => {
    if (!stepValid) return;
    setStep((s) => Math.min(total, s + 1));
  };

  const back = () => setStep((s) => Math.max(1, s - 1));

  const handleComplete = React.useCallback(
    async (payload: MentorOnboardingData) => {
      setLoading(true);
      setError(null);

      try {
        console.log("Mentor onboarding submitted:", payload);

        // lowercase transform
        const normalizedData = {
          full_name: payload.fullName,
          phone: payload.phone || null,
          linkedin: payload.linkedAccount || null,
          bio: payload.bio || null,
          current_position: payload.occupation.toLowerCase(),
          expertise: payload.expertise.map((e) => e.toLowerCase()),
          is_verified:true
        };

        // update mentor record
        const { error: updateError } = await supabase
          .from("mentors")
          .update(normalizedData)
          .eq("id", mentor?.id);

        if (updateError) throw updateError;

        localStorage.setItem("isOnboardingDoneMentor", "true");
        router.push("/dashboard");
      } catch (error: any) {
        console.error("Onboarding error:", error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    },
    [mentor?.id, router]
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stepValid) return;
    handleComplete(data);
  };

  const progress = (step / total) * 100;

  return (
    <form
      onSubmit={submit}
      className={cn(
        "w-full max-w-[640px] rounded-lg border bg-background p-6 shadow-sm",
        "flex flex-col gap-6",
        className
      )}
      aria-labelledby="mentor-onboarding-title"
    >
      <header className="flex flex-col gap-2">
        <h1
          id="mentor-onboarding-title"
          className="text-xl font-medium font-inter tracking-tight flex gap-3 mb-5"
        >
          Welcome! Lets get started by completing your profile <LuActivity />
        </h1>
        <div className="flex items-center justify-between text-sm text-muted-foreground font-inter">
          <span>
            Step {step} of {total}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div
          className="h-2 w-full rounded bg-muted"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-2 rounded bg-blue-600 transition-all dark:bg-blue-500"
            style={{ width: `${progress}%` }}
            aria-hidden="true"
          />
        </div>
      </header>

      {step === 1 && (
        <section aria-label="Basic details" className="flex flex-col gap-4 ">
          <div className="flex  gap-4">
            <Label
              htmlFor="fullName"
              className="whitespace-nowrap font-raleway font-semibold"
            >
              Full name
            </Label>
            <Input
              id="fullName"
              placeholder="e.g., Priya Sharma"
              value={data.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              required
            />
          </div>

          <div className="flex gap-10">
            <Label
              htmlFor="phone"
              className="whitespace-nowrap font-raleway font-semibold"
            >
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              placeholder="+91 98765 43210"
              value={data.phone}
              onChange={(e) => update("phone", e.target.value)}
              required
            />
          </div>

          {/* <div className="flex flex-col gap-2 mt-4">
            <Label htmlFor="linked" className="whitespace-nowrap font-raleway font-semibold">Linked account (optional)</Label>
            <Input
              id="linked"
              type="url"
              placeholder="https://www.linkedin.com/in/username"
              value={data.linkedAccount}
              onChange={(e) => update("linkedAccount", e.target.value)}
            />
          </div> */}

          <div className="flex flex-col gap-2 mt-5">
            <Label
              htmlFor="bio"
              className="whitespace-nowrap font-raleway font-semibold"
            >
              Short bio
            </Label>
            <Textarea
              id="bio"
              placeholder="Tell students about your experience and how you can help."
              value={data.bio}
              onChange={(e) => update("bio", e.target.value)}
              rows={4}
              className="font-inter resize-none h-24"
            />
          </div>
        </section>
      )}

      {step === 2 && (
        <section
          aria-label="Current occupation"
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label className="mb-1 font-inter text-base">
              Select your current occupation
            </Label>
            <Select
              value={data.occupation}
              onValueChange={(val) => update("occupation", val)}
            >
              <SelectTrigger aria-label="Occupation" className="w-full">
                <SelectValue placeholder="Select an occupation"  />
              </SelectTrigger>
              <SelectContent position="item-aligned">
                {OCCUPATIONS.map((role) => (
                  <SelectItem key={role} value={role} className="font-inter cursor-pointer">
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground font-raleway mt-3">
              Choose the role that best matches your current position.
            </p>
          </div>
        </section>
      )}

      {step === 3 && (
        <section
          aria-label="Areas of expertise"
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label className="mb-1 text-base font-inter">
              Choose expertise areas where you can help students.
            </Label>

            <Popover open={expertiseOpen} onOpenChange={setExpertiseOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={expertiseOpen}
                  className="w-full justify-between bg-transparent"
                >
                  {data.expertise.length
                    ? `${data.expertise.length} / ${MAX_EXPERTISE} selected`
                    : `Select expertise (up to ${MAX_EXPERTISE})`}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-(--radix-popover-trigger-width) p-0"
                align="start"
              >
                <Command shouldFilter>
                  <CommandList>
                    <CommandInput placeholder="Search expertise..." />
                    <CommandEmpty>No expertise found.</CommandEmpty>
                    <CommandGroup>
                      {EXPERTISE_OPTIONS.map((opt) => {
                        const checked = data.expertise.includes(opt);
                        const maxReached =
                          data.expertise.length >= MAX_EXPERTISE;
                        const itemDisabled = !checked && maxReached;
                        return (
                          <CommandItem
                            key={opt}
                            onSelect={() => {
                              if (itemDisabled) return;
                              toggleExpertise(opt, !checked);
                            }}
                            className={cn(
                              "flex items-center gap-2",
                              itemDisabled
                                ? "opacity-50 pointer-events-none"
                                : ""
                            )}
                            aria-disabled={itemDisabled}
                          >
                            <Checkbox
                              checked={checked}
                              disabled={itemDisabled}
                              onCheckedChange={(c) => {
                                if (itemDisabled && c === true) return;
                                toggleExpertise(opt, c);
                              }}
                              aria-label={opt}
                            />
                            <span className="text-black font-inter">{opt}</span>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {data.expertise.length > 0 && (
              <p className="text-sm font-inter text-blue-400">
                {data.expertise.slice(0, 3).join(", ")}
                {data.expertise.length > 3
                  ? ` and ${data.expertise.length - 3} more`
                  : ""}
              </p>
            )}
            <p className="text-xs text-muted-foreground font-inter mt-3">
              Select up to {MIN_EXPERTISE} to {MAX_EXPERTISE} options.
            </p>
          </div>
        </section>
      )}

      <footer className="mt-2 flex items-center justify-between gap-3">
        <Button
          variant="outline"
          type="button"
          onClick={back}
          className="cursor-pointer"
          disabled={step === 1}
        >
          Back
        </Button>

        {step < total ? (
          <Button
            type="button"
            onClick={next}
            disabled={!stepValid}
            className="cursor-pointer"
          >
            Next <LuChevronRight className="ml-2" />
          </Button>
        ) : (
          <Button type="submit" disabled={!stepValid || loading} className="cursor-pointer">
            {loading ? (
              <>
                <LucideLoader2 className="mr-2 animate-spin" />
                Saving
              </>
            ) : (
              <>
                Save <LuChevronRight className="ml-2" />
              </>
            )}
          </Button>
        )}
      </footer>
    </form>
  );
}

export default MentorOnboarding;

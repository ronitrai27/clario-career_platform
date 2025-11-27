/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
import { StepIndicator } from "./stepIndicator";
import { Calendar, Copy, Loader2, Share2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  LuActivity,
  LuChevronLeft,
  LuChevronRight,
  LuLoader,
} from "react-icons/lu";
import Image from "next/image";
import { useUserData } from "@/context/UserDataProvider";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profession =
  | "12th Student"
  | "Diploma"
  | "Graduate"
  // | "Postgraduate"
  | "Working professional";

const PROFESSION_OPTIONS: Profession[] = [
  "12th Student",
  "Diploma",
  "Graduate",
  // "Postgraduate",
  "Working professional",
];

const FOCUS_BY_PROFESSION: Record<Profession, string[]> = {
  "12th Student": [
    "Crack competitive exams",
    "Choose Career paths",
    "Skill building",
    "Others",
  ],
  Diploma: [
    "Job/Internship opportunities",
    "Career/ Path guidance",
    "Skill building",
    "Others",
  ],
  Graduate: [
    "Job/Internship opportunities",
    "Career/ Path guidance",
    "Skill building",
    "Others",
  ],
  // Postgraduate: ["Research opportunities", "Higher studies", "Job placement"],
  "Working professional": [
    "Career growth",
    "Career/ Path guidance",
    "Skill building",
    "Others",
  ],
};

type FormData = {
  // Step 1
  name?: string;
  dob: string;
  phone: string;
  institution: string;
  // Step 2
  profession?: Profession;
  // Step 3
  focus?: string;

};

export function OnboardingCard() {
  const [step, setStep] = useState<number>(1);
  const [busy, setBusy] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>("");
  const { user } = useUserData();

  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [isEmailProvider, setIsEmailProvider] = useState(false);

  useEffect(() => {
    // read from localStorage once on mount
    const stored = localStorage.getItem("emailProvider");
    setIsEmailProvider(stored === "true");
  }, []);

  const [data, setData] = useState<FormData>({
    name: "",
    dob: "",
    phone: "",
    institution: "",
    profession: undefined,
    focus: undefined,
    // calendarConnected: false,
  });

  const focusOptions = useMemo(() => {
    return data.profession ? FOCUS_BY_PROFESSION[data.profession] : [];
  }, [data.profession]);

  // Validation per step
  const canProceed = useMemo(() => {
    if (busy) return false;
    switch (step) {
      case 1:
        return (
          /^\d{4}-\d{2}-\d{2}$/.test(data.dob) &&
          /^[0-9()+\-\s]{7,}$/.test(data.phone.trim()) &&
          data.institution.trim().length >= 5
        );
      case 2:
        return !!data.profession;
      case 3:
        return !!data.focus;
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  }, [busy, step, data]);

  function nextStep() {
    if (step < 5 && canProceed) setStep((s) => s + 1);
  }
  function prevStep() {
    if (step > 1) setStep((s) => s - 1);
  }



  function addInviteFromInput() {
    const v = emailInput.trim();
    if (!v) return;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    if (!isEmail) {
      toast("Invalid Email ", {
        description: (
          <span className="text-gray-600 font-inter">
            Please enter a valid email
          </span>
        ),
      });
      return;
    }

    setEmailInput("");
  }

  // copy the link
  async function copyReferral() {
    if (!user) return;

    const link = `${window.location.origin}/invite/${user.invite_link}`;

    await navigator.clipboard.writeText(link);

    toast("Referral link copied", {
      description: (
        <span className="text-gray-600 font-inter">
          Now you can share it with your friends
        </span>
      ),
    });
  }

  // SHARE the link
  async function shareReferral() {
    if (!user) return;

    const link = `${window.location.origin}/invite/${user.invite_link}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on this platform",
          text: "I’m finding it super helpful — join me!",
          url: link,
        });
      } catch {
        // user canceled
      }
    } else {
      await copyReferral();
    }
  }

  async function finish() {
    if (!user) return;

    setLoading(true);
    try {
      const updatePayload: any = {
        userPhone: data.phone,
        institutionName: data.institution
          ? data.institution.trim().toLowerCase()
          : null,
        mainFocus: data.focus ? data.focus.trim().toLowerCase() : null,
        // calendarConnected: data.calendarConnected,
        current_status: data.profession?.toLocaleLowerCase() || null,
        is_verified: true,
      };

      // only update userName if it's filled
      if (data.name && data.name.trim() !== "") {
        updatePayload.userName = data.name.trim();
      }

      // update Supabase record
      const { error } = await supabase
        .from("users")
        .update(updatePayload)
        .eq("id", user.id);

      if (error) {
        console.error("❌ Error updating user:", error.message);
        return;
      }

      // localStorage.removeItem("isOnboardingDone");
      localStorage.setItem("isOnboardingDone", "true");
      localStorage.removeItem("emailProvider");

      router.push("/home");
    } catch (err) {
      console.error("❌ Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl border-border shadow-sm ">
      <CardHeader className="space-y-3">
        <CardTitle className="text-balance font-inter text-xl">
          Let&apos;s personalize your journey
          <LuActivity className="inline ml-2" />
        </CardTitle>
        <CardDescription className="text-pretty font-raleway text-base font-medium">
          Complete the steps to get tailored guidance for your goals.
        </CardDescription>
        <div className="w-full ">
          <StepIndicator current={step} onStepClick={(s) => setStep(s)} />
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {step === 1 && (
          <section className="space-y-6" aria-label="Basic information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Show this block ONLY if provider is email */}
              {isEmailProvider && (
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-base font-raleway font-semibold"
                  >
                    Full name
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., John Doe"
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    className="font-raleway bg-blue-50"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="dob"
                  className="text-base font-raleway font-semibold"
                >
                  Date of birth
                </Label>
                <Input
                  id="dob"
                  type="date"
                  value={data.dob}
                  onChange={(e) => setData({ ...data, dob: e.target.value })}
                  className="font-raleway bg-blue-50 border-blue-200"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-base font-raleway font-semibold"
                >
                  Phone number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 90005 xxxxx"
                  value={data.phone}
                  onChange={(e) => setData({ ...data, phone: e.target.value })}
                  className="font-inter  bg-blue-50 border-blue-200"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="institution"
                  className="text-base font-raleway font-semibold"
                >
                  Current school/college
                </Label>
                <Input
                  id="institution"
                  placeholder="e.g., Delhi Public School"
                  value={data.institution}
                  onChange={(e) =>
                    setData({ ...data, institution: e.target.value })
                  }
                  className=" bg-blue-50 border-blue-200 font-inter"
                />
              </div>
            </div>
            <p className="text-sm -mt-3 font-inter text-muted-foreground">
              Make sure to write full name of your school Instituion/school.
            </p>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-4" aria-label="Current profile">
            <div className="space-y-2 mt-4">
              <Label className="font-raleway font-semibold text-base">
                What best describes you Currently?
              </Label>
              <Select
                value={data.profession}
                onValueChange={(v: Profession) => {
                  setData({ ...data, profession: v, focus: undefined });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your current status" />
                </SelectTrigger>
                <SelectContent>
                  {PROFESSION_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-6" aria-label="Main focus">
            <div className="space-y-2">
              <Label className="font-raleway text-base font-semibold">
                Based on your profile, what’s your main focus right now?
              </Label>
              <p></p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
                {focusOptions.map((opt) => {
                  const selected = data.focus === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setData({ ...data, focus: opt })}
                      className={cn(
                        "text-left rounded-md border p-3 transition-colors cursor-pointer",
                        selected
                          ? "border-blue-600 bg-blue-50"
                          : "border-border hover:bg-blue-50"
                      )}
                      aria-pressed={selected}
                    >
                      <div className="font-medium text-sm font-inter">
                        {opt}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="space-y-4" aria-label="Connect Google Calendar">
            <div className="rounded-md border p-4">
              <div className="flex gap-3 w-full">
                <div className="space-y-1 w-full">
                  <div className="font-medium font-inter text-center">
                    Where did you find Clario?
                  </div>
                  <p className="text-sm text-muted-foreground text-center font-inter">
                    Tell us how you found out about Clario
                  </p>
                </div>
              </div>
              <div className="mt-8 flex items-center gap-3">
                <Input
                  type="text"
                  placeholder="Eg: blogs..."
                  className="w-[70%] mx-auto font-inter"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Note: This step is optional and can be skipped.
            </p>
          </section>
        )}

        {step === 5 && (
          <section className="space-y-6" aria-label="Invite friends">
            <div className="space-y-2">
              <Label
                htmlFor="inviteEmail"
                className="font-raleway font-semibold text-base"
              >
                Invite by email
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="inviteEmail"
                  type="email"
                  placeholder="friend@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="bg-blue-50 border-blue-200 font-inter"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addInviteFromInput();
                    }
                  }}
                />
                <Button
                  onClick={addInviteFromInput}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              {/* {!!data.invites.length && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {data.invites.map((e) => (
                    <span
                      key={e}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-sm"
                    >
                      {e}
                      <button
                        type="button"
                        onClick={() => removeInvite(e)}
                        aria-label={`Remove ${e}`}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )} */}
            </div>

            <div className="space-y-2">
              <Label className="font-raleway font-semibold text-base">
                Or share a referral link
              </Label>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Button
                  variant="outline"
                  onClick={copyReferral}
                  className="font-inter"
                >
                  Copy referral link <Copy className="h-4 w-4 ml-2" />
                </Button>
                <Button
                  onClick={shareReferral}
                  className="bg-blue-600 hover:bg-blue-700 font-inter"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
              <p className="text-sm text-muted-foreground font-inter mt-4">
                Friends who join with your link may unlock bonus resources for
                you.
              </p>
            </div>
          </section>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 mt-4">
        <div className="text-sm text-muted-foreground">Step {step} of 5</div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1 || busy}
          >
            <LuChevronLeft className="mr-2" /> Back
          </Button>
          {step < 5 ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              Continue <LuChevronRight className="ml-2" />
            </Button>
          ) : (
            <Button
              onClick={finish}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              {loading ? (
                <>
                  <LuLoader className="mr-2 animate-spin" /> Saving..
                </>
              ) : (
                <>
                  Complete SetUp <LuActivity className="ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

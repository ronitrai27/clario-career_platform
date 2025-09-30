"use client";

import { useEffect, useState } from "react";
import { useQuizData } from "@/context/userQuizProvider";

type Course = {
  title: string;
  link?: string;
  source?: string;
  redirect_link?: string;
  displayed_link?: string;
  snippet?: string;
};

const demoCourses: Course[] = [
  {
    title: "Introduction to Web Development",
    link: "https://coursera.org/web-dev",
    source: "Coursera",
    displayed_link: "coursera.org",
    snippet: "Learn HTML, CSS, and JavaScript to build responsive websites.",
  },
  {
    title: "Full-Stack Developer Bootcamp",
    link: "https://udemy.com/fullstack",
    source: "Udemy",
    displayed_link: "udemy.com",
    snippet:
      "A complete guide to becoming a full-stack web developer with React & Node.js.",
  },
  {
    title: "Data Science with Python",
    link: "https://edx.org/data-science-python",
    source: "edX",
    displayed_link: "edx.org",
    snippet:
      "Master data analysis, visualization, and machine learning with Python.",
  },
  {
    title: "UI/UX Design Specialization",
    link: "https://coursera.org/uiux",
    source: "Coursera",
    displayed_link: "coursera.org",
    snippet:
      "Learn user experience principles and design interactive interfaces.",
  },
  {
    title: "Machine Learning Crash Course",
    link: "https://developers.google.com/machine-learning/crash-course",
    source: "Google Developers",
    displayed_link: "developers.google.com",
    snippet: "Hands-on introduction to machine learning with TensorFlow APIs.",
  },
  {
    title: "Cloud Computing with AWS",
    link: "https://aws.training",
    source: "AWS Training",
    displayed_link: "aws.training",
    snippet:
      "Get started with AWS cloud services and deploy scalable applications.",
  },
  {
    title: "Mobile App Development with Flutter",
    link: "https://udacity.com/flutter",
    source: "Udacity",
    displayed_link: "udacity.com",
    snippet:
      "Learn to build cross-platform mobile apps using Flutter and Dart.",
  },
  {
    title: "Cybersecurity Fundamentals",
    link: "https://nptel.ac.in/courses/cybersecurity",
    source: "NPTEL",
    displayed_link: "nptel.ac.in",
    snippet:
      "Understand the basics of cybersecurity, threats, and ethical hacking.",
  },
];

export default function CareerCourses() {
  const { quizData } = useQuizData();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   if (!quizData?.selectedCareer) return;

  //   const fetchCourses = async () => {
  //     try {
  //       setLoading(true);
  //       const res = await fetch(`/api/courses?q=${quizData.selectedCareer}`);
  //       const data: Course[] = await res.json();
  //       setCourses(data || []);
  //     } catch (err) {
  //       console.error("❌ Error fetching courses:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchCourses();
  // }, [quizData?.selectedCareer]);

  useEffect(() => {
    if (quizData?.selectedCareer) {
      setCourses(demoCourses);
    }
  }, [quizData?.selectedCareer]);

  if (loading) return <p className="text-center mt-6">Loading...</p>;
  if (!courses.length)
    return <p className="text-center mt-6">No courses found.</p>;

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, idx) => (
          <div
            key={idx}
            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white"
          >
            <a
              href={course.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold text-blue-600 hover:underline"
            >
              {course.title}
            </a>

            {course.snippet && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-4">
                {course.snippet}
              </p>
            )}

            {course.source && (
              <p className="text-xs text-gray-400 mt-2">
                Source: {course.source}
              </p>
            )}

            {course.displayed_link && (
              <p className="text-xs text-gray-400 mt-1 break-all">
                {course.displayed_link}
              </p>
            )}

            {course.redirect_link && (
              <a
                href={course.redirect_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 mt-1 block hover:underline break-all"
              >
                Redirect Link
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

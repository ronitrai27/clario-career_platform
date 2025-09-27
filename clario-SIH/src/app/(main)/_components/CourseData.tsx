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

export default function CareerCourses() {
  const { quizData } = useQuizData();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!quizData?.selectedCareer) return;

    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/courses?q=${quizData.selectedCareer}`);
        const data: Course[] = await res.json();
        setCourses(data || []);
      } catch (err) {
        console.error("❌ Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
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
              <p className="text-xs text-gray-400 mt-2">Source: {course.source}</p>
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

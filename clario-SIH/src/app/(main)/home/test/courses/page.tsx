/* eslint-disable @typescript-eslint/no-explicit-any */
import { getJson } from "serpapi";

interface Course {
  title: string;
  link?: string;
  source?: string;
  description?: string;
  price?: string;
}

// Server-side data fetching
async function getCourses(): Promise<Course[]> {
  try {
    const response = await getJson({
      api_key: process.env.SERPAPI_KEY,
      q: "data scientist",
      hl: "en",
      gl: "us",
      device: "desktop",
      engine: "google",
    });

    if (Array.isArray(response.courses)) {
      return response.courses.map((course: any) => ({
        title: course.title || "Untitled",
        link: course.link,
        source: course.source,
        description: course.description,
        price: course.price,
      }));
    }

    return [];
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
}

// Main page component
export default async function DataScientistCourses() {
  const courses = await getCourses();
  console.log(courses);

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Recommended Courses for "Data Scientist"</h1>
      {courses.length === 0 ? (
        <p>No courses found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {courses.map((course, index) => (
            <li
              key={index}
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                marginBottom: "20px",
                borderRadius: "5px",
              }}
            >
              <h2>{course.title}</h2>
              {course.source && (
                <p>
                  <strong>Source:</strong> {course.source}
                </p>
              )}
              {course.description && (
                <p>
                  <strong>Description:</strong>{" "}
                  {course.description.length > 200
                    ? course.description.slice(0, 200) + "..."
                    : course.description}
                </p>
              )}
              {course.price && (
                <p>
                  <strong>Price:</strong> {course.price}
                </p>
              )}
              {course.link && (
                <p>
                  <a
                    href={course.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "blue", textDecoration: "underline" }}
                  >
                    View Course
                  </a>
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { getJson } from "serpapi";

interface Job {
  title: string;
  company_name: string;
  location: string;
  via: string;
  description: string;
  apply_options: { title: string; link: string }[];
}

// Server-side data fetching
async function getJobs(): Promise<Job[]> {
  try {
    const response = await getJson({
      // api_key: process.env.SERPAPI_KEY, 
      engine: "google_jobs",
      google_domain: "google.co.in",
      q: "gen ai dev",
      hl: "en",
      gl: "in",
      location: "India",
    });

    // Extract only the desired fields from jobs_results
    if (Array.isArray(response.jobs_results)) {
      return response.jobs_results.map((job: any) => ({
        title: job.title,
        company_name: job.company_name,
        location: job.location,
        via: job.via,
        description: job.description,
        apply_options: job.apply_options,
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
}

// Main page component
export default async function JobsData() {
  const jobs = await getJobs();
  console.log(jobs);

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Generative AI Developer Jobs in India</h1>
      {jobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {jobs.map((job, index) => (
            <li
              key={index}
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                marginBottom: "20px",
                borderRadius: "5px",
              }}
            >
              <h2>{job.title}</h2>
              <p>
                <strong>Company:</strong> {job.company_name}
              </p>
              <p>
                <strong>Location:</strong> {job.location}
              </p>
              <p>
                <strong>Source:</strong> {job.via}
              </p>
              <p>
                <strong>Description:</strong>{" "}
                {job.description.length > 200
                  ? job.description.slice(0, 200) + "..."
                  : job.description}
              </p>
              <div>
                <strong>Apply:</strong>
                <ul>
                  {job.apply_options?.map((option, idx) => (
                    <li key={idx}>
                      <a href={option.link} target="_blank" rel="noopener noreferrer">
                        {option.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>

  );
}
import DocsClient from "./DocsClient";

export default async function DocsPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://legal-copilot-backend-088i.onrender.com";

  // Best Practice: Fetch all endpoints concurrently on the server and cache for 10 seconds
  const fetchOpts = { next: { revalidate: 10 } };

  const [accessRes, contentRes, statsRes, teamRes] = await Promise.all([
    fetch(`${API_BASE}/api/docs/access`, fetchOpts).catch(() => null),
    fetch(`${API_BASE}/api/docs/content`, fetchOpts).catch(() => null),
    fetch(`${API_BASE}/api/docs/live-stats`, fetchOpts).catch(() => null),
    fetch(`${API_BASE}/api/docs/team`, fetchOpts).catch(() => null),
  ]);

  // Safely parse JSON or return null/defaults if the fetch failed or access is restricted
  const access = accessRes?.ok ? await accessRes.json() : { accessible: true, visibility: "ON" };
  const content = contentRes?.ok ? await contentRes.json() : null;
  const stats = statsRes?.ok ? await statsRes.json() : null;
  const team = teamRes?.ok ? await teamRes.json() : null;

  return (
    <DocsClient
      initialAccess={access}
      initialContent={content}
      initialStats={stats}
      initialTeam={team}
    />
  );
}
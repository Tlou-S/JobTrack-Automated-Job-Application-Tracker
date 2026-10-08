import { useMemo, useState } from "react";
import { FaBullhorn, FaSearch } from "react-icons/fa";
import Navbar from "../Components/Navbar";
import "./AnnouncementsPage.css";

type AnnouncementCategory = "Career" | "Community" | "Event";
type Priority = "Important" | "Update" | "Event";
type SortOrder = "newest" | "oldest";

type Announcement = {
  id: string;
  title: string;
  content: string;
  date: string;
  category: AnnouncementCategory;
  priority: Priority;
};

const announcements: Announcement[] = [
  { id: "a1", title: "Graduate application season is underway", content: "Review your saved opportunities and make time to tailor each application to the role.", date: "2026-09-04", category: "Career", priority: "Event" },
  { id: "a2", title: "Keep your interview details together", content: "Add the time, interviewer, and preparation notes to each application so nothing gets missed.", date: "2026-09-01", category: "Career", priority: "Important" },
  { id: "a3", title: "New job-search resources are available", content: "Explore resume guidance, interview preparation, and ways to keep your search organized.", date: "2026-08-28", category: "Community", priority: "Update" },
  { id: "a4", title: "Update your contact details", content: "Keep your profile current so recruiters can reach you about active opportunities.", date: "2026-08-22", category: "Career", priority: "Update" },
  { id: "a5", title: "Resume review sessions open", content: "Prepare your CV and get ready to highlight your skills and project experience.", date: "2026-08-15", category: "Event", priority: "Event" },
];

const categories: Array<"All" | AnnouncementCategory> = ["All", "Career", "Community", "Event"];

const formatDate = (date: string) => new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${date}T00:00:00`));

export default function AnnouncementsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | AnnouncementCategory>("All");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const visibleAnnouncements = useMemo(() => announcements
    .filter((announcement) => {
      const matchesCategory = category === "All" || announcement.category === category;
      const searchText = `${announcement.title} ${announcement.content} ${announcement.category} ${announcement.priority}`.toLowerCase();
      return matchesCategory && searchText.includes(query.toLowerCase());
    })
    .sort((first, second) => sortOrder === "newest" ? second.date.localeCompare(first.date) : first.date.localeCompare(second.date)), [category, query, sortOrder]);

  return (
    <div className="announcements-page">
      <Navbar />
      <header className="announcements-header">
        <p className="services-eyebrow">Stay in the loop</p>
        <h1>Announcements</h1>
        <p>Important updates, career resources, and opportunities for JobTrack users.</p>
      </header>
      <section className="announcements-controls" aria-label="Announcement filters">
        <label className="announcements-search">
          <FaSearch aria-hidden="true" />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search announcements" aria-label="Search announcements" />
        </label>
        <div className="announcements-filter-list" aria-label="Filter by category">
          {categories.map((item) => (
            <button type="button" key={item} className={`announcements-filter ${category === item ? "announcements-filter-active" : ""}`} onClick={() => setCategory(item)}>{item}</button>
          ))}
        </div>
        <select className="announcements-sort" value={sortOrder} onChange={(event) => setSortOrder(event.target.value as SortOrder)} aria-label="Sort announcements">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </section>
      <main className="announcements-content">
        <div className="announcements-results-heading"><h2>Latest from JobTrack</h2><span>{visibleAnnouncements.length} announcement{visibleAnnouncements.length === 1 ? "" : "s"}</span></div>
        {visibleAnnouncements.length > 0 ? (
          <div className="announcements-list">
            {visibleAnnouncements.map((announcement) => (
              <article className="announcement-card" key={announcement.id}>
                <div className="announcement-card-topline"><span className="announcement-category">{announcement.category}</span><span className={`announcement-priority announcement-priority-${announcement.priority.toLowerCase()}`}>{announcement.priority}</span></div>
                <h3>{announcement.title}</h3>
                <p>{announcement.content}</p>
                <div className="announcement-card-footer"><time dateTime={announcement.date}>{formatDate(announcement.date)}</time><button type="button" onClick={() => setSelectedAnnouncement(announcement)}>Read More</button></div>
              </article>
            ))}
          </div>
        ) : (
          <div className="announcements-empty"><FaBullhorn aria-hidden="true" /><h2>No announcements found</h2><p>Try a different search term or category.</p></div>
        )}
      </main>
      {selectedAnnouncement && (
        <div className="service-modal-backdrop" role="presentation" onClick={() => setSelectedAnnouncement(null)}>
          <section className="service-modal" role="dialog" aria-modal="true" aria-labelledby="announcement-modal-title" onClick={(event) => event.stopPropagation()}>
            <span className="announcement-category">{selectedAnnouncement.category} · {formatDate(selectedAnnouncement.date)}</span>
            <h2 id="announcement-modal-title">{selectedAnnouncement.title}</h2>
            <p>{selectedAnnouncement.content}</p>
            <button type="button" className="service-details-button" onClick={() => setSelectedAnnouncement(null)}>Close</button>
          </section>
        </div>
      )}
    </div>
  );
}
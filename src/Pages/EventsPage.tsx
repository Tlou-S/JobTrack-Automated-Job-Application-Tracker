import { useMemo, useState } from "react";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import Navbar from "../Components/Navbar";
import "./EventsPage.css";

type EventCategory = "Workshop" | "Career" | "Networking";

type CampusEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: EventCategory;
  accent: string;
};

const events: CampusEvent[] = [
  {
    id: "resume-clinic",
    title: "Graduate CV Clinic",
    description: "Get practical feedback on your resume and tailor it to the roles you want.",
    date: "2026-09-11",
    time: "10:00 - 15:00",
    location: "Career Centre",
    category: "Workshop",
    accent: "workshop",
  },
  {
    id: "interview-workshop",
    title: "Interview Preparation",
    description: "Practice clear answers and prepare thoughtful questions for your next interview.",
    date: "2026-09-16",
    time: "13:00 - 14:00",
    location: "Library Learning Lab",
    category: "Workshop",
    accent: "workshop",
  },
  {
    id: "graduate-networking",
    title: "Graduate Networking Session",
    description: "Meet early-career professionals and learn about their routes into the industry.",
    date: "2026-09-19",
    time: "11:00 - 14:00",
    location: "Main Quad",
    category: "Networking",
    accent: "networking",
  },
  {
    id: "safety-session",
    title: "Job Search Planning",
    description: "Build a manageable application plan and set reminders for your next steps.",
    date: "2026-09-24",
    time: "12:30 - 13:30",
    location: "Student Affairs Hall",
    category: "Career",
    accent: "career",
  },
];

const categories: Array<"All" | EventCategory> = ["All", "Workshop", "Career", "Networking"];

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-ZA", { weekday: "short", day: "numeric", month: "short" }).format(new Date(`${date}T00:00:00`));

export default function EventsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | EventCategory>("All");
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);

  const visibleEvents = useMemo(() => events.filter((event) => {
    const matchesCategory = category === "All" || event.category === category;
    const searchText = `${event.title} ${event.description} ${event.location} ${event.category}`.toLowerCase();
    return matchesCategory && searchText.includes(query.toLowerCase());
  }), [category, query]);

  return (
    <div className="events-page">
      <Navbar />
      <header className="events-hero">
        <div className="events-hero-copy">
          <p className="events-eyebrow">Build your next step</p>
          <h1>Recent events</h1>
          <p>Discover upcoming resume sessions, interview workshops, and career events.</p>
        </div>
        <div className="events-hero-date" aria-label="Next event">
          <span>Next up</span>
          <strong>11</strong>
          <small>SEP</small>
        </div>
      </header>

      <main className="events-content">
        <section className="events-controls" aria-label="Event filters">
          <label className="events-search">
            <FaSearch aria-hidden="true" />
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events" aria-label="Search events" />
          </label>
          <div className="events-filter-list" aria-label="Filter by event type">
            {categories.map((item) => (
              <button type="button" key={item} className={`events-filter ${category === item ? "events-filter-active" : ""}`} onClick={() => setCategory(item)}>{item}</button>
            ))}
          </div>
        </section>

        <div className="events-results-heading">
          <div><p className="events-eyebrow">Mark your calendar</p><h2>What&apos;s happening next</h2></div>
          <span>{visibleEvents.length} event{visibleEvents.length === 1 ? "" : "s"}</span>
        </div>

        {visibleEvents.length > 0 ? (
          <div className="events-list">
            {visibleEvents.map((event) => (
              <article className="event-card" key={event.id}>
                <div className={`event-card-banner event-card-banner-${event.accent}`}><FaCalendarAlt aria-hidden="true" /><span>{event.category}</span></div>
                <div className="event-card-body">
                  <time dateTime={event.date}>{formatDate(event.date)}</time>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                  <div className="event-meta"><span><FaClock aria-hidden="true" />{event.time}</span><span><FaMapMarkerAlt aria-hidden="true" />{event.location}</span></div>
                  <button type="button" className="event-details-button" onClick={() => setSelectedEvent(event)}>View details</button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="events-empty"><FaCalendarAlt aria-hidden="true" /><h2>No events found</h2><p>Try a different search term or event type.</p></div>
        )}
      </main>

      {selectedEvent && (
        <div className="events-modal-backdrop" role="presentation" onClick={() => setSelectedEvent(null)}>
          <section className="events-modal" role="dialog" aria-modal="true" aria-labelledby="event-modal-title" onClick={(event) => event.stopPropagation()}>
            <span className={`event-modal-label event-modal-label-${selectedEvent.accent}`}>{selectedEvent.category}</span>
            <h2 id="event-modal-title">{selectedEvent.title}</h2>
            <p>{selectedEvent.description}</p>
            <div className="event-modal-meta"><span><FaCalendarAlt aria-hidden="true" />{formatDate(selectedEvent.date)}</span><span><FaClock aria-hidden="true" />{selectedEvent.time}</span><span><FaMapMarkerAlt aria-hidden="true" />{selectedEvent.location}</span></div>
            <button type="button" className="event-details-button" onClick={() => setSelectedEvent(null)}>Close</button>
          </section>
        </div>
      )}
    </div>
  );
}
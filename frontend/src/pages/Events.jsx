
import React, { useEffect, useState } from "react";
import { api } from "../api";

// Events page.
export default function Events({ role }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const canCreate = role === "admin" || role === "faculty";

  // Fetch all events.
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await api("/events");

      setEvents(Array.isArray(data) ? data : data.events || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Reset form.
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setVenue("");
    setEditingId(null);
  };

  // Create or update event.
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setMessage("");

      const eventData = {
        title,
        description,
        date,
        time,
        venue
      };

      if (editingId) {
        await api(`/events/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(eventData)
        });

        setMessage("Event updated successfully!");
      } else {
        await api("/events", {
          method: "POST",
          body: JSON.stringify(eventData)
        });

        setMessage("Event created successfully!");
      }

      resetForm();
      await fetchEvents();
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Edit event.
  const handleEdit = (event) => {
    setEditingId(event._id);
    setTitle(event.title);
    setDescription(event.description);
    setDate(new Date(event.date).toISOString().split("T")[0]);
    setTime(event.time);
    setVenue(event.venue);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Check ownership.
  const canEdit = (event) => {
    if (role === "admin") return true;

    const user = JSON.parse(
      localStorage.getItem("campus_user") || "null"
    );

    const creatorId =
      event.createdBy?._id || event.createdBy;

    return (
      role === "faculty" &&
      creatorId &&
      user?.id === creatorId.toString()
    );
  };

  return (
    <section className="page-section">

      {/* Page header */}
      <div className="page-hero glass">
        <div>
          <span className="eyebrow">CAMPUS LIFE</span>
          <h1>Events</h1>
          <p>
            Discover campus activities, schedules and upcoming experiences.
          </p>

          <div className="hero-mini-row">
            <span className="glass mini-pill">✦ {role}</span>
            <span className="glass mini-pill">● Live workspace</span>
          </div>
        </div>

        <div className="hero-sculpture" aria-hidden="true">
          <div className="sculpture-core" />
          <div className="sculpture-ring" />
        </div>
      </div>

      {/* Create / Edit Event Form */}
      {canCreate && (
        <div className="content-card glass" style={{ marginBottom: 24 }}>
          <span className="card-kicker">
            {editingId ? "EDIT EVENT" : "CREATE EVENT"}
          </span>

          <h3>{editingId ? "Update Event" : "Post a New Event"}</h3>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gap: 14, marginTop: 18 }}>

              <input
                type="text"
                placeholder="Event title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <textarea
                placeholder="Event description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows="4"
              />

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Time (e.g. 10:00 AM)"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Venue"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                required
              />

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button type="submit">
                  {editingId ? "Update Event" : "Create Event"}
                </button>

                {editingId && (
                  <button type="button" onClick={resetForm}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>

          {message && <p style={{ marginTop: 12 }}>{message}</p>}
        </div>
      )}

      {/* Events List */}
      <div style={{ marginBottom: 18 }}>
        <span className="card-kicker">CAMPUS SCHEDULE</span>
        <h2>All Events</h2>
      </div>

      {loading && <p>Loading events...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && events.length === 0 && (
        <div className="content-card glass">
          <h3>No events yet</h3>
          <p>Campus events will appear here.</p>
        </div>
      )}

      <div className="content-grid">
        {events.map((event) => (
          <article
            className="content-card glass"
            key={event._id}
          >
            <div className="content-icon">◷</div>

            <div>
              <span className="card-kicker">CAMPUS EVENT</span>

              <h3>{event.title}</h3>

              <p>{event.description}</p>

              <p>📅 {new Date(event.date).toLocaleDateString()}</p>

              <p>🕒 {event.time}</p>

              <p>📍 {event.venue}</p>

              <p>
                <small>
                  Posted by: {event.createdBy?.name || "Campus member"}
                </small>
              </p>

              {canEdit(event) && (
                <button
                  type="button"
                  onClick={() => handleEdit(event)}
                  style={{ marginTop: 12 }}
                >
                  Edit Event
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

    </section>
  );
}


import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function Resources({ role }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Notes",
    subject: "",
    fileUrl: "",
    fileName: ""
  });

  // NORMALIZE ROLE
  const normalizedRole = String(role || "").toLowerCase();

  const canUpload =
    normalizedRole === "faculty" ||
    normalizedRole === "admin";

  // FETCH RESOURCES
  const fetchResources = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await api("/resources");

      setResources(data.resources || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // HANDLE INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // UPLOAD RESOURCE
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      await api("/resources", {
        method: "POST",
        body: JSON.stringify(formData)
      });

      setMessage("Resource added successfully!");

      setFormData({
        title: "",
        description: "",
        category: "Notes",
        subject: "",
        fileUrl: "",
        fileName: ""
      });

      await fetchResources();
    } catch (err) {
      setError(err.message);
    }
  };

  // DELETE RESOURCE
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this resource?"
    );

    if (!confirmDelete) return;

    try {
      setError("");
      setMessage("");

      await api(`/resources/${id}`, {
        method: "DELETE"
      });

      setMessage("Resource deleted successfully!");

      await fetchResources();
    } catch (err) {
      setError(err.message);
    }
  };

  // CHECK DELETE PERMISSION
  const canDelete = (resource) => {
    if (normalizedRole === "admin") {
      return true;
    }

    return (
      normalizedRole === "faculty" &&
      resource.uploadedBy?._id === localStorage.getItem("userId")
    );
  };

  console.log("Current role:", role);
  console.log("Normalized role:", normalizedRole);
  console.log("Can upload:", canUpload);

  return (
    <section className="page-section">

      {/* PAGE HEADER */}
      <div className="page-hero glass">
        <div>
          <span className="eyebrow">LEARNING</span>

          <h1>Resources</h1>

          <p>
            Explore study materials, documents and useful learning resources.
          </p>

          <div className="hero-mini-row">
            <span className="glass mini-pill">
              ✦ {role}
            </span>

            <span className="glass mini-pill">
              ● {resources.length} Resources
            </span>
          </div>
        </div>

        <div className="hero-sculpture" aria-hidden="true">
          <div className="sculpture-core" />
          <div className="sculpture-ring" />
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="content-card glass">
          <p>{error}</p>
        </div>
      )}

      {/* SUCCESS MESSAGE */}
      {message && (
        <div className="content-card glass">
          <p>{message}</p>
        </div>
      )}

      {/* UPLOAD RESOURCE FORM */}
      {canUpload && (
        <article className="content-card glass">

          <span className="card-kicker">
            FACULTY / ADMIN
          </span>

          <h3>Add Learning Resource</h3>

          <form onSubmit={handleSubmit}>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Resource title"
              required
            />

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
            />

            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Subject name"
              required
            />

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="Notes">Notes</option>

              <option value="E-books">
                E-books
              </option>

              <option value="Previous Year Questions">
                Previous Year Questions
              </option>

              <option value="Tutorials">
                Tutorials
              </option>

              <option value="Other">
                Other
              </option>
            </select>

            <input
              type="text"
              name="fileName"
              value={formData.fileName}
              onChange={handleChange}
              placeholder="File name (example: java-notes.pdf)"
              required
            />

            <input
              type="url"
              name="fileUrl"
              value={formData.fileUrl}
              onChange={handleChange}
              placeholder="PDF / Document URL"
              required
            />

            <button type="submit">
              + Add Resource
            </button>

          </form>
        </article>
      )}

      {/* RESOURCE LIST */}
      <div className="content-grid">

        {loading ? (
          <article className="content-card glass">
            <p>Loading resources...</p>
          </article>
        ) : resources.length === 0 ? (
          <article className="content-card glass">

            <div className="content-icon">
              ▱
            </div>

            <div>
              <span className="card-kicker">
                EMPTY LIBRARY
              </span>

              <h3>No resources available</h3>

              <p>
                Learning materials will appear here when added.
              </p>
            </div>

          </article>
        ) : (
          resources.map((resource) => (
            <article
              className="content-card glass"
              key={resource._id}
            >

              <div className="content-icon">
                ▱
              </div>

              <div>
                <span className="card-kicker">
                  {resource.category}
                </span>

                <h3>{resource.title}</h3>

                <p>
                  {resource.description}
                </p>

                <p>
                  <strong>Subject:</strong>{" "}
                  {resource.subject}
                </p>

                <p>
                  <strong>File:</strong>{" "}
                  {resource.fileName}
                </p>

                <p>
                  <strong>Uploaded by:</strong>{" "}
                  {resource.uploadedBy?.name || "Unknown"}
                </p>

                <a
                  href={resource.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View / Download ↗
                </a>

                {canDelete(resource) && (
                  <button
                    type="button"
                    onClick={() => handleDelete(resource._id)}
                  >
                    Delete
                  </button>
                )}

              </div>
            </article>
          ))
        )}

      </div>
    </section>
  );
}

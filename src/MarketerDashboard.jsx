
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  CalendarCheck,
  Clock,
  Search,
  RefreshCw,
  TrendingUp,
  Phone,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import "./MarketerDashboard.css";

const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

const STATUSES = [
  "New",
  "Contacted",
  "Interested",
  "Trial Booked",
  "Trial Attended",
  "Follow-up",
  "Converted",
  "Lost",
];

const normalise = (value) =>
  String(value ?? "").trim().toLowerCase();

function StatCard({ title, value, icon: Icon, description }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span>{title}</span>
        <div className="stat-icon">
          <Icon size={21} />
        </div>
      </div>
      <strong>{value}</strong>
      <small>{description}</small>
    </div>
  );
}

export default function MarketerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadBookings = useCallback(() => {
    if (!SCRIPT_URL) {
      setError("Google Apps Script URL is missing. Check your .env file.");
      setLoading(false);
      return;
    }

    const callbackName =
      `bookingCallback_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    let script;

    window[callbackName] = (result) => {
      if (result?.error) {
        setError(result.error);
      } else {
        setBookings(Array.isArray(result?.bookings) ? result.bookings : []);
        setLastUpdated(new Date());
        setError("");
      }

      setLoading(false);
      delete window[callbackName];
      script?.remove();
    };

    script = document.createElement("script");
    script.src =
      `${SCRIPT_URL}?callback=${callbackName}&_=${Date.now()}`;

    script.onerror = () => {
      setError("Unable to load bookings. Check your Apps Script deployment.");
      setLoading(false);
      delete window[callbackName];
      script.remove();
    };

    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    loadBookings();
    const interval = setInterval(loadBookings, 30000);

    return () => clearInterval(interval);
  }, [loadBookings]);

  const stats = useMemo(() => {
    const count = (status) =>
      bookings.filter(
        (b) => normalise(b.Status) === normalise(status)
      ).length;

    return {
      total: bookings.length,
      newLeads: count("New"),
      trialBooked: count("Trial Booked"),
      trialAttended: count("Trial Attended"),
      converted: count("Converted"),
      followUp: count("Follow-up") + count("Contacted") + count("Interested"),
      lost: count("Lost"),
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings
      .filter((booking) => {
        const matchesFilter =
          filter === "All" ||
          normalise(booking.Status) === normalise(filter);

        const term = normalise(search);

        const matchesSearch = [
          booking["Parent Name"],
          booking["Child Name"],
          booking.Phone,
          booking.Grade,
        ].some((value) => normalise(value).includes(term));

        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => {
        return new Date(b.Date).getTime() - new Date(a.Date).getTime();
      });
  }, [bookings, filter, search]);

  const getStatusClass = (status) =>
    normalise(status).replace(/\s+/g, "-");

  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? String(value)
      : date.toLocaleString("en-KE", {
          dateStyle: "medium",
          timeStyle: "short",
        });
  };

  return (
    <main className="marketer-page">
      <header className="dashboard-header">
        <div>
          <div className="dashboard-brand">TECH TALK HUB</div>
          <h1>Marketing Dashboard</h1>
          <p>Track bookings, trial classes and student enrolments.</p>
        </div>

        <button
          className="refresh-button"
          onClick={() => {
            setLoading(true);
            loadBookings();
          }}
          disabled={loading}
        >
          <RefreshCw size={17} className={loading ? "spinning" : ""} />
          Refresh
        </button>
      </header>

      {error && (
        <div className="dashboard-error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <section className="stats-grid">
        <StatCard
          title="Total Bookings"
          value={stats.total}
          icon={Users}
          description="All registrations received"
        />
        <StatCard
          title="New Leads"
          value={stats.newLeads}
          icon={TrendingUp}
          description="Awaiting contact"
        />
        <StatCard
          title="Trials Booked"
          value={stats.trialBooked}
          icon={CalendarCheck}
          description="Trial sessions scheduled"
        />
        <StatCard
          title="Trials Attended"
          value={stats.trialAttended}
          icon={CheckCircle2}
          description="Completed trial sessions"
        />
        <StatCard
          title="Enrolled Students"
          value={stats.converted}
          icon={UserCheck}
          description="Successfully converted"
        />
        <StatCard
          title="Follow-ups"
          value={stats.followUp}
          icon={Clock}
          description="Contact and follow-up needed"
        />
      </section>

      <section className="enrollment-highlight">
        <div className="enrollment-icon">
          <UserCheck size={24} />
        </div>
        <div>
          <strong>{stats.converted} students enrolled</strong>
          <p>
            These are leads marked as Converted in the bookings sheet.
          </p>
        </div>
        <TrendingUp size={25} className="enrollment-trend" />
      </section>

      <section className="bookings-section">
        <div className="section-heading">
          <div>
            <h2>Booking Records</h2>
            <p>View and track every parent registration.</p>
          </div>
          <span className="record-count">
            {filteredBookings.length} records
          </span>
        </div>

        <div className="booking-controls">
          <div className="search-box">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search parent, child or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-box">
            <Filter size={17} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Parent</th>
                <th>Child</th>
                <th>Phone</th>
                <th>Grade</th>
                <th>Preferred Time</th>
                <th>Status</th>
                <th>Booking Date</th>
              </tr>
            </thead>

            <tbody>
              {loading && bookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">
                    Loading bookings...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking, index) => (
                  <tr key={`${booking.Phone}-${index}`}>
                    <td className="parent-cell">
                      {booking["Parent Name"] || "—"}
                    </td>
                    <td>
                      <strong>{booking["Child Name"] || "—"}</strong>
                      <small>Age: {booking.Age || "—"}</small>
                    </td>
                    <td>
                      {booking.Phone ? (
                        <a
                          className="phone-link"
                          href={`tel:${booking.Phone}`}
                        >
                          <Phone size={13} />
                          {booking.Phone}
                        </a>
                      ) : "—"}
                    </td>
                    <td>{booking.Grade || "—"}</td>
                    <td>{booking["Preferred Time"] || "—"}</td>
                    <td>
                      <span
                        className={`status-pill ${getStatusClass(booking.Status)}`}
                      >
                        {booking.Status || "New"}
                      </span>
                    </td>
                    <td>{formatDate(booking.Date)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>
            {lastUpdated
              ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
              : "Waiting for data..."}
          </span>
          <span>Automatically refreshes every 30 seconds</span>
        </div>
      </section>

      <footer className="dashboard-footer">
        Tech Talk Hub · Marketing Performance
      </footer>
    </main>
  );
}

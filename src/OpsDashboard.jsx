
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users, UserCheck, CalendarCheck, Clock, Search, RefreshCw,
  TrendingUp, Phone, Filter, CheckCircle2, AlertCircle,
  MessageCircle, UserPlus, CalendarDays, Save, X, FileText,
  History, Bell, ExternalLink
} from "lucide-react";
import "./OpsDashboard.css";

const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

const STATUSES = [
  "New", "Contacted", "Interested", "Trial Booked",
  "Trial Attended", "Follow-up", "Converted", "Lost"
];

const normalise = (value) =>
  String(value ?? "").trim().toLowerCase();

const cleanPhone = (value) =>
  String(value ?? "").replace(/[^\d+]/g, "");

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString("en-KE", {
        day: "numeric", month: "short", year: "numeric"
      });
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString("en-KE", {
        dateStyle: "medium", timeStyle: "short"
      });
}

function StatCard({ title, value, icon: Icon, description }) {
  return (
    <div className="ops-stat-card">
      <div className="ops-stat-top">
        <span>{title}</span>
        <div className="ops-stat-icon"><Icon size={20} /></div>
      </div>
      <strong>{value}</strong>
      <small>{description}</small>
    </div>
  );
}

function makeWhatsAppLink(phone, message) {
  let number = cleanPhone(phone).replace(/\D/g, "");
  if (number.startsWith("0")) number = `254${number.slice(1)}`;
  if (number.startsWith("7") || number.startsWith("1")) {
    number = `254${number}`;
  }
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export default function OpsDashboard() {
  const [bookings, setBookings] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("All");

  const [form, setForm] = useState({
    status: "New",
    tutorId: "",
    followUpDate: "",
    followUpNotes: "",
    trialConfirmation: "Pending",
    classDate: "",
    classTime: ""
  });

  const loadData = useCallback(() => {
    if (!SCRIPT_URL) {
      setError("Google Apps Script URL is missing.");
      setLoading(false);
      return;
    }

    const callbackName =
      `opsCallback_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    let script;
    let timeout;
    let completed = false;

    const cleanup = () => {
      clearTimeout(timeout);
      delete window[callbackName];
      script?.remove();
    };

    window[callbackName] = (result) => {
      if (completed) return;
      completed = true;
      cleanup();

      if (result?.success === false || result?.error) {
        setError(result.error || "Unable to load operations data.");
      } else {
        setBookings(Array.isArray(result.bookings) ? result.bookings : []);
        setTutors(Array.isArray(result.tutors) ? result.tutors : []);
        setLastUpdated(new Date());
        setError("");
      }
      setLoading(false);
    };

    script = document.createElement("script");
    script.src =
      `${SCRIPT_URL}?view=ops&callback=${callbackName}&_=${Date.now()}`;

    script.onerror = () => {
      if (completed) return;
      completed = true;
      cleanup();
      setError("Unable to connect to Google Sheets. Check your Apps Script deployment.");
      setLoading(false);
    };

    timeout = setTimeout(() => {
      if (completed) return;
      completed = true;
      cleanup();
      setError("Request timed out. Please refresh.");
      setLoading(false);
    }, 15000);

    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const stats = useMemo(() => {
    const count = (status) =>
      bookings.filter(b => normalise(b.Status) === normalise(status)).length;

    return {
      total: bookings.length,
      newLeads: count("New"),
      trialBooked: count("Trial Booked"),
      trialAttended: count("Trial Attended"),
      converted: count("Converted"),
      followUp: count("Follow-up") + count("Contacted") + count("Interested")
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const term = normalise(search);

    return bookings.filter((b) => {
      const matchesSearch = [
        b["Parent Name"], b["Student Name"], b.Phone, b.Grade,
        b["Class Date"], b["Class Time"], b.Status,
        b["Assigned Tutor"]
      ].some(value => normalise(value).includes(term));

      const matchesStatus =
        filter === "All" || normalise(b.Status) === normalise(filter);

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Unassigned" && !b["Assigned Tutor"]) ||
        (activeTab === "Upcoming" && normalise(b.Status) === "trial booked") ||
        (activeTab === "Follow-ups" && Boolean(b["Follow-up Date"]));

      return matchesSearch && matchesStatus && matchesTab;
    }).sort((a, b) =>
      new Date(b.Date).getTime() - new Date(a.Date).getTime()
    );
  }, [bookings, search, filter, activeTab]);

  const openRecord = (booking) => {
    setSelected(booking);
    setForm({
      status: booking.Status || "New",
      tutorId: booking["Tutor ID"] || "",
      followUpDate: booking["Follow-up Date"] || "",
      followUpNotes: booking["Follow-up Notes"] || "",
      trialConfirmation: booking["Trial Confirmation"] || "Pending",
      classDate: booking["Class Date"] || "",
      classTime: booking["Class Time"] || ""
    });
    setNotice("");
  };

  const updateForm = (field, value) => {
    setForm(previous => ({ ...previous, [field]: value }));
  };

  const saveRecord = async () => {
    if (!selected) return;

    setSaving(true);
    setError("");
    setNotice("");

    const assignedTutor = tutors.find(
      tutor => String(tutor["Tutor ID"]) === String(form.tutorId)
    );

    const payload = {
      action: "updateBooking",
      phone: selected.Phone,
      bookingDate: selected.Date,
      parentName: selected["Parent Name"],
      studentName: selected["Student Name"],
      status: form.status,
      tutorId: form.tutorId,
      assignedTutor: assignedTutor?.["Tutor Name"] || "",
      followUpDate: form.followUpDate,
      followUpNotes: form.followUpNotes,
      trialConfirmation: form.trialConfirmation,
      classDate: form.classDate,
      classTime: form.classTime
    };

    try {
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.error || "Unable to save changes.");
      }

      setNotice("Changes saved successfully.");
      setSelected(null);
      loadData();
    } catch (err) {
      setError(
        err.message || "Could not save changes. Check your Apps Script update handler."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setError("");
    loadData();
  };

  const getWhatsAppMessage = (booking) =>
    `Hi ${booking["Parent Name"] || "there"}, this is Tech Talk Hub. ` +
    `We are following up about ${booking["Student Name"] || "your child"}'s ` +
    `coding trial class. Please let us know if you need any assistance.`;

  const sendTrialMessage = (booking) => {
    const message =
      `Hi ${booking["Parent Name"] || "there"}, your child's coding trial class ` +
      `at Tech Talk Hub is scheduled for ${formatDate(booking["Class Date"])} ` +
      `at ${booking["Class Time"] || "the agreed time"}. We look forward to meeting you!`;
    window.open(makeWhatsAppLink(booking.Phone, message), "_blank", "noopener,noreferrer");
  };

  const getStatusClass = (status) =>
    normalise(status).replace(/\s+/g, "-");

  return (
    <main className="ops-page">
      <header className="ops-header">
        <div>
          <div className="ops-brand">TECH TALK HUB</div>
          <h1>Operations Dashboard</h1>
          <p>Manage leads, tutors, trial classes and parent follow-ups.</p>
        </div>

        <button className="ops-refresh" onClick={handleRefresh} disabled={loading}>
          <RefreshCw size={17} className={loading ? "ops-spinning" : ""} />
          Refresh
        </button>
      </header>

      {error && (
        <div className="ops-alert ops-alert-error">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {notice && (
        <div className="ops-alert ops-alert-success">
          <CheckCircle2 size={18} /> {notice}
        </div>
      )}

      <section className="ops-stats-grid">
        <StatCard title="Total Bookings" value={stats.total} icon={Users} description="All registrations" />
        <StatCard title="New Leads" value={stats.newLeads} icon={TrendingUp} description="Awaiting contact" />
        <StatCard title="Trials Booked" value={stats.trialBooked} icon={CalendarCheck} description="Scheduled trials" />
        <StatCard title="Trials Attended" value={stats.trialAttended} icon={CheckCircle2} description="Completed trials" />
        <StatCard title="Enrolled" value={stats.converted} icon={UserCheck} description="Converted students" />
        <StatCard title="Follow-ups" value={stats.followUp} icon={Clock} description="Contact required" />
      </section>

      <section className="ops-highlight">
        <div className="ops-highlight-icon"><UserCheck size={23} /></div>
        <div>
          <strong>{stats.converted} students enrolled</strong>
          <p>Leads marked as Converted in your bookings sheet.</p>
        </div>
        <TrendingUp size={24} />
      </section>

      <section className="ops-records">
        <div className="ops-section-heading">
          <div>
            <h2>Lead and Trial Management</h2>
            <p>Open a booking to update its status, assign a tutor or schedule follow-ups.</p>
          </div>
          <span>{filteredBookings.length} records</span>
        </div>

        <div className="ops-tabs">
          {["All", "Unassigned", "Upcoming", "Follow-ups"].map(tab => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="ops-controls">
          <div className="ops-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search parent, student, phone, tutor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="ops-filter">
            <Filter size={17} />
            <select value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="All">All statuses</option>
              {STATUSES.map(status => <option key={status}>{status}</option>)}
            </select>
          </div>
        </div>

        <div className="ops-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Parent / Student</th>
                <th>Phone</th>
                <th>Trial Date</th>
                <th>Time</th>
                <th>Tutor</th>
                <th>Status</th>
                <th>Follow-up</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && bookings.length === 0 ? (
                <tr><td colSpan="8" className="ops-empty">Loading bookings...</td></tr>
              ) : filteredBookings.length === 0 ? (
                <tr><td colSpan="8" className="ops-empty">No matching bookings found.</td></tr>
              ) : filteredBookings.map((booking, index) => (
                <tr key={`${booking.Phone}-${booking.Date}-${index}`}>
                  <td>
                    <strong>{booking["Parent Name"] || "—"}</strong>
                    <small className="ops-subtext">{booking["Student Name"] || "—"} · {booking.Grade || "—"}</small>
                  </td>
                  <td>
                    {booking.Phone ? (
                      <a className="ops-phone" href={`tel:${cleanPhone(booking.Phone)}`}>
                        <Phone size={13} /> {booking.Phone}
                      </a>
                    ) : "—"}
                  </td>
                  <td>{formatDate(booking["Class Date"])}</td>
                  <td>{booking["Class Time"] || "—"}</td>
                  <td>{booking["Assigned Tutor"] || <span className="ops-unassigned">Unassigned</span>}</td>
                  <td>
                    <span className={`ops-status ${getStatusClass(booking.Status || "New")}`}>
                      {booking.Status || "New"}
                    </span>
                  </td>
                  <td>{formatDate(booking["Follow-up Date"])}</td>
                  <td>
                    <div className="ops-actions">
                      <button title="Edit booking" onClick={() => openRecord(booking)}><FileText size={16} /></button>
                      <a title="WhatsApp parent" href={makeWhatsAppLink(booking.Phone, getWhatsAppMessage(booking))} target="_blank" rel="noreferrer"><MessageCircle size={16} /></a>
                      <button title="Confirm trial message" onClick={() => sendTrialMessage(booking)}><Bell size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ops-footer">
          <span>{lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString("en-KE")}` : "Waiting for data..."}</span>
          <span>Auto-refreshes every 30 seconds</span>
        </div>
      </section>

      {selected && (
        <div className="ops-modal-backdrop" onClick={() => setSelected(null)}>
          <section className="ops-modal" onClick={e => e.stopPropagation()}>
            <div className="ops-modal-heading">
              <div>
                <h2>Manage Booking</h2>
                <p>{selected["Student Name"]} · {selected["Parent Name"]}</p>
              </div>
              <button className="ops-close" onClick={() => setSelected(null)}><X size={20} /></button>
            </div>

            <div className="ops-contact-row">
              <a href={`tel:${cleanPhone(selected.Phone)}`} className="ops-contact-button">
                <Phone size={16} /> Call Parent
              </a>
              <a
                href={makeWhatsAppLink(selected.Phone, getWhatsAppMessage(selected))}
                target="_blank"
                rel="noreferrer"
                className="ops-contact-button ops-whatsapp"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
            </div>

            <div className="ops-form-grid">
              <label>
                Lead Status
                <select value={form.status} onChange={e => updateForm("status", e.target.value)}>
                  {STATUSES.map(status => <option key={status}>{status}</option>)}
                </select>
              </label>

              <label>
                Assign Tutor
                <select value={form.tutorId} onChange={e => updateForm("tutorId", e.target.value)}>
                  <option value="">Unassigned</option>
                  {tutors.filter(t => normalise(t.Active) !== "no" && normalise(t.Active) !== "false").map(tutor => (
                    <option key={tutor["Tutor ID"]} value={tutor["Tutor ID"]}>
                      {tutor["Tutor Name"]}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Trial Date
                <input type="date" value={String(form.classDate).slice(0, 10)} onChange={e => updateForm("classDate", e.target.value)} />
              </label>

              <label>
                Trial Time
                <input type="text" placeholder="e.g. 10:00 AM" value={form.classTime} onChange={e => updateForm("classTime", e.target.value)} />
              </label>

              <label>
                Trial Confirmation
                <select value={form.trialConfirmation} onChange={e => updateForm("trialConfirmation", e.target.value)}>
                  <option>Pending</option>
                  <option>Confirmed</option>
                  <option>Reschedule Requested</option>
                  <option>Rescheduled</option>
                  <option>Cancelled</option>
                  <option>Attended</option>
                  <option>Missed</option>
                </select>
              </label>

              <label>
                Next Follow-up Date
                <input type="date" value={String(form.followUpDate).slice(0, 10)} onChange={e => updateForm("followUpDate", e.target.value)} />
              </label>

              <label className="ops-full">
                Follow-up Notes
                <textarea
                  rows="4"
                  placeholder="Record parent feedback, questions, next steps..."
                  value={form.followUpNotes}
                  onChange={e => updateForm("followUpNotes", e.target.value)}
                />
              </label>
            </div>

            <div className="ops-modal-footer">
              <button className="ops-cancel" onClick={() => setSelected(null)}>Cancel</button>
              <button className="ops-save" onClick={saveRecord} disabled={saving}>
                <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </section>
        </div>
      )}

      <footer className="ops-page-footer">
        Tech Talk Hub · Operations Management
      </footer>
    </main>
  );
}

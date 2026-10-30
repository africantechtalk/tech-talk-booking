
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

function formatBookingDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatClassDate(value) {
  if (!value) return "—";

  // Apps Script may return a date-only value or an ISO timestamp.
  const dateString = String(value).trim();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
    ? new Date(`${dateString}T00:00:00`)
    : new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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
      setError(
        "Google Apps Script URL is missing. Check your Vercel environment variables."
      );
      setLoading(false);
      return;
    }

    const callbackName =
      `bookingCallback_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    let script;
    let timeout;
    let completed = false;

    const cleanup = () => {
      clearTimeout(timeout);
      delete window[callbackName];
      script?.remove();
    };

    const finishWithError = (message) => {
      if (completed) return;

      completed = true;
      cleanup();
      setError(message);
      setLoading(false);
    };

    window[callbackName] = (result) => {
      if (completed) return;

      completed = true;
      cleanup();

      if (result?.error || result?.success === false) {
        setError(result.error || "Unable to retrieve bookings.");
      } else if (!Array.isArray(result?.bookings)) {
        setError("Unexpected response from Google Sheets.");
      } else {
        setBookings(result.bookings);
        setLastUpdated(new Date());
        setError("");
      }

      setLoading(false);
    };

    script = document.createElement("script");

    script.src =
      `${SCRIPT_URL}?callback=${callbackName}&_=${Date.now()}`;

    script.onerror = () => {
      finishWithError(
        "Unable to load bookings. Check your Apps Script deployment and URL."
      );
    };

    timeout = setTimeout(() => {
      finishWithError("Request timed out. Please try refreshing.");
    }, 15000);

    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    loadBookings();

    const interval = setInterval(loadBookings, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [loadBookings]);

  const stats = useMemo(() => {
    const count = (status) =>
      bookings.filter(
        (booking) =>
          normalise(booking.Status) === normalise(status)
      ).length;

    return {
      total: bookings.length,
      newLeads: count("New"),
      trialBooked: count("Trial Booked"),
      trialAttended: count("Trial Attended"),
      converted: count("Converted"),
      followUp:
        count("Follow-up") +
        count("Contacted") +
        count("Interested"),
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const term = normalise(search);

    return bookings
      .filter((booking) => {
        const matchesFilter =
          filter === "All" ||
          normalise(booking.Status) === normalise(filter);

        const matchesSearch = [
          booking["Parent Name"],
          booking["Student Name"],
          booking.Phone,
          booking.Grade,
          booking["Class Date"],
          booking["Class Time"],
          booking.Status,
        ].some((value) => normalise(value).includes(term));

        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => {
        return (
          new Date(b.Date).getTime() -
          new Date(a.Date).getTime()
        );
      });
  }, [bookings, filter, search]);

  const getStatusClass = (status) =>
    normalise(status).replace(/\s+/g, "-");

  const handleRefresh = () => {
    setLoading(true);
    setError("");
    loadBookings();
  };

  return (
    <main className="marketer-page">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <div className="dashboard-brand">TECH TALK HUB</div>

          <h1>Marketing Dashboard</h1>

          <p>
            Track bookings, trial classes and student enrolments.
          </p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? "spinning" : ""}
          />
          Refresh
        </button>
      </header>

      {/* Error message */}
      {error && (
        <div className="dashboard-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Statistics */}
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

      {/* Enrollment highlight */}
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

      {/* Booking records */}
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

        {/* Search and filter */}
        <div className="booking-controls">
          <div className="search-box">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search parent, child, phone or date..."
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

        {/* Table */}
        <div className="table-wrapper">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Parent</th>
                <th>Student</th>
                <th>Phone</th>
                <th>Grade</th>
                <th>Preferred Date</th>
                <th>Preferred Time</th>
                <th>Status</th>
                <th>Booking Date</th>
              </tr>
            </thead>

            <tbody>
              {loading && bookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    Loading bookings...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    {search || filter !== "All"
                      ? "No bookings match your search or filter."
                      : "No bookings found."}
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking, index) => (
                  <tr
                    key={`${booking.Phone}-${booking.Date}-${index}`}
                  >
                    <td className="parent-cell">
                      {booking["Parent Name"] || "—"}
                    </td>

                    <td>
                      <strong>
                        {booking["Student Name"] || "—"}
                      </strong>
                    </td>

                    <td>
                      {booking.Phone ? (
                        <a
                          className="phone-link"
                          href={`tel:${String(booking.Phone).replace(
                            /[^\d+]/g,
                            ""
                          )}`}
                        >
                          <Phone size={13} />
                          {booking.Phone}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td>{booking.Grade || "—"}</td>

                    <td>
                      {formatClassDate(booking["Class Date"])}
                    </td>

                    <td>{booking["Class Time"] || "—"}</td>

                    <td>
                      <span
                        className={`status-pill ${getStatusClass(
                          booking.Status || "New"
                        )}`}
                      >
                        {booking.Status || "New"}
                      </span>
                    </td>

                    <td>{formatBookingDate(booking.Date)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="table-footer">
          <span>
            {lastUpdated
              ? `Last updated: ${lastUpdated.toLocaleTimeString("en-KE")}`
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


// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   Users,
//   UserCheck,
//   CalendarCheck,
//   Clock,
//   Search,
//   RefreshCw,
//   TrendingUp,
//   Phone,
//   Filter,
//   CheckCircle2,
//   AlertCircle,
// } from "lucide-react";
// import "./MarketerDashboard.css";

// const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

// const STATUSES = [
//   "New",
//   "Contacted",
//   "Interested",
//   "Trial Booked",
//   "Trial Attended",
//   "Follow-up",
//   "Converted",
//   "Lost",
// ];

// const normalise = (value) =>
//   String(value ?? "").trim().toLowerCase();

// function StatCard({ title, value, icon: Icon, description }) {
//   return (
//     <div className="stat-card">
//       <div className="stat-card-top">
//         <span>{title}</span>
//         <div className="stat-icon">
//           <Icon size={21} />
//         </div>
//       </div>
//       <strong>{value}</strong>
//       <small>{description}</small>
//     </div>
//   );
// }

// export default function MarketerDashboard() {
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [search, setSearch] = useState("");
//   const [filter, setFilter] = useState("All");
//   const [lastUpdated, setLastUpdated] = useState(null);

//   const loadBookings = useCallback(() => {
//     if (!SCRIPT_URL) {
//       setError("Google Apps Script URL is missing. Check your Vercel environment variables.");
//       setLoading(false);
//       return;
//     }

//     const callbackName =
//       `bookingCallback_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

//     let script;
//     let timeout;

//     const cleanup = () => {
//       clearTimeout(timeout);
//       delete window[callbackName];
//       script?.remove();
//     };

//     window[callbackName] = (result) => {
//       cleanup();

//       if (result?.error || result?.success === false) {
//         setError(result.error || "Unable to retrieve bookings.");
//       } else if (!Array.isArray(result?.bookings)) {
//         setError("Unexpected response from Google Sheets.");
//       } else {
//         setBookings(result.bookings);
//         setLastUpdated(new Date());
//         setError("");
//       }

//       setLoading(false);
//     };

//     script = document.createElement("script");

//     script.src =
//       `${SCRIPT_URL}?callback=${callbackName}&_=${Date.now()}`;

//     script.onerror = () => {
//       cleanup();
//       setError("Unable to load bookings. Check your Apps Script deployment and URL.");
//       setLoading(false);
//     };

//     timeout = setTimeout(() => {
//       cleanup();
//       setError("Request timed out. Please try refreshing.");
//       setLoading(false);
//     }, 15000);

//     document.body.appendChild(script);
//   }, []);

//   useEffect(() => {
//     loadBookings();

//     const interval = setInterval(loadBookings, 30000);

//     return () => clearInterval(interval);
//   }, [loadBookings]);

//   const stats = useMemo(() => {
//     const count = (status) =>
//       bookings.filter(
//         (booking) => normalise(booking.Status) === normalise(status)
//       ).length;

//     return {
//       total: bookings.length,
//       newLeads: count("New"),
//       trialBooked: count("Trial Booked"),
//       trialAttended: count("Trial Attended"),
//       converted: count("Converted"),
//       followUp:
//         count("Follow-up") +
//         count("Contacted") +
//         count("Interested"),
//     };
//   }, [bookings]);

//   const filteredBookings = useMemo(() => {
//     return bookings
//       .filter((booking) => {
//         const matchesFilter =
//           filter === "All" ||
//           normalise(booking.Status) === normalise(filter);

//         const term = normalise(search);

//         const matchesSearch = [
//           booking["Parent Name"],
//           booking["Student Name"],
//           booking.Phone,
//           booking.Grade,
//         ].some((value) => normalise(value).includes(term));

//         return matchesFilter && matchesSearch;
//       })
//       .sort((a, b) => {
//         return new Date(b.Date).getTime() -
//           new Date(a.Date).getTime();
//       });
//   }, [bookings, filter, search]);

//   const getStatusClass = (status) =>
//     normalise(status).replace(/\s+/g, "-");

//   const formatDate = (value) => {
//     if (!value) return "—";

//     const date = new Date(value);

//     return Number.isNaN(date.getTime())
//       ? String(value)
//       : date.toLocaleString("en-KE", {
//           dateStyle: "medium",
//           timeStyle: "short",
//         });
//   };

//   const handleRefresh = () => {
//     setLoading(true);
//     loadBookings();
//   };

//   return (
//     <main className="marketer-page">
//       <header className="dashboard-header">
//         <div>
//           <div className="dashboard-brand">TECH TALK HUB</div>
//           <h1>Marketing Dashboard</h1>
//           <p>Track bookings, trial classes and student enrolments.</p>
//         </div>

//         <button
//           type="button"
//           className="refresh-button"
//           onClick={handleRefresh}
//           disabled={loading}
//         >
//           <RefreshCw
//             size={17}
//             className={loading ? "spinning" : ""}
//           />
//           Refresh
//         </button>
//       </header>

//       {error && (
//         <div className="dashboard-error">
//           <AlertCircle size={18} />
//           {error}
//         </div>
//       )}

//       <section className="stats-grid">
//         <StatCard
//           title="Total Bookings"
//           value={stats.total}
//           icon={Users}
//           description="All registrations received"
//         />

//         <StatCard
//           title="New Leads"
//           value={stats.newLeads}
//           icon={TrendingUp}
//           description="Awaiting contact"
//         />

//         <StatCard
//           title="Trials Booked"
//           value={stats.trialBooked}
//           icon={CalendarCheck}
//           description="Trial sessions scheduled"
//         />

//         <StatCard
//           title="Trials Attended"
//           value={stats.trialAttended}
//           icon={CheckCircle2}
//           description="Completed trial sessions"
//         />

//         <StatCard
//           title="Enrolled Students"
//           value={stats.converted}
//           icon={UserCheck}
//           description="Successfully converted"
//         />

//         <StatCard
//           title="Follow-ups"
//           value={stats.followUp}
//           icon={Clock}
//           description="Contact and follow-up needed"
//         />
//       </section>

//       <section className="enrollment-highlight">
//         <div className="enrollment-icon">
//           <UserCheck size={24} />
//         </div>

//         <div>
//           <strong>{stats.converted} students enrolled</strong>
//           <p>
//             These are leads marked as Converted in the bookings sheet.
//           </p>
//         </div>

//         <TrendingUp size={25} className="enrollment-trend" />
//       </section>

//       <section className="bookings-section">
//         <div className="section-heading">
//           <div>
//             <h2>Booking Records</h2>
//             <p>View and track every parent registration.</p>
//           </div>

//           <span className="record-count">
//             {filteredBookings.length} records
//           </span>
//         </div>

//         <div className="booking-controls">
//           <div className="search-box">
//             <Search size={18} />

//             <input
//               type="search"
//               placeholder="Search parent, child or phone..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//           </div>

//           <div className="filter-box">
//             <Filter size={17} />

//             <select
//               value={filter}
//               onChange={(e) => setFilter(e.target.value)}
//             >
//               <option value="All">All statuses</option>

//               {STATUSES.map((status) => (
//                 <option key={status} value={status}>
//                   {status}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div className="table-wrapper">
//           <table className="bookings-table">
//             <thead>
//               <tr>
//                 <th>Parent</th>
//                 <th>Student</th>
//                 <th>Phone</th>
//                 <th>Age</th>
//                 <th>Grade</th>
//                 <th>Preferred Time</th>
//                 <th>Status</th>
//                 <th>Booking Date</th>
//               </tr>
//             </thead>

//             <tbody>
//               {loading && bookings.length === 0 ? (
//                 <tr>
//                   <td colSpan="8" className="empty-state">
//                     Loading bookings...
//                   </td>
//                 </tr>
//               ) : filteredBookings.length === 0 ? (
//                 <tr>
//                   <td colSpan="8" className="empty-state">
//                     No bookings found.
//                   </td>
//                 </tr>
//               ) : (
//                 filteredBookings.map((booking, index) => (
//                   <tr key={`${booking.Phone}-${booking.Date}-${index}`}>
//                     <td className="parent-cell">
//                       {booking["Parent Name"] || "—"}
//                     </td>

//                     <td>
//                       <strong>
//                         {booking["Student Name"] || "—"}
//                       </strong>
//                     </td>

//                     <td>
//                       {booking.Phone ? (
//                         <a
//                           className="phone-link"
//                           href={`tel:${booking.Phone}`}
//                         >
//                           <Phone size={13} />
//                           {booking.Phone}
//                         </a>
//                       ) : (
//                         "—"
//                       )}
//                     </td>

//                     <td>{booking.Age || "—"}</td>

//                     <td>{booking.Grade || "—"}</td>

//                     <td>{booking["Class Time"] || "—"}</td>

//                     <td>
//                       <span
//                         className={`status-pill ${getStatusClass(
//                           booking.Status || "New"
//                         )}`}
//                       >
//                         {booking.Status || "New"}
//                       </span>
//                     </td>

//                     <td>{formatDate(booking.Date)}</td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         <div className="table-footer">
//           <span>
//             {lastUpdated
//               ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
//               : "Waiting for data..."}
//           </span>

//           <span>Automatically refreshes every 30 seconds</span>
//         </div>
//       </section>

//       <footer className="dashboard-footer">
//         Tech Talk Hub · Marketing Performance
//       </footer>
//     </main>
//   );
// }

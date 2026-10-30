
import { useState } from "react";
import {
  Code2,
  User,
  Phone,
  CalendarDays,
  Clock,
  GraduationCap,
  Laptop,
  ShieldCheck,
  Star,
  Users,
  ChevronRight,
  Check,
  Lock,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import "./App.css";

const grades = [
  {
    id: "K - Grade 3",
    description: "Start with the basics of logic, games and creative projects.",
    emoji: "👦",
    color: "green",
  },
  {
    id: "Grades 4 - 6",
    description: "Build real coding skills and create fun projects like games and apps.",
    emoji: "👧",
    color: "blue",
  },
  {
    id: "Grades 7 - 9",
    description: "Explore advanced coding, web development and problem solving.",
    emoji: "🧑",
    color: "purple",
  },
  {
    id: "Grades 10 - 12",
    description: "Work on real-world projects, prepare for future careers and build a portfolio.",
    emoji: "👨",
    color: "orange",
  },
];

const classTimes = [
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
];

const initialForm = {
  parentName: "",
  phone: "",
  studentName: "",
  classDate: "",
  classTime: "",
};

const getRecommendedGrade = (age) => {
  const childAge = Number(age);

  if (childAge <= 8) return "K - Grade 3";
  if (childAge <= 11) return "Grades 4 - 6";
  if (childAge <= 14) return "Grades 7 - 9";
  return "Grades 10 - 12";
};

const getTodayDate = () => {
  const today = new Date();

  return `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

const formatClassDate = (date) => {
  if (!date) return "";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

function App() {
  const [step, setStep] = useState(1);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [showHelp, setShowHelp] = useState(false);
  const [helpAge, setHelpAge] = useState("");

  const updateForm = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const chooseGrade = (grade) => {
    setSelectedGrade(grade);
    setStep(2);
    setError("");
  };

  const recommendedGrade = helpAge
    ? getRecommendedGrade(helpAge)
    : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!SCRIPT_URL) {
      setError(
        "Booking service is not configured. Please contact us on WhatsApp."
      );
      return;
    }

    if (!selectedGrade) {
      setError("Please select your child's grade.");
      setStep(1);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        parentName: form.parentName.trim(),
        phone: form.phone.trim(),
        studentName: form.studentName.trim(),
        grade: selectedGrade,
        classDate: form.classDate,
        classTime: form.classTime,
      };

      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      // A no-cors response is opaque; the browser cannot verify
      // whether Google Apps Script saved the booking.
      if (response.type === "opaque") {
        setSubmitted(true);
      } else if (response.ok) {
        const result = await response.json();

        if (result.success) {
          setSubmitted(true);
        } else {
          throw new Error(result.error || "Booking could not be saved.");
        }
      } else {
        throw new Error("Unable to submit your booking.");
      }
    } catch (err) {
      setError(
        "We couldn't confirm your submission. Please try again or contact us on WhatsApp."
      );
    } finally {
      setLoading(false);
    }
  };

  const whatsappLink =
    "https://wa.me/254704494504?text=" +
    encodeURIComponent(
      "Hi Tech Talk Hub, I would like to book a free trial coding class."
    );

  const confirmationWhatsappLink =
    "https://wa.me/254704494504?text=" +
    encodeURIComponent(
      `Hi Tech Talk Hub, I have submitted a free trial booking.\n\nParent: ${form.parentName}\nChild: ${form.studentName}\nGrade: ${selectedGrade}\nPreferred Date: ${formatClassDate(form.classDate)}\nPreferred Time: ${form.classTime}`
    );

  return (
    <main className="booking-page">
      <div className="booking-container">

        {/* BRAND */}
        <header
          className="brand"
          style={{ marginBottom: "12px", gap: "10px" }}
        >
          <div className="brand-icon">
            <Code2 size={40} strokeWidth={3} />
          </div>

          <div>
            <h1>Tech Talk Hub</h1>
            <p>Code · Create · Build · Grow</p>
          </div>
        </header>

        {/* PROGRESS */}
        <div className="progress" style={{ marginBottom: "16px" }}>
          <div
            className={`progress-step ${
              step === 1 ? "active" : "completed"
            }`}
          >
            <span className="progress-circle">
              {step === 1 ? "1" : <Check size={19} />}
            </span>
            <span>Choose Grade</span>
          </div>

          <div className="progress-line">
            <div className={step === 2 ? "line-filled" : ""}></div>
          </div>

          <div
            className={`progress-step ${
              step === 2 ? "active" : ""
            }`}
          >
            <span className="progress-circle">2</span>
            <span>Enter Details</span>
          </div>
        </div>

        {!submitted ? (
          <>
            {step === 1 ? (
              /* STEP 1: GRADE SELECTION */
              <section className="step-content">
                <div
                  className="intro"
                  style={{ marginBottom: "16px" }}
                >
                  <h2 style={{ marginBottom: "8px" }}>
                    Give Your Child a<br />
                    Confident Start in <span>Coding</span>
                  </h2>

                  <p style={{ marginBottom: "6px" }}>
                    Choose your child's grade level to get started
                    <br className="desktop-break" />
                    with a free trial class.
                  </p>

                  <p style={{ marginBottom: "0" }}>
                    <strong>
                      Free trials are live online sessions with a real instructor.
                    </strong>{" "}
                    Your child gets to interact, learn and try coding firsthand.
                  </p>
                </div>

                {/* COMPACT GRADE CARDS */}
                <div
                  className="grade-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "12px",
                    marginBottom: "14px",
                  }}
                >
                  {grades.map((grade) => (
                    <button
                      type="button"
                      key={grade.id}
                      className={`grade-card ${grade.color}`}
                      onClick={() => chooseGrade(grade.id)}
                      style={{
                        minHeight: "145px",
                        padding: "14px",
                        gap: "6px",
                      }}
                    >
                      <span className="grade-emoji">
                        {grade.emoji}
                      </span>

                      <span className="grade-title">
                        {grade.id}
                      </span>

                      <ChevronRight
                        className="grade-arrow"
                        size={20}
                      />

                      <span className="grade-description">
                        {grade.description}
                      </span>
                    </button>
                  ))}
                </div>

                {/* HELP ME CHOOSE */}
                <div
                  className="grade-help"
                  style={{ marginTop: "10px" }}
                >
                  <p style={{ marginBottom: "5px" }}>
                    Not sure which level is right for your child?
                  </p>

                  <button
                    type="button"
                    className="help-toggle"
                    onClick={() => setShowHelp(!showHelp)}
                  >
                    {showHelp ? "Close" : "Help me choose"}
                  </button>

                  {showHelp && (
                    <div className="help-panel">
                      <label htmlFor="helpAge">
                        How old is your child?
                      </label>

                      <select
                        id="helpAge"
                        value={helpAge}
                        onChange={(e) => setHelpAge(e.target.value)}
                      >
                        <option value="">Select child's age</option>

                        {Array.from(
                          { length: 14 },
                          (_, i) => i + 5
                        ).map((age) => (
                          <option key={age} value={age}>
                            {age} years
                          </option>
                        ))}
                      </select>

                      {helpAge && (
                        <div className="recommendation">
                          <p>
                            Based on your child's age, we recommend:
                          </p>

                          <strong>{recommendedGrade}</strong>

                          <small>
                            This is a starting recommendation.
                            Our team can confirm the appropriate
                            learning level during the free trial.
                          </small>

                          <button
                            type="button"
                            className="recommendation-button"
                            onClick={() =>
                              chooseGrade(recommendedGrade)
                            }
                          >
                            Continue with this level
                            <ArrowRight size={17} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <a
                    className="help-whatsapp"
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle size={16} />
                    Need assistance? Chat with us
                  </a>
                </div>
              </section>
            ) : (
              /* STEP 2: BOOKING DETAILS */
              <section className="step-content details-content">
                <div className="intro">
                  <h2>Great! Let's Get Started</h2>

                  <p>
                    Fill in the form below to book your child's free trial class
                    <br className="desktop-break" />
                    for <span>{selectedGrade}</span>.
                  </p>

                  <p>
                    <strong>
                      This is a live online class with a Tech Talk Hub instructor.
                    </strong>{" "}
                    Your child will interact directly with the instructor during the session.
                  </p>
                </div>

                <form
                  className="booking-form"
                  onSubmit={handleSubmit}
                >
                  <div className="selected-grade">
                    <GraduationCap size={43} />

                    <div>
                      <small>Selected Grade</small>
                      <strong>{selectedGrade}</strong>
                    </div>

                    <button
                      type="button"
                      className="edit-button"
                      onClick={() => setStep(1)}
                    >
                      Edit
                    </button>
                  </div>

                  <div className="form-fields">
                    <label htmlFor="parentName">
                      Parent's Name <b>*</b>
                    </label>

                    <div className="input-wrap">
                      <User />
                      <input
                        id="parentName"
                        name="parentName"
                        value={form.parentName}
                        onChange={updateForm}
                        placeholder="Enter your name"
                        autoComplete="name"
                        required
                      />
                    </div>

                    <label htmlFor="phone">
                      Phone Number <b>*</b>
                    </label>

                    <div className="input-wrap">
                      <Phone />
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={updateForm}
                        placeholder="Enter your phone number"
                        autoComplete="tel"
                        required
                      />
                    </div>

                    <label htmlFor="studentName">
                      Student's Name <b>*</b>
                    </label>

                    <div className="input-wrap">
                      <User />
                      <input
                        id="studentName"
                        name="studentName"
                        value={form.studentName}
                        onChange={updateForm}
                        placeholder="Enter your child's name"
                        required
                      />
                    </div>

                    <label htmlFor="classDate">
                      Preferred Class Date <b>*</b>
                    </label>

                    <div className="input-wrap">
                      <CalendarDays />
                      <input
                        id="classDate"
                        name="classDate"
                        type="date"
                        min={getTodayDate()}
                        value={form.classDate}
                        onChange={updateForm}
                        required
                      />
                    </div>

                    <label htmlFor="classTime">
                      Preferred Class Time <b>*</b>
                    </label>

                    <div className="input-wrap">
                      <Clock />

                      <select
                        id="classTime"
                        name="classTime"
                        value={form.classTime}
                        onChange={updateForm}
                        required
                      >
                        <option value="">Select a time</option>

                        {classTimes.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {error && (
                    <p className="error-message" role="alert">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="submit-button"
                    disabled={loading}
                  >
                    {loading
                      ? "Submitting..."
                      : "Book Free Trial Class"}

                    {!loading && <ArrowRight size={20} />}
                  </button>

                  <div className="or-divider">
                    <span></span> OR <span></span>
                  </div>

                  <a
                    className="whatsapp-button"
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle size={25} />

                    <div>
                      <strong>Chat with Us on WhatsApp</strong>
                      <small>
                        Have questions? We're here to help!
                      </small>
                    </div>
                  </a>

                  <div className="privacy-note">
                    <Lock size={15} />

                    <span>
                      Your information is used for class booking
                      and communication.
                    </span>
                  </div>
                </form>
              </section>
            )}
          </>
        ) : (
          /* SUCCESS MESSAGE */
          <section className="success-content">
            <div className="success-icon">
              <Check size={40} />
            </div>

            <h2>Booking Received!</h2>

            <p>
              Thank you, {form.parentName}. We've received your request
              for {form.studentName}'s free trial coding class.
            </p>

            <p>
              <strong>Selected Grade:</strong> {selectedGrade}
              <br />
              <strong>Preferred Date:</strong> {formatClassDate(form.classDate)}
              <br />
              <strong>Preferred Time:</strong> {form.classTime}
            </p>

            <p>
              Our team will contact you shortly to confirm the class.
              Your trial will be a live online session with an instructor.
            </p>

            <a
              href={confirmationWhatsappLink}
              className="submit-button"
              target="_blank"
              rel="noreferrer"
            >
              Chat with Us on WhatsApp
            </a>
          </section>
        )}

        {/* TRUST FEATURES */}
        <div className="trust-features">
          <div>
            <Laptop />
            <span>
              Live Online<br />Classes
            </span>
          </div>

          <div>
            <ShieldCheck />
            <span>
              Experienced<br />Tutors
            </span>
          </div>

          <div>
            <Star />
            <span>
              Project-Based<br />Learning
            </span>
          </div>

          <div>
            <Users />
            <span>
              Small<br />Class Sizes
            </span>
          </div>
        </div>

        <footer>
          Tech Talk Hub <span>|</span> Learn Today. Build Tomorrow.
        </footer>
      </div>
    </main>
  );
}

export default App;

// import { useState } from "react";
// import {
//   Code2,
//   User,
//   Phone,
//   CalendarDays,
//   Clock,
//   GraduationCap,
//   Laptop,
//   ShieldCheck,
//   Star,
//   Users,
//   ChevronRight,
//   Check,
//   Lock,
//   ArrowRight,
//   MessageCircle,
// } from "lucide-react";
// import "./App.css";

// const grades = [
//   {
//     id: "K - Grade 3",
//     description: "Start with the basics of logic, games and creative projects.",
//     emoji: "👦",
//     color: "green",
//   },
//   {
//     id: "Grades 4 - 6",
//     description: "Build real coding skills and create fun projects like games and apps.",
//     emoji: "👧",
//     color: "blue",
//   },
//   {
//     id: "Grades 7 - 9",
//     description: "Explore advanced coding, web development and problem solving.",
//     emoji: "🧑",
//     color: "purple",
//   },
//   {
//     id: "Grades 10 - 12",
//     description: "Work on real-world projects, prepare for future careers and build a portfolio.",
//     emoji: "👨",
//     color: "orange",
//   },
// ];

// const classTimes = [
//   "7:00 AM",
//   "8:00 AM",
//   "9:00 AM",
//   "10:00 AM",
//   "11:00 AM",
//   "12:00 PM",
//   "1:00 PM",
//   "2:00 PM",
//   "3:00 PM",
//   "4:00 PM",
//   "5:00 PM",
//   "6:00 PM",
//   "7:00 PM",
//   "Other / Flexible",
// ];

// const initialForm = {
//   parentName: "",
//   phone: "",
//   studentName: "",
//   classDate: "",
//   classTime: "",
// };

// const getRecommendedGrade = (age) => {
//   const childAge = Number(age);

//   if (childAge <= 8) return "K - Grade 3";
//   if (childAge <= 11) return "Grades 4 - 6";
//   if (childAge <= 14) return "Grades 7 - 9";
//   return "Grades 10 - 12";
// };

// const getTodayDate = () => {
//   const today = new Date();

//   return `${today.getFullYear()}-${String(
//     today.getMonth() + 1
//   ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
// };

// const formatClassDate = (date) => {
//   if (!date) return "";

//   return new Date(`${date}T00:00:00`).toLocaleDateString("en-KE", {
//     day: "numeric",
//     month: "long",
//     year: "numeric",
//   });
// };

// const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

// function App() {
//   const [step, setStep] = useState(1);
//   const [selectedGrade, setSelectedGrade] = useState("");
//   const [form, setForm] = useState(initialForm);
//   const [loading, setLoading] = useState(false);
//   const [submitted, setSubmitted] = useState(false);
//   const [error, setError] = useState("");

//   const [showHelp, setShowHelp] = useState(false);
//   const [helpAge, setHelpAge] = useState("");

//   const updateForm = (e) => {
//     setForm((previous) => ({
//       ...previous,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const chooseGrade = (grade) => {
//     setSelectedGrade(grade);
//     setStep(2);
//     setError("");
//   };

//   const recommendedGrade = helpAge
//     ? getRecommendedGrade(helpAge)
//     : "";

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     if (!SCRIPT_URL) {
//       setError(
//         "Booking service is not configured. Please contact us on WhatsApp."
//       );
//       return;
//     }

//     if (!selectedGrade) {
//       setError("Please select your child's grade.");
//       setStep(1);
//       return;
//     }

//     setLoading(true);

//     try {
//       const payload = {
//         parentName: form.parentName.trim(),
//         phone: form.phone.trim(),
//         studentName: form.studentName.trim(),
//         grade: selectedGrade,
//         classDate: form.classDate,
//         classTime: form.classTime,
//       };

//       const response = await fetch(SCRIPT_URL, {
//         method: "POST",
//         mode: "no-cors",
//         headers: {
//           "Content-Type": "text/plain;charset=utf-8",
//         },
//         body: JSON.stringify(payload),
//       });

//       // no-cors responses are opaque, so the browser cannot verify
//       // whether Google Apps Script successfully saved the booking.
//       if (response.type === "opaque") {
//         setSubmitted(true);
//       } else if (response.ok) {
//         const result = await response.json();

//         if (result.success) {
//           setSubmitted(true);
//         } else {
//           throw new Error(result.error || "Booking could not be saved.");
//         }
//       } else {
//         throw new Error("Unable to submit your booking.");
//       }
//     } catch (err) {
//       setError(
//         "We couldn't confirm your submission. Please try again or contact us on WhatsApp."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const whatsappLink =
//     "https://wa.me/254704494504?text=" +
//     encodeURIComponent(
//       "Hi Tech Talk Hub, I would like to book a free trial coding class."
//     );

//   const confirmationWhatsappLink =
//     "https://wa.me/254704494504?text=" +
//     encodeURIComponent(
//       `Hi Tech Talk Hub, I have submitted a free trial booking.\n\nParent: ${form.parentName}\nChild: ${form.studentName}\nGrade: ${selectedGrade}\nPreferred Date: ${formatClassDate(form.classDate)}\nPreferred Time: ${form.classTime}`
//     );

//   return (
//     <main className="booking-page">
//       <div className="booking-container">

//         {/* BRAND */}
//         <header className="brand">
//           <div className="brand-icon">
//             <Code2 size={48} strokeWidth={3} />
//           </div>

//           <div>
//             <h1>Tech Talk Hub</h1>
//             <p>Code · Create · Build · Grow</p>
//           </div>
//         </header>

//         {/* PROGRESS */}
//         <div className="progress">
//           <div
//             className={`progress-step ${
//               step === 1 ? "active" : "completed"
//             }`}
//           >
//             <span className="progress-circle">
//               {step === 1 ? "1" : <Check size={19} />}
//             </span>
//             <span>Choose Grade</span>
//           </div>

//           <div className="progress-line">
//             <div className={step === 2 ? "line-filled" : ""}></div>
//           </div>

//           <div
//             className={`progress-step ${
//               step === 2 ? "active" : ""
//             }`}
//           >
//             <span className="progress-circle">2</span>
//             <span>Enter Details</span>
//           </div>
//         </div>

//         {!submitted ? (
//           <>
//             {step === 1 ? (

//               /* STEP 1: GRADE SELECTION */

//               <section className="step-content">
//                 <div className="intro">
//                   <h2>
//                     Give Your Child a<br />
//                     Confident Start in <span>Coding</span>
//                   </h2>

//                   <p>
//                     Choose your child's grade level to get started
//                     <br className="desktop-break" />
//                     with a free trial class.
//                   </p>

//                   <p>
//                     <strong>
//                       Free trials are live online sessions with a real instructor.
//                     </strong>
//                     Your child gets to interact, learn and try coding firsthand.
//                   </p>
//                 </div>

//                 {/* GRADE CARDS */}
//                 <div className="grade-grid">
//                   {grades.map((grade) => (
//                     <button
//                       type="button"
//                       key={grade.id}
//                       className={`grade-card ${grade.color}`}
//                       onClick={() => chooseGrade(grade.id)}
//                     >
//                       <span className="grade-emoji">
//                         {grade.emoji}
//                       </span>

//                       <span className="grade-title">
//                         {grade.id}
//                       </span>

//                       <ChevronRight
//                         className="grade-arrow"
//                         size={23}
//                       />

//                       <span className="grade-description">
//                         {grade.description}
//                       </span>
//                     </button>
//                   ))}
//                 </div>

//                 {/* HELP ME CHOOSE */}
//                 <div className="grade-help">
//                   <p>
//                     Not sure which level is right for your child?
//                   </p>

//                   <button
//                     type="button"
//                     className="help-toggle"
//                     onClick={() => setShowHelp(!showHelp)}
//                   >
//                     {showHelp ? "Close" : "Help me choose"}
//                   </button>

//                   {showHelp && (
//                     <div className="help-panel">
//                       <label htmlFor="helpAge">
//                         How old is your child?
//                       </label>

//                       <select
//                         id="helpAge"
//                         value={helpAge}
//                         onChange={(e) => setHelpAge(e.target.value)}
//                       >
//                         <option value="">
//                           Select child's age
//                         </option>

//                         {Array.from(
//                           { length: 14 },
//                           (_, i) => i + 5
//                         ).map((age) => (
//                           <option key={age} value={age}>
//                             {age} years
//                           </option>
//                         ))}
//                       </select>

//                       {helpAge && (
//                         <div className="recommendation">
//                           <p>
//                             Based on your child's age, we recommend:
//                           </p>

//                           <strong>{recommendedGrade}</strong>

//                           <small>
//                             This is a starting recommendation.
//                             Our team can confirm the appropriate
//                             learning level during the free trial.
//                           </small>

//                           <button
//                             type="button"
//                             className="recommendation-button"
//                             onClick={() =>
//                               chooseGrade(recommendedGrade)
//                             }
//                           >
//                             Continue with this level
//                             <ArrowRight size={17} />
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   )}

//                   <a
//                     className="help-whatsapp"
//                     href={whatsappLink}
//                     target="_blank"
//                     rel="noreferrer"
//                   >
//                     <MessageCircle size={16} />
//                     Need assistance? Chat with us
//                   </a>
//                 </div>
//               </section>

//             ) : (

//               /* STEP 2: BOOKING DETAILS */

//               <section className="step-content details-content">
//                 <div className="intro">
//                   <h2>Great! Let's Get Started</h2>

//                   <p>
//                     Fill in the form below to book your child's free trial class
//                     <br className="desktop-break" />
//                     for <span>{selectedGrade}</span>.
//                   </p>

//                   <p>
//                     <strong>
//                       This is a live online class with a Tech Talk Hub instructor.
//                     </strong>
//                     Your child will interact directly with the instructor during the session.
//                   </p>
//                 </div>

//                 <form
//                   className="booking-form"
//                   onSubmit={handleSubmit}
//                 >
//                   <div className="selected-grade">
//                     <GraduationCap size={43} />

//                     <div>
//                       <small>Selected Grade</small>
//                       <strong>{selectedGrade}</strong>
//                     </div>

//                     <button
//                       type="button"
//                       className="edit-button"
//                       onClick={() => setStep(1)}
//                     >
//                       Edit
//                     </button>
//                   </div>

//                   <div className="form-fields">
//                     <label htmlFor="parentName">
//                       Parent's Name <b>*</b>
//                     </label>

//                     <div className="input-wrap">
//                       <User />
//                       <input
//                         id="parentName"
//                         name="parentName"
//                         value={form.parentName}
//                         onChange={updateForm}
//                         placeholder="Enter your name"
//                         autoComplete="name"
//                         required
//                       />
//                     </div>

//                     <label htmlFor="phone">
//                       Phone Number <b>*</b>
//                     </label>

//                     <div className="input-wrap">
//                       <Phone />
//                       <input
//                         id="phone"
//                         name="phone"
//                         type="tel"
//                         value={form.phone}
//                         onChange={updateForm}
//                         placeholder="Enter your phone number"
//                         autoComplete="tel"
//                         required
//                       />
//                     </div>

//                     <label htmlFor="studentName">
//                       Student's Name <b>*</b>
//                     </label>

//                     <div className="input-wrap">
//                       <User />
//                       <input
//                         id="studentName"
//                         name="studentName"
//                         value={form.studentName}
//                         onChange={updateForm}
//                         placeholder="Enter your child's name"
//                         required
//                       />
//                     </div>

//                     <label htmlFor="classDate">
//                       Preferred Class Date <b>*</b>
//                     </label>

//                     <div className="input-wrap">
//                       <CalendarDays />
//                       <input
//                         id="classDate"
//                         name="classDate"
//                         type="date"
//                         min={getTodayDate()}
//                         value={form.classDate}
//                         onChange={updateForm}
//                         required
//                       />
//                     </div>

//                     <label htmlFor="classTime">
//                       Preferred Class Time <b>*</b>
//                     </label>

//                     <div className="input-wrap">
//                       <Clock />

//                       <select
//                         id="classTime"
//                         name="classTime"
//                         value={form.classTime}
//                         onChange={updateForm}
//                         required
//                       >
//                         <option value="">Select a time</option>

//                         {classTimes.map((time) => (
//                           <option key={time} value={time}>
//                             {time}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>

//                   {error && (
//                     <p className="error-message" role="alert">
//                       {error}
//                     </p>
//                   )}

//                   <button
//                     type="submit"
//                     className="submit-button"
//                     disabled={loading}
//                   >
//                     {loading
//                       ? "Submitting..."
//                       : "Book Free Trial Class"}

//                     {!loading && <ArrowRight size={20} />}
//                   </button>

//                   <div className="or-divider">
//                     <span></span> OR <span></span>
//                   </div>

//                   <a
//                     className="whatsapp-button"
//                     href={whatsappLink}
//                     target="_blank"
//                     rel="noreferrer"
//                   >
//                     <MessageCircle size={25} />

//                     <div>
//                       <strong>Chat with Us on WhatsApp</strong>
//                       <small>
//                         Have questions? We're here to help!
//                       </small>
//                     </div>
//                   </a>

//                   <div className="privacy-note">
//                     <Lock size={15} />

//                     <span>
//                       Your information is used for class booking
//                       and communication.
//                     </span>
//                   </div>
//                 </form>
//               </section>
//             )}
//           </>
//         ) : (

//           /* SUCCESS MESSAGE */

//           <section className="success-content">
//             <div className="success-icon">
//               <Check size={40} />
//             </div>

//             <h2>Booking Received!</h2>

//             <p>
//               Thank you, {form.parentName}. We've received your request
//               for {form.studentName}'s free trial coding class.
//             </p>

//             <p>
//               <strong>Selected Grade:</strong> {selectedGrade}
//               <br />
//               <strong>Preferred Date:</strong> {formatClassDate(form.classDate)}
//               <br />
//               <strong>Preferred Time:</strong> {form.classTime}
//             </p>

//             <p>
//               Our team will contact you shortly to confirm the class.
//               Your trial will be a live online session with an instructor.
//             </p>

//             <a
//               href={confirmationWhatsappLink}
//               className="submit-button"
//               target="_blank"
//               rel="noreferrer"
//             >
//               Chat with Us on WhatsApp
//             </a>
//           </section>
//         )}

//         {/* TRUST FEATURES */}

//         <div className="trust-features">
//           <div>
//             <Laptop />
//             <span>
//               Live Online<br />Classes
//             </span>
//           </div>

//           <div>
//             <ShieldCheck />
//             <span>
//               Experienced<br />Tutors
//             </span>
//           </div>

//           <div>
//             <Star />
//             <span>
//               Project-Based<br />Learning
//             </span>
//           </div>

//           <div>
//             <Users />
//             <span>
//               Small<br />Class Sizes
//             </span>
//           </div>
//         </div>

//         <footer>
//           Tech Talk Hub <span>|</span> Learn Today. Build Tomorrow.
//         </footer>
//       </div>
//     </main>
//   );
// }

// export default App;


// import { useState } from "react";
// import {
//   Code2,
//   User,
//   Phone,
//   CalendarDays,
//   Clock,
//   GraduationCap,
//   Laptop,
//   ShieldCheck,
//   Star,
//   Users,
//   ChevronRight,
//   Check,
//   Lock,
//   ArrowRight,
//   MessageCircle,
// } from "lucide-react";
// import "./App.css";

// const grades = [
//   {
//     id: "K - Grade 3",
//     description: "Start with the basics of logic, games and creative projects.",
//     emoji: "👦",
//     color: "green",
//   },
//   {
//     id: "Grades 4 - 6",
//     description: "Build real coding skills and create fun projects like games and apps.",
//     emoji: "👧",
//     color: "blue",
//   },
//   {
//     id: "Grades 7 - 9",
//     description: "Explore advanced coding, web development and problem solving.",
//     emoji: "🧑",
//     color: "purple",
//   },
//   {
//     id: "Grades 10 - 12",
//     description: "Work on real-world projects, prepare for future careers and build a portfolio.",
//     emoji: "👨",
//     color: "orange",
//   },
// ];

// const initialForm = {
//   parentName: "",
//   phone: "",
//   studentName: "",
//   classDate: "",
//   classTime: "",
// };

// const getRecommendedGrade = (age) => {
//   const childAge = Number(age);

//   if (childAge <= 8) return "K - Grade 3";
//   if (childAge <= 11) return "Grades 4 - 6";
//   if (childAge <= 14) return "Grades 7 - 9";
//   return "Grades 10 - 12";
// };

// const getTodayDate = () => {
//   const today = new Date();

//   return `${today.getFullYear()}-${String(
//     today.getMonth() + 1
//   ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
// };

// const formatClassDate = (date) => {
//   if (!date) return "";

//   return new Date(`${date}T00:00:00`).toLocaleDateString("en-KE", {
//     day: "numeric",
//     month: "long",
//     year: "numeric",
//   });
// };

// const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

// function App() {
//   const [step, setStep] = useState(1);
//   const [selectedGrade, setSelectedGrade] = useState("");
//   const [form, setForm] = useState(initialForm);
//   const [loading, setLoading] = useState(false);
//   const [submitted, setSubmitted] = useState(false);
//   const [error, setError] = useState("");

//   const [showHelp, setShowHelp] = useState(false);
//   const [helpAge, setHelpAge] = useState("");

//   const updateForm = (e) => {
//     setForm((previous) => ({
//       ...previous,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const chooseGrade = (grade) => {
//     setSelectedGrade(grade);
//     setStep(2);
//     setError("");
//   };

//   const recommendedGrade = helpAge
//     ? getRecommendedGrade(helpAge)
//     : "";

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     if (!SCRIPT_URL) {
//       setError(
//         "Booking service is not configured. Please contact us on WhatsApp."
//       );
//       return;
//     }

//     if (!selectedGrade) {
//       setError("Please select your child's grade.");
//       setStep(1);
//       return;
//     }

//     setLoading(true);

//     try {
//       const payload = {
//         parentName: form.parentName.trim(),
//         phone: form.phone.trim(),
//         studentName: form.studentName.trim(),
//         grade: selectedGrade,
//         classDate: form.classDate,
//         classTime: form.classTime,
//       };

//       const response = await fetch(SCRIPT_URL, {
//         method: "POST",
//         mode: "no-cors",
//         headers: {
//           "Content-Type": "text/plain;charset=utf-8",
//         },
//         body: JSON.stringify(payload),
//       });

//       // no-cors responses are opaque, so the browser cannot verify
//       // whether Google Apps Script successfully saved the booking.
//       if (response.type === "opaque") {
//         setSubmitted(true);
//       } else if (response.ok) {
//         const result = await response.json();

//         if (result.success) {
//           setSubmitted(true);
//         } else {
//           throw new Error(result.error || "Booking could not be saved.");
//         }
//       } else {
//         throw new Error("Unable to submit your booking.");
//       }
//     } catch (err) {
//       setError(
//         "We couldn't confirm your submission. Please try again or contact us on WhatsApp."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const whatsappLink =
//     "https://wa.me/254704494504?text=" +
//     encodeURIComponent(
//       "Hi Tech Talk Hub, I would like to book a free trial coding class."
//     );

//   const confirmationWhatsappLink =
//     "https://wa.me/254704494504?text=" +
//     encodeURIComponent(
//       `Hi Tech Talk Hub, I have submitted a free trial booking.\n\nParent: ${form.parentName}\nChild: ${form.studentName}\nGrade: ${selectedGrade}\nPreferred Date: ${formatClassDate(form.classDate)}\nPreferred Time: ${form.classTime}`
//     );

//   return (
//     <main className="booking-page">
//       <div className="booking-container">

//         {/* BRAND */}
//         <header className="brand">
//           <div className="brand-icon">
//             <Code2 size={48} strokeWidth={3} />
//           </div>

//           <div>
//             <h1>Tech Talk Hub</h1>
//             <p>Code · Create · Build · Grow</p>
//           </div>
//         </header>

//         {/* PROGRESS */}
//         <div className="progress">
//           <div
//             className={`progress-step ${
//               step === 1 ? "active" : "completed"
//             }`}
//           >
//             <span className="progress-circle">
//               {step === 1 ? "1" : <Check size={19} />}
//             </span>
//             <span>Choose Grade</span>
//           </div>

//           <div className="progress-line">
//             <div className={step === 2 ? "line-filled" : ""}></div>
//           </div>

//           <div
//             className={`progress-step ${
//               step === 2 ? "active" : ""
//             }`}
//           >
//             <span className="progress-circle">2</span>
//             <span>Enter Details</span>
//           </div>
//         </div>

//         {!submitted ? (
//           <>
//             {step === 1 ? (

//               /* STEP 1: GRADE SELECTION */

//               <section className="step-content">
//                 <div className="intro">
//                   <h2>
//                     Give Your Child a<br />
//                     Confident Start in <span>Coding</span>
//                   </h2>

//                   <p>
//                     Choose your child's grade level to get started
//                     <br className="desktop-break" />
//                     with a free trial class.
//                   </p>
//                 </div>

//                 {/* GRADE CARDS */}
//                 <div className="grade-grid">
//                   {grades.map((grade) => (
//                     <button
//                       type="button"
//                       key={grade.id}
//                       className={`grade-card ${grade.color}`}
//                       onClick={() => chooseGrade(grade.id)}
//                     >
//                       <span className="grade-emoji">
//                         {grade.emoji}
//                       </span>

//                       <span className="grade-title">
//                         {grade.id}
//                       </span>

//                       <ChevronRight
//                         className="grade-arrow"
//                         size={23}
//                       />

//                       <span className="grade-description">
//                         {grade.description}
//                       </span>
//                     </button>
//                   ))}
//                 </div>

//                 {/* HELP ME CHOOSE */}
//                 <div className="grade-help">
//                   <p>
//                     Not sure which level is right for your child?
//                   </p>

//                   <button
//                     type="button"
//                     className="help-toggle"
//                     onClick={() => setShowHelp(!showHelp)}
//                   >
//                     {showHelp ? "Close" : "Help me choose"}
//                   </button>

//                   {showHelp && (
//                     <div className="help-panel">
//                       <label htmlFor="helpAge">
//                         How old is your child?
//                       </label>

//                       <select
//                         id="helpAge"
//                         value={helpAge}
//                         onChange={(e) => setHelpAge(e.target.value)}
//                       >
//                         <option value="">
//                           Select child's age
//                         </option>

//                         {Array.from(
//                           { length: 14 },
//                           (_, i) => i + 5
//                         ).map((age) => (
//                           <option key={age} value={age}>
//                             {age} years
//                           </option>
//                         ))}
//                       </select>

//                       {helpAge && (
//                         <div className="recommendation">
//                           <p>
//                             Based on your child's age, we recommend:
//                           </p>

//                           <strong>{recommendedGrade}</strong>

//                           <small>
//                             This is a starting recommendation.
//                             Our team can confirm the appropriate
//                             learning level during the free trial.
//                           </small>

//                           <button
//                             type="button"
//                             className="recommendation-button"
//                             onClick={() =>
//                               chooseGrade(recommendedGrade)
//                             }
//                           >
//                             Continue with this level
//                             <ArrowRight size={17} />
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   )}

//                   <a
//                     className="help-whatsapp"
//                     href={whatsappLink}
//                     target="_blank"
//                     rel="noreferrer"
//                   >
//                     <MessageCircle size={16} />
//                     Need assistance? Chat with us
//                   </a>
//                 </div>
//               </section>

//             ) : (

//               /* STEP 2: BOOKING DETAILS */

//               <section className="step-content details-content">
//                 <div className="intro">
//                   <h2>Great! Let's Get Started</h2>

//                   <p>
//                     Fill in the form below to book your child's free trial class
//                     <br className="desktop-break" />
//                     for <span>{selectedGrade}</span>.
//                   </p>
//                 </div>

//                 <form
//                   className="booking-form"
//                   onSubmit={handleSubmit}
//                 >
//                   <div className="selected-grade">
//                     <GraduationCap size={43} />

//                     <div>
//                       <small>Selected Grade</small>
//                       <strong>{selectedGrade}</strong>
//                     </div>

//                     <button
//                       type="button"
//                       className="edit-button"
//                       onClick={() => setStep(1)}
//                     >
//                       Edit
//                     </button>
//                   </div>

//                   <div className="form-fields">
//                     <label htmlFor="parentName">
//                       Parent's Full Name <b>*</b>
//                     </label>

//                     <div className="input-wrap">
//                       <User />
//                       <input
//                         id="parentName"
//                         name="parentName"
//                         value={form.parentName}
//                         onChange={updateForm}
//                         placeholder="Enter your name"
//                         autoComplete="name"
//                         required
//                       />
//                     </div>

//                     <label htmlFor="phone">
//                       Phone Number <b>*</b>
//                     </label>

//                     <div className="input-wrap">
//                       <Phone />
//                       <input
//                         id="phone"
//                         name="phone"
//                         type="tel"
//                         value={form.phone}
//                         onChange={updateForm}
//                         placeholder="Enter your phone number"
//                         autoComplete="tel"
//                         required
//                       />
//                     </div>

//                     <label htmlFor="studentName">
//                       Child's Name <b>*</b>
//                     </label>

//                     <div className="input-wrap">
//                       <User />
//                       <input
//                         id="studentName"
//                         name="studentName"
//                         value={form.studentName}
//                         onChange={updateForm}
//                         placeholder="Enter your child's name"
//                         required
//                       />
//                     </div>

//                     <label htmlFor="classDate">
//                       Preferred Class Date <b>*</b>
//                     </label>

//                     <div className="input-wrap">
//                       <CalendarDays />
//                       <input
//                         id="classDate"
//                         name="classDate"
//                         type="date"
//                         min={getTodayDate()}
//                         value={form.classDate}
//                         onChange={updateForm}
//                         required
//                       />
//                     </div>

//                     <label htmlFor="classTime">
//                       Preferred Class Time <b>*</b>
//                     </label>

//                     <div className="input-wrap">
//                       <Clock />

//                       <select
//                         id="classTime"
//                         name="classTime"
//                         value={form.classTime}
//                         onChange={updateForm}
//                         required
//                       >
//                         <option value="">Select a time</option>
//                         {[
//                           "8:00 AM",
//                           "9:00 AM",
//                           "10:00 AM",
//                           "11:00 AM",
//                           "12:00 PM",
//                           "1:00 PM",
//                           "2:00 PM",
//                           "3:00 PM",
//                           "4:00 PM",
//                           "5:00 PM",
//                         ].map((time) => (
//                           <option key={time} value={time}>
//                             {time}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>

//                   {error && (
//                     <p className="error-message" role="alert">
//                       {error}
//                     </p>
//                   )}

//                   <button
//                     type="submit"
//                     className="submit-button"
//                     disabled={loading}
//                   >
//                     {loading
//                       ? "Submitting..."
//                       : "Book Free Trial Class"}

//                     {!loading && <ArrowRight size={20} />}
//                   </button>

//                   <div className="or-divider">
//                     <span></span> OR <span></span>
//                   </div>

//                   <a
//                     className="whatsapp-button"
//                     href={whatsappLink}
//                     target="_blank"
//                     rel="noreferrer"
//                   >
//                     <MessageCircle size={25} />

//                     <div>
//                       <strong>Chat with Us on WhatsApp</strong>
//                       <small>
//                         Have questions? We're here to help!
//                       </small>
//                     </div>
//                   </a>

//                   <div className="privacy-note">
//                     <Lock size={15} />

//                     <span>
//                       Your information is used for class booking
//                       and communication.
//                     </span>
//                   </div>
//                 </form>
//               </section>
//             )}
//           </>
//         ) : (

//           /* SUCCESS MESSAGE */

//           <section className="success-content">
//             <div className="success-icon">
//               <Check size={40} />
//             </div>

//             <h2>Booking Received!</h2>

//             <p>
//               Thank you, {form.parentName}. We've received your request
//               for {form.studentName}'s free trial coding class.
//             </p>

//             <p>
//               <strong>Selected Grade:</strong> {selectedGrade}
//               <br />
//               <strong>Preferred Date:</strong> {formatClassDate(form.classDate)}
//               <br />
//               <strong>Preferred Time:</strong> {form.classTime}
//             </p>

//             <p>
//               Our team will contact you shortly to confirm the class.
//             </p>

//             <a
//               href={confirmationWhatsappLink}
//               className="submit-button"
//               target="_blank"
//               rel="noreferrer"
//             >
//               Chat with Us on WhatsApp
//             </a>
//           </section>
//         )}

//         {/* TRUST FEATURES */}

//         <div className="trust-features">
//           <div>
//             <Laptop />
//             <span>
//               Live Online<br />Classes
//             </span>
//           </div>

//           <div>
//             <ShieldCheck />
//             <span>
//               Experienced<br />Tutors
//             </span>
//           </div>

//           <div>
//             <Star />
//             <span>
//               Project-Based<br />Learning
//             </span>
//           </div>

//           <div>
//             <Users />
//             <span>
//               Small<br />Class Sizes
//             </span>
//           </div>
//         </div>

//         <footer>
//           Tech Talk Hub <span>|</span> Learn Today. Build Tomorrow.
//         </footer>
//       </div>
//     </main>
//   );
// }

// export default App;


// // import { useState } from "react";
// // import {
// //   Code2,
// //   User,
// //   Phone,
// //   CalendarDays,
// //   Clock,
// //   GraduationCap,
// //   Laptop,
// //   ShieldCheck,
// //   Star,
// //   Users,
// //   ChevronRight,
// //   Check,
// //   Lock,
// //   ArrowRight,
// //   MessageCircle,
// // } from "lucide-react";
// // import "./App.css";

// // const grades = [
// //   {
// //     id: "K - Grade 3",
// //     description: "Start with the basics of logic, games and creative projects.",
// //     emoji: "👦",
// //     color: "green",
// //   },
// //   {
// //     id: "Grades 4 - 6",
// //     description: "Build real coding skills and create fun projects like games and apps.",
// //     emoji: "👧",
// //     color: "blue",
// //   },
// //   {
// //     id: "Grades 7 - 9",
// //     description: "Explore advanced coding, web development and problem solving.",
// //     emoji: "🧑",
// //     color: "purple",
// //   },
// //   {
// //     id: "Grades 10 - 12",
// //     description: "Work on real-world projects, prepare for future careers and build a portfolio.",
// //     emoji: "👨",
// //     color: "orange",
// //   },
// // ];

// // const initialForm = {
// //   parentName: "",
// //   phone: "",
// //   studentName: "",
// //   grade: "",
// //   classDate: "",
// //   classTime: "",
// // };


// // const getRecommendedGrade = (age) => {
// //   const childAge = Number(age);

// //   if (childAge <= 8) return "K - Grade 3";
// //   if (childAge <= 11) return "Grades 4 - 6";
// //   if (childAge <= 14) return "Grades 7 - 9";
// //   return "Grades 10 - 12";
// // };

// // const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

// // function App() {
// //   const [step, setStep] = useState(1);
// //   const [selectedGrade, setSelectedGrade] = useState("");
// //   const [form, setForm] = useState(initialForm);
// //   const [loading, setLoading] = useState(false);
// //   const [submitted, setSubmitted] = useState(false);
// //   const [error, setError] = useState("");

// //   const [showHelp, setShowHelp] = useState(false);
// //   const [helpAge, setHelpAge] = useState("");

// //   const updateForm = (e) => {
// //     setForm((previous) => ({
// //       ...previous,
// //       [e.target.name]: e.target.value,
// //     }));
// //   };

// //   const chooseGrade = (grade) => {
// //     setSelectedGrade(grade);
// //     setStep(2);
// //     setError("");
// //   };

// //   const recommendedGrade = helpAge
// //     ? getRecommendedGrade(helpAge)
// //     : "";

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setError("");

// //     if (!SCRIPT_URL) {
// //       setError(
// //         "Booking service is not configured. Please contact us on WhatsApp."
// //       );
// //       return;
// //     }

// //     if (!selectedGrade) {
// //       setError("Please select your child's grade.");
// //       setStep(1);
// //       return;
// //     }

// //     setLoading(true);

// //     try {
// //       const payload = {
// //         parentName: form.parentName.trim(),
// //         phone: form.phone.trim(),
// //         studentName: form.studentName.trim(),
// //         age: form.age,
// //         grade: selectedGrade,
// //         classTime: form.classTime,
// //       };

// //       const response = await fetch(SCRIPT_URL, {
// //         method: "POST",
// //         mode: "no-cors",
// //         headers: {
// //           "Content-Type": "text/plain;charset=utf-8",
// //         },
// //         body: JSON.stringify(payload),
// //       });

// //       // A no-cors response is opaque. The browser cannot verify
// //       // whether Google Apps Script successfully saved the booking.
// //       if (response.type === "opaque") {
// //         setSubmitted(true);
// //       } else if (response.ok) {
// //         const result = await response.json();

// //         if (result.success) {
// //           setSubmitted(true);
// //         } else {
// //           throw new Error(result.error || "Booking could not be saved.");
// //         }
// //       } else {
// //         throw new Error("Unable to submit your booking.");
// //       }
// //     } catch (err) {
// //       setError(
// //         "We couldn't confirm your submission. Please try again or contact us on WhatsApp."
// //       );
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const whatsappLink =
// //     "https://wa.me/254704494504?text=" +
// //     encodeURIComponent(
// //       "Hi Tech Talk Hub, I would like to book a free trial coding class."
// //     );

// //   return (
// //     <main className="booking-page">
// //       <div className="booking-container">

// //         {/* BRAND */}
// //         <header className="brand">
// //           <div className="brand-icon">
// //             <Code2 size={48} strokeWidth={3} />
// //           </div>

// //           <div>
// //             <h1>Tech Talk Hub</h1>
// //             <p>Code · Create · Build · Grow</p>
// //           </div>
// //         </header>

// //         {/* PROGRESS */}
// //         <div className="progress">
// //           <div
// //             className={`progress-step ${
// //               step === 1 ? "active" : "completed"
// //             }`}
// //           >
// //             <span className="progress-circle">
// //               {step === 1 ? "1" : <Check size={19} />}
// //             </span>
// //             <span>Choose Grade</span>
// //           </div>

// //           <div className="progress-line">
// //             <div className={step === 2 ? "line-filled" : ""}></div>
// //           </div>

// //           <div
// //             className={`progress-step ${
// //               step === 2 ? "active" : ""
// //             }`}
// //           >
// //             <span className="progress-circle">2</span>
// //             <span>Enter Details</span>
// //           </div>
// //         </div>

// //         {!submitted ? (
// //           <>
// //             {step === 1 ? (

// //               /* STEP 1: GRADE SELECTION */

// //               <section className="step-content">
// //                 <div className="intro">
// //                   <h2>
// //                     Give Your Child a<br />
// //                     Confident Start in <span>Coding</span>
// //                   </h2>

// //                   <p>
// //                     Choose your child's grade level to get started
// //                     <br className="desktop-break" />
// //                     with a free trial class.
// //                   </p>
// //                 </div>

// //                 {/* GRADE CARDS */}
// //                 <div className="grade-grid">
// //                   {grades.map((grade) => (
// //                     <button
// //                       type="button"
// //                       key={grade.id}
// //                       className={`grade-card ${grade.color}`}
// //                       onClick={() => chooseGrade(grade.id)}
// //                     >
// //                       <span className="grade-emoji">
// //                         {grade.emoji}
// //                       </span>

// //                       <span className="grade-title">
// //                         {grade.id}
// //                       </span>

// //                       <ChevronRight
// //                         className="grade-arrow"
// //                         size={23}
// //                       />

// //                       <span className="grade-description">
// //                         {grade.description}
// //                       </span>
// //                     </button>
// //                   ))}
// //                 </div>

// //                 {/* HELP ME CHOOSE */}
// //                 <div className="grade-help">
// //                   <p>
// //                     Not sure which level is right for your child?
// //                   </p>

// //                   <button
// //                     type="button"
// //                     className="help-toggle"
// //                     onClick={() => setShowHelp(!showHelp)}
// //                   >
// //                     {showHelp ? "Close" : "Help me choose"}
// //                   </button>

// //                   {showHelp && (
// //                     <div className="help-panel">
// //                       <label htmlFor="helpAge">
// //                         How old is your child?
// //                       </label>

// //                       <select
// //                         id="helpAge"
// //                         value={helpAge}
// //                         onChange={(e) => setHelpAge(e.target.value)}
// //                       >
// //                         <option value="">
// //                           Select child's age
// //                         </option>

// //                         {Array.from(
// //                           { length: 14 },
// //                           (_, i) => i + 5
// //                         ).map((age) => (
// //                           <option key={age} value={age}>
// //                             {age} years
// //                           </option>
// //                         ))}
// //                       </select>

// //                       {helpAge && (
// //                         <div className="recommendation">
// //                           <p>
// //                             Based on your child's age, we recommend:
// //                           </p>

// //                           <strong>{recommendedGrade}</strong>

// //                           <small>
// //                             This is a starting recommendation.
// //                             Our team can confirm the appropriate
// //                             learning level during the free trial.
// //                           </small>

// //                           <button
// //                             type="button"
// //                             className="recommendation-button"
// //                             onClick={() =>
// //                               chooseGrade(recommendedGrade)
// //                             }
// //                           >
// //                             Continue with this level
// //                             <ArrowRight size={17} />
// //                           </button>
// //                         </div>
// //                       )}
// //                     </div>
// //                   )}

// //                   <a
// //                     className="help-whatsapp"
// //                     href={whatsappLink}
// //                     target="_blank"
// //                     rel="noreferrer"
// //                   >
// //                     <MessageCircle size={16} />
// //                     Need assistance? Chat with us
// //                   </a>
// //                 </div>
// //               </section>

// //             ) : (

// //               /* STEP 2: BOOKING DETAILS */

// //               <section className="step-content details-content">
// //                 <div className="intro">
// //                   <h2>Great! Let's Get Started</h2>

// //                   <p>
// //                     Fill in the form below to book your child's free trial class
// //                     <br className="desktop-break" />
// //                     for <span>{selectedGrade}</span>.
// //                   </p>
// //                 </div>

// //                 <form
// //                   className="booking-form"
// //                   onSubmit={handleSubmit}
// //                 >
// //                   <div className="selected-grade">
// //                     <GraduationCap size={43} />

// //                     <div>
// //                       <small>Selected Grade</small>
// //                       <strong>{selectedGrade}</strong>
// //                     </div>

// //                     <button
// //                       type="button"
// //                       className="edit-button"
// //                       onClick={() => setStep(1)}
// //                     >
// //                       Edit
// //                     </button>
// //                   </div>

// //                   <div className="form-fields">
// //                     <label htmlFor="parentName">
// //                       Parent's Full Name <b>*</b>
// //                     </label>

// //                     <div className="input-wrap">
// //                       <User />
// //                       <input
// //                         id="parentName"
// //                         name="parentName"
// //                         value={form.parentName}
// //                         onChange={updateForm}
// //                         placeholder="Enter your name"
// //                         autoComplete="name"
// //                         required
// //                       />
// //                     </div>

// //                     <label htmlFor="phone">
// //                       Phone Number <b>*</b>
// //                     </label>

// //                     <div className="input-wrap">
// //                       <Phone />
// //                       <input
// //                         id="phone"
// //                         name="phone"
// //                         type="tel"
// //                         value={form.phone}
// //                         onChange={updateForm}
// //                         placeholder="Enter your phone number"
// //                         autoComplete="tel"
// //                         required
// //                       />
// //                     </div>

// //                     <label htmlFor="studentName">
// //                       Child's Name <b>*</b>
// //                     </label>

// //                     <div className="input-wrap">
// //                       <User />
// //                       <input
// //                         id="studentName"
// //                         name="studentName"
// //                         value={form.studentName}
// //                         onChange={updateForm}
// //                         placeholder="Enter your child's name"
// //                         required
// //                       />
// //                     </div>

// //                     <label htmlFor="age">
// //                       Child's Age <b>*</b>
// //                     </label>

// //                     <div className="input-wrap">
// //                       <CalendarDays />
// //                       <select
// //                         id="age"
// //                         name="age"
// //                         value={form.age}
// //                         onChange={updateForm}
// //                         required
// //                       >
// //                         <option value="">Select age</option>

// //                         {Array.from(
// //                           { length: 14 },
// //                           (_, i) => i + 5
// //                         ).map((age) => (
// //                           <option key={age} value={age}>
// //                             {age} years
// //                           </option>
// //                         ))}
// //                       </select>
// //                     </div>

// //                     <label htmlFor="classTime">
// //                       Preferred Class Time <b>*</b>
// //                     </label>

// //                     <div className="input-wrap">
// //                       <Clock />

// //                       <select
// //                         id="classTime"
// //                         name="classTime"
// //                         value={form.classTime}
// //                         onChange={updateForm}
// //                         required
// //                       >
// //                         <option value="">Select a time</option>
// //                         <option value="Weekday Morning">
// //                           Weekday Morning
// //                         </option>
// //                         <option value="Weekday Afternoon">
// //                           Weekday Afternoon
// //                         </option>
// //                         <option value="Weekday Evening">
// //                           Weekday Evening
// //                         </option>
// //                         <option value="Saturday">
// //                           Saturday
// //                         </option>
// //                         <option value="Sunday">
// //                           Sunday
// //                         </option>
// //                         <option value="Flexible">
// //                           Flexible
// //                         </option>
// //                       </select>
// //                     </div>
// //                   </div>

// //                   {error && (
// //                     <p className="error-message" role="alert">
// //                       {error}
// //                     </p>
// //                   )}

// //                   <button
// //                     type="submit"
// //                     className="submit-button"
// //                     disabled={loading}
// //                   >
// //                     {loading
// //                       ? "Submitting..."
// //                       : "Book Free Trial Class"}

// //                     {!loading && <ArrowRight size={20} />}
// //                   </button>

// //                   <div className="or-divider">
// //                     <span></span> OR <span></span>
// //                   </div>

// //                   <a
// //                     className="whatsapp-button"
// //                     href={whatsappLink}
// //                     target="_blank"
// //                     rel="noreferrer"
// //                   >
// //                     <MessageCircle size={25} />

// //                     <div>
// //                       <strong>Chat with Us on WhatsApp</strong>
// //                       <small>
// //                         Have questions? We're here to help!
// //                       </small>
// //                     </div>
// //                   </a>

// //                   <div className="privacy-note">
// //                     <Lock size={15} />

// //                     <span>
// //                       Your information is used for class booking
// //                       and communication.
// //                     </span>
// //                   </div>
// //                 </form>
// //               </section>
// //             )}
// //           </>
// //         ) : (

// //           /* SUCCESS MESSAGE */

// //           <section className="success-content">
// //             <div className="success-icon">
// //               <Check size={40} />
// //             </div>

// //             <h2>Booking Received!</h2>

// //             <p>
// //               Thank you, {form.parentName}. We've received your request
// //               for {form.studentName}'s free trial coding class.
// //             </p>

// //             <p>
// //               Our team will contact you shortly to confirm the class.
// //             </p>

// //             <a
// //               href={whatsappLink}
// //               className="submit-button"
// //               target="_blank"
// //               rel="noreferrer"
// //             >
// //               Chat with Us on WhatsApp
// //             </a>
// //           </section>
// //         )}

// //         {/* TRUST FEATURES */}

// //         <div className="trust-features">
// //           <div>
// //             <Laptop />
// //             <span>
// //               Live Online<br />Classes
// //             </span>
// //           </div>

// //           <div>
// //             <ShieldCheck />
// //             <span>
// //               Experienced<br />Tutors
// //             </span>
// //           </div>

// //           <div>
// //             <Star />
// //             <span>
// //               Project-Based<br />Learning
// //             </span>
// //           </div>

// //           <div>
// //             <Users />
// //             <span>
// //               Small<br />Class Sizes
// //             </span>
// //           </div>
// //         </div>

// //         <footer>
// //           Tech Talk Hub <span>|</span> Learn Today. Build Tomorrow.
// //         </footer>
// //       </div>
// //     </main>
// //   );
// // }

// // export default App;

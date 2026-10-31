
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed.",
    });
  }

  try {
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;

    if (!scriptUrl) {
      throw new Error("Booking service is not configured.");
    }

    const {
      parentName,
      phone,
      studentName,
      grade,
      classDate,
      classTime,
    } = req.body || {};

    // Validate required booking information.
    if (
      !parentName?.trim() ||
      !phone?.trim() ||
      !studentName?.trim() ||
      !grade?.trim() ||
      !classDate ||
      !classTime
    ) {
      return res.status(400).json({
        success: false,
        error: "Please complete all required booking details.",
      });
    }

    const payload = {
      parentName: parentName.trim(),
      phone: phone.trim(),
      studentName: studentName.trim(),
      grade: grade.trim(),
      classDate,
      classTime,
    };

    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error("The booking service could not process your request.");
    }

    const result = await response.json();

    if (!result || result.success !== true) {
      return res.status(400).json({
        success: false,
        error: result?.error || "Your booking could not be saved.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Your booking has been saved successfully.",
    });

  } catch (error) {
    console.error("Booking API error:", error);

    return res.status(500).json({
      success: false,
      error:
        error.message ||
        "We could not confirm your booking. Please try again.",
    });
  }
}

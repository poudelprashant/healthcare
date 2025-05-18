import axios from "axios";
import appointmentModel from "../models/appointmentModel.js";
const initiateKhalti = async (req, res) => {
  const { appointmentId } = req.body;
  const appointmentData = await appointmentModel.findById(appointmentId);

  if (!appointmentData || appointmentData.cancelled) {
    return res.json({
      success: false,
      message: "Appointment Cancelled or not found",
    });
  }

  const formData = {
    return_url: `${
      process.env.BACKEND_URL || "http://localhost:4000"
    }/api/user/verifyKhalti`,
    website_url: process.env.FRONTEND_URL || "http://localhost:5173",
    amount: appointmentData.amount * 100,
    purchase_order_id: appointmentData._id,
    purchase_order_name: "Doctor Appointment",
    customer_info: {
      name: appointmentData.userData.name,
      email: appointmentData.userData.email,
    },
  };

  try {
    const headers = {
      Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    };

    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/initiate/",
      formData,
      { headers }
    );

    return res.json({
      success: true,
      message: "Payment initiated successfully.",
      data: response.data,
    });
  } catch (error) {
    console.error("Khalti Payment Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing the Khalti payment.",
      error: error.message,
    });
  }
};

const verifyKhalti = async (req, res) => {
  try {
    const { pidx, purchase_order_id, amount, message, transaction_id, status } =
      req.query;

    if (message) {
      return res.status(400).json({
        success: false,
        message: message,
      });
    }

    const headers = {
      Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    };

    await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      { headers }
    );

    req.transaction_uuid = purchase_order_id;
    req.transaction_id = transaction_id;

    const appointmentData = await appointmentModel.findById(purchase_order_id);
    if (!appointmentData) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }
    if (appointmentData.payment) {
      return res.status(400).json({
        success: false,
        message: "Payment already verified.",
      });
    }
    if (appointmentData.cancelled) {
      return res.status(400).json({
        success: false,
        message: "Appointment Cancelled.",
      });
    }
    if (appointmentData) {
      await appointmentModel.findByIdAndUpdate(purchase_order_id, {
        payment: true,
      });
    }

    // Modified redirection logic
    if (status === "Completed") {
      return res.send(`
        <html>
          <head>
            <meta http-equiv="refresh" content="3;url=${process.env.FRONTEND_URL?.trim().replace(
              /\/$/,
              ""
            )}/my-appointments" />
          </head>
          <body>
            <p>Payment successful! Redirecting ...</p>
            <script>
              setTimeout(() => {
                window.location.href = "${process.env.FRONTEND_URL?.trim().replace(
                  /\/$/,
                  ""
                )}/my-appointments";
              }, 3000);
            </script>
          </body>
        </html>
      `);
    } else {
      const redirectURL =
        process.env.FRONTEND_URL?.trim().replace(/\/$/, "") + "/payment-cancel";
      return res.redirect(redirectURL);
    }
  } catch (e) {
    console.error("Khalti Verification Error:", e);
    return res.status(500).json({
      success: false,
      message: "An error occurred while verifying the Khalti payment.",
      error: e.message,
    });
  }
};

export { initiateKhalti, verifyKhalti };

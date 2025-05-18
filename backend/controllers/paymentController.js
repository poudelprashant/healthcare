const axios = require("axios");
const Order = require("../../models/Order");
const Course = require("../../models/Course"); 
const StudentCourses = require("../../models/StudentCourses");

const initiateKhalti = async (req, res) => {
  const {
    amount,
    userName,
    userEmail,
    userId,
    courseImage,
    courseId,
    courseTitle,
    instructorName,
    instructorId,
  } = req.body;

  const newlyCreatedCourseOrder = new Order({
    userId,
    userName,
    userEmail,
    orderStatus: "pending",
    paymentMethod: "khalti",
    paymentStatus: "initiated",
    orderDate: new Date(),
    instructorId,
    instructorName,
    courseImage,
    courseTitle,
    courseId,
    coursePricing: parseFloat(amount),
  });

  await newlyCreatedCourseOrder.save();

  const formData = {
    return_url: `${
      process.env.BACKEND_URL || "http://localhost:5000"
    }/payment/khalti/verify`,
    website_url: process.env.FRONTEND_URL || "http://localhost:3000",
    amount: amount * 100,
    purchase_order_id: newlyCreatedCourseOrder._id,
    purchase_order_name: courseTitle,
    customer_info: {
      name: userName,
      email: userEmail,
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

    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      { headers }
    );

    req.transaction_uuid = purchase_order_id;
    req.transaction_id = transaction_id;

    const order = await Order.findOne({ _id: purchase_order_id });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    const updatedStatus =
      status === "Completed"
        ? "confirmed"
        : status === "Expired"
        ? "expired"
        : status === "User canceled"
        ? "canceled"
        : "failed";

    await Order.updateOne(
      { _id: purchase_order_id },
      {
        $set: {
          orderStatus: updatedStatus,
          paymentStatus: status === "Completed" ? "paid" : "pending",
        },
      }
    );

    //  Added: Update StudentCourses & Course if payment was successful
    if (status === "Completed") {
      const courseData = {
        courseId: order.courseId,
        title: order.courseTitle,
        instructorId: order.instructorId,
        instructorName: order.instructorName,
        dateOfPurchase: new Date(),
        courseImage: order.courseImage,
      };

      let studentCourses = await StudentCourses.findOne({
        userId: order.userId,
      });

      if (studentCourses) {
        if (!Array.isArray(studentCourses.courses)) {
          studentCourses.courses = [];
        }
        studentCourses.courses.push(courseData);
        await studentCourses.save();
      } else {
        const newStudentCourses = new StudentCourses({
          userId: order.userId,
          courses: [courseData],
        });
        await newStudentCourses.save();
      }

      await Course.findByIdAndUpdate(order.courseId, {
        $addToSet: {
          students: {
            studentId: order.userId,
            studentName: order.userName,
            studentEmail: order.userEmail,
            paidAmount: order.coursePricing,
          },
        },
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
            )}/student-courses" />
          </head>
          <body>
            <p>Payment successful! Redirecting to your courses page...</p>
            <script>
              setTimeout(() => {
                window.location.href = "${process.env.FRONTEND_URL?.trim().replace(
                  /\/$/,
                  ""
                )}/student-courses";
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

module.exports = { initiateKhalti, verifyKhalti };
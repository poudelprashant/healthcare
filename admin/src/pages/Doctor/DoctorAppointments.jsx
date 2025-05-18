import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const DoctorAppointments = () => {
  const {
    dToken,
    appointments,
    getAppointments,
    cancelAppointment,
    completeAppointment,
  } = useContext(DoctorContext);
  const { slotDateFormat, calculateAge, currency, backendUrl } =
    useContext(AppContext);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken]);

  // Generate previews when files change
  useEffect(() => {
    if (files.length > 0) {
      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/")
      );
      const newPreviews = imageFiles.map((file) => URL.createObjectURL(file));
      setPreviews(newPreviews);

      // Cleanup: revoke object URLs on unmount or files change
      return () => {
        newPreviews.forEach((url) => URL.revokeObjectURL(url));
      };
    } else {
      setPreviews([]);
    }
  }, [files]);

  const handleIconClick = (item) => {
    setSelectedAppointment(item);
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  // Remove a file and its preview by index
  const handleRemoveFile = (idx) => {
    setFiles((prevFiles) => {
      const newFiles = [...prevFiles];
      newFiles.splice(idx, 1);
      return newFiles;
    });
    setPreviews((prevPreviews) => {
      const newPreviews = [...prevPreviews];
      // Revoke the object URL to avoid memory leaks
      URL.revokeObjectURL(newPreviews[idx]);
      newPreviews.splice(idx, 1);
      return newPreviews;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("prescription", files[0]);
    formData.append("appointmentId", selectedAppointment._id);

    const { data } = await axios.post(
      backendUrl + "/api/doctor/add-prescription",
      formData,
      { headers: { dToken } }
    );
    if (data.success) {
      toast.success(data.message);
      setShowModal(false);
      setFiles([]);
      setPreviews([]);
      setSelectedAppointment(null);
      getAppointments();
    } else {
      toast.error(data.message);
    }
  };

  return (
    <div className="w-full max-w-6xl m-5 ">
      <p className="mb-3 text-lg font-medium">All Appointments</p>
      <div className="bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll">
        <div className="max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr_1fr] gap-1 py-3 px-6 border-b">
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Prescription</p>
          <p>Action</p>
        </div>
        {appointments.map((item, index) => (
          <div
            className="flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50"
            key={index}
          >
            <p className="max-sm:hidden">{index}</p>
            <div className="flex items-center gap-2">
              <img
                src={item.userData.image}
                className="w-8 rounded-full"
                alt=""
              />{" "}
              <p>{item.userData.name}</p>
            </div>
            <div>
              <p className="text-xs inline border border-primary px-2 rounded-full">
                {item.payment ? "Online" : "CASH"}
              </p>
            </div>
            <p className="max-sm:hidden">{calculateAge(item.userData.dob)}</p>
            <p>
              {slotDateFormat(item.slotDate)}, {item.slotTime}
            </p>
            <p>
              {currency}
              {item.amount}
            </p>
            <p>
              {item?.isCompleted ? (
                item?.prescription ? (
                  <a
                    href={item.prescription}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-primary text-xs inline-block px-2 rounded-full py-2"
                  >
                    Prescription
                  </a>
                ) : (
                  <span
                    className="cursor-pointer text-blue-500"
                    title="Upload Prescription"
                    onClick={() => handleIconClick(item)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="inline w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </span>
                )
              ) : (
                "N/A"
              )}
            </p>
            {item.cancelled ? (
              <p className="text-red-400 text-xs font-medium">Cancelled</p>
            ) : item.isCompleted ? (
              <p className="text-green-500 text-xs font-medium">Completed</p>
            ) : (
              <div className="flex">
                <img
                  onClick={() => cancelAppointment(item._id)}
                  className="w-10 cursor-pointer"
                  src={assets.cancel_icon}
                  alt=""
                />
                <img
                  onClick={() => completeAppointment(item._id)}
                  className="w-10 cursor-pointer"
                  src={assets.tick_icon}
                  alt=""
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal for prescription upload */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-100">
            <h2 className="text-lg font-semibold mb-4">Upload Prescription</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="file"
                accept=".pdf,.jpg,.png"
                onChange={handleFileChange}
                className="mb-4"
                required
              />
              {/* Image previews with remove button */}
              {previews.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {previews.map((src, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={src}
                        alt={`preview-${idx}`}
                        className="w-16 h-16 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 hover:opacity-100"
                        title="Remove"
                        tabIndex={-1}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded"
                  onClick={() => {
                    setShowModal(false);
                    setFiles([]);
                    setPreviews([]);
                    setSelectedAppointment(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                  disabled={files.length === 0}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;

import { useState } from "react";
import emailjs from "emailjs-com";
import Navbar from "../components/Navbar";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [status, setStatus] = useState({ message: "", isError: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await emailjs.send(
        "service_p0odil5",         // Replace with your EmailJS service ID
        "template_4ehp9mj",        // Replace with your EmailJS template ID
        formData,
        "U2V3F5obnmBdI1iFx"        // Replace with your EmailJS public key
      );
      setStatus({ message: "Message sent successfully!", isError: false });
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      setStatus({ message: "Failed to send message. Please try again later.", isError: true });
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-4 p-6 bg-white rounded-2xl shadow-xl">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold">Contact Us</h2>
            <p>Feel free to use the form or drop us an email. Old fashioned calls work too...</p>
            <p>📞 +91 - 8770222006</p>
            <p>📧 lakshyamishra099@gmail.com</p>
            <p>📍 Indore, Madhya Pradesh</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="p-2 border border-gray-300 rounded w-full"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className="p-2 border border-gray-300 rounded w-full"
              />
            </div>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="p-2 border border-gray-300 rounded w-full"
            />
            <input
              type="tel"
              name="phone"
              placeholder="9876543210"
              value={formData.phone}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded w-full"
            />
            <textarea
              name="message"
              placeholder="Your message..."
              value={formData.message}
              onChange={handleChange}
              required
              className="p-2 border border-gray-300 rounded w-full h-32"
            ></textarea>
            <button
              type="submit"
              className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
            >
              Submit
            </button>
            {status.message && (
              <p
                className={`text-sm text-center mt-2 ${
                  status.isError ? "text-red-600" : "text-green-600"
                }`}
              >
                {status.message}
              </p>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
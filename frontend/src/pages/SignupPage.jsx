import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "/src/assets/images/logo.svg";

export default function Signup() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isIITIMember, setIsIITIMember] = useState(null);
  const [memberType, setMemberType] = useState("");
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, isIITIMember, memberType }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess("Signup successful! Redirecting to OTP verification...");
        localStorage.setItem("pendingSignupEmail", formData.email);
        setTimeout(() => navigate("/VerifyOtp"), 2000);
      } else {
        setError(result.message || "Signup failed");
      }
    } catch (err) {
      setError("Error connecting to server.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#0e001d] via-[#1a0733] to-[#3d2171] text-white">
      <div className="flex flex-wrap justify-center items-start gap-10 px-10 py-20">
        <div className="w-full max-w-xl bg-[#3a0066] p-10 rounded-xl border border-white/20 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6">Create Your Account</h2>

          <form autoComplete="on" className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                required
                autoComplete="name"
                onChange={handleChange}
                className="flex-1 p-3 rounded bg-white text-black placeholder-gray-600"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                autoComplete="email"
                onChange={handleChange}
                className="flex-1 p-3 rounded bg-white text-black placeholder-gray-600"
              />
            </div>

            <input
              type="tel"
              name="mobile"
              placeholder="Mobile Number"
              pattern="[0-9]{10}"
              required
              onChange={handleChange}
              className="p-3 rounded bg-white text-black placeholder-gray-600"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              onChange={handleChange}
              className="p-3 rounded bg-white text-black placeholder-gray-600"
            />
            <input
              type="password"
              name="confirm_password"
              placeholder="Confirm Password"
              required
              onChange={handleChange}
              className="p-3 rounded bg-white text-black placeholder-gray-600"
            />

            <label className="mt-2">Are you a member of IIT Indore?</label>
            <div className="flex gap-6 text-sm">
              <label>
                <input
                  type="radio"
                  name="is_iiti"
                  value="yes"
                  onChange={() => setIsIITIMember(true)}
                  required
                />{" "}
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="is_iiti"
                  value="no"
                  onChange={() => setIsIITIMember(false)}
                  required
                />{" "}
                No
              </label>
            </div>

            {isIITIMember && (
              <div className="mt-4">
                <div className="bg-[#4a0072] p-4 text-sm rounded border-l-4 border-pink-400 shadow">
                  🔐 <strong>We verify all IIT Indore members for authenticity.</strong><br />
                  Providing false information may result in rejection.
                </div>

                <label className="mt-4" htmlFor="member_type">
                  Member Type
                </label>
                <select
                  name="member_type"
                  id="member_type"
                  onChange={(e) => setMemberType(e.target.value)}
                  className="p-3 rounded bg-white text-black"
                >
                  <option value="">-- Select --</option>
                  <option value="student">Student</option>
                  <option value="professor">Professor</option>
                  <option value="staff">Staff</option>
                  <option value="researcher">Researcher</option>
                </select>

                {memberType === "student" && (
                  <div className="mt-2 flex flex-col gap-2">
                    <label htmlFor="program">Program</label>
                    <select
                      name="program"
                      id="program"
                      onChange={handleChange}
                      className="p-3 rounded bg-white text-black"
                    >
                      <option value="">-- Select Program --</option>
                      <option value="BTech">BTech</option>
                      <option value="MTech">MTech</option>
                      <option value="MSc">MSc</option>
                      <option value="MS(R)">MS(R)</option>
                      <option value="PhD">PhD</option>
                    </select>

                    <label htmlFor="student_dept">Department</label>
                    <input
                      type="text"
                      name="student_dept"
                      placeholder="e.g. Mathematics, EE"
                      onChange={handleChange}
                      className="p-3 rounded bg-white text-black"
                    />

                    <label htmlFor="passing_year">Passing Year</label>
                    <input
                      type="number"
                      name="passing_year"
                      min="2009"
                      max="2100"
                      placeholder="e.g. 2026"
                      onChange={handleChange}
                      className="p-3 rounded bg-white text-black"
                    />
                  </div>
                )}

                {(memberType === "professor" || memberType === "researcher") && (
                  <div className="mt-2">
                    <label htmlFor="dept">Department (Optional)</label>
                    <input
                      type="text"
                      name="dept"
                      placeholder="e.g. Chemistry, Mathematics"
                      onChange={handleChange}
                      className="p-3 rounded bg-white text-black"
                    />
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              className="mt-4 bg-[#cc33ff] hover:bg-[#aa00cc] text-white font-semibold py-3 rounded"
            >
              Register
            </button>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            {success && <p className="text-green-400 text-sm text-center">{success}</p>}

            <p className="text-center text-sm mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-purple-300 underline">
                Login
              </Link>
            </p>
          </form>
        </div>

        {/* Description Section */}
        <div className="w-full max-w-xl bg-[#400080] p-10 rounded-xl border border-white/20 shadow-2xl text-gray-200">
          <h2 className="text-xl font-bold mb-4">Welcome to IITI Bot</h2>
          <p>
            IITI Bot is an intelligent platform crafted for IIT Indore members
            and learners across India. Whether you're a student, researcher, or
            staff — this AI-powered bot helps you interact with services and
            resources more effectively.
          </p>
        </div>
      </div>
    </div>
  );
}

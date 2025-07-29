import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "/src/assets/images/logo.svg";

export default function Signup() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isIITIMember, setIsIITIMember] = useState(null);
  const [memberType, setMemberType] = useState("");

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#0e001d] via-[#1a0733] to-[#3d2171] text-white">

      {/* Main Section */}
      <div className="flex flex-wrap justify-center items-start gap-10 px-10 py-20">
        {/* Signup Form */}
        <div className="w-full max-w-xl bg-[#3a0066] p-10 rounded-xl border border-white/20 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6">Create Your Account</h2>
          <form autoComplete="on" className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                autoComplete="name"
                required
                className="flex-1 p-3 rounded bg-white text-black placeholder-gray-600"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                autoComplete="email"
                required
                className="flex-1 p-3 rounded bg-white text-black placeholder-gray-600"
              />
            </div>
            <input
              type="tel"
              name="mobile"
              placeholder="Mobile Number"
              autoComplete="tel"
              pattern="[0-9]{10}"
              required
              className="p-3 rounded bg-white text-black placeholder-gray-600"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="new-password"
              required
              className="p-3 rounded bg-white text-black placeholder-gray-600"
            />
            <input
              type="password"
              name="confirm_password"
              placeholder="Confirm Password"
              autoComplete="new-password"
              required
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

            {/* IIT Member Fields */}
            {isIITIMember && (
              <div className="mt-4">
                <div className="bg-[#4a0072] p-4 text-sm rounded border-l-4 border-pink-400 shadow">
                  🔐{" "}
                  <strong>
                    We verify all IIT Indore members for authenticity.
                  </strong>
                  <br />
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
                      className="p-3 rounded bg-white text-black"
                    />

                    <label htmlFor="passing_year">Passing Year</label>
                    <input
                      type="number"
                      name="passing_year"
                      placeholder="e.g. 2026"
                      min="2009"
                      max="2100"
                      className="p-3 rounded bg-white text-black"
                    />
                  </div>
                )}

                {(memberType === "professor" ||
                  memberType === "researcher") && (
                  <div className="mt-2">
                    <label htmlFor="dept">Department (Optional)</label>
                    <input
                      type="text"
                      name="dept"
                      placeholder="e.g. Chemistry, Mathematics"
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

            {/* Google Sign In */}
            <div id="googleSignInDiv" className="flex justify-center"></div>

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

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import supabase from "../supabase/supabase";
import { useUser } from "../store/store";

const Finders = () => {
  const { user, setUser } = useUser();
  const [submits, setSubmits] = useState([]);
  const navigate = useNavigate();

  const location = useLocation();
  const report = location.state?.report;

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (!userData) {
      navigate("/connectWallet");
      return;
    }

    setUser(JSON.parse(userData));

    // Redirect if report is missing
    if (!report) {
      navigate("/explore");
      return;
    }

    getSubmits();
  }, [report, navigate, setUser]);

  const getSubmits = async () => {
    try {
      const { data, error } = await supabase
        .from("submits")
        .select("*")
        .eq("report_id", report.id);
      if (error) throw error;
      setSubmits(data || []);
    } catch (error) {
      console.error("Error fetching submits:", error.message);
    }
  };

  const handleApprove = async (submitId) => {
    try {
      const { error } = await supabase
        .from("submits")
        .update({ status: "approved" })
        .eq("id", submitId);
      if (error) throw error;
      getSubmits();
    } catch (error) {
      console.error("Error approving submit:", error.message);
    }
  };

  const handleRemove = async (submitId) => {
    try {
      const { error } = await supabase
        .from("submits")
        .delete()
        .eq("id", submitId);
      if (error) throw error;
      getSubmits();
    } catch (error) {
      console.error("Error removing submit:", error.message);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">
        Finders for "{report?.type || "Unknown"}"
      </h1>

      {submits.length === 0 ? (
        <p className="text-gray-400">No submissions yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submits.map((submit) => (
            <div
              key={submit.id}
              className="bg-gray-800 rounded-2xl p-4 flex flex-col shadow-lg border border-gray-700/50"
            >
              <img
                src={submit.image_url}
                alt={submit.description}
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
              <p className="text-gray-300 mb-2">{submit.description}</p>
              <p className="text-gray-400 text-sm mb-4">
                Contact: {submit.contact_no}
              </p>
              <div className="flex justify-between mt-auto gap-2">
                <button
                  onClick={() => handleApprove(submit.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-xl font-semibold transition-all duration-200"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleRemove(submit.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl font-semibold transition-all duration-200"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Finders;

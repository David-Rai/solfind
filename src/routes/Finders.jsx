import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, CheckCircle, XCircle, Phone, User, Calendar } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import supabase from "../supabase/supabase";
import { useUser } from "../store/store";

const Finders = () => {
  const { user, setUser } = useUser();
  const [submits, setSubmits] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const report = location.state?.r

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (!userData) {
      navigate("/connectWallet");
      return;
    }

    setUser(JSON.parse(userData));

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
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submitId) => {
    console.log("approve this ",submitId)
    // try {
    //   const { error } = await supabase
    //     .from("submits")
    //     .update({ status: "approved" })
    //     .eq("id", submitId);
    //   if (error) throw error;
    //   toast.success("Submission approved!");
    //   getSubmits();
    // } catch (error) {
    //   console.error("Error approving submit:", error.message);
    //   toast.error("Failed to approve submission");
    // }
  };

  const handleRemove = async (submitId) => {
    try {
      const { error } = await supabase
        .from("submits")
        .delete()
        .eq("id", submitId);
      if (error) throw error;
      toast.success("Submission removed");
      getSubmits();
    } catch (error) {
      console.error("Error removing submit:", error.message);
      toast.error("Failed to remove submission");
    }
  };

  if (!report) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <ToastContainer position="top-right" theme="dark" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/explore")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Back to Explore
          </button>
          
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="text-blue-400" size={24} />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold">
                  <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Finders for "{report.type}"
                  </span>
                </h1>
              </div>
              <p className="text-gray-400 ml-14">
                Review submissions from people who found your item
              </p>
            </div>
          </div>
        </div>

        {/* Report Summary Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {report.image_url && (
              <img
                src={report.image_url}
                alt={report.type}
                className="w-full md:w-48 h-48 object-cover rounded-xl"
              />
            )}
            <div className="flex-1 space-y-3">
              <div>
                <span className="text-gray-400 text-sm">Item Type</span>
                <p className="text-white font-semibold text-lg">{report.type}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Description</span>
                <p className="text-gray-300">{report.description}</p>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <span className="text-yellow-400 text-sm font-semibold">Reward:</span>
                  <span className="text-yellow-300 font-bold">{report.reward} SOL</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <span className="text-blue-400 text-sm font-semibold">Submissions:</span>
                  <span className="text-blue-300 font-bold">{submits.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col justify-center items-center min-h-[400px]">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-700"></div>
              <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-blue-500 absolute top-0 left-0"></div>
            </div>
            <p className="mt-6 text-gray-400 animate-pulse">Loading submissions...</p>
          </div>
        ) : submits.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
              <div className="relative text-8xl mb-2">🔍</div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No Submissions Yet</h2>
            <p className="text-gray-400 max-w-md">
              When someone finds your item and submits it, their submission will appear here for your review.
            </p>
          </div>
        ) : (
          /* Submissions Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submits.map((submit, index) => (
              <div
                key={submit.id}
                className="group bg-gray-800/40 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 flex flex-col"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Image */}
                <div className="relative w-full h-56 bg-gray-900 overflow-hidden">
                  <img
                    src={submit.image_url}
                    alt={submit.description}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
                  
                  {/* Status Badge */}
                  {submit.status === "approved" && (
                    <div className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full font-bold text-sm shadow-lg flex items-center gap-1">
                      <CheckCircle size={14} />
                      Approved
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-gray-300 text-sm mb-4 flex-1 leading-relaxed">
                    {submit.description}
                  </p>

                  {/* Details */}
                  <div className="space-y-2 mb-4 pb-4 border-b border-gray-700/50">
                    <div className="flex items-center gap-2 text-sm">
                      <User size={16} className="text-gray-500" />
                      <span className="text-gray-400">Submitted by</span>
                      <span className="text-white font-medium">{submit.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={16} className="text-gray-500" />
                      <span className="text-gray-400">Contact:</span>
                      <span className="text-white font-medium">{submit.contact_no}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(submit.id)}
                      disabled={submit.status === "approved"}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        submit.status === "approved"
                          ? "bg-gray-700 cursor-not-allowed text-gray-400"
                          : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-green-500/30 active:scale-95"
                      }`}
                    >
                      <CheckCircle size={18} />
                      {submit.status === "approved" ? "Approved" : "Approve"}
                    </button>
                    <button
                      onClick={() => handleRemove(submit.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-red-500/30 active:scale-95 flex items-center justify-center"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Finders;
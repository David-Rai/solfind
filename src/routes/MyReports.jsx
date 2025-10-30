import React, { useState, useEffect } from "react";
import supabase from "../supabase/supabase";
import { useUser } from "../store/store";

const MyReports = () => {
  const { user, setUser } = useUser();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    getReports(useUser.getState().user.id);
  }, []);

  const getReports = async (id) => {
    try {
      setLoading(true);
      const res = await supabase.from("reports").select("*").eq("user_id", id);
      if (res.data) setReports(res.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your reports...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            My Reports
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-400">
            {reports.length} {reports.length === 1 ? "report" : "reports"} found
          </p>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-500 text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No reports yet
            </h3>
            <p className="text-gray-400 text-sm">
              You haven't created any reports. Start by adding your first one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((r) => (
              <div
                key={r.id}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 hover:border-green-500/50"
              >
                <div className="relative w-full h-56 bg-gray-900 overflow-hidden">
                  <img
                    src={r.image_url}
                    alt={r.type}
                    className="w-full h-full object-cover"
                    onError={(e) =>
                      (e.target.src =
                        "https://via.placeholder.com/400x300?text=No+Image")
                    }
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                  <div className="absolute top-3 right-3 bg-green-900/80 px-3 py-1 rounded-full text-green-300 text-xs font-semibold">
                    {r.type}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h2 className="text-xl font-bold mb-2 text-white line-clamp-1">
                    {r.type}
                  </h2>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {r.description}
                  </p>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between py-2 px-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <span className="text-green-400 font-semibold text-sm">
                        Contact
                      </span>
                      <span className="text-green-300 font-medium">
                        {r.contact_no}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2 px-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <span className="text-yellow-400 font-semibold text-sm">
                        Reward
                      </span>
                      <span className="text-yellow-300 font-bold">
                        {r.reward} SOL
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-3 text-xs text-gray-400">
                    Posted{" "}
                    {new Date(r.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
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

export default MyReports;

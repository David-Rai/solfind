import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabase/supabase";

const Explore = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getReports = async () => {
      try {
        const { data, error } = await supabase.from("reports").select();
        if (error) throw error;
        setReports(data || []);
      } catch (error) {
        console.error("Error fetching reports:", error.message);
      } finally {
        setLoading(false);
      }
    };
    getReports();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Explore Reports
          </h1>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/report")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/50 active:scale-95"
            >
              Report Missing
            </button>
            <button
              onClick={() => navigate("/myReports")}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/50 active:scale-95"
            >
              My Reports
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          /* Reports Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {reports.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <div className="text-gray-500 text-6xl mb-4">📭</div>
                <p className="text-gray-400 text-lg">No reports found yet.</p>
                <p className="text-gray-500 text-sm mt-2">Be the first to report a missing item!</p>
              </div>
            ) : (
              reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden flex flex-col hover:transform hover:scale-105 transition-all duration-300 border border-gray-700/50 hover:border-blue-500/50"
                >
                  {report.image_url ? (
                    <div className="relative w-full h-56 bg-gray-900 overflow-hidden">
                      <img
                        src={report.image_url}
                        alt={report.type}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                    </div>
                  ) : (
                    <div className="w-full h-56 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                      <span className="text-6xl opacity-30">📦</span>
                    </div>
                  )}
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <h2 className="text-xl font-bold mb-3 text-white line-clamp-1">
                      {report.type}
                    </h2>
                    <p className="text-gray-300 text-sm mb-4 flex-1 line-clamp-3">
                      {report.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 px-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <span className="text-yellow-400 font-semibold text-sm">Reward</span>
                        <span className="text-yellow-300 font-bold">{report.reward} SOL</span>
                      </div>
                      
                      <p className="text-gray-400 text-xs flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Reported by {report.name}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => navigate('/submitFound', { state: { report } })}
                    className="m-4 mt-0 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-green-500/50 active:scale-95"
                  >
                    I Found This Item
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default Explore;
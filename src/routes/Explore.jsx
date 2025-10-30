import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, FileText, Coins, User, Calendar } from "lucide-react";
import supabase from "../supabase/supabase";

const Explore = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  // Filter reports based on search term
  const filteredReports = reports.filter(report =>
    report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-2">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Explore Reports
                </span>
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">
                Help reunite lost items with their owners
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/report")}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-95"
              >
                <Plus size={20} />
                Report Missing
              </button>
              <button
                onClick={() => navigate("/myReports")}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 active:scale-95"
              >
                <FileText size={20} />
                My Reports
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by item type or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        {/* Stats Bar */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <FileText className="text-blue-400" size={20} />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Total Reports</p>
                  <p className="text-white font-bold text-xl">{reports.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Coins className="text-yellow-400" size={20} />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Total Rewards</p>
                  <p className="text-white font-bold text-xl">
                    {reports.reduce((sum, r) => sum + parseFloat(r.reward || 0), 0).toFixed(2)} SOL
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Search className="text-green-400" size={20} />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Active Searches</p>
                  <p className="text-white font-bold text-xl">{filteredReports.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col justify-center items-center min-h-[500px]">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-700"></div>
              <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-blue-500 absolute top-0 left-0"></div>
            </div>
            <p className="mt-6 text-gray-400 animate-pulse">Loading reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-4">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
              <div className="relative text-8xl mb-2">🔍</div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {searchTerm ? "No matching reports found" : "No reports yet"}
            </h2>
            <p className="text-gray-400 mb-6 max-w-md">
              {searchTerm 
                ? "Try adjusting your search terms or clear the search to see all reports." 
                : "Be the first to report a missing item and help build our community!"}
            </p>
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm("")}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
              >
                Clear Search
              </button>
            ) : (
              <button
                onClick={() => navigate("/report")}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-blue-500/50"
              >
                <Plus size={20} />
                Report Missing Item
              </button>
            )}
          </div>
        ) : (
          /* Reports Grid */
    /* Reports Grid */
<div className="grid grid-cols-3 gap-6">
  {filteredReports.map((report, index) => (
    <div
      key={report.id}
      className="group bg-gray-800/40 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden flex flex-col hover:transform hover:scale-[1.02] transition-all duration-300 border border-gray-700/50 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Image Section */}
      <div className="relative w-full h-52 bg-gray-900 overflow-hidden">
        {report.image_url ? (
          <>
            <img
              src={report.image_url}
              alt={report.type}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 flex items-center justify-center">
            <span className="text-7xl opacity-20">📦</span>
          </div>
        )}
        
        {/* Reward Badge */}
        <div className="absolute top-3 right-3 bg-yellow-500/90 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-full font-bold text-sm shadow-lg flex items-center gap-1">
          <Coins size={14} />
          {report.reward} SOL
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col">
        <h2 className="text-xl font-bold mb-2 text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
          {report.type}
        </h2>
        
        <p className="text-gray-400 text-sm mb-4 flex-1 line-clamp-3 leading-relaxed">
          {report.description}
        </p>
        
        {/* Reporter Info */}
        <div className="flex items-center gap-2 text-xs text-gray-500 pb-4 border-b border-gray-700/50">
          <User size={14} className="text-gray-600" />
          <span>Reported by <span className="text-gray-400 font-medium">{report.name}</span></span>
        </div>
      </div>
      
      {/* Action Button */}
      <button
        onClick={() => navigate('/submitFound', { state: { report } })}
        className="m-4 mt-0 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-5 py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 active:scale-95 flex items-center justify-center gap-2"
      >
        <span>✓</span>
        I Found This Item
      </button>
    </div>
  ))}
</div>

        )}
      </div>
    </main>
  );
};

export default Explore;
 import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabase/supabase";

const Explore = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);

  // ✅ Fetch reports from Supabase
  useEffect(() => {
    const getReports = async () => {
      const { data, error } = await supabase.from("reports").select();
      if (error) {
        console.error("Error fetching reports:", error.message);
      } else {
        setReports(data);
      }
    };
    getReports();
  }, []);

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header / Navigation */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Explore Reports</h1>
        <button
          onClick={() => navigate("/report")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          Report Missing
        </button>
                <button
          onClick={() => navigate("/myReports")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition"
        >
        My reports
        </button>

      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.length === 0 ? (
          <p className="text-gray-400 col-span-full text-center">
            No reports found.
          </p>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col"
            >
              {report.image_url && (
                <img
                  src={report.image_url}
                  alt={report.type}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4 flex-1 flex flex-col">
                <h2 className="text-lg font-bold mb-2">{report.type}</h2>
                <p className="text-gray-400 mb-2 flex-1">{report.description}</p>
                <p className="text-yellow-400 font-semibold mb-2">
                  Reward: {report.reward} SOL
                </p>
                <p className="text-gray-500 text-sm">
                  Reported by {report.name}
                </p>
              </div>
              <button
              onClick={()=> navigate('/submitFound',{state:{report}})}
  className="mt-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-semibold"
>
  I Found This Item
</button>

            </div>
          ))
        )}
      </div>
    </main>
  );
};

export default Explore;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import UploadModal from "../../Components/UploadModal";

interface Interview {
  _id: string;
  startTime: number;
  isCompleted: boolean;
  name: string;
}

const Home = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/interview/list");

      const data = await response.json();
      if (data.success) {
        setInterviews(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch interviews");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 min-h-screen pt-12 relative">
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Your Interviews
            </h1>
            <p className="text-slate-300 text-lg">
              Track and manage your interview progress
            </p>
          </div>
          {interviews.length != 0 && (
            <button
              onClick={() => {
                console.log("clickedModal");
                setShowUploadModal(!showUploadModal);
              }}
              className="bg-slate-700 text-white px-8 py-4 rounded-xl hover:bg-slate-600 transition-all duration-300 flex items-center gap-3 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              New Interview
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {interviews.map((interview) => (
            <div
              key={interview._id}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-700/50 overflow-hidden group"
            >
              <div className="p-8 relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-white mb-3">
                      {interview.name}
                    </h2>
                    <div className="flex items-center text-slate-400 text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {new Date(interview.startTime).toLocaleDateString()}
                    </div>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      interview.isCompleted
                        ? "bg-emerald-900/50 text-emerald-400"
                        : "bg-amber-900/50 text-amber-400"
                    }`}
                  >
                    {interview.isCompleted ? "Completed" : "In Progress"}
                  </span>
                </div>

                <div className="mt-8">
                  {interview.isCompleted ? (
                    <button
                      onClick={() => navigate(`/analysis/${interview._id}`)}
                      className="w-full bg-indigo-600 text-white py-4 px-6 rounded-xl hover:bg-indigo-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      View Analysis
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/chat/${interview._id}`)}
                      className="w-full bg-indigo-600 text-white py-4 px-6 rounded-xl hover:bg-indigo-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Continue Interview
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {interviews.length === 0 && (
          <div className="text-center py-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700/50">
            <div className="mb-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-20 w-20 mx-auto text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">
              No Interviews Yet
            </h3>
            <p className="text-slate-300 text-lg mb-8">
              Start your first interview to begin your journey
            </p>
            <button
              onClick={() => setShowUploadModal(!showUploadModal)}
              className="bg-slate-700 text-white py-4 px-10 rounded-xl hover:bg-slate-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Start New Interview
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

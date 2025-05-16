import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "react-toastify";

const Analysis = () => {
  const [analysis, setAnalysis] = useState(null);

  const { interviewId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/interview/analysis/${interviewId}`
        );

        const data = await response.json();
        if (data.success) {
          setAnalysis(data.data);
        } else {
          throw new Error(data.message);
        }
      } catch (error: any) {
        console.error("Error fetching analysis:", error);
        toast.error(error.message || "Error fetching analysis");
        navigate("/");
      }
    };
    fetchAnalysis();
  }, [interviewId]);

  return (
    <div className="bg-slate-900 min-h-screen pt-12 relative">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold text-white mb-3">Analysis</h1>
      </div>
    </div>
  );
};

export default Analysis;

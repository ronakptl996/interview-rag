import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "react-toastify";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "../../Context/AuthContext";

const getStatus = (avg: any) => {
  if (avg >= 8) return { label: "Excellent", color: "bg-emerald-600" };
  if (avg >= 6) return { label: "Good", color: "bg-yellow-500" };
  if (avg >= 4) return { label: "Fair", color: "bg-orange-500" };
  return { label: "Poor", color: "bg-red-500" };
};

interface IAnalysis {
  analysis: Object;
  timeTaken: string;
}

export default function AnalysisSummary() {
  const [analysisData, setAnalysisData] = useState<IAnalysis>();

  const { loading, setLoading } = useAuth();

  const { interviewId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/interview/analysis/${interviewId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("intToken")}`,
            },
          }
        );

        const data = await response.json();
        if (data.success) {
          setAnalysisData(data.data);
        } else {
          throw new Error(data.message);
        }
      } catch (error: any) {
        console.error("Error fetching analysis:", error);
        toast.error(error.message || "Error fetching analysis");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [interviewId]);

  const scores = analysisData?.analysis
    ? Object.entries(analysisData.analysis).map(([name, data]) => ({
        name,
        score: data.score || 0,
        comment: data.comment || "",
      }))
    : [];

  const scored = scores.filter((s) => s.score !== null);
  const avg = scored.length
    ? (
        scored.reduce((sum, s) => sum + (s.score || 0), 0) / scored.length
      ).toFixed(1)
    : "N/A";
  const status = getStatus(avg);

  const topStrength = scored.sort((a, b) => (b.score || 0) - (a.score || 0))[0];
  const areaToImprove = scored.sort(
    (a, b) => (a.score || 0) - (b.score || 0)
  )[0];

  if (loading) {
    return (
      <div className="flex justify-center bg-slate-900 items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 min-h-screen py-16 text-white">
      <div className="container mx-auto max-w-6xl px-6 space-y-12">
        {/* Title */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Interview Analysis</h1>
          <p className="text-slate-400 text-lg">
            Here’s a breakdown of your performance
          </p>
        </div>

        {/* Overall Summary + Radar */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold">
              Average Score: <span className="text-indigo-400">{avg}/10</span>
            </h2>
            <h2 className="text-sx font-semibold">
              Time taken:{" "}
              <span className="text-indigo-400">{analysisData?.timeTaken}</span>
            </h2>
            <div
              className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${status.color}`}
            >
              {status.label}
            </div>
            <div className="space-y-2 pt-4">
              <div>
                <h3 className="text-lg font-semibold text-emerald-400">
                  Top Strength
                </h3>
                <p>
                  {topStrength?.name} — {topStrength?.score}/10
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-rose-400">
                  Area to Improve
                </h3>
                <p>
                  {areaToImprove?.name} — {areaToImprove?.score}/10
                </p>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={scores}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" stroke="#cbd5e1" />
              <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  color: "#fff",
                }}
                formatter={(value) => [`${value} / 10`, "Score"]}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#818cf8"
                fill="#6366f1"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Metric Feedback Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scores.map((metric) => (
            <div
              key={metric.name}
              className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700 shadow-md"
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xl font-semibold">{metric.name}</h4>
                <span className="text-sm text-slate-300">
                  {metric.score !== null ? `${metric.score} / 10` : "N/A"}
                </span>
              </div>
              <p className="text-slate-300 text-sm">{metric.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

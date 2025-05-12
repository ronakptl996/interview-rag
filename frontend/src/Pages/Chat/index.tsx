import { useEffect } from "react";
import { data, useParams } from "react-router";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

const Chat = () => {
  const { interviewId } = useParams();
  console.log("interviewId >>>", interviewId);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/interview/${interviewId}`
        );
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message);
        }

        if (data.data.isCompleted) {
          toast.success("Interview completed");
          navigate("/");
        }
      } catch (error: any) {
        console.log(error);
        toast.error(error.message || "Something went wrong");
      }
    };
    fetchInterview();
  }, [interviewId]);

  return (
    <div className="bg-black h-screen relative">
      <div className="flex justify-center items-center h-full gap-10">
        <div className="w-1/4 h-1/3 bg-red-500 rounded-lg border-2 border-white">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="h-28 w-28 rounded-full bg-white">
              <img
                src="/user.png"
                className="w-full h-full rounded-full"
                alt="resume"
              />
            </div>
            <div className="text-white text-2xl font-bold mt-4">User</div>
          </div>
        </div>
        <div className="w-1/4 h-1/3 bg-blue-500 rounded-lg border-2 border-white">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="h-28 w-28 rounded-full bg-white">
              <img
                src="/bot.jpg"
                className="w-full h-full rounded-full"
                alt="resume"
              />
            </div>
            <div className="text-white text-2xl font-bold mt-4">Bot</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <button className="bg-white text-black px-4 py-2 rounded-md">
          Ask Question
        </button>
      </div>
    </div>
  );
};

export default Chat;

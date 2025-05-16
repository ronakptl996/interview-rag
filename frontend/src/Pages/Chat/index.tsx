import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

const Chat = () => {
  const [startInterview, setStartInterview] = useState(false);
  const [isInterviewAlreadyStarted, setIsInterviewAlreadyStarted] =
    useState(true);

  const [isRecording, setIsRecording] = useState(false);
  const [startAnswering, setStartAnswering] = useState(false);
  const [botSpeaking, setBotSpeaking] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null); // Ref for speech recognition
  const chatIdRef = useRef(""); // Ref for chatId
  const recognizedTextRef = useRef(""); // Ref for recognized text
  const keepListening = useRef(true);
  const pendingSubmit = useRef(false);

  const { interviewId } = useParams();

  const navigate = useNavigate();

  const askQuestionHandler = async () => {
    try {
      recognizedTextRef.current = "";
      const response = await fetch(
        `http://localhost:3000/api/chat/askQuestion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            interviewId,
          }),
        }
      );

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }

      // setChatId(data.data.chatId);
      chatIdRef.current = data.data.chatId;
      const utterance = new SpeechSynthesisUtterance(data.data.question);
      utterance.rate = 0.6;
      utterance.pitch = 1.5;
      utterance.voice = speechSynthesis.getVoices()[0];
      speechSynthesis.speak(utterance);
      utterance.onstart = () => {
        setBotSpeaking(true);
      };
      utterance.onend = () => {
        setStartAnswering(true);
        setBotSpeaking(false);
      };
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || "Something went wrong");
    }
  };

  const submitAnswerHandler = async () => {
    try {
      console.log(
        "????????????????? submitAnswerHandler =========================="
      );
      console.log("recognizedTextRef.current >>>", recognizedTextRef.current);
      const answer = recognizedTextRef.current.trim();
      console.log("answer ================================ >>>", answer);
      const currentChatId = chatIdRef.current;
      const response = await fetch(`http://localhost:3000/api/chat/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: currentChatId,
          answer,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      await askQuestionHandler();
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || "Something went wrong");
    }
  };

  const startInterviewHandler = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/interview/start/${interviewId}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setStartInterview(true);
      setIsInterviewAlreadyStarted(data.data.isStarted);
      await askQuestionHandler();
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || "Something went wrong");
    }
  };

  const endInterviewHandler = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/interview/end/${interviewId}`
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      toast.success("Interview ended successfully");
      navigate("/");
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || "Something went wrong");
    }
  };

  // Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setUserSpeaking(true);
    };

    recognition.onresult = (event: any) => {
      let result = event.results[event.results.length - 1][0].transcript;
      console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
      console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
      console.log(
        "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ METHOD  ONRESULT ================================"
      );
      console.log("result ================================ >>>", event.results);
      console.log("===============================================");
      // Accumulate the answer
      recognizedTextRef.current += result;
    };

    recognition.onend = async () => {
      console.log(
        "recognition.onend >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
      );
      console.log("keepListening.current >>>>>", keepListening.current);
      console.log("pendingSubmit.current >>>", pendingSubmit.current);
      console.log("ENDDDDDDDDDDDDDDDDDD ===============");
      setUserSpeaking(false);
      if (pendingSubmit.current) {
        pendingSubmit.current = false;
        await submitAnswerHandler();
      } else if (keepListening.current) {
        recognition.start();
      }
    };

    recognition.onerror = () => {
      setUserSpeaking(false);
      console.error("Error occurred while recognizing speech");
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

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
          setStartInterview(false);
          navigate("/");
        } else {
          setStartInterview(false);
          setIsInterviewAlreadyStarted(data.data.isStarted);
        }
      } catch (error: any) {
        console.log(error);
        navigate("/");
        toast.error(error.message || "Something went wrong");
      }
    };
    fetchInterview();
  }, [interviewId]);

  // REMOVE FALSE
  if (!startInterview) {
    return (
      <div className="bg-slate-900 min-h-screen flex flex-col justify-center items-center">
        <div className="text-slate-100 text-2xl font-bold mb-6">
          Interview not started
        </div>
        <button
          className="bg-slate-700 text-slate-100 px-6 py-3 rounded-lg hover:bg-slate-600 transition-all duration-300 shadow-md hover:shadow-lg"
          onClick={startInterviewHandler}
        >
          {isInterviewAlreadyStarted ? "Continue Interview" : "Start Interview"}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 min-h-screen relative">
      <div className="absolute top-10 right-10 flex items-center gap-2">
        <button
          className="bg-red-600 text-slate-100 px-6 py-2 rounded-lg hover:bg-red-700 transition-all duration-300 shadow-md hover:shadow-lg"
          onClick={endInterviewHandler}
        >
          End Interview
        </button>
      </div>

      <div className="flex justify-center items-center h-[70vh] gap-10">
        {/* User Card */}
        <div
          className={`w-80 h-96 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden group ${
            userSpeaking ? "ring-2 ring-emerald-500" : ""
          }`}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-700/20 to-transparent opacity-50"></div>

          {/* User Avatar Container */}
          <div className="relative z-10">
            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 p-1 shadow-lg group-hover:shadow-emerald-500/20 transition-all duration-300">
              <div className="h-full w-full rounded-full overflow-hidden border-2 border-slate-600/50">
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <img
                    src="https://api.dicebear.com/9.x/thumbs/svg?faceOffsetY=-15,15"
                    className="w-full h-full object-cover"
                    alt="user"
                  />
                </div>
              </div>
            </div>
            {userSpeaking && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-500/20 backdrop-blur-sm px-3 py-1 rounded-full text-emerald-400 text-sm">
                Speaking...
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="mt-6 text-center">
            <h3 className="text-slate-100 text-2xl font-bold">User</h3>
            <p className="text-slate-400 text-sm mt-1">Interview Participant</p>
          </div>

          {/* Status Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                userSpeaking ? "bg-emerald-500 animate-pulse" : "bg-slate-600"
              }`}
            ></div>
            <span className="text-slate-400 text-xs">
              {userSpeaking ? "Active" : "Ready"}
            </span>
          </div>
        </div>

        {/* Bot Card */}
        <div
          className={`w-80 h-96 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden group ${
            botSpeaking ? "ring-2 ring-emerald-500" : ""
          }`}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-700/20 to-transparent opacity-50"></div>

          {/* Bot Avatar Container */}
          <div className="relative z-10">
            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 p-1 shadow-lg group-hover:shadow-emerald-500/20 transition-all duration-300">
              <div className="h-full w-full rounded-full overflow-hidden border-2 border-slate-600/50">
                <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <img
                    src="https://api.dicebear.com/7.x/bottts/svg?seed=ai&backgroundColor=65c9ff"
                    className="w-full h-full object-cover"
                    alt="bot"
                  />
                </div>
              </div>
            </div>
            {botSpeaking && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-500/20 backdrop-blur-sm px-3 py-1 rounded-full text-emerald-400 text-sm">
                Speaking...
              </div>
            )}
          </div>

          {/* Bot Info */}
          <div className="mt-6 text-center">
            <h3 className="text-slate-100 text-2xl font-bold">AI Assistant</h3>
            <p className="text-slate-400 text-sm mt-1">Interview Conductor</p>
          </div>

          {/* Status Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                botSpeaking ? "bg-emerald-500 animate-pulse" : "bg-slate-600"
              }`}
            ></div>
            <span className="text-slate-400 text-xs">
              {botSpeaking ? "Active" : "Ready"}
            </span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-20 left-0 right-0">
        <div className="relative flex items-center justify-center">
          <div
            className={`absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-100 text-xs px-3 py-1 rounded-lg shadow-lg z-10 whitespace-nowrap border border-slate-700 ${
              isRecording || startAnswering ? "block" : "hidden"
            }`}
          >
            {isRecording ? "Click when done answering" : "Click to answer"}
          </div>
          <div
            className={`
              flex items-center justify-center
              w-[48px] h-[48px] rounded-full
              ${startAnswering && "bg-emerald-500"}
              ${isRecording && "bg-red-600"}
              ${!startAnswering && !isRecording && "bg-slate-700"}
              cursor-pointer
              shadow-lg
              ${isRecording && "animate-pulse-recording"}
              ${startAnswering && "animate-pulse-answer"}
              transition-all
              duration-300
              hover:scale-105
              hover:shadow-emerald-500/20
            `}
            onClick={async () => {
              if (startAnswering) {
                setStartAnswering(false);
                setIsRecording(true);
                keepListening.current = true;
                if (recognitionRef.current) {
                  recognitionRef.current.start();
                }
              } else if (isRecording) {
                setIsRecording(false);
                setStartAnswering(false);
                keepListening.current = false;
                pendingSubmit.current = true;
                if (recognitionRef.current) {
                  recognitionRef.current.stop();
                }
              }
            }}
          >
            <img
              src="/microphone.png"
              className="w-5 h-5 rounded-full"
              alt="bot"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

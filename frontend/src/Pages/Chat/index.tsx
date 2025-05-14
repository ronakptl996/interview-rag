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
      const answer = recognizedTextRef.current.trim();
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
      // Accumulate the answer
      recognizedTextRef.current += result;
    };

    recognition.onend = async () => {
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
      <div className="bg-black h-screen relative">
        <div className="flex flex-col justify-center items-center h-full gap-4">
          <div className="text-white text-2xl font-bold">
            Interview not started
          </div>
          <button
            className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-300 cursor-pointer"
            onClick={startInterviewHandler}
          >
            {isInterviewAlreadyStarted
              ? "Continue Interview"
              : "Start Interview"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#181719] h-screen relative">
      <div className="absolute top-10 right-20 flex items-center gap-2">
        <button
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 cursor-pointer"
          onClick={endInterviewHandler}
        >
          End Interview
        </button>
      </div>

      <div className="flex justify-center items-center h-full gap-10">
        <div
          className={`w-1/4 h-1/3 bg-[#1e1e1e] rounded-lg border-2 box-shadow-lg ${
            userSpeaking ? "border-green-500" : "border-[#ffffff61]"
          }`}
        >
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
        <div
          className={`w-1/4 h-1/3 bg-[#1e1e1e] rounded-lg border-2 box-shadow-lg ${
            botSpeaking ? "border-green-500" : "border-[#ffffff61]"
          }`}
        >
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

      <div className="absolute bottom-20 left-0 right-0">
        <div className="relative flex items-center justify-center">
          <div
            className={`absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded shadow z-10 whitespace-nowrap ${
              isRecording || startAnswering ? "block" : "hidden"
            }`}
          >
            {isRecording ? "Click when done answering" : "Click to answer"}
          </div>
          <div
            className={`
              flex items-center justify-center
              w-[42px] h-[42px] rounded-full bg-green-800 
              ${startAnswering && "bg-green-500"}
              ${isRecording && "bg-red-600"}
              cursor-pointer
              shadow-[0_0_0_rgba(204,169,44,0.4)]
              ${isRecording && "animate-pulse-recording"}
              ${startAnswering && "animate-pulse-answer"}
              transition
              hover:animate-none
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
              className="w-4 h-4 rounded-full"
              alt="bot"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

const Chat = () => {
  const [startInterview, setStartInterview] = useState(true);
  const [isInterviewAlreadyStarted, setIsInterviewAlreadyStarted] =
    useState(true);
  const [chatId, setChatId] = useState("");

  const [isRecording, setIsRecording] = useState(false);
  const [startAnswering, setStartAnswering] = useState(false);
  const [botSpeaking, setBotSpeaking] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");

  const recognitionRef = useRef<any>(null);
  const keepListening = useRef(true);

  const { interviewId } = useParams();

  const navigate = useNavigate();

  const askQuestionHandler = async () => {
    try {
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
      console.log("QUESTION >>>", data);
      if (!data.success) {
        throw new Error(data.message);
      }

      setChatId(data.data.chatId);
      const utterance = new SpeechSynthesisUtterance(data.data.question);
      utterance.rate = 0.6;
      utterance.pitch = 1.5;
      utterance.voice = speechSynthesis.getVoices()[0];
      console.log(utterance);
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
      const response = await fetch(`http://localhost:3000/api/chat/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          answer: recognizedText,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setRecognizedText("");
      setChatId("");
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
      console.log("data >>>", data);

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
      console.log(" >>>> User started speaking");
    };

    // recognition.onsoundstart = () => {
    //   setUserSpeaking(true);
    // };

    // recognition.onsoundend = () => {
    //   setUserSpeaking(false);
    // };

    recognition.onresult = (event: any) => {
      // setUserSpeaking(false);
      let result = event.results[event.results.length - 1][0].transcript;
      console.log(" >>>> Recognized text:", result);
      setRecognizedText((prev) => prev + result);
    };

    recognition.onend = () => {
      setUserSpeaking(false);
      console.log(" >>>> Recognition ended");
      // Restart if you want to keep listening
      if (keepListening.current) {
        recognition.start();
      }
    };

    recognition.onerror = (event: any) => {
      setUserSpeaking(false);
      console.error("Error occurred while recognizing speech");
    };

    recognitionRef.current = recognition;

    return () => {
      //  clearTimeout(speakingTimeout);
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

        console.log("data >>>", data);
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

  if (!startInterview) {
    return (
      <div className="bg-black h-screen relative">
        <div className="flex flex-col justify-center items-center h-full gap-10">
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
    <div className="bg-black h-screen relative">
      <div className="flex justify-center items-center h-full gap-10">
        <div
          className={`w-1/4 h-1/3 bg-red-500 rounded-lg border-4 ${
            userSpeaking ? "border-green-500" : "border-white"
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
          className={`w-1/4 h-1/3 bg-blue-500 rounded-lg border-4 ${
            botSpeaking ? "border-green-500" : "border-white"
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
              console.log("startAnswering >>>", startAnswering);
              console.log("isRecording >>>", isRecording);
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
                console.log(" >>>> recognizedText else >>>", recognizedText);
                keepListening.current = false;
                if (recognitionRef.current) {
                  recognitionRef.current.stop();
                }
                await submitAnswerHandler();
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

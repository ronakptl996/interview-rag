import { BrowserRouter, Route, Routes } from "react-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./Pages/Home";
import Chat from "./Pages/Chat";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat/:interviewId" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Route, Routes } from "react-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./Pages/Home";
import Chat from "./Pages/Chat";
import Analysis from "./Pages/Analysis";
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/chat/:interviewId" element={<Chat />} />
        <Route path="/analysis/:interviewId" element={<Analysis />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

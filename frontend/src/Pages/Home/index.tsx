import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

const Home = () => {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();

  const handleDragOver = async (
    e: React.DragEvent<HTMLDivElement>,
    value: boolean
  ) => {
    e.preventDefault();
    setDragOver(value);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    try {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length === 0) {
        throw new Error("No file selected");
      }
      if (e.dataTransfer.files[0].type !== "application/pdf") {
        throw new Error("File must be a PDF");
      }
      setFile(e.dataTransfer.files[0]);
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || "Something went wrong");
    }
  };

  const handleBrowseFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files![0];
    if (file.type !== "application/pdf") {
      throw new Error("File must be a PDF");
    }
    setFile(file);
  };

  const handleUpload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      if (!file) {
        throw new Error("No file selected");
      }
      if (file.type !== "application/pdf") {
        throw new Error("File must be a PDF");
      }
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file!);
      const response = await fetch("http://localhost:3000/api/chat/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (response.status === 401) {
        // toast.error("Unauthorized");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const data = await response.json();
      if (data.success) {
        localStorage.setItem("interviewId", data.data.interviewId);
        navigate(`/chat/${data.data.interviewId}`);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.log(error);
      setUploading(false);
      toast.error(error.message || "Something went wrong");
    }
  };

  return (
    <div
      className="relative z-10"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-gray-500/75 transition-opacity"
        aria-hidden="true"
      ></div>

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-9 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="rounded-lg w-[600px] mx-auto">
                  <h2 className="text-lg font-bold text-green-600">
                    Upload PDF file
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Upload your resume to get started
                  </p>

                  {/* Drag & Drop Area */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      handleDragOver(e, true);
                    }}
                    onDragLeave={(e) => handleDragOver(e, false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed border-gray-300 p-8 text-center mt-4 rounded-lg cursor-pointer transition-all ${
                      dragOver
                        ? "border-green-500 bg-green-100"
                        : "border-gray-300 bg-gray-50"
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-gray-400 text-2xl">📁</span>
                      <p className="text-gray-600">Drag and drop files here</p>
                      <p className="text-gray-400 text-sm my-1">- OR -</p>
                      <label
                        className={`bg-green-500 text-white px-4 py-2 rounded-md cursor-pointer ${
                          file && "hidden"
                        }`}
                      >
                        Browse Files
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleBrowseFile}
                        />
                      </label>
                      {file && (
                        <>
                          <p className="text-gray-400 p-2 text-sm font-light">
                            {file.name}
                          </p>
                          <div className="flex">
                            <button
                              onClick={(e) => handleUpload(e)}
                              disabled={uploading}
                              className={`bg-green-500 text-white px-4 py-2 rounded-md cursor-pointer disabled:bg-gray-400`}
                            >
                              {uploading ? "Uploading..." : "Upload"}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-9">
              <button
                type="button"
                className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                onClick={() => {
                  setFile(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

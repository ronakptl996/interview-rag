import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

const UploadModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    console.log("handleBrowseFile >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
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
      if (name === "") {
        throw new Error("Name is required");
      }

      setUploading(true);

      const formData = new FormData();
      formData.append("file", file!);
      formData.append("name", name);

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

  if (!isOpen) return null;

  return (
    isOpen && (
      <div
        className="relative z-10"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div
          className="fixed inset-0 bg-slate-700/60 transition-opacity"
          aria-hidden="true"
        ></div>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-700/50">
              <div className="px-8 pt-8 pb-4 sm:p-12 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="rounded-lg w-full mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-1">
                      Upload PDF file
                    </h2>
                    <p className="text-slate-400 text-sm mb-4">
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
                      className={`border-2 border-dashed p-8 text-center mt-4 rounded-xl cursor-pointer transition-all duration-200
                      ${
                        dragOver
                          ? "border-emerald-400 bg-slate-800/80"
                          : "border-slate-600 bg-slate-800/60"
                      }
                    `}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-4xl mb-2">📁</span>
                        <p className="text-slate-200 font-medium">
                          Drag and drop files here
                        </p>
                        <p className="text-slate-400 text-sm my-1">- OR -</p>
                        <label
                          className={`bg-slate-700 text-white px-4 py-2 rounded-md cursor-pointer transition-all duration-200 hover:bg-slate-600 ${
                            file && "hidden"
                          }`}
                        >
                          Browse Files
                          <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleBrowseFile}
                          />
                        </label>
                        {file && (
                          <div className="w-full mt-4">
                            <input
                              type="text"
                              className="w-full p-2 rounded-md border-2 border-slate-700 focus:border-emerald-400 focus:outline-none mb-2 text-slate-100 bg-slate-900 placeholder:text-slate-500"
                              placeholder="Enter Interview Name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                            />
                            <p className="text-slate-400 p-2 text-sm font-light">
                              {file.name}
                            </p>
                            <div className="flex justify-end">
                              <button
                                onClick={(e) => handleUpload(e)}
                                disabled={uploading}
                                className={`bg-emerald-600 text-white px-4 py-2 rounded-md cursor-pointer transition-all duration-200 hover:bg-emerald-700 disabled:bg-slate-600`}
                              >
                                {uploading ? "Uploading..." : "Upload"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-8 py-2 mt-4 sm:flex sm:flex-row-reverse rounded-b-2xl border-t border-slate-700/50">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-xl bg-slate-700 px-6 py-3 text-base font-medium text-white shadow-md hover:bg-slate-600 hover:shadow-lg transition-all duration-200 sm:ml-3 sm:w-auto"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default UploadModal;

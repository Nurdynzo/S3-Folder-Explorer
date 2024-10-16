import React, { useState, useEffect } from "react";
import { FileIcon, Loader, Download, FolderIcon } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
const USERNAME = process.env.REACT_APP_USERNAME || "";
const PASSWORD = process.env.REACT_APP_PASSWORD || "";

const Home = () => {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [folderData, setFolderData] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await fetch(`${API_URL}/api/folders`);
        if (!response.ok) throw new Error("Failed to fetch folders");
        const data = await response.json();
        setFolders(data.folders);
        setSelectedFolder(data.folders[0]);
      } catch (err) {
        console.error("Error fetching folders:", err);
      }
    };

    fetchFolders();
  }, []);

  useEffect(() => {
    if (selectedFolder) {
      fetchFolderObjects(selectedFolder);
    }
  }, [selectedFolder]);

  const fetchFolderObjects = async (folder) => {
    setLoading((prev) => ({ ...prev, [folder]: true }));
    setError((prev) => ({ ...prev, [folder]: null }));

    try {
      const response = await fetch(`${API_URL}/api/list-objects/${folder}`);
      if (!response.ok) throw new Error(`Failed to fetch ${folder} objects`);
      const data = await response.json();
      setFolderData((prev) => ({ ...prev, [folder]: data }));
    } catch (err) {
      setError((prev) => ({ ...prev, [folder]: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, [folder]: false }));
    }
  };

  useEffect(() => {
    folders.forEach((folder) => {
      fetchFolderObjects(folder);
    });
  }, [folders]);

  const handleDownload = async (objectKey) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    try {
      const response = await fetch(
        `${API_URL}/api/download/${encodeURIComponent(objectKey)}`
      );
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = objectKey.split("/").pop();
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const handleLogin = () => {
    // Simulate a simple login (in a real-world scenario, you would authenticate with an API)
    if (username === `${USERNAME}` && password === `${PASSWORD}`) {
      setIsLoggedIn(true);
      setShowLoginModal(false);
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-orange-50 rounded-lg shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-white-600 to-white-600 p-6">
        <h2 className="text-l font-bold text-blue-800">
          <img
            className="w-18 h-9"
            src="https://assets.plateaumed.com/plateaumed-logo.png"
            alt="logo"
          />
          <div className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">
            Database Dumps
          </div>
        </h2>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-purple-50 to-orange-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">
                  Last Modified
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {folders.map((folder) => (
                <React.Fragment key={folder}>
                  <tr className="bg-orange-50">
                    <td colSpan="4" className="px-6 py-3">
                      <button className="flex items-center font-semibold text-blue-700 hover:text-orange-600 transition-colors duration-150">
                        <FolderIcon className="w-5 h-5 mr-2 text-blue-800" />
                        {folder.toUpperCase()}
                      </button>
                    </td>
                  </tr>
                  {loading[folder] ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4">
                        <div className="flex justify-center items-center">
                          <Loader className="animate-spin text-blue-500 w-6 h-6" />
                        </div>
                      </td>
                    </tr>
                  ) : error[folder] ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4">
                        <div className="text-red-500">
                          Error: {error[folder]}
                        </div>
                      </td>
                    </tr>
                  ) : folderData[folder] && folderData[folder].length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No files in this folder
                      </td>
                    </tr>
                  ) : (
                    folderData[folder] &&
                    folderData[folder].map((obj, index) => (
                      <tr
                        key={`${folder}-${index}`}
                        className="hover:bg-orange-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center pl-8">
                            <FileIcon className="w-4 h-4 text-blue-500 mr-2" />
                            <span className="text-gray-900">
                              {obj.key.split("/").pop()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {((obj.size / 1024) * 0.001).toFixed(2)} MB
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {isLoggedIn ? (
                            <button
                              onClick={() => handleDownload(obj.key)}
                              className="flex items-center gap-1 px-3 py-1 bg-blue-800 text-white rounded hover:bg-blue-600 transition-colors duration-150"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                          ) : (
                            <button
                              onClick={() => setShowLoginModal(true)}
                              className="flex items-center gap-1 px-3 py-1 bg-gray-400 text-white rounded"
                            >
                              <Download className="w-4 h-4" />
                              Log in to Download
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">Login</h2>
            <input
              type="text"
              placeholder="Username"
              className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-md"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex justify-between">
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
              >
                Login
              </button>
              <button
                onClick={() => setShowLoginModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

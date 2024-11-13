import { useRef, useState } from "react";

const Modal = ({ open, onClose, handleEndSession, roomID }) => {
  const usernameRef = useRef(null);
  const [username, setUsername] = useState("");
  const copyToClipboard = () => {
    const text = document.getElementById("link").value;
    navigator.clipboard.writeText(text).then(
      function () {
        console.log("Async: Copying to clipboard was successful!");
      },
      function (err) {
        console.error("Async: Could not copy text: ", err);
      }
    );
  };
  return (
    <div>
      {open && (
        <BackDrop open={open} onClose={onClose} username={username}>
          <div
            className="bg-white p-10 absolute  top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] rounded-2xl font-poppins"
            onClick={(e) => e.stopPropagation()}
          >
            <h1 className="text-2xl font-medium font-poppins text-center">
              Live Collaboration
            </h1>
            <p className="text-sm text-center mt-3">
              Share this link with your friends to collaborate
            </p>
            <div>
              <div className="flex flex-col justify-start items-start mt-4">
                <label htmlFor="username" className="text-md">
                  Your name
                </label>
                <input
                  type="text"
                  name="room"
                  id="room"
                  ref={usernameRef}
                  onChange={(e) => setUsername(e.target.value)}
                  className="border border-gray-300 rounded-md p-1 w-[70%]"
                />
              </div>
              <div className="flex flex-col justify-start items-start mt-4">
                <label htmlFor="link">Link</label>
                <div className="flex justify-start items-center gap-2 w-full">
                  <input
                    type="text"
                    name="link"
                    id="link"
                    readOnly
                    value={`http://localhost:5173/?roomID=${roomID}`}
                    className="border border-gray-300 rounded-md p-1 focus:border-none w-[70%]"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="bg-blue-500  text-white rounded-md p-1 w-[25%]"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <button
                onClick={() => {
                  handleEndSession();
                  onClose(username);
                }}
                className="bg-blue-500 text-white rounded-md p-1 mt-4 w-full"
              >
                End Session
              </button>
            </div>
          </div>
        </BackDrop>
      )}
    </div>
  );
};

const BackDrop = ({ children, onClose, username }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-[999]"
      onClick={() => onClose(username)}
    >
      {children}
    </div>
  );
};

export default Modal;
export { BackDrop };

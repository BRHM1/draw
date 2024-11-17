import { useRef, useState } from "react";
import {motion} from "framer-motion";
const Modal = ({ open, onClose, handleEndSession, roomID }) => {
  // this should take the URL of the current page and append the roomID to it
  // to avoid the need for additional "?" you can check if the URL already has a "?" and append accordingly
  const getURL = () => {
    if(window.location.href.includes("roomID")) {
      const URL = window.location.href.split("roomID")[0] + `roomID=${roomID}`;
      return URL;
    }
    const URL = window.location.href.includes("?")
      ? window.location.href + `&roomID=${roomID}`
      : window.location.href + `?roomID=${roomID}`;
    return URL;
  }
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
          <motion.div
            initial={{ scale: 0, x: "-50%", y: "-50%" }}
            animate={{ scale: 1 , x: "-50%", y: "-50%"} }
            transition={{ duration: 0.2 }}
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
                    value={getURL()}
                    className="border border-gray-300 rounded-md p-1 focus:border-none w-[70%]"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="bg-blue-500  text-white rounded-md p-1 w-[25%] active:scale-95 transition-all"
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
          </motion.div>
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

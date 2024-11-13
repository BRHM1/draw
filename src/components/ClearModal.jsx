import { BackDrop } from "./Modal";
import {motion} from "framer-motion";
const ClearModal = ({ open, onClose, clearCanvas }) => {
  return (
    <BackDrop onClose={onClose}>
      <motion.div
        initial={{ scale: 0, y: "-50%" , x: "-50%"}}
        animate={{ scale: 1, y: "-50%", x: "-50%" }}
        transition={{ duration: 0.2 }}
        className="bg-white p-10 absolute border border-red-800  top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] rounded-2xl font-poppins flex flex-col justify-start items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="text-2xl font-medium font-poppins text-center">
          Clear Board
        </h1>
        <p className="text-sm text-center mt-1  ">
          Are you sure you want to clear the canvas?
        </p>
        <div className="flex justify-center items-center w-52 h-10 gap-2 mx-auto mt-7">
          <button
            className="shadow-md rounded-md p-1 w-[80%] mx-auto h-10"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-red-600  text-white shadow-lg rounded-md p-1 w-[80%] h-10  mx-auto"
            onClick={() => {
              clearCanvas();
              onClose();
            }}
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </BackDrop>
  );
};

export default ClearModal;

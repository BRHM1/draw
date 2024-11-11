import Canvas from "./components/Canvas";
import { History } from "./hooks/History";
import useInitDB from "./hooks/useInitDB";
import { io } from "socket.io-client";

function App() {
  // BUG: resizing window makes the canvas stretch
  // BUG: RESIZE: shape acts weird when flipping the shape  

  // TODO: Perfromance improvements
  // 1- store functions can be improved
  // 2- path move method can be improved
  
  const history = new History();
  useInitDB();
  return (
    <div>
      <Canvas history={history} />
    </div>
  );
}

export default App;

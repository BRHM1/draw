import Canvas from "./components/Canvas";
import { History } from "./hooks/History";
import useInitDB from "./hooks/useInitDB";

function App() {
  //TODO: Make import and export buttons to save and load the canvas
  const history = new History();
  useInitDB();
  return (
    <div>
      <Canvas history={history} />
    </div>
  );
}

export default App;

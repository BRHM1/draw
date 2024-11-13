import Canvas from "./components/Canvas";
import { History } from "./hooks/History";
import useInitDB from "./hooks/useInitDB";

function App() {
  //TODO: Make a clear button to clear the canvas with a modal to clear the canvas
  //TODO: Make an event listener to make the user able to delete selected elements with backspace
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

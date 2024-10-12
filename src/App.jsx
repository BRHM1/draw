import Canvas from "./components/Canvas";
import { History } from "./hooks/History";
import useInitDB from "./hooks/useInitDB";

function App() {
  // document.addEventListener('mousemove', (event) => {
  //   console.log('Mouse position:', event.clientX, event.clientY);
  // });

  // BUG: resizing window makes the canvas stretch
  // BUG: while drawing and mouse gets on top of the Toolbar the line stops drawing
  // BUG: Undo doesn't save the move action
  // BUG: Text dissapears when you change the tool from the toolbar
  // BUG: selection tool onMouseDown adds a new element
  // BUG: typing in the corner of the screen makes it harder to see the text
  // BUG: text blinking when you type

  // TODO: make the canvas persistent
  // TODO: resizing Elements
  // TODO: selected elements should be editable from the toolbar
  // TODO: add text tool bar with font size and font family
  // TODO: add zooming tool
  // TODO: make the DB Model for the application
  // TODO: Undo Redo functionality

  // TODO: Perfromance improvements
  // 1- store functions can be improved
  // 2- path move method can be improved

  // Text flow:
  // 1. onClick intiates an instance of Text class + a textarea
  // 2. onKeyDown updates the text
  // 3. onBlur removes the textarea and adds the text to the elements array
  // -------------------- TODAY --------------------
  // don't push text to history if it's empty
  const history = new History();
  useInitDB();
  return (
    <div>
      <Canvas history={history} />
    </div>
  );
}

export default App;

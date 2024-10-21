import Canvas from "./components/Canvas";
import { History } from "./hooks/History";
import useInitDB from "./hooks/useInitDB";

function App() {
  // document.addEventListener('mousemove', (event) => {
  //   console.log('Mouse position:', event.clientX, event.clientY);
  // });

  // BUG: resizing window makes the canvas stretch
  // BUG: while drawing and mouse gets on top of the Toolbar the line stops drawing
  // BUG: Text dissapears when you change the tool from the toolbar
  // BUG: typing in the corner of the screen makes it harder to see the text
  // BUG: text blinking when you type
  
  // BUG: resizing should be relative to the gizmo not the element
  // BUG: when resizing flips the coordinates of the element are be broken, no more one flip allowed

  // TODO: make the canvas persistent
  // TODO: add real time collaboration using websockets

  // TODO: Perfromance improvements
  // 1- store functions can be improved
  // 2- path move method can be improved

  // Text flow:
  // 1. onClick intiates an instance of Text class + a textarea
  // 2. onKeyDown updates the text
  // 3. onBlur removes the textarea and adds the text to the elements array
  // -------------------- TODAY --------------------
  // change the gizmo impelementation to be more like the elementModule Rect class
  // this will allow for more robust resizing and moving to not delete the selected elements and 
  // make multiple selection actions possible
  const history = new History();
  useInitDB();
  return (
    <div>
      <Canvas history={history} />
    </div>
  );
}

export default App;

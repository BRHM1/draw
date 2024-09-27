import Canvas from "./components/Canvas"


function App() {
  // document.addEventListener('mousemove', (event) => {
  //   console.log('Mouse position:', event.clientX, event.clientY);
  // });
  
  // BUG: The line mirrors when you move it 
  // BUG: resizing window makes the canvas stretch
  // BUG: while drawing and mouse gets on top of the Toolbar the line stops drawing
  // BUG: Undo doesn't save the move action
  // BUG: Gizmo coordinates are not correct
  // BUG: Path coordinates are not correct
  // BUG: selection box works only when you drag from top left to bottom right
  // BUG: Text dissapears when you change the tool from the toolbar

  // TODO: make the canvas persistent
  // TODO: resizing Elements
  // TODO: layering
  // TODO: add Grouping to the selection tool
  // TODO: add text tool bar with font size and font family
  // TODO: add panning tool
  // TODO: add zooming tool
  // TODO: make the DB Model for the application

  // TODO: Perfromance improvements
  // 1- store functions can be improved
  // 2- path move method can be improved

  // Text flow:
  // 1. onClick intiates an instance of Text class + a textarea
  // 2. onKeyDown updates the text
  // 3. onBlur removes the textarea and adds the text to the elements array
  // -------------------- TODAY --------------------
  return (
    <div>
      <Canvas/>
    </div>
  )
}

export default App

import Canvas from "./components/Canvas"


function App() {
  // document.addEventListener('mousemove', (event) => {
  //   console.log('Mouse position:', event.clientX, event.clientY);
  // });
  
  // BUG: resizing window makes the canvas stretch
  // BUG: while drawing and mouse gets on top of the Toolbar the line stops drawing
  // BUG: Undo doesn't save the move action
  // BUG: Text dissapears when you change the tool from the toolbar
  
  // BUG: selection tool changes the panOffset
  // BUG: selection tool changes the panOffset
  // BUG: selection tool changes the panOffset
  // BUG: selection tool changes the panOffset
  // BUG: selection tool changes the panOffset
  // BUG: selection tool changes the panOffset
  // BUG: selection tool changes the panOffset

  // TODO: make the canvas persistent
  // TODO: resizing Elements
  // TODO: layering
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

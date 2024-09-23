import Canvas from "./components/Canvas"


function App() {
  // document.addEventListener('mousemove', (event) => {
  //   console.log('Mouse position:', event.clientX, event.clientY);
  // });
  
  // BUG: The line mirrors when you move it 
  // BUG: All elements should have a defined structure
  // BUG: resizing window makes the canvas stretch
  // BUG: while drawing and mouse gets on top of the Toolbar the line stops drawing
  // BUG: Undo doesn't save the move action
  // BUG: Gizmo coordinates are not correct
  // BUG: Circle sucks

  // TODO: make the canvas persistent
  // TODO: resizing Elements
  // TODO: layering
  // TODO: add Grouping to the selection tool
  // TODO: add text tool bar with font size and font family
  // TODO: add panning tool
  // TODO: add zooming tool
  // TODO: make the DB Model for the application

  // TODO: Perfromance improvements
  // 1. onMouseDown creates instance of the shape
  // 2. onMouseMove updates the dimensions of the shape
  // 3. onMouseUp finalizes the shape and adds it to the elements array 
  // 4- onMouseMove should not trigger if the mouse is not down
  // 5- two separate canvas for drawing and rendering
  // 6- use requestAnimationFrame for rendering
  // 7- use useMemo for elements
  // 8- use useCallback for functions

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

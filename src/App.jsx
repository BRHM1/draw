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

  // -------------------- TODAY --------------------
  // editing circle 
  // editing line mirror
  // resizing elements 
  return (
    <div>
      <Canvas/>
    </div>
  )
}

export default App

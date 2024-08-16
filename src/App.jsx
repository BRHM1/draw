import Canvas from "./components/Canvas"


function App() {
  // document.addEventListener('mousemove', (event) => {
  //   console.log('Mouse position:', event.clientX, event.clientY);
  // });
  
  // BUG: The line mirrors when you move it 
  // BUG: All elements should have a defined structure
  // BUG: resizing window makes the canvas stretch
  // BUG: while drawing and mouse gets on top of the Toolbar the line stops drawing
  return (
    <div>
      <Canvas/>
    </div>
  )
}

export default App

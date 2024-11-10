import Canvas from "./components/Canvas";
import { History } from "./hooks/History";
import useInitDB from "./hooks/useInitDB";
import { io } from "socket.io-client";

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

  // TODO: 
  // events should be sent through the socket also like move ,copy, delete, resize and undo redo
  // each shape should have a locked attribute so when the shape is bieng modified like moved, copied, etc..
  // other users couldn't modifiy the shape and when the modification is released lock is released   

  // SOLVING CONFLICT PROBLEM:::
  // flow: suppose you have three users A,B and C user A selects an element it should call the method LOCK on that element 
  // LOCK = (socket) => socket.emit('lock-element', element.id) and the server should emit to all users except user A that element is locked
  // all other users listens on socket.on('update-locked-elements' , (id) => lockedElements.add(id)) 
  // now user B and C have the locked elements so they won't be able to add them to the selectedElements if(lockedElements.has(element.id)) return
  // finally when user A release's the element it should call method UNLOCK
  // UNLOCK = (socket) => socket.emit('unlock-element', element.id) and the server should emit to all users except user A that element is unlocked
  // all other users listens on socket.on('update-locked-elements' , (id) => lockedElements.delete(id))

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

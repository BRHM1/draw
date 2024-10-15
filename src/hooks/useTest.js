import React from 'react'

const useTest = () => {
//   onMouseDown = (e) => {
//     if(gizmo.isMouseOver()) isDragging.current = true
//     else if(gizmo.isMouseResizing()) isResizing.current = true
//     else if(getElementAtPos(x,y)) {
//         isDragging.current = true  ------------------>
//         selectedElements.push(getElementAtPos(x,y))
//      } 
//      else {
//         selectedElements = []
//         initCoords.current = { x, y }
//         gizmoRef.current = new Gizmo(x, y, x, y, true, true)
//      }
//  }
//  
//
// onMouseMove = (e) => {
//   if((isDragging.current || isResizing.current) && selectedElementsRemoved) {
//         selectedElements.forEach(element => {
//           element.hidden = true
//         }
//    }
//
//    if(isDragging.current) {
//       Dragging Logic...
//    } else if(isResizing.current) {
//       Resizing Logic...
//     }else {
//     gizmoRef.current.updateCoordinates(x, y)
//     gizmoRef.current.draw(context)
//       }
//  }  
// 
//
// onMouseUp = () => {
//   if(isDragging.current || isResizing.current) {
//    selectedElements.forEach(element => {
//         element.hidden = false
//           })
//    isDragging.current = false
//    isResizing.current = false
//    selectedElementsRemoved = false
//    gizmoRef.current = null
//    selectedElements = []
//    } else {
//     getElementsInRegion(gizmoRef.current.x1, gizmoRef.current.y1, gizmoRef.current.x2, gizmoRef.current.y2)
//     forEach(gizmoRef.current.draw(context))
//     drawRectangleGizmo(gizmoRef.current)
//   }
// }
//
//
//
//
//
//
//
//
//
}

export default useTest
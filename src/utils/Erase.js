const Erase = (elements , setElements) => {
    const startErasing = (e) => {
        setElements([...elements, {x: e.pageX, y: e.pageY, width: 20 , height: 20}])
    }
    const Erasing = (e) => {
        if(!e.buttons) return 
        setElements([...elements, {x: e.pageX, y: e.pageY, width: 20 , height: 20}])
    }
    const stopErasing = () => {
    }
    return { startErasing, Erasing, stopErasing }
}

export default Erase
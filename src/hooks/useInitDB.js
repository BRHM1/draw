
const useInitDB = () => {
    const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB

    const request = indexedDB.open('myDB', 1)
    request.onerror = (event) => {
        console.log('Error opening DB', event)
    }

    request.onupgradeneeded = () => {
        const db = request.result
        db.createObjectStore('elements', { keyPath: 'id' })
    }

    request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction('elements', 'readwrite')
        console.log('DB opened successfully')
        transaction.oncomplete = () => {
            db.close()
        }
    }

}

export default useInitDB
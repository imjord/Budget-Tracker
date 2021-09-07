


// variable to hold db connection 
let db; 

// establish a connection to indexDB database called budget and set version to 1


const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function(event){
    // save a ref to the data base
    const db = event.target.result;
    // create an object store called new_amount set it to have an auto increment 
    db.createObjectStore('new_amount', { autoIncrement: true });
}

request.onsuccess = function(event) {
    db = event.target.result;

    if (navigator.onLine) {
        saveAmount();
    }
}

request.onerror = function(event) {
    console.log(event.target.errorCode);
} 


// function to execute with no internet 
function saveAmount(record) {
    const transaction = db.transaction(['new_amount'], 'readwrite');

    const amountObjectStore = transaction.objectStore('new_amount');

    amountObjectStore.add(record);
}


function uploadAmount() {
    const transaction = db.transaction(['new_amount'], 'readwrite');

    // access my store object
    const amountObjectStore = transaction.objectStore('new_amount');

    // get all the records 

    const getAll = amountObjectStore.getAll();

    // fa

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST', 
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['new_amount'], 'readwrite');
                const amountObjectStore = transaction.objectStore('new_amount');
                amountObjectStore.clear();

                alert('all saved transactions have been submitted')
            })
            .catch(err => {
                console.log(err);
            })
        }
    }
}



window.addEventListener('online', uploadAmount);
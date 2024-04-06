import { getFirestore, collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDqjjREo71wR1FrnbbzKb2Q15TfAVUdRq4",
    authDomain: "digipedal-76f51.firebaseapp.com",
    projectId: "digipedal-76f51",
    storageBucket: "digipedal-76f51.appspot.com",
    messagingSenderId: "67345932505",
    appId: "1:67345932505:web:02328c3ee26c2589521ec8",
    measurementId: "G-HDXBSEYM9W"
  };

  // Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// const analytics = getAnalytics(app);

export const getPedals = async () => {
  const pedals = collection(db, 'pedals');
  const pedalsDocs = await getDocs(pedals);
  const pedalsList = pedalsDocs.docs.map( (doc, idx) => {
    // console.log(doc.data());
    return {id:idx, name:doc.data().name, image:doc.data().name + '.svg'}
  });
  return pedalsList;
}

export const getBoards = async () => {
    const boards = collection(db, 'boards');
    const boardsDocs = await getDocs(boards);
    const boardsList = boardsDocs.docs.map( (doc, idx) => {
      // console.log(doc.data());
      return {id:idx, name:doc.data().name, image:doc.data().name + '.svg'}
    });
    return boardsList;
}

export const getPedalById = async (pedalId) => {
    const pedals = collection(db, 'pedals', pedalId);
    const pedalDocs = await getDocs(pedals);
    return pedalDocs.data();
}

export const getBoardById = async (boardId) => {
    const boards = collection(db, 'boards', boardId);
    const boardDocs = await getDocs(boards);
    return boardDocs.data();
}


// Input: boardId (string), pedalId (string), updatedPedalData (object)
// Usage Example: 
/*
      const newPedal = {
        id: 3,
        x: 0,
        y: 0,
        toggled: false,
        param_vals: {
          "Amplification": 2
        }
      }
      await editPedal("1", "3", newPedal);
*/
export const editPedal = async (boardId, pedalId, updatedPedalData) => {
    try {
        const pedalRef = doc(db, 'boards', boardId, 'pedals', pedalId);

        try {
            // Update the pedal document
            await updateDoc(pedalRef, updatedPedalData);
            console.log("Pedal updated successfully!");
        } catch (error) {
            console.error("Error updating pedal:", error);
        }
    }
    catch (error) {
        console.error("Error getting pedal document:", error);
    }
}
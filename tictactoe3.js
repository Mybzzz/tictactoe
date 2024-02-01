import React, { useState,useEffect } from "react";
import Modal from 'react-modal';

function Tictac(){

    //To start a New Game
    const newGame=()=>{
      setmy2DArray([
        ['', '', ''],
        ['', '', ''],
        ['', '', '']]);
      setwin('')  
      setshow('')
      setmoves(1)
      setdraw(false)
      setapiInput('')
    };
    //Toggle active player
    const [player,setplayer]=useState(false)
    let [X,setX]=useState('X')
    
    //Used in placeholder and index value to check
    const [show,setshow]=useState('')

    //Checks the Winner
    let [win,setwin]=useState('')

    //Checks for match Draw
    let [draw,setdraw]=useState(false)
    
    //3X3 matrix
    const [my2DArray,setmy2DArray]=useState([
      ['', '', ''],
      ['', '', ''],
      ['', '', '']]);
      
      //Counts move and checks for winner
      let [moves,setmoves]=useState(1)
      
      //to pass onto api
      const [id,setId]=useState(0)

      //for api call
      let [apiInput,setapiInput]=useState('')

      //for Modal
      const [modalResultShow, setModalResultShow] = useState(false);
      const [modalNewSeriesShow, setModalNewSeriesShow] = useState(false);

      // Calls api as state of api Input changes
      useEffect(() => {if (apiInput!==''){callApi();}}, [apiInput]);
 
      //Updates the value
      const setResponse=()=>{
        const newArray = [...my2DArray];
        const arr1=show.split('');
        if (newArray[arr1[0]][arr1[1]]==='') {
          newArray[arr1[0]][arr1[1]]=X
          setplayer(!player);
          setX(player===false?'O':'X');
          setmoves(moves+1);
          // console.log(moves)
        }
        setmy2DArray(newArray);
        if (moves>=5) {
          // console.log('within moves check')
          var setWinner=winner();
          if (setWinner===true){
            setwin(X);
            setapiInput(`Winner of the Match:${X}`)
            setId(id+1);
            //Calls post api to insert result
            // console.log('calling api from winner and value is',apiInput)
          }
            // callApi();
          }
        if (moves===9){
          setdraw(true);
          setapiInput('Match is Draw')
          setId(id+1);
          // console.log('calling api from Draw')
          // callApi();
        }
      };
      
      // Checks the winner
      function winner(){
        const sumOfRows = my2DArray.map(row => row.reduce((sum, element) => sum + element));
        const sumOfColumns = my2DArray[0].map((_, i) => my2DArray.map(row => row[i]).reduce((sum, element) => sum + element));
        let diagonalSum=''; 
        let counterDiagonalSum='';
        for (let i = 0; i < my2DArray.length; i++) {
          diagonalSum += my2DArray[i][i];
          counterDiagonalSum += my2DArray[i][my2DArray.length - i - 1];
        }
        // console.log(sumOfRows,sumOfColumns,diagonalSum,counterDiagonalSum)
        for (let j=0;j<sumOfRows.length;j++){
          if (sumOfRows[j]===X+X+X||sumOfColumns[j]===X+X+X||diagonalSum===X+X+X||counterDiagonalSum===X+X+X){                 
            // console.log('We have a winner');
            return true
          }
        }
      }
     
     const callApi=()=>{
       var myHeaders = new Headers();
       myHeaders.append("Content-Type", "application/json");
      //  console.log('After update',apiInput)
       var raw = JSON.stringify({
         "InputVal": apiInput,
         "Id": id});

        var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'};

        fetch("http://localhost:3333/api/tictacv3", requestOptions)
        .then(response => response.text())
        // .then(result => console.log(result))
        .catch(error => console.log('error', error));
      }

      //Modal here
      function toggleResultModal() {
        setModalResultShow(!modalResultShow);
        fetchResults();}

      function toggleNewSeriesModal() {
        setModalNewSeriesShow(!modalNewSeriesShow);
        setIsCleared(false)}

      //For Get Api results
      const [result,setResult]=useState(['Please wait while its being fetched..'])

      //Gets Results
      const fetchResults= async () =>{
      const data = await fetch ('http://localhost:3333/api/tictacv3');
      const items=await data.json();
      setResult(items);}

      //Clear record state
      const [iscleared,setIsCleared]=useState(false)

      //Deletes result
      const clearResult= async () =>{
      var requestOptions = {
        method: 'DELETE',
        redirect: 'follow'
      };
      fetch("http://localhost:3333/api/tictacv3", requestOptions)
      .then(response => response.text())
      // .then(result => console.log(result))
      .catch(error => console.log('error', error));
      setIsCleared(true);
      setId(0)
    }

      // Display the array
    return (
      <div className="tictac-common">
        <button className="tictac-bttn" onClick={toggleResultModal} title="Shows Last 10 Game Results">Show Stats</button>
        <Modal isOpen={modalResultShow} onRequestClose={toggleResultModal} ariaHideApp={false}>
        <h1>Last 10 Games Result</h1>
        {result.map((item, index) => (<p key={index} className="grid-list"> {item.Id} {item.InputVal}</p>))}
        <button onClick={toggleResultModal} className="tictac-bttn">Close</button>
        </Modal>
        <button className="tictac-bttn" onClick={toggleNewSeriesModal} title="Start a New Series and Clears history">Restart</button>
        <Modal isOpen={modalNewSeriesShow} onRequestClose={toggleNewSeriesModal} ariaHideApp={false}>
        {iscleared===false?(<><h1>Do you want to Clear Historic Game Results?</h1><button onClick={clearResult} className="tictac-bttn">Yes</button><button onClick={toggleNewSeriesModal} className="tictac-bttn">No</button></>):'Success!'}
        </Modal>
        <h4>Welcome to the Game of TicTacToe</h4>
        <div> </div>
        <h5>{draw===false?(win===''?`Its player: ${X} turn`:`Winner of the match is: ${win}`):'Match is Draw'}</h5>
          {draw===false?(win===''?my2DArray.map((row, i) => (
            <form key={i}>
              {row.map((cell, j) => (
               <input key={`${i}${j}`} className="tictac-cell" 
               onMouseEnter={()=>{setshow(`${i}${j}`)}}
               value={cell}
               placeholder={show===(`${i}${j}`)?X:''} onClick={setResponse} onChange={(e)=>(e.target.value)}/>))}
            </form>
          )):<button onClick={newGame} className="tictac-bttn">New Game!</button>):<button onClick={newGame} className="tictac-bttn">New Game!</button>}
      </div>
    );
  };
  
export default Tictac;
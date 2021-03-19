import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';

// displays data from all teams at a match
const Match = ({ match }) => {
    // match number and regional from url
    const matchNum = match.params.match;
    const regional = match.params.regional;

    // state for red alliance and blue alliance data
    const [redData, setRedData] = useState([]);
    const [blueData, setBlueData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            // fetch and set data from each alliance
            console.log("=========LOADING DATA=========");
            try {                
                const redRef = await db.collection("regional").doc(regional).collection("matches").doc(matchNum).collection("red").get();
                const blueRef = await db.collection("regional").doc(regional).collection("matches").doc(matchNum).collection("blue").get();
                
                if(redRef !== null) {
                    setRedData(redRef.docs.map(doc => doc.data()));
                    console.log("Red Alliance Array", redRef.docs.map(doc => ({...doc.data(), id: doc.id})));
                }
                    
                if(blueRef !== null) {
                    setBlueData(blueRef.docs.map(doc => ({...doc.data(), id: doc.id})));
                    console.log("Blue Alliance Array", blueRef.docs.map(doc => ({...doc.data(), id: doc.id})));
                }
                    
                console.log("=========DATA LOADED=========");
                
            } catch(e) {
                console.log(e);
            }
        }
        console.log("=========IN MATCH USE EFFECT=========");
        fetchData().then("=========OUT OF MATCH USE EFFECT=========");
    }, [matchNum, regional]);

    return (
        <>
            {/* Breadcrumbs */}
            <div>
                <h3>
                    <Link to="/">Home</Link> / 
                    <Link to={"/regional/" + regional}> {regional}</Link> / 
                     Match # {matchNum}
                </h3>
            </div>
            {/* match data from each team */}
            {redData.length || blueData.length ? <>
                <h2 style={{color: "red"}}>Red Alliance</h2>
                <ul>
                    {redData.map(data => <><h2><Link to={"/teams/" + regional + "/" + data.data.teamNum}>Team # {data.data.teamNum}</Link></h2><li className = "data">{JSON.stringify(data, undefined, 2)}</li></>)}
                </ul>
                <h2 style={{color: "blue"}}>Blue Alliance</h2>
                <ul>
                    {redData.map(data => <><h2><Link to={"/teams/" + regional + "/" + data.data.teamNum}>Team # {data.data.teamNum}</Link></h2><li className = "data">{JSON.stringify(data, undefined, 2)}</li></>)}
                </ul>

                
            </> : <h2>Match Data Not Found</h2>}
            <Link to="/" >Back to home</Link>
        </>
    )
}

export default Match;
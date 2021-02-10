import React, { useEffect, useState } from 'react';
import { db } from '../firebase';

const  Match = ({ match }) => {
    const matchNum = match.params.match;
    const regional = match.params.regional;
    const [redData, setRedData] = useState([]);
    const [blueData, setBlueData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const redRef = await db.collection("regional").doc(regional).collection("matches").doc(matchNum).collection("red").get();
            const blueRef = await db.collection("regional").doc(regional).collection("matches").doc(matchNum).collection("blue").get();
            
            if(redRef !== null)
                setRedData(redRef.docs.map(doc => doc.data()));
            if(blueRef !== null)
                setBlueData(blueRef.docs.map(doc => ({...doc.data(), id: doc.id})));
        }
        fetchData();
    }, []);

    return (
        <>
            <h2>Red Alliance</h2>
            <ul>
                {redData.map(data => <li className = "data">{JSON.stringify(data, undefined, 2)}</li>)}
            </ul>
            <h2>Blue Alliance</h2>
            <ul>
                {blueData.map(data => <li className = "data">{JSON.stringify(data, undefined, 2)}</li>)}
            </ul>
        </>
    )
}

export default Match;
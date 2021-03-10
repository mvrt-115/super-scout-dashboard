import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
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
    }, [match]);

    return (
        <>
            <div>
                <h3>
                    <Link to="/">Home</Link> / 
                    <Link to={"/regional/" + regional}> {regional}</Link> / 
                     Match # {matchNum}
                </h3>
            </div>
            {redData.length && blueData.length ? <>
                <h2 style={{color: "red"}}>Red Alliance</h2>
                <ul>
                    {redData.map(data => <li className = "data">{JSON.stringify(data, undefined, 2)}</li>)}
                </ul>
                <h2 style={{color: "blue"}}>Blue Alliance</h2>
                <ul>
                    {blueData.map(data => <li className = "data">{JSON.stringify(data, undefined, 2)}</li>)}
                </ul>

                
            </> : <h2>Match Data Not Found</h2>}
            <Link to="/" >Back to home</Link>
        </>
    )
}

export default Match;
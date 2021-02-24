import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';

function TeamData({match}) {
    const team = match.params.team;
    const regional = match.params.regional;
    const matchNum = match.params.match;
    
    console.log("match", match);

    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            if(matchNum) {
                const matchRef = await db.collection("regional").doc(regional).collection("teams").doc(team).collection("matches").doc(matchNum).get();
                setMatches([matchRef.data()]);
            } else {
                const teamRef = await db.collection("regional").doc(regional).collection("teams").doc(team).collection("matches").get()
                setMatches(teamRef.docs.map((doc) => {
                    if(!doc.exists)
                        return {}
                    console.log(doc.data());
                    return doc.data()
                }))
            }
            setLoading(false)
        }
        fetchData();
    }, []);

    return (
        <>
           {!loading && <ul>
                {matches && matches.length ? matches.map((match) => (
                    <li className = "data">
                        <h3>Match # {match.data.matchNum}</h3>
                        {JSON.stringify(match, undefined, 2)}
                    </li>
                )) : (<><h1>There are no mathes played by this team or this team did not play this match</h1></>)}
            </ul>}
            <Link to="/">Back to home</Link>
        </>
    )
}

export default TeamData;
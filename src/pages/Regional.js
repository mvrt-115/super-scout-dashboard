import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';

const Regional = ({ match }) => {
    const regional = match.params.regional;
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const matchRef = await db.collection("regional").doc(regional).collection("matches").get();
            setMatches(matchRef.docs.map(doc => doc.id));

            const teamRef = await db.collection("regional").doc(regional).collection("teams").get();
            setTeams(teamRef.docs.map(doc => doc.id));
        }
        fetchData();
    }, [])

    return (
        <>
            <div>
                <h3><Link to="/">Home</Link> / {regional}</h3>
            </div>
            <h3>Matches:</h3>
            <ul>
                {matches.map(match => <li className = "link" ><Link to={`/regional/${regional}/match/${match}`}>{match}</Link></li>)}
            </ul>
            <h3>Teams:</h3>
            <ul>
                {teams.map(team => <li className = "link" ><Link to={`/teams/${regional}/${team}`}>{team}</Link></li>)}
            </ul>
        </>
    )
}

export default Regional;
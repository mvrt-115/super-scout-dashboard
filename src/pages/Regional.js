import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';

const Regional = ({ match }) => {
    const regional = match.params.regional;
    const [matches, setMatches] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const matchRef = await db.collection("regional").doc(regional).collection("matches").get();
            setMatches(matchRef.docs.map(doc => doc.id));
        }
        fetchData();
    }, [])

    return (
        <>
            <ul>
                {matches.map(match => <li className = "link" ><Link to={`/regional/${regional}/match/${match}`}>{match}</Link></li>)}
            </ul>
        </>
    )
}

export default Regional;
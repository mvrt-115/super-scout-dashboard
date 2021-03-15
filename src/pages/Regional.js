import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { db } from '../firebase';

// displays matches and teams in a given regional
const Regional = ({ match }) => {
    const regional = match.params.regional;
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // fetch matches
                const matchRef = await db.collection("regional").doc(regional).collection("matches").get();
                setMatches(matchRef.docs.map(doc => doc.id));

                // fetch teams
                const teamRef = await db.collection("regional").doc(regional).collection("teams").get();
                setTeams(teamRef.docs.map(doc => doc.id));
            } catch (e) {
                console.log(e);
            }
            
        }
        fetchData();
    }, [regional])

    return (
        <>
            {/* Breadcrumbs */}
            <div>
                <h3><Link to="/">Home</Link> / {regional}</h3>
            </div>
            <Row>
                <Col>
                    {/* Display matches */}
                    <h3>Matches:</h3>
                    <ul>
                        {matches.map(match => <li className = "link" ><Link to={`/regional/${regional}/match/${match}`}>{match}</Link></li>)}
                    </ul>
                    </Col>
                <Col>
                    {/* Display teams */}
                    <h3>Teams:</h3>
                    <ul>
                        {teams.map(team => <li className = "link" ><Link to={`/teams/${regional}/${team}`}>{team}</Link></li>)}
                    </ul>
                </Col>
            </Row>
        </>
    )
}

export default Regional;
import React, { useEffect, useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import * as math from 'mathjs';
import { db } from '../firebase';
import { typeOf } from 'mathjs';

// displays matches and teams in a given regional
const Regional = ({ match }) => {
    const regional = match.params.regional;
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState([]);
    const [teamData, setTeamData] = useState({});
    const [regionalData, setRegionalData] = useState({})

    const [refreshLoading, setRefreshLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const matchesRef = await db.collection("regional").doc(regional).collection("matches").get();
                const teamsRef = await db.collection("regional").doc(regional).collection("teams").get();
                
                let teams = teamsRef.docs.map(doc => doc.id);
                let regionalData = {};

                teams.forEach(async team => {
                    const teamRef = await db.collection("regional").doc(regional).collection("teams").doc(team).collection("matches").get();
                    const teamData = teamRef.docs.map(doc => doc.data());

                    regionalData[team] = {}

                    Object.keys(teamData[0].data).forEach(key => {
                        if(Number.isSafeInteger(teamData[0].data[key]) && key!== 'scout_id') {
                            const arr = teamData.map(team => team.data[key]);

                            regionalData[team][key] = {
                                min: math.min(arr),
                                mean: math.mean(arr),
                                median: math.median(arr),
                                max: math.max(arr),
                            };
                        }

                    })
                })

                console.log(regionalData);

                setMatches(matchesRef.docs.map(doc => doc.id));
                setTeams(teams);

                
            } catch (e) {
                console.log(e);
            }
            setRefreshLoading(false);
        }
        fetchData();
    }, [regional, refreshLoading])

    return (
        <>
            {/* Breadcrumbs */}
            <div>
                <h3><Link to="/">Home</Link> / {regional}</h3>
            </div>
            <Row>

                <Button
                    variant="primary"
                    disabled={refreshLoading}
                    onClick={!refreshLoading ? () => {setRefreshLoading(true)} : null}
                    size="lg"
                    block
                    className="my-2 mx-3"
                >
                    {refreshLoading ? 'Loading…' : 'Refresh Data'}
                </Button>
                </Row>
            <Row>
                <Col>   
                    {/* Display matches */}
                    <h3>Matches:</h3>
                    <ul>
                        {matches.map(match => <li className = "link" key={match}><Link to={`/regional/${regional}/match/${match}`}>{match}</Link></li>)}
                    </ul>
                </Col>
                <Col>
                    {/* Display teams */}
                    <h3>Teams:</h3>
                    <ul>
                        {teams.map(team => <li className = "link" key={team}><Link to={`/teams/${regional}/${team}`}>{team}</Link></li>)}
                    </ul>
                </Col>
            </Row>
        </>
    )
}

export default Regional;
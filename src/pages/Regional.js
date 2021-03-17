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
                // fetch matches
                const matchRef = await db.collection("regional").doc(regional).collection("matches").get();
                const teamRef = await db.collection("regional").doc(regional).collection("teams").get();
                let teams = {};
                
                //loop through each team id
                teamRef.docs.forEach(async (doc) => {

                    

                    //get all matches from one team
                    const allTeamMatches = await db.collection("regional").doc(regional).collection("teams").doc(doc.id).collection("matches").get();
                    
                    //add all matches from team to doc
                    let matchArr = allTeamMatches.docs.map(doc => (doc.data().data));

                    Object.keys(matchArr[0]).forEach((key) => {
                        if(typeOf(matchArr[0][key]) === 'number') {
                            const ofKey = matchArr.map(match => match[key]);
                            console.log(ofKey)
                            try{
                                teams[doc.id][key] = {
                                    min: math.min(ofKey),
                                    max: math.max(ofKey),
                                    median: math.median(ofKey),
                                    mean: math.mean(ofKey),
                                }
                            } catch (e) {
                                console.log(e);
                            }
                        }

                    })
                })

                console.log(teams);

                let matchesArr = matchRef.docs.map(doc => {
                    console.log("doc", doc.data())
                    return ({data: doc.data(), id: doc.id})
                });
                setMatches(matchRef.docs.map(doc => doc.id));
               
                let teamsArr = teamRef.docs.map(doc => ({data: doc.data(), id: doc.id}));
                console.log("teams data", teamsArr);
                setTeams(teamRef.docs.map(doc => doc.id));

                // regionalData = {
                //     115: {
                //         cycles: {
                //             low: 5,
                //              mean: 9,
                //              medium: 10,
                //              high: 20,
                //         },
                //         autonBottom: { ...},
                //     }
                // }
                
                setRegionalData({
                    teams: teams,
                    matches: matches
                })

                
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
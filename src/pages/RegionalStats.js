import * as math from 'mathjs';
import React, { useEffect, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { db } from '../firebase';

const RegionalStats = ({ match }) => {
    const [regionals, setRegionals] = useState([]);
    const [regionalData, setRegionalData] = useState({});
    const [loading, setLoading] = useState(true);
    const regional = match.params.regional;

    useEffect(() => {
        const fetchData = async () => {
            console.log("=========LOADING DATA=========");
            try {
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
            
                const regionalRequest = await db.collection('regional').get();
                setRegionals(regionalRequest.docs.map(doc => doc.id));

                console.log("Regionals Array", regionalRequest.docs.map(doc => doc.id));

                console.log("Min, Mean, Median, Max Data for all teams at regional", regionalData);
                setRegionalData(regionalData);                

                console.log("=========DATA LOADED=========");
            } catch (e) {
                console.log(e);
            }
        }
        console.log("=========IN REGIONAL STATS USE EFFECT=========");
        fetchData().then();
        
    },[regional])

    return (
        <>
            <div>
                <h3><Link to="/">Home</Link> / <Link to={"/regional/" + regional}>{regional}</Link> / Stats</h3>
                <Dropdown>
                    <Dropdown.Toggle>
                        Change Regional
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        {regionals.map(reg => <Dropdown.Item as={Link} disabled={reg === regional} to={"/regional/" + reg + "/stats"}>{reg}</Dropdown.Item>)}
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </>
    )
}

export default RegionalStats;
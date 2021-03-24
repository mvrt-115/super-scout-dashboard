import React, { useEffect, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import { useRegionalData } from '../contexts/RegionalDataContext';
import { db } from '../firebase';
import {HorizontalGridLines, VerticalBarSeries, XAxis, XYPlot, YAxis } from 'react-vis';
import * as math from 'mathjs';


const RegionalStats = ({ match }) => {
    const regional = match.params.regional;
    const {regionals, updateRegionals, updateRegionalData} = useRegionalData();
    const [loading, setLoading] = useState(true);
    const [totalPointsByTeam, setTotalPointsByTeam] = useState([]);
    const history = useHistory(); 

    

    useEffect(() => {
        const fetchData = async () => {
            console.log("=========LOADING DATA=========");
            try {
                
                let regionalData = await updateRegionalData(regional);
                await updateRegionals();
                
                if(regionalData === {}){
                    console.warn("Regional data is empty", regionalData);
                    history.push("/");
                }
                const tpbt = Object.keys(regionalData).map((team) => ({
                    y: math.sum(regionalData[team].autonBottom) * 2 + math.sum(regionalData[team].autonUpper) * 4 + math.sum(regionalData[team].autonInner) * 6
                        + math.sum(regionalData[team].teleopBottom) + math.sum(regionalData[team].teleopUpper) * 2 + math.sum(regionalData[team].teleopInner) * 3,
                    team: team                
                }));

                tpbt.sort((a, b) => (a.y < b.y) ? 1 : -1);

                tpbt.forEach((team, index) => team.x = index + 1)
                
                console.log("hii", tpbt);
                setTotalPointsByTeam(tpbt);
                console.log("=========DATA LOADED=========");
            } catch (e) {
                console.log(e);
            }
        }
        console.log("=========IN REGIONAL STATS USE EFFECT=========");
        fetchData().then(() => { 
            setLoading(false) 
        });
    },[regional, history])


    
    return (
        <>
            <div>
                <h3><Link to="/">Home</Link> / <Link to={"/regional/" + regional}>{regional}</Link> / Stats</h3>
                <Dropdown>
                    <Dropdown.Toggle>
                        Change Regional
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        {regionals.map(reg => <Dropdown.Item as={Link} disabled={reg === regional} to={"/regional/" + reg + "/stats"} key={reg}>{reg}</Dropdown.Item>)}
                    </Dropdown.Menu>
                </Dropdown>
            
                                
                {!loading && <XYPlot width={1500} height={600}>
                    <HorizontalGridLines/>

                    <VerticalBarSeries
                        data={totalPointsByTeam}
                        color="#fcba03"/>

                    <XAxis title="Team #" tickFormat={(val, i) => totalPointsByTeam[i].team} tickValues={totalPointsByTeam.map(team => team.x)}/>
                    <YAxis title="Points"/>
                </XYPlot>}
            </div>
        </>
    )
}

export default RegionalStats;
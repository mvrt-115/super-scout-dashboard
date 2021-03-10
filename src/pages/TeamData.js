import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DiscreteColorLegend, HorizontalGridLines, VerticalBarSeries, VerticalGridLines, XAxis, XYPlot, YAxis } from 'react-vis';
import { db } from '../firebase';
import "react-vis/dist/style.css";
import * as     math from 'mathjs';
import { Button, Col, Row } from 'react-bootstrap';


function TeamData({match}) {
    const team = match.params.team;
    const regional = match.params.regional;
    const matchNum = match.params.match;

    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    const [timeSeriesVisible, setTimeSeriesVisisble] = useState(false);

    const [dataG1Auton, setDataG1Auton] = useState([]) 
    const [dataG1Teleop, setDataG1Teleop] = useState([])

    const [autonData, setAutonData] = useState([])

    const totalPoints = (data, gameState) => {
        let bottomMult = 1
        let outerMult = 2
        let innerMult = 3;
        if(gameState === "auton"){
            bottomMult = 2
            outerMult = 4
            innerMult = 6
            
            return (data.autonBottom * bottomMult) + (data.autonUpper * outerMult) + (data.autonInner * innerMult)
        }
        return (data.teleopBottom * bottomMult) + (data.teleopUpper * outerMult) + (data.teleopInner * innerMult)
    }
    

    useEffect(() => {
        const fetchData = async () => {
            if(matchNum) {
                const matchRef = await db.collection("regional").doc(regional).collection("teams").doc(team).collection("matches").doc(matchNum).get();
                setMatches([matchRef.data()]);
            } else {
                const teamRef = await db.collection("regional").doc(regional).collection("teams").doc(team).collection("matches").get()
                let auton = [];
                let teleop = [];
                let autonBalls = [];
                setMatches(teamRef.docs.map((doc) => {
                    if(!doc.exists) 
                        return {}
                    auton = [...auton, {x: doc.data().data.matchNum, y: totalPoints(doc.data().data, "auton")}];
                    teleop = [...teleop, {x: doc.data().data.matchNum, y: totalPoints(doc.data().data, "teleop")}];
                    autonBalls = [...autonBalls, doc.data().data.autonInner + doc.data().data.autonUpper + doc.data().data.autonBottom];
                    return doc.data()
                }))
                setDataG1Auton(auton);
                setDataG1Teleop(teleop);

                if(matches.length) {
                    setAutonData([
                        {x: "min", y: math.min(autonBalls)},
                        {x: "median", y: math.median(autonBalls)},
                        {x: "max", y: math.max(autonBalls)},
                    ])
                }
            }
            setLoading(false)
        }
        fetchData();
    }, [matchNum, regional, team, matches.length]);

    return (
        <>
            <div>
                <h3>
                    <Link to="/">Home</Link> / 
                    <Link to={"/regional/" + regional}> {regional}</Link> / 
                    {matchNum ? <><Link to={"/teams/" + regional + "/" + team}> Team # {team}</Link> / Match # {matchNum} </> : <> Team # {team}</>}
                </h3>
            </div>
            {!loading && 
            <>
                <ul>
                {matches && matches.length ? matches.map((match) => ( match ? (
                    <li className = "data">
                        <h3><Link to={"/teams/" + regional + "/" + team + "/" + match.data.matchNum}>Match # {match.data.matchNum}</Link></h3>
                        {JSON.stringify(match, null, 1)}
                    </li>
                ) : <></>)) : (<><h1>There are no mathes played by this team or this team did not play this match</h1></>)}
                </ul>
                {(dataG1Auton || dataG1Teleop || autonData) && <Button onClick={() => setTimeSeriesVisisble(!timeSeriesVisible)}>Toggle Graphs</Button>}
                    <Row>
                        {dataG1Auton && dataG1Teleop && timeSeriesVisible &&
                        <Col>
                            
                            <XYPlot xType="ordinal" width={300} height={350} xDistance={100}>
                                <DiscreteColorLegend
                                    style={{position: 'absolute', left: '50px', top: '10px'}}
                                    orientation="vertical"
                                    items={[
                                    {
                                        title: 'Auton Points',
                                        color: '#7300b5'
                                    },
                                    {
                                        title: 'Teleop Points',
                                        color: '#fcba03'
                                    }
                                    ]}
                                />
                                <VerticalGridLines />
                                <HorizontalGridLines />
                                
                                <VerticalBarSeries className="vertical-bar-series-example" data={dataG1Teleop} color="#7300b5" />
                                <VerticalBarSeries data={dataG1Auton} color="#fcba03"/>
                                <XAxis title="Match #"/>
                                <YAxis title="Points"/>
                            </XYPlot>
                        </Col>}
                        {autonData && timeSeriesVisible &&
                        <Col>
                            <XYPlot xType="ordinal" width={300} height={350} xDistance={100}>
                                <DiscreteColorLegend
                                    style={{position: 'absolute', left: '50px', top: '10px'}}
                                    orientation="vertical"
                                    items={[
                                    {
                                        title: 'Auton Balls Scored',
                                        color: '#7300b5'
                                    }
                                    ]}
                                />
                                <VerticalGridLines />
                                <HorizontalGridLines />
                                <VerticalBarSeries data={autonData} color="#7300b5"/>
                                <XAxis />
                                <YAxis />
                            </XYPlot>
                        </Col>
                        }
                    </Row>
                
            </>}
        </>
    )
}

export default TeamData;
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DiscreteColorLegend, HorizontalGridLines, VerticalBarSeries, VerticalGridLines, XAxis, XYPlot, YAxis, RadialChart } from 'react-vis';
import { db } from '../firebase';
import "react-vis/dist/style.css";
import * as math from 'mathjs';
import { Button, Col, Row } from 'react-bootstrap';

// displays the a team's data (team and regional are passed in through link and router stuff)
function TeamData({match}) {
    // get team regional and match from url
    const team = match.params.team;
    const regional = match.params.regional;
    const matchNum = match.params.match;

    // array of match data
    const [matches, setMatches] = useState([]);

    // if the page is still getting data from firebase
    const [loading, setLoading] = useState(true);

    // showing graphs state
    const [timeSeriesVisible, setTimeSeriesVisisble] = useState(false);

    // auton and teleop data for the first graph
    const [dataG1Auton, setDataG1Auton] = useState([]);
    const [dataG1Teleop, setDataG1Teleop] = useState([]);

    // auton and teleop data for min, median, max graphs
    const [autonData, setAutonData] = useState([]);
    const [teleopData, setTeleopData] = useState([]);

    // total points scored
    const [points, setPoints] = useState([]);

    // Radial chart data to keep track of climb fails and successes
    const [pieChartData, setPieChartData] = useState([])

    // calculates total auton/teleop points
    const totalPoints = (data, gameState) => {  
        return gameState === "auton" ? (data.autonBottom * 2) + (data.autonUpper * 4) + (data.autonInner * 6) :
        (data.teleopBottom) + (data.teleopUpper * 2) + (data.teleopInner * 3)
    }

    // called when team/regional/match changes and when page starts up
    useEffect(() => {
        const fetchData = async () => {
            try {
                // if a match is selected get the data from this teams performance in that match from firebase
                if(matchNum) {
                    const matchRef = await db.collection("regional").doc(regional).collection("teams").doc(team).collection("matches").doc(matchNum).get();
                    setMatches([matchRef.data()]);
                // otherwise get all team dataa
                } else {
                    // get all matches that the team has played from firebase
                    const teamRef = await db.collection("regional").doc(regional).collection("teams").doc(team).collection("matches").get()
                    
                    // temporary variables that will be used to set state
                    let auton = [];
                    let teleop = [];
                    let autonBalls = [];
                    let teleopBalls = [];
                    let climbFailsNum = 0;
                    let climbSucessNum = 0;
                    let didNotAttemptsNum = 0;
                    let pointsData = [];

                    setMatches(teamRef.docs.map((doc, index) => {
                        if(!doc.exists) 
                            return {}
                        // updating data based on each match
                        auton = [...auton, {x: doc.data().data.matchNum, y: totalPoints(doc.data().data, "auton")}];
                        teleop = [...teleop, {x: doc.data().data.matchNum, y: totalPoints(doc.data().data, "teleop")}];
                        autonBalls = [...autonBalls, doc.data().data.autonInner + doc.data().data.autonUpper + doc.data().data.autonBottom];
                        teleopBalls = [...teleopBalls, doc.data().data.teleopInner + doc.data().data.teleopUpper + doc.data().data.teleopBottom];
                        pointsData = [...pointsData, {x: doc.data().data.matchNum, y: auton[index].y + teleop[index].y}];

                        if(!doc.data().data.attemptHang){
                            didNotAttemptsNum++;
                        }
                        
                        if(doc.data().data.attemptHang){
                            if(doc.data().data.hangFail){
                                climbFailsNum++;
                            }
                            else {
                                climbSucessNum++;
                            }
                        }

                        return doc.data();
                    }))

                    // changing the state of different things
                    setDataG1Auton(auton);
                    setDataG1Teleop(teleop);
                    setPoints(pointsData);
                    setPieChartData([
                        {angle: climbFailsNum, label: climbFailsNum > 0 ? "Failed to Climb" : "", color: "#fcba03"}, 
                        {angle: climbSucessNum, label: climbSucessNum > 0 ? "Climb Successes" : "", color: "#ffd769"}, 
                        {angle: didNotAttemptsNum, label: didNotAttemptsNum > 0 ? "Did not attempt" : "", color: "#a849de"}
                    ]);

                    if(matches.length) {
                        setAutonData([
                            {x: "min", y: math.min(autonBalls)},
                            {x: "median", y: math.median(autonBalls)},
                            {x: "max", y: math.max(autonBalls)},
                        ])
                        setTeleopData([
                            {x: "min", y: math.min(teleopBalls)},
                            {x: "median", y: math.median(teleopBalls)},
                            {x: "max", y: math.max(teleopBalls)},
                        ])
                    }
                }
            } catch(e) {
                console.log(e);
            }
            setLoading(false);
        }
        fetchData();
    }, [matchNum, regional, team, matches.length]);


    return (
        <>
            {/* Breadcrumbs */}
            <div>
                <h3>
                    <Link to="/">Home</Link> / 
                    <Link to={"/regional/" + regional}> {regional}</Link> / 
                    {matchNum ? <><Link to={"/teams/" + regional + "/" + team}> Team # {team}</Link> / Match # {matchNum} </> : <> Team # {team}</>}
                </h3>
            </div>
            {/* once loaded show the data */}
            {!loading && 
            <>
                {/* displays match data from matches array */}
                <ul>
                {matches && matches.length ? matches.map((match) => ( match ? (
                    <li className = "data" key={match.data.matchNum}>
                        <h3><Link to={"/teams/" + regional + "/" + team + "/" + match.data.matchNum}>Match # {match.data.matchNum}</Link></h3>
                        {JSON.stringify(match, null, 1)}
                    </li>
                ) : <></>)) : (<><h1>There are no mathes played by this team or this team did not play this match</h1></>)}
                </ul>
                {(matches.length > 1) && <Button onClick={() => setTimeSeriesVisisble(!timeSeriesVisible)}>Toggle Graphs</Button>}
                
                {matches.length > 1 && timeSeriesVisible && <Row>
                    {/* Teleop vs Auton points per game bar chart */}
                    <Col>
                        <XYPlot xType="ordinal" width={300} height={350} xDistance={100}>
                            <DiscreteColorLegend
                                style={{position: 'absolute', left: '50px', top: '10px'}}
                                orientation="vertical"
                                items={[
                                {
                                    title: 'Teleop Points',
                                    color: '#7300b5'
                                },
                                {
                                    title: 'Auton Points',
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
                    </Col>
                    {/* Auton min, median, max graph */}
                    <Col>
                        <XYPlot xType="ordinal" width={300} height={350} xDistance={100} stackBy="y">
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
                            <VerticalBarSeries data={autonData} color="#7300b5" />
                            <XAxis />
                            <YAxis />
                        </XYPlot>
                    </Col>
                    {/* Teleop min, median, max graph */}
                    <Col>
                        <XYPlot xType="ordinal" width={300} height={350} xDistance={100}>
                            <DiscreteColorLegend
                                style={{position: 'absolute', left: '50px', top: '10px'}}
                                orientation="vertical"
                                items={[
                                {
                                    title: 'Teleop Balls Scored',
                                    color: '#7300b5'
                                }
                                ]}
                            />
                            <VerticalGridLines />
                            <HorizontalGridLines />
                            <VerticalBarSeries data={teleopData} color="#7300b5"/>
                            <XAxis />
                            <YAxis />
                        </XYPlot>
                    </Col>
                    {/* total points per match bar chart */}
                    <Col>
                        <XYPlot xType="ordinal" width={300} height={350} xDistance={100}>
                            <DiscreteColorLegend
                                style={{position: 'absolute', left: '50px', top: '10px'}}
                                orientation="vertical"
                                items={[
                                {
                                    title: 'Points Scored',
                                    color: '#fcba03'
                                }
                                ]}
                            />
                            <VerticalGridLines />
                            <HorizontalGridLines />
                            <VerticalBarSeries data={points} color="#fcba03"/>
                            <XAxis title="Match # "/>
                            <YAxis title="Points" />
                        </XYPlot>
                    </Col>
                    {/* Climb, Failed, did not attempt */}
                    <Col>
                        <RadialChart
                            data={pieChartData}
                            labelsStyle={{
                                fontSize:10,
                                margin: 10,
                            }}
                            colorType="literal"
                            showLabels={true}
                            labelsRadiusMultiplier={0.8}
                            labelsAboveChildren={true}
                            padAngle={0}
                            margin={
                                {left: 40, right: 40, top: 10, bottom: 10}
                            }
                            width={300}
                            height={300}
                        />
                    </Col>
                </Row>}
            </>}
        </>
    )
}

export default TeamData;
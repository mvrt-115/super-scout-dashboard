import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DiscreteColorLegend, HorizontalGridLines, VerticalBarSeries, VerticalGridLines, XAxis, XYPlot, YAxis, RadialChart, Crosshair, HorizontalBarSeries, LabelSeries } from 'react-vis';
import { db } from '../firebase';
import "react-vis/dist/style.css";
import * as math from 'mathjs';
import { Button, Col, Row, Table } from 'react-bootstrap';

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
    const [showRawData, setShowRawData] = useState(false);

    // auton and teleop data for the first graph
    const [dataG1Auton, setDataG1Auton] = useState([]);
    const [dataG1Teleop, setDataG1Teleop] = useState([]);
    const [crosshairG1, setCrosshairG1] = useState([])

    // auton and teleop data for min, median, max graphs
    const [autonData, setAutonData] = useState({});
    const [teleopData, setTeleopData] = useState([]);
    const [crosshairG2, setCrosshairG2] = useState([]);
    const [crosshairG3, setCrosshairG3] = useState([]);

    // total points scored
    const [points, setPoints] = useState([]);
    const [crosshairG4, setCrosshairG4] = useState([]);


    // Radial chart data to keep track of climb fails and successes
    const [pieChartData, setPieChartData] = useState([])

    // calculates total auton/teleop points
    const totalPoints = (data, gameState) => {  
        return gameState === "auton" ? (data.autonBottom * 2) + (data.autonUpper * 4) + (data.autonInner * 6) :
        (data.teleopBottom) + (data.teleopUpper * 2) + (data.teleopInner * 3)
    }

    const fetchData = async () => {
        setLoading(true);
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
                    {angle: climbSucessNum, label: climbSucessNum > 0 ? "Climb Successes" : "", color: "#7300b5"}, 
                    {angle: didNotAttemptsNum, label: didNotAttemptsNum > 0 ? "Did not attempt" : "", color: "#A7A6BA"}
                ]);

                if(matches.length) {
                    setAutonData({
                        min : [{y: team, x: math.min(autonBalls)}],
                        mean : [{y: team, x: math.mean(autonBalls) - math.min(autonBalls)}],
                        max : [{y: team, x: math.max(autonBalls) - math.mean(autonBalls)}],
                    })
                    setTeleopData({
                        min : [{y: team, x: math.min(teleopBalls)}],
                        mean : [{y: team, x: math.mean(teleopBalls) - math.min(teleopBalls)}],
                        max : [{y: team, x: math.max(teleopBalls) - math.mean(teleopBalls)}],
                    })
                }
            }
        } catch(e) {
            console.log(e);
        }
        setLoading(false);
    }
    

    // called when team/regional/match changes and when page starts up
    useEffect(() => {
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
                <Button onClick={fetchData}>
                    Refresh Data
                </Button>
            </div>
            {/* once loaded show the data */}
            {!loading && 
            <>                
                {matches.length > 1 ? <Row>
                    {/* Teleop vs Auton points per game bar chart */}
                    <Col>
                        <XYPlot xType="ordinal" width={1200} height={400} xDistance={100} stackBy="y" onMouseLeave={() => {setCrosshairG1([])}}>
                            <DiscreteColorLegend
                                style={{position: 'absolute', left: '50px', top: '10px'}}
                                orientation="vertical"
                                items={[
                                    {
                                        title: 'Auton Points',
                                        color: '#fcba03'
                                    },
                                    {
                                        title: 'Teleop Points',
                                        color: '#7300b5'
                                    },
                                    
                                ]}
                            />
                            <VerticalGridLines />
                            <HorizontalGridLines />
                            <VerticalBarSeries  
                                onNearestX={(value, {index}) => {setCrosshairG1([{...dataG1Auton[index]}, {...dataG1Teleop[index]}])}} 
                                className="vertical-bar-series-example" 
                                data={dataG1Teleop} 
                                color="#7300b5"/>
                            <VerticalBarSeries data={dataG1Auton} color="#fcba03"/>
                            <XAxis title="Match #"/>
                            <YAxis title="Points"/>
                            <Crosshair 
                                values={crosshairG1} 
                                titleFormat={(d) => ({title: "Match", value: d[0].x})} 
                                itemsFormat={(d) => ([{ title: "Auton points", value: d[0].y }, { title: "Teleop points", value: d[1].y }])}
                            />
                        </XYPlot>
                    </Col>
                    {/* Auton min, median, max graph */}
                    <Col>
                        <XYPlot yType="ordinal" width={1200} height={200} xDistance={100} stackBy="x" onMouseLeave={() => setCrosshairG2([])}>
                            <VerticalGridLines />
                            <HorizontalGridLines />
                            <HorizontalBarSeries 
                                data={teleopData.min} 
                                color="#a200ff" 
                                onNearestX={(value) => {setCrosshairG2([{value}])} } 
                            />
                            <HorizontalBarSeries 
                                data={teleopData.mean} 
                                color="#8b00db" 
                                onNearestX={(value) => {setCrosshairG2([{value}])} }
                            />
                            <HorizontalBarSeries 
                                data={teleopData.max} 
                                color="#7300b5" 
                                onNearestX={(value) => {setCrosshairG2([{value}])} } 
                                
                            />

                            {teleopData.min && teleopData.min.length > 0 && <LabelSeries
                                data={[
                                    {x: teleopData.min[0].x, y: 115, label: "Min: "},
                                    {x: teleopData.mean[0].x, y: 115, label: "Mean: "},
                                    {x: teleopData.max[0].x, y: 115, label: "Max: "},
                                ]}
                                getLabel={d => d.label + (Math.round(d.x * 100) / 100) + " balls"}
                            />}
                            <XAxis title="Points scored in teleop" />
                            <YAxis />
                            <Crosshair 
                                values={crosshairG2}
                                titleFormat={() => ({title: "Team", value: team})}
                                itemsFormat={() => {
                                    return [
                                        {title: "Min", value: teleopData.min[0].x  + " balls scored"},
                                        {title: "Mean", value: teleopData.mean[0].x + teleopData.min[0].x + " balls scored"},
                                        {title: "Max", value: teleopData.max[0].x + teleopData.mean[0].x + teleopData.min[0].x + " balls scored"},
                                    ]
                                }}
                            />
                        </XYPlot>
                    </Col>
                    {/* Teleop min, median, max graph */}
                    <Col>
                    <XYPlot yType="ordinal" width={1200} height={200} xDistance={100} stackBy="x" onMouseLeave={() => setCrosshairG3([])}>
                            <VerticalGridLines />
                            <HorizontalGridLines />
                            <HorizontalBarSeries 
                                data={autonData.min} 
                                color="#ffd45e" 
                                onNearestX={(value) => {setCrosshairG3([{value}])} } 
                            />
                            <HorizontalBarSeries 
                                data={autonData.mean} 
                                color="#ffc933" 
                                onNearestX={(value) => {setCrosshairG3([{value}])} }
                            />
                            <HorizontalBarSeries 
                                data={autonData.max} 
                                color="#fcba03" 
                                onNearestX={(value) => {setCrosshairG3([{value}])} } 
                                
                            />
                            {autonData.min && autonData.min.length > 0 && <LabelSeries
                                data={[
                                    {x: autonData.min[0].x, y: 115, label: "Min: "},
                                    {x: autonData.mean[0].x, y: 115, label: "Mean: "},
                                    {x: autonData.max[0].x, y: 115, label: "Max: "},
                                ]}
                                getLabel={d => d.label + (Math.round(d.x * 100) / 100) + " balls"}
                            />}
                            <XAxis title="Points scored in auton" />
                            <YAxis />
                            <Crosshair 
                                values={crosshairG3}
                                titleFormat={() => ({title: "Team", value: team})}
                                itemsFormat={() => {
                                    return [
                                        {title: "Min", value: autonData.min[0].x + " balls scored"},
                                        {title: "Mean", value: autonData.mean[0].x + autonData.min[0].x + " balls scored"},
                                        {title: "Max", value: autonData.max[0].x + autonData.mean[0].x + autonData.min[0].x + " balls scored"},
                                    ]
                                }}
                            />
                        </XYPlot>
                    </Col>
                    {/* total points per match bar chart */}
                    <Col>
                        <XYPlot xType="ordinal" width={300} height={350} xDistance={100} onMouseLeave={() => setCrosshairG4([])}>
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
                            <VerticalBarSeries 
                                data={points} 
                                onNearestX={(value, {index}) => {setCrosshairG4([{...points[index]}])} } 
                                color="#fcba03"
                            />
                            <XAxis title="Match # "/>
                            <YAxis title="Points" />
                            <Crosshair 
                                values={crosshairG4} 
                                itemsFormat={(d) => ([{ title: "points", value: d[0].y }])}
                                titleFormat={(d) => ({ title: "Match", value: d[0].x })}
                            />
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
                    <Col>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Match #</th>
                                    <th>Climb ?</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matches.map(match => (
                                    <tr key={match.data.matchNum}>
                                        <td>{match.data.matchNum}</td>
                                        <td>{!match.data.attemptHang ? "Did not attempt" : match.data.hangFail ? "Fail" : "Success"}</td>
                                    </tr>
                                ))}
                            </tbody>
                            
                        </Table>
                    </Col>
                </Row>: (<><h1>There are no mathes played by this team or this team did not play this match</h1></>)}
            </>}
            {/* displays match data from matches array */}
            {(matches.length > 0) && <Button onClick={() => setShowRawData(!showRawData)}>Toggle Raw Data</Button>}
            {showRawData && <ul>
                {matches && matches.length > 0 && matches.map((match) => ( match ? (
                    <li className = "data" key={match.data.matchNum}>
                        <h3><Link to={"/teams/" + regional + "/" + team + "/" + match.data.matchNum}>Match # {match.data.matchNum}</Link></h3>
                        {JSON.stringify(match, null, 1)}
                    </li>
                ) : <></>))}
            </ul>}
        </>
    )
}

export default TeamData;
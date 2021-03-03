import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DiscreteColorLegend, HorizontalGridLines, LabelSeries, VerticalBarSeries, VerticalGridLines, XAxis, XYPlot, YAxis } from 'react-vis';
import { db } from '../firebase';
import "react-vis/dist/style.css";
import * as     math from 'mathjs';


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
        
        console.log("matchNum", data.matchNum);
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
                    console.log(totalPoints(doc.data().data, "auton"));
                    auton = [... auton, {x: doc.data().data.matchNum, y: totalPoints(doc.data().data, "auton")}];
                    teleop = [... teleop, {x: doc.data().data.matchNum, y: totalPoints(doc.data().data, "teleop")}];
                    autonBalls = [... autonBalls, doc.data().data.autonInner + doc.data().data.autonUpper + doc.data().data.autonBottom];
                    return doc.data()
                }))
                setDataG1Auton(auton);
                setDataG1Teleop(teleop);

                setAutonData([
                    {x: "min", y: math.min(autonBalls)},
                    {x: "median", y: math.median(autonBalls)},
                    {x: "max", y: math.max(autonBalls)},
                ])

                console.log("autonArray", auton);
            }
            setLoading(false)
        }
        fetchData();
    }, []);

    return (
        <>
           {!loading && 
            <>
                <ul>
                {matches && matches.length ? matches.map((match) => (
                    <li className = "data">
                        <h3>Match # {match.data.matchNum}</h3>
                        {JSON.stringify(match, null, 1)}
                    </li>
                )) : (<><h1>There are no mathes played by this team or this team did not play this match</h1></>)}
                </ul>
                <button onClick={() => setTimeSeriesVisisble(!timeSeriesVisible)}>Toggle Graphs</button>
                {dataG1Auton.length && dataG1Teleop.length && timeSeriesVisible &&
                <XYPlot xType="ordinal" width={300} height={350} xDistance={100}>
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
                        }
                        ]}
                    />
                    <VerticalGridLines />
                    <HorizontalGridLines />
                    <XAxis />
                    <YAxis />
                    <VerticalBarSeries className="vertical-bar-series-example" data={dataG1Teleop} color="#fcba03" />
                    <VerticalBarSeries data={dataG1Auton} color="#7300b5"/>
                </XYPlot>}
                {autonData.length && timeSeriesVisible &&
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
                    <XAxis />
                    <YAxis />
                    <VerticalBarSeries data={autonData} color="#7300b5"/>
                </XYPlot>}
            </>}
            <Link to="/">Back to home</Link>
        </>
    )
}

export default TeamData;
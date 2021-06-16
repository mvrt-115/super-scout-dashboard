import React, { useState } from "react";
import {
  DiscreteColorLegend,
  HorizontalGridLines,
  VerticalBarSeries,
  VerticalGridLines,
  XAxis,
  XYPlot,
  YAxis,
  RadialChart,
  Crosshair,
} from "react-vis";
import { Col, Row, Table } from "react-bootstrap";
import MeanGraph from "./MeanGraph";
import StackedBarChart from "./StackedBarChart";
const TeamGraphs = ({
  data,
  autonBalls,
  teleopBalls,
  team,
  dataG1Teleop,
  dataG1Auton,
  comments,
}) => {
  const [crosshairG4, setCrosshairG4] = useState([]);

  return (
    <>
      {data.matches.length > 1 ? (
        <Row>
          {/* Teleop vs Auton points per game bar chart */}
          {/* Props: AutonData, teleopData, pieChartData, dataG1Auton, dataG1Teleop, matches, setCrosshairG1, setCrosshairG2, setCrosshairG3, setCrosshairG4 */}
          <Col>
            <StackedBarChart
              data1={dataG1Auton}
              data2={dataG1Teleop}
              label1="Auton Points"
              label2="Teleop Points"
              color1="#fcba03"
              color2="#7300b5"
              xLabel="Match #"
              yLabel="Points"
            />
          </Col>
          {/* Auton min, median, max graph */}
          <Col>
            <MeanGraph
              gameState="teleop"
              ballsScored={teleopBalls}
              colors={["#a200ff", "#8b00db", "#7300b5"]}
              team={team}
              units="balls"
            />
          </Col>
          {/* Teleop min, median, max graph */}
          <Col>
            <MeanGraph
              gameState="auton"
              ballsScored={autonBalls}
              colors={["#ffd45e", "#ffc933", "#fcba03"]}
              team={team}
              units="balls"
            />
          </Col>
          {/* total points per match bar chart */}
          <Col>
            <XYPlot
              xType="ordinal"
              width={300}
              height={350}
              xDistance={100}
              onMouseLeave={() => setCrosshairG4([])}
            >
              <DiscreteColorLegend
                style={{ position: "absolute", left: "50px", top: "10px" }}
                orientation="vertical"
                items={[
                  {
                    title: "Points Scored",
                    color: "#fcba03",
                  },
                ]}
              />
              <VerticalGridLines />
              <HorizontalGridLines />
              <VerticalBarSeries
                data={data.points}
                onNearestX={(value, { index }) => {
                  setCrosshairG4([{ ...data.points[index] }]);
                }}
                color="#fcba03"
              />
              <XAxis title="Match # " />
              <YAxis title="Points" />
              <Crosshair
                values={crosshairG4}
                itemsFormat={(d) => [{ title: "points", value: d[0].y }]}
                titleFormat={(d) => ({ title: "Match", value: d[0].x })}
              />
            </XYPlot>
          </Col>
          {/* Climb, Failed, did not attempt */}
          <Col>
            <RadialChart
              data={data.pieChartData}
              labelsStyle={{
                fontSize: 10,
                margin: 10,
              }}
              colorType="literal"
              showLabels={true}
              labelsRadiusMultiplier={0.8}
              labelsAboveChildren={true}
              padAngle={0}
              margin={{ left: 40, right: 40, top: 10, bottom: 10 }}
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
                {data.matches &&
                  data.matches.map((match) => (
                    <tr key={match.data.matchNum}>
                      <td>{match.data.matchNum}</td>
                      <td>
                        {!match.data.attemptHang
                          ? "Did not attempt"
                          : match.data.hangFail
                          ? "Fail"
                          : "Success"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </Col>
          <Col>
            <Table>
              <thead>
                <tr>
                  <th>Match #</th>
                  <th>Comments</th>
                </tr>
              </thead>
              <tbody>
                {data.matches &&
                  data.matches.map((match) => (
                    <tr key={match.data.matchNum}>
                      <td>{match.data.matchNum}</td>
                      <td>{`${comments[match.data.matchNum]}`}</td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      ) : (
        <>
          <h1>
            There are no matches played by this team or this team did not play
            this match
          </h1>
        </>
      )}
    </>
  );
};

export default TeamGraphs;

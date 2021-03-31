import React, { useEffect, useState } from "react";
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
  HorizontalBarSeries,
  LabelSeries,
} from "react-vis";
import { Button, Col, Row, Table } from "react-bootstrap";
export default function Graphs(props) {
  const data = props.data;
  console.log(data);

  const [crosshairG1, setCrosshairG1] = useState([]);
  const [crosshairG2, setCrosshairG2] = useState([]);
  const [crosshairG3, setCrosshairG3] = useState([]);
  const [crosshairG4, setCrosshairG4] = useState([]);

  return (
    <>
      {data.matches.length > 1 ? (
        <Row>
          {/* Teleop vs Auton points per game bar chart */}
          {/* Props: AutonData, teleopData, pieChartData, dataG1Auton, dataG1Teleop, matches, setCrosshairG1, setCrosshairG2, setCrosshairG3, setCrosshairG4 */}
          <Col>
            <XYPlot
              xType="ordinal"
              width={1200}
              height={400}
              xDistance={100}
              stackBy="y"
              onMouseLeave={() => {
                setCrosshairG1([]);
              }}
            >
              <DiscreteColorLegend
                style={{ position: "absolute", left: "50px", top: "10px" }}
                orientation="vertical"
                items={[
                  {
                    title: "Auton Points",
                    color: "#fcba03",
                  },
                  {
                    title: "Teleop Points",
                    color: "#7300b5",
                  },
                ]}
              />
              <VerticalGridLines />
              <HorizontalGridLines />
              <VerticalBarSeries
                onNearestX={(value, { index }) => {
                  setCrosshairG1([
                    { ...data.dataG1Auton[index] },
                    { ...data.dataG1Teleop[index] },
                  ]);
                }}
                className="vertical-bar-series-example"
                data={data.dataG1Teleop}
                color="#7300b5"
              />
              <VerticalBarSeries data={data.dataG1Auton} color="#fcba03" />
              <XAxis title="Match #" />
              <YAxis title="Points" />
              <Crosshair
                values={crosshairG1}
                titleFormat={(d) => ({ title: "Match", value: d[0].x })}
                itemsFormat={(d) => [
                  { title: "Auton points", value: d[0].y },
                  { title: "Teleop points", value: d[1].y },
                ]}
              />
            </XYPlot>
          </Col>
          {/* Auton min, median, max graph */}
          <Col>
            <XYPlot
              yType="ordinal"
              width={1200}
              height={200}
              xDistance={100}
              stackBy="x"
              onMouseLeave={() => setCrosshairG2([])}
            >
              <VerticalGridLines />
              <HorizontalGridLines />
              <HorizontalBarSeries
                data={data.teleopData.min}
                color="#a200ff"
                onNearestX={(value) => {
                  setCrosshairG2([{ value }]);
                }}
              />
              <HorizontalBarSeries
                data={data.teleopData.mean}
                color="#8b00db"
                onNearestX={(value) => {
                  setCrosshairG2([{ value }]);
                }}
              />
              <HorizontalBarSeries
                data={data.teleopData.max}
                color="#7300b5"
                onNearestX={(value) => {
                  setCrosshairG2([{ value }]);
                }}
              />

              {data.teleopData.min && data.teleopData.min.length > 0 && (
                <LabelSeries
                  data={[
                    { x: data.teleopData.min[0].x, y: 115, label: "Min: " },
                    { x: data.teleopData.mean[0].x, y: 115, label: "Mean: " },
                    { x: data.teleopData.max[0].x, y: 115, label: "Max: " },
                  ]}
                  getLabel={(d) =>
                    d.label + Math.round(d.x * 100) / 100 + " balls"
                  }
                />
              )}
              <XAxis title="Points scored in teleop" />
              <YAxis />
              <Crosshair
                values={crosshairG2}
                titleFormat={() => ({ title: "Team", value: data.team })}
                itemsFormat={() => {
                  return [
                    {
                      title: "Min",
                      value: data.teleopData.min[0].x + " balls scored",
                    },
                    {
                      title: "Mean",
                      value:
                        data.teleopData.mean[0].x +
                        data.teleopData.min[0].x +
                        " balls scored",
                    },
                    {
                      title: "Max",
                      value:
                        data.teleopData.max[0].x +
                        data.teleopData.mean[0].x +
                        data.teleopData.min[0].x +
                        " balls scored",
                    },
                  ];
                }}
              />
            </XYPlot>
          </Col>
          {/* Teleop min, median, max graph */}
          <Col>
            <XYPlot
              yType="ordinal"
              width={1200}
              height={200}
              xDistance={100}
              stackBy="x"
              onMouseLeave={() => setCrosshairG3([])}
            >
              <VerticalGridLines />
              <HorizontalGridLines />
              <HorizontalBarSeries
                data={data.autonData.min}
                color="#ffd45e"
                onNearestX={(value) => {
                  setCrosshairG3([{ value }]);
                }}
              />
              <HorizontalBarSeries
                data={data.autonData.mean}
                color="#ffc933"
                onNearestX={(value) => {
                  setCrosshairG3([{ value }]);
                }}
              />
              <HorizontalBarSeries
                data={data.autonData.max}
                color="#fcba03"
                onNearestX={(value) => {
                  setCrosshairG3([{ value }]);
                }}
              />
              {data.autonData.min && data.autonData.min.length > 0 && (
                <LabelSeries
                  data={[
                    { x: data.autonData.min[0].x, y: 115, label: "Min: " },
                    { x: data.autonData.mean[0].x, y: 115, label: "Mean: " },
                    { x: data.autonData.max[0].x, y: 115, label: "Max: " },
                  ]}
                  getLabel={(d) =>
                    d.label + Math.round(d.x * 100) / 100 + " balls"
                  }
                />
              )}
              <XAxis title="Points scored in auton" />
              <YAxis />
              <Crosshair
                values={crosshairG3}
                titleFormat={() => ({ title: "Team", value: data.team })}
                itemsFormat={() => {
                  return [
                    {
                      title: "Min",
                      value: data.autonData.min[0].x + " balls scored",
                    },
                    {
                      title: "Mean",
                      value:
                        data.autonData.mean[0].x +
                        data.autonData.min[0].x +
                        " balls scored",
                    },
                    {
                      title: "Max",
                      value:
                        data.autonData.max[0].x +
                        data.autonData.mean[0].x +
                        data.autonData.min[0].x +
                        " balls scored",
                    },
                  ];
                }}
              />
            </XYPlot>
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
}

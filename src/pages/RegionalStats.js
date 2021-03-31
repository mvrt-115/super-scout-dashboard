import React, { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import { useRegionalData } from "../contexts/RegionalDataContext";
import {
  HorizontalGridLines,
  MarkSeries,
  VerticalBarSeries,
  XAxis,
  XYPlot,
  YAxis,
} from "react-vis";
import * as math from "mathjs";

const RegionalStats = ({ match }) => {
  const regional = match.params.regional;
  const { regionals, updateRegionals, updateRegionalData } = useRegionalData();
  const [loading, setLoading] = useState(true);
  const [totalPointsByTeam, setTotalPointsByTeam] = useState([]);
  const [avgAutonByTeam, setAvgAutonPointsByTeam] = useState([]);
  const [avgTeleopByTeam, setAvgTeleopPointsByTeam] = useState([]);
  const history = useHistory();
  const [lineData, setLineData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      console.log("=========LOADING DATA=========");
      try {
        let regionalData = await updateRegionalData(regional);
        await updateRegionals();

        console.log(Object.keys(regionalData).length);

        if (Object.keys(regionalData).length === 0) {
          console.warn("Regional data is empty", regionalData);
          history.push("/");
        }
        const tpbt = Object.keys(regionalData).map((team) => ({
          y:
            math.sum(regionalData[team].autonBottom) * 2 +
            math.sum(regionalData[team].autonUpper) * 4 +
            math.sum(regionalData[team].autonInner) * 6 +
            math.sum(regionalData[team].teleopBottom) +
            math.sum(regionalData[team].teleopUpper) * 2 +
            math.sum(regionalData[team].teleopInner) * 3,
          team,
        }));

        const lineData = Object.keys(regionalData).map((team) => ({
          y:
            math.mean(regionalData[team].autonBottom) * 2 +
            math.mean(regionalData[team].autonUpper) * 4 +
            math.mean(regionalData[team].autonInner) * 6 +
            math.mean(regionalData[team].teleopBottom) +
            math.mean(regionalData[team].teleopUpper) * 2 +
            math.mean(regionalData[team].teleopInner) * 3,
          team,
        }));

        const avgAuton = Object.keys(regionalData).map((team, index) => ({
          y:
            math.sum(regionalData[team].autonBottom) * 2 +
            math.sum(regionalData[team].autonUpper) * 4 +
            math.sum(regionalData[team].autonInner) * 6,
          team,
          x: index,
        }));

        const avgTeleop = Object.keys(regionalData).map((team, index) => ({
          y:
            math.sum(regionalData[team].teleopBottom) +
            math.sum(regionalData[team].teleopUpper) * 2 +
            math.sum(regionalData[team].teleopInner) * 3,
          team,
          x: index,
        }));

        const sum = avgAuton.map((team, index) => ({
          ...team,
          y: team.y + avgTeleop[index].y,
          auton: team,
          teleop: avgTeleop[index],
        }));

        sum.sort((a, b) => (a.y < b.y ? 1 : -1));

        sum.forEach((team, index) => {
          avgAuton[team.x] = team.auton;
          avgTeleop[team.x] = team.teleop;

          avgAuton[team.x].x = index + 2;
          avgTeleop[team.x].x = index + 2;
        });

        tpbt.sort((a, b) => (a.y < b.y ? 1 : -1));

        tpbt.forEach((team, index) => (team.x = index + 1));

        lineData.forEach((team, index) => (team.x = index + 1));

        setAvgAutonPointsByTeam(avgAuton);
        setAvgTeleopPointsByTeam(avgTeleop);

        setTotalPointsByTeam(tpbt);
        setLineData(lineData);
        console.log("=========DATA LOADED=========");
      } catch (e) {
        console.log(e);
      }
    };
    console.log("=========IN REGIONAL STATS USE EFFECT=========");
    fetchData().then(() => {
      setLoading(false);
    });
  }, [regional, history]);

  return (
    <>
      <div>
        <h3>
          <Link to="/">Home</Link> /{" "}
          <Link to={"/regional/" + regional}>{regional}</Link> / Stats
        </h3>
        <Dropdown>
          <Dropdown.Toggle>Change Regional</Dropdown.Toggle>

          <Dropdown.Menu>
            {regionals.map((reg) => (
              <Dropdown.Item
                as={Link}
                disabled={reg === regional}
                to={"/compare-teams/" + reg}
                key={reg}
              >
                {reg}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>

        {!loading && (
          <>
            <XYPlot width={1500} height={600}>
              <HorizontalGridLines />

              <VerticalBarSeries data={totalPointsByTeam} color="#fcba03" />

              <XAxis
                title="Team #"
                tickFormat={(val, i) => totalPointsByTeam[i].team}
                tickValues={totalPointsByTeam.map((team) => team.x)}
              />
              <YAxis title="Points" />
            </XYPlot>
            <XYPlot width={1500} height={600} stackBy="y">
              <HorizontalGridLines />

              <VerticalBarSeries data={avgAutonByTeam} color="#fcba03" />
              <VerticalBarSeries data={avgTeleopByTeam} color="purple" />

              <XAxis
                title="Team #"
                tickFormat={(val, i) => totalPointsByTeam[i].team}
                tickValues={totalPointsByTeam.map((team) => team.x)}
              />
              <YAxis title="Points" />
            </XYPlot>
            <XYPlot width={1500} height={600} stackBy="y">
              <HorizontalGridLines />

              <MarkSeries data={lineData} color="#fcba03" />

              <XAxis
                title="Team #"
                tickFormat={(val, i) => totalPointsByTeam[i].team}
                tickValues={totalPointsByTeam.map((team) => team.x)}
              />
              <YAxis title="Points" />
            </XYPlot>
          </>
        )}
      </div>
    </>
  );
};

export default RegionalStats;

import React, { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import { useRegionalData } from "../contexts/RegionalDataContext";
import {
  Crosshair,
  HorizontalGridLines,
  MarkSeries,
  makeWidthFlexible,
  VerticalBarSeries,
  XAxis,
  XYPlot,
  YAxis,
  LabelSeries,
} from "react-vis";
import { functions } from "../firebase";
import * as math from "mathjs";

const FlexibleWidthXYPlot = makeWidthFlexible(XYPlot);

const RegionalStats = ({ match }) => {
  const regional = match.params.regional;
  const { regionals, updateRegionals, updateRegionalData } = useRegionalData();
  const [loading, setLoading] = useState(true);
  const [totalPointsByTeam, setTotalPointsByTeam] = useState([]);
  const [avgAutonByTeam, setAvgAutonPointsByTeam] = useState([]);
  const [avgTeleopByTeam, setAvgTeleopPointsByTeam] = useState([]);
  const [autonTeleopEndGame, setAutonTeleopEndGame] = useState([]);

  const [autonTeleopLabel, setAutonTeleopLabel] = useState([]);

  const [autonTeleopEndGameCrossHair, setAutonTeleopEndGameCrossHair] =
    useState([]);
  const history = useHistory();
  const [lineData, setLineData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let regionalData = await updateRegionalData(regional);
        await updateRegionals();

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
            math.mean(regionalData[team].autonBottom) * 2 +
            math.mean(regionalData[team].autonUpper) * 4 +
            math.mean(regionalData[team].autonInner) * 6,
          team,
          x: index,
        }));

        const avgTeleop = Object.keys(regionalData).map((team, index) => ({
          y:
            math.mean(regionalData[team].teleopBottom) +
            math.mean(regionalData[team].teleopUpper) * 2 +
            math.mean(regionalData[team].teleopInner) * 3,
          team,
          x: index,
        }));

        const teleopAndAutonTemp = avgAuton.map((avg, index) => ({
          x: avg.y,
          y: avgTeleop[index].y,
          opacity: math.mean(regionalData[avg.team].endgamePoints) / 15,
          size: math.mean(regionalData[avg.team].endgamePoints) / 1.5,
          team: avg.team,
        }));

        setAutonTeleopLabel(
          teleopAndAutonTemp.map((coord) => ({
            x: coord.x,
            y: coord.y,
            label: coord.team,
          }))
        );

        const sum = avgAuton.map((team, index) => ({
          ...team,
          y: team.y + avgTeleop[index].y,
          auton: team,
          teleop: avgTeleop[index],
        }));

        sum.sort((a, b) => (a.y < b.y ? 1 : -1));

        sum.forEach((team, index) => {
          //   avgAuton[team.x] = team.auton;
          //   avgTeleop[team.x] = team.teleop;

          avgAuton[team.x].x = index;
          avgTeleop[team.x].x = index;
        });

        tpbt.sort((a, b) => (a.y < b.y ? 1 : -1));

        tpbt.forEach((team, index) => (team.x = index + 1));
        tpbt.forEach((team, index) => (team.x += 1));

        lineData.forEach((team, index) => (team.x = index + 1));

        setAvgAutonPointsByTeam(avgAuton);
        setAvgTeleopPointsByTeam(avgTeleop);
        setAutonTeleopEndGame(teleopAndAutonTemp);

        setTotalPointsByTeam(tpbt);
        setLineData(lineData);

        const res = await functions.httpsCallable("tbaAPI")({
          route: "event/2019cave/rankings",
        });
        console.log("res", res);
      } catch (e) {
        console.log(e);
      }
    };
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
            <h4>
              Average Auton and Teleop Points vs Team Number (sorted by most
              post points scored, purple is teleop, yellow is auton)
            </h4>
            <XYPlot width={1500} height={700}>
              <HorizontalGridLines />

              <VerticalBarSeries data={avgAutonByTeam} color="#fcba03" />
              <VerticalBarSeries data={avgTeleopByTeam} color="purple" />

              <XAxis
                title="Team #"
                tickFormat={(val, i) => totalPointsByTeam[i].team}
                tickValues={avgAutonByTeam.map((avg, index) => avg.x)}
              />
              <YAxis title="Points" />
            </XYPlot>
            {/* <h4>Average Points vs Team Rank</h4>
            <FlexibleWidthXYPlot height={700} stackBy="y">
              <HorizontalGridLines />
              <VerticalGridLines />

              < data={lineData} color="#fcba03" />

              <XAxis
                title="Team #"
                tickFormat={(val, i) => totalPointsByTeam[i].team}
                tickValues={totalPointsByTeam.map((team) => team.x)}
              />
              <YAxis title="Points" />
            </FlexibleWidthXYPlot> */}
            <h4>
              Average Teleop Points vs Average Auton Points (point size is
              endgame points)
            </h4>

            <FlexibleWidthXYPlot height={700} stackBy="y">
              <MarkSeries
                className="mark-series-example"
                sizeRange={[2, 16]}
                data={autonTeleopEndGame}
                color="#fcba03"
                onValueMouseOver={(datapoint, event) => {
                  setAutonTeleopEndGameCrossHair([datapoint]);
                }}
                onValueMouseOut={() => setAutonTeleopEndGameCrossHair([])}
              />

              <Crosshair
                values={autonTeleopEndGameCrossHair}
                titleFormat={(d) => ({ title: "Team", value: d[0].team })}
                itemsFormat={(d) => [
                  { title: "Average Auton points", value: d[0].x },
                  { title: "Average Teleop points", value: d[0].y },
                  { title: "Average Endgame points", value: d[0].size * 1.5 },
                ]}
              ></Crosshair>
              <LabelSeries data={autonTeleopLabel} />
              <XAxis title="Average Auton Points Scored" />
              <YAxis title="Average Teleop Points Scored" />
            </FlexibleWidthXYPlot>
          </>
        )}
      </div>
    </>
  );
};

export default RegionalStats;

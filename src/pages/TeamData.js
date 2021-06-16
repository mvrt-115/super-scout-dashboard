import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { Button } from "react-bootstrap";
import TeamGraphs from "../components/TeamGraphs";

// displays the a team's data (team and regional are passed in through link and router stuff)
function TeamData({ match }) {
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
  const [dependency, setDependency] = useState(0);

  // auton and teleop data for the first graph
  const [dataG1Auton, setDataG1Auton] = useState([]);
  const [dataG1Teleop, setDataG1Teleop] = useState([]);

  // auton and teleop data for min, median, max graphs
  const [autonBalls, setAutonBalls] = useState([]);
  const [teleopBalls, setTeleopBalls] = useState([]);

  // total points scored
  const [points, setPoints] = useState([]);

  const [comments, setComments] = useState({});

  // Radial chart data to keep track of climb fails and successes
  const [pieChartData, setPieChartData] = useState([]);

  const [rank, setRank] = useState(0);
  const [OPR, setOPR] = useState(0);

  // calculates total auton/teleop points
  const totalPoints = (data, gameState) => {
    return gameState === "auton"
      ? data.autonBottom * 2 + data.autonUpper * 4 + data.autonInner * 6
      : data.teleopBottom + data.teleopUpper * 2 + data.teleopInner * 3;
  };

  // called when team/regional/match changes and when page starts up
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // if a match is selected get the data from this teams performance in that match from firebase
        if (matchNum) {
          const matchRef = await db
            .collection("regional")
            .doc(regional)
            .collection("teams")
            .doc(team)
            .collection("matches")
            .doc(matchNum)
            .get();
          setMatches([matchRef.data()]);

          // otherwise get all team dataa
        } else {
          // get all matches that the team has played from firebase
          const teamRef = await db
            .collection("regional")
            .doc(regional)
            .collection("teams")
            .doc(team)
            .collection("matches")
            .get();

          // temporary variables that will be used to set state
          let auton = [];
          let teleop = [];
          let autonBalls = [];
          let teleopBalls = [];
          let climbFailsNum = 0;
          let climbSucessNum = 0;
          let didNotAttemptsNum = 0;
          let pointsData = [];

          let matches = teamRef.docs.map((doc, index) => {
            if (!doc.exists) return {};
            // updating data based on each match
            auton = [
              ...auton,
              {
                x: doc.data().data.matchNum,
                y: totalPoints(doc.data().data, "auton"),
              },
            ];
            teleop = [
              ...teleop,
              {
                x: doc.data().data.matchNum,
                y: totalPoints(doc.data().data, "teleop"),
              },
            ];
            autonBalls = [
              ...autonBalls,
              doc.data().data.autonInner +
                doc.data().data.autonUpper +
                doc.data().data.autonBottom,
            ];
            teleopBalls = [
              ...teleopBalls,
              doc.data().data.teleopInner +
                doc.data().data.teleopUpper +
                doc.data().data.teleopBottom,
            ];
            pointsData = [
              ...pointsData,
              {
                x: doc.data().data.matchNum,
                y: auton[index].y + teleop[index].y,
              },
            ];

            if (!doc.data().data.attemptHang) {
              didNotAttemptsNum++;
            }

            if (doc.data().data.attemptHang) {
              if (doc.data().data.hangFail) {
                climbFailsNum++;
              } else {
                climbSucessNum++;
              }
            }

            return doc.data();
          });
          setMatches(matches);

          // changing the state of different things
          setDataG1Auton(auton);
          setDataG1Teleop(teleop);
          setPoints(pointsData);
          setPieChartData([
            {
              angle: climbFailsNum,
              label: climbFailsNum > 0 ? "Failed to Climb" : "",
              color: "#fcba03",
            },
            {
              angle: climbSucessNum,
              label: climbSucessNum > 0 ? "Climb Successes" : "",
              color: "#7300b5",
            },
            {
              angle: didNotAttemptsNum,
              label: didNotAttemptsNum > 0 ? "Did not attempt" : "",
              color: "#A7A6BA",
            },
          ]);

          if (matches.length) {
            setAutonBalls(autonBalls);
            setTeleopBalls(teleopBalls);
          }

          const rankingsResponse = await fetch(
            `https://www.thebluealliance.com/api/v3/event/2019${
              regional === "CAVE" ? "cave" : regional === "CC19" ? "cc" : "cacg"
            }/rankings`,
            {
              headers: {
                "X-TBA-Auth-Key": process.env.REACT_APP_TBA_KEY,
              },
            }
          );
          const rankingsJSON = await rankingsResponse.json();

          const rankings = rankingsJSON.rankings.map((team) =>
            team.team_key.substring(3)
          );

          setRank(rankings.indexOf(team) + 1);

          const oprsResponse = await fetch(
            `https://www.thebluealliance.com/api/v3/event/2019${
              regional === "CAVE" ? "cave" : regional === "CC19" ? "cc" : "cacg"
            }/oprs`,
            {
              headers: {
                "X-TBA-Auth-Key": process.env.REACT_APP_TBA_KEY,
              },
            }
          );
          const oprsJSON = await oprsResponse.json();

          setOPR(oprsJSON.oprs[`frc${team}`]);
        }
      } catch (e) {
        console.log(e);
      }
      setLoading(false);
    };
    fetchData();
  }, [matchNum, regional, team]);

  return (
    <>
      {/* Breadcrumbs */}
      <div>
        <h3>
          <Link to="/">Home</Link> /
          <Link to={"/regional/" + regional}> {regional}</Link> /
          {matchNum ? (
            <>
              <Link to={"/teams/" + regional + "/" + team}> Team # {team}</Link>{" "}
              / Match # {matchNum}{" "}
            </>
          ) : (
            <> Team # {team}</>
          )}
        </h3>
        <Button onClick={() => setDependency(dependency + 1)}>
          Refresh Data
        </Button>
      </div>
      {/* once loaded show the data */}
      <div>
        <h4>About Team {team}</h4>
        <div style={{ fontSize: "1.5em" }}>
          Rank: {rank}, OPR: {Math.round(OPR * 100) / 100}
        </div>
      </div>
      {!loading && (
        <TeamGraphs
          data={{
            pieChartData: pieChartData,

            matches: matches,
            team: team,
            points: points,
          }}
          autonBalls={autonBalls}
          teleopBalls={teleopBalls}
          team={team}
          dataG1Auton={dataG1Auton}
          dataG1Teleop={dataG1Teleop}
        />
      )}
      {/* displays match data from matches array */}
      {matches.length > 0 && (
        <Button onClick={() => setShowRawData(!showRawData)}>
          Toggle Raw Data
        </Button>
      )}
      {showRawData && (
        <ul>
          {matches &&
            matches.length > 0 &&
            matches.map((match) =>
              match ? (
                <li className="data" key={match.data.matchNum}>
                  <h3>
                    <Link
                      to={
                        "/teams/" +
                        regional +
                        "/" +
                        team +
                        "/" +
                        match.data.matchNum
                      }
                    >
                      Match # {match.data.matchNum}
                    </Link>
                  </h3>
                  {JSON.stringify(match, null, 1)}
                </li>
              ) : (
                <></>
              )
            )}
        </ul>
      )}
    </>
  );
}

export default TeamData;

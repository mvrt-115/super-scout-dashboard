import React, { useEffect, useState } from "react";
import { Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { db } from "../firebase";

// displays matches and teams in a given regional
const Regional = ({ match }) => {
  const regional = match.params.regional;
  // const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teamsRef = await db
          .collection("regional")
          .doc(regional)
          .collection("teams")
          .get();

        let teams = teamsRef.docs.map((doc) => doc.id);
        // let matches = matchesRef.docs.map((doc) => doc.id);

        // sorts the array numerically
        teams.sort((a, b) => a - b);
        // matches.sort((a, b) => a - b);

        // setMatches(matches);
        setTeams(teams);
      } catch (e) {
        console.log(e);
      }
    };
    fetchData();
  }, [regional]);
  return (
    <>
      {/* Breadcrumbs */}
      <div>
        <h3>
          <Link to="/">Home</Link> / {regional}
        </h3>
      </div>
      <Row>
        <Button
          size="lg"
          block
          className="my-2 mx-3"
          as={Link}
          to={"/compare-teams/" + regional}
        >
          View Regional Stats
        </Button>
      </Row>
      <h3>Teams:</h3>
      <Row>
        {/* <Col>
          <h3>Matches:</h3>
          <ul>
            {matches.map((match) => (
              <li className="link" key={match}>
                <Link to={`/regional/${regional}/match/${match}`}>{match}</Link>
              </li>
            ))}
          </ul>
        </Col> */}
        {/* Display teams */}
        {teams.map((team) => (
          <span className="team-button" key={team}>
            <Link to={`/teams/${regional}/${team}`}>{team}</Link>
          </span>
        ))}
      </Row>
    </>
  );
};

export default Regional;

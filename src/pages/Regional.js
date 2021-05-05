import React, { useEffect, useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { db } from '../firebase';

// displays matches and teams in a given regional
const Regional = ({ match }) => {
  const regional = match.params.regional;
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('=========LOADING DATA=========');
        const matchesRef = await db
          .collection('regional')
          .doc(regional)
          .collection('matches')
          .get();
        const teamsRef = await db
          .collection('regional')
          .doc(regional)
          .collection('teams')
          .get();

        let teams = teamsRef.docs.map((doc) => doc.id);
        let matches = matchesRef.docs.map((doc) => doc.id);

        // sorts the array numerically
        teams.sort((a, b) => a - b);
        matches.sort((a, b) => a - b);

        console.log('Teams at Regional Array', teams);
        console.log('Matches at Regional Array', matches);
        console.log('=========DATA LOADED=========');

        setMatches(matches);
        setTeams(teams);
      } catch (e) {
        console.log(e);
      }
    };
    console.log('=========IN REGIONAL DATA USE EFFECT=========');
    fetchData().then(() =>
      console.log('=========OUT OF REGIONAL DATA USE EFFECT=========')
    );
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
          to={'/compare-teams/' + regional}
        >
          View Regional Stats
        </Button>
      </Row>
      <Row>
        <Col>
          {/* Display matches */}
          <h3>Matches:</h3>
          <ul>
            {matches.map((match) => (
              <li className="link" key={match}>
                <Link to={`/regional/${regional}/match/${match}`}>{match}</Link>
              </li>
            ))}
          </ul>
        </Col>
        <Col>
          {/* Display teams */}
          <h3>Teams:</h3>
          <ul>
            {teams.map((team) => (
              <li className="link" key={team}>
                <Link to={`/teams/${regional}/${team}`}>{team}</Link>
              </li>
            ))}
          </ul>
        </Col>
      </Row>
    </>
  );
};

export default Regional;

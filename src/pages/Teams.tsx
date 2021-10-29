import { Container, Grid, Heading } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/react";
import React, { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase";

interface TeamsProps {
  match: any;
}

const Teams: FC<TeamsProps> = ({ match }) => {
  const [teams, setTeams] = useState<string[] | number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const teamsRef = await db
        .collection("regional")
        .doc(match.params.regional)
        .collection("teams")
        .get();

      let teams = teamsRef.docs.map((doc) => doc.id);
      // let matches = matchesRef.docs.map((doc) => doc.id);

      // sorts the array numerically
      teams.sort((a, b) => parseInt(a) - parseInt(b));
      // matches.sort((a, b) => a - b);

      // setMatches(matches);
      setTeams(teams);
    };
    fetchData();
  }, [match.params.regional]);
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Container
        width="80%"
        maxWidth="100vw"
        margin="0"
        justifyContent="center"
        alignItems="center"
      >
        <Heading>Regionals: </Heading>
        <Button
          as={Link}
          to={`/regional-data/${match.params.regional}`}
          colorScheme="gold"
          width="100%"
          size="lg"
        >
          View Regional Data
        </Button>
        <Grid gap={1} templateColumns={"repeat(5, 1fr)"}>
          {/* <ul> */}
          {teams.map((team) => (
            <li className="link" key={team}>
              <Link
                to={`/regional/${match.params.regional}/teams/${team}`}
                style={{ textAlign: "center" }}
              >
                {team}
              </Link>
            </li>
          ))}
          {/* </ul> */}
        </Grid>
      </Container>
    </div>
  );
};

export default Teams;

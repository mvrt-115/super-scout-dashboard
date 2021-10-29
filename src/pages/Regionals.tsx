import { Container, Heading } from "@chakra-ui/layout";
import React, { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase";

interface RegionalsProps {}

const Regionals: FC<RegionalsProps> = () => {
  const [regionals, setRegionals] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const regionalData = await db.collection("regional").get();

      const regionals = regionalData.docs.map((regional) => regional.id);
      setRegionals(regionals);
    };
    fetchData();
  }, []);

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
        <ul>
          {regionals.map((regional) => (
            <li className="link" key={regional}>
              <Link to={`/regional/${regional}`}>{regional}</Link>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
};

export default Regionals;

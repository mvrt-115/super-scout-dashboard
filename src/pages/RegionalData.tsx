import { IconButton } from "@chakra-ui/button";
import { AddIcon } from "@chakra-ui/icons";
import { Container, Heading } from "@chakra-ui/layout";
import { Tooltip } from "@chakra-ui/react";
import React, { FC, useEffect, useState } from "react";
import RegionalGraphInput from "../components/RegionalGraphInput";
import { db } from "../firebase";

interface RegionalDataProps {
  match: any;
}

const RegionalData: FC<RegionalDataProps> = ({ match }) => {
  const regional = match.params.regional;
  const [regionalData, setRegionalData] = useState<any>({});
  const [graphs, setGraphs] = useState<number[]>([1]);

  useEffect(() => {
    const fetchData = async () => {
      const regionalKey = (
        await db.collection("regional").doc(regional).get()
      )?.data()?.key;
      const [regionalRef, oprsRe, rankingsRe] = await Promise.all([
        db.collection("regional").doc(regional).collection("teams").get(),
        fetch(
          `https://www.thebluealliance.com/api/v3/event/${regionalKey}/oprs`,
          {
            headers: {
              "X-TBA-Auth-Key": process.env.REACT_APP_TBA_KEY || "",
            },
          }
        ),
        fetch(
          `https://www.thebluealliance.com/api/v3/event/${regionalKey}/rankings`,
          {
            headers: {
              "X-TBA-Auth-Key": process.env.REACT_APP_TBA_KEY || "",
            },
          }
        ),
      ]);
      const [oprsJson, rankingsJson] = await Promise.all([
        oprsRe.json(),
        rankingsRe.json(),
      ]);
      let regionalData: any = {};
      console.log(oprsJson);
      rankingsJson.rankings.forEach((teamInfo: any) => {
        const teamKey = teamInfo.team_key;
        regionalData[teamKey.substring(3)] = {
          opr: oprsJson.oprs[teamKey],
          dpr: oprsJson.dprs[teamKey],
          ccwm: oprsJson.ccwms[teamKey],
          ranking: teamInfo.rank,
        };
      });
      regionalRef.docs.forEach((doc: any) => {
        regionalData[doc.id] = { ...regionalData[doc.id], ...doc.data() };
      });
      setRegionalData(regionalData);
      console.log(regionalData);
    };
    fetchData();
  }, [regional]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Container
        width="80%"
        maxWidth="100vw"
        margin="0"
        justifyContent="center"
        alignItems="center"
        display="flex"
        flexDirection="column"
      >
        <Heading>{regional} Data</Heading>
        {graphs.map((graph, index) => (
          <RegionalGraphInput key={index} regionalData={regionalData} />
        ))}
        <Tooltip label="Add Graph">
          <IconButton
            marginTop="5%"
            aria-label="Add Graph"
            icon={<AddIcon />}
            onClick={() => setGraphs([...graphs, 1])}
            colorScheme="green"
            width="50%"
          />
        </Tooltip>
      </Container>
    </div>
  );
};

export default RegionalData;

import { IconButton } from "@chakra-ui/button";
import { AddIcon } from "@chakra-ui/icons";
import { Container, Heading, Text } from "@chakra-ui/layout";
import { Tooltip } from "@chakra-ui/tooltip";
import React, { FC, useEffect, useState } from "react";
import { Cell, Legend, Pie, PieChart } from "recharts";
import GraphInput from "../components/TeamGraphInput";
import { db } from "../firebase";

interface TeamDataProps {
  match: any;
}

const TeamData: FC<TeamDataProps> = ({ match }) => {
  const regional = match.params.regional;
  const team = match.params.team;
  const [teamData, setTeamData] = useState<any>({});
  const [graphs, setGraphs] = useState<number[]>([1]);
  const [oprInfo, setOprInfo] = useState<string>();
  const [dprInfo, setDprInfo] = useState<string>();
  const [ccwmInfo, setCcwmInfo] = useState<string>();
  const [ranking, setRanking] = useState<string>();
  const [climbGraphData, setClimbGraphData] = useState<any[]>([]);
  const colors = ["#260245", "#ffc410", "#dab0ec", "#550575"];

  useEffect(() => {
    const fetchData = async () => {
      const [teamRef, regionalRef] = await Promise.all([
        db
          .collection("regional")
          .doc(regional)
          .collection("teams")
          .doc(team)
          .collection("matches")
          .get(),
        db.collection("regional").doc(regional).get(),
      ]);

      const regionalKey = regionalRef?.data()?.key;

      const [rankingsRes, oprsRes] = await Promise.all([
        fetch(
          `https://www.thebluealliance.com/api/v3/event/${regionalKey}/rankings`,
          {
            headers: {
              "X-TBA-Auth-Key": process.env.REACT_APP_TBA_KEY || "",
            },
          }
        ),
        fetch(
          `https://www.thebluealliance.com/api/v3/event/${regionalKey}/oprs`,
          {
            headers: {
              "X-TBA-Auth-Key": process.env.REACT_APP_TBA_KEY || "",
            },
          }
        ),
      ]);
      const [oprsJson, rankingsJson] = await Promise.all([
        oprsRes.json(),
        rankingsRes.json(),
      ]);

      const oprsList = Object.keys(oprsJson.oprs).map(
        (key) => oprsJson.oprs[key]
      );
      const dprsList = Object.keys(oprsJson.dprs).map(
        (key) => oprsJson.dprs[key]
      );
      const ccwmsList = Object.keys(oprsJson.ccwms).map(
        (key) => oprsJson.ccwms[key]
      );

      oprsList.sort((a, b) => a - b);
      dprsList.sort((a, b) => a - b);
      ccwmsList.sort((a, b) => a - b);

      const opr = oprsJson.oprs[`frc${team}`];
      const dpr = oprsJson.dprs[`frc${team}`];
      const ccwm = oprsJson.ccwms[`frc${team}`];

      setOprInfo(
        `OPR (Offensive Power Rating): ${
          Math.round(opr * 100) / 100
        }, which is in the ${Math.round(
          (oprsList.indexOf(opr) / oprsList.length) * 100
        )}th percentile`
      );
      setDprInfo(
        `DPR (Defensive Power Rating): ${
          Math.round(dpr * 100) / 100
        }, which is in the ${Math.round(
          (dprsList.indexOf(dpr) / dprsList.length) * 100
        )}th percentile`
      );
      setCcwmInfo(
        `CCWM (Calculated Contribution to Winning Margin): ${
          Math.round(ccwm * 100) / 100
        }, which is in the ${Math.round(
          (ccwmsList.indexOf(ccwm) / ccwmsList.length) * 100
        )}th percentile`
      );
      const rankingsList = rankingsJson.rankings;
      let index = 0;
      for (let i = 0; i < rankingsList.length; i++) {
        if (rankingsList[i].team_key === `frc${team}`) index = i;
      }
      setRanking(`${index + 1}`);

      let teamData: any = {};
      let matches = teamRef.docs.map((doc) => doc.data().data || doc.data());

      matches.sort((a, b) => a.matchNum - b.matchNum);

      matches.forEach((data) => {
        Object.keys(data).forEach((key) => {
          if (
            (typeof data[key] === "number" && !isNaN(data[key])) ||
            key === "attemptHang" ||
            key === "hangFail" ||
            key === "levelFail"
          ) {
            let array = teamData[key];

            if (!array) array = [];
            array = [...array, data[key]];
            teamData[key] = array;
          }
        });
      });
      setTeamData(teamData);
      let climbData = [
        { name: "No Attempt or fail", value: 0 },
        { name: "Level", value: 0 },
        { name: "Hang", value: 0 },
      ];
      teamData.attemptHang.forEach((attempt: boolean, index: number) => {
        if (!attempt || teamData.hangFail[index]) {
          climbData[0].value += 1;
        } else if (teamData?.levelFail && !teamData.levelFail[index]) {
          climbData[1].value += 1;
        } else if (!teamData.hangFail[index]) {
          climbData[2].value += 1;
        }
      });
      setClimbGraphData(climbData);
    };
    fetchData();
  }, [regional, team]);

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
        <Heading>
          Team # {team} Rank # {ranking}
        </Heading>
        <Text>{oprInfo}</Text>
        <Text>{dprInfo}</Text>
        <Text>{ccwmInfo}</Text>
        <Heading size="sm">Climb Data</Heading>
        <PieChart width={400} height={400}>
          <Legend />
          <Pie data={climbGraphData} dataKey="value" nameKey="name">
            {climbGraphData.map((entry, index) => (
              <Cell fill={colors[index % colors.length]} />
            ))}
          </Pie>
        </PieChart>
        {graphs.map((graph, index) => (
          <GraphInput teamData={teamData} key={index} />
        ))}
        <IconButton
          aria-label="Add Graph"
          icon={<AddIcon />}
          onClick={() => setGraphs([...graphs, 1])}
          colorScheme="green"
        />
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

export default TeamData;

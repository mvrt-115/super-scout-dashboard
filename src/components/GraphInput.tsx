import { IconButton } from "@chakra-ui/button";
import { DeleteIcon } from "@chakra-ui/icons";
import { HStack, Text } from "@chakra-ui/layout";
import { Select } from "@chakra-ui/select";
import { Tooltip } from "@chakra-ui/tooltip";
import React, { FC, useEffect, useState } from "react";
import Graph, { PointList } from "./Graph";

interface GraphInputProps {
  teamData: any;
}

const GraphInput: FC<GraphInputProps> = ({ teamData }) => {
  const [graphPoints, setGraphPoints] = useState<PointList[]>([]);
  const [keys, setKeys] = useState<string[]>([]);
  const [keyOptions, setKeyOptions] = useState<string[]>([]);
  const [graphType, setGraphType] = useState<
    "Bar" | "Area" | "Line" | "Scatter" | "Pie"
  >("Bar");
  const [xAxis, setXAxis] = useState<string>("matchNum");
  const [y1Axis, setY1Axis] = useState<string>("autonPoints");
  const [y2Axis, setY2Axis] = useState<string>("teleopPoints");
  const [y3Axis, setY3Axis] = useState<string>("endgamePoints");
  const [display, setDisplay] = useState<string>("flex");

  const removeFromArray = (key: string, array: string[]) => {
    const index = array.indexOf(key);
    if (index > -1) {
      array.splice(index, 1);
    }
  };

  useEffect(() => {
    const getPointList: (key: string, xKey: string) => any = (key, xKey) => {
      if (key === "teleopPoints")
        return teamData?.teleopBottom?.map(
          (bottom: number, index: number | string) => ({
            x: teamData[xKey][index],
            y:
              bottom +
              teamData?.teleopUpper[index] * 3 +
              teamData?.teleopInner[index] * 2,
          })
        );
      if (key === "autonPoints")
        return teamData?.autonBottom?.map(
          (bottom: number, index: number | string) => {
            const crossedInitLine = teamData.crossedInitLine
              ? teamData.crossedInitLine[index]
              : false;
            const initPoints = crossedInitLine ? 5 : 0;
            return {
              x: teamData[xKey][index],
              y:
                bottom * 2 +
                teamData?.autonUpper[index] * 4 +
                teamData?.autonInner[index] * 6 +
                initPoints,
            };
          }
        );
      if (key === "endgamePoints") {
        return teamData?.attemptHang?.map((hang: boolean, index: number) => {
          if (!hang || teamData.hangFail[index])
            return { x: teamData[xKey][index], y: 5 };
          if (
            !teamData.hangFail[index] &&
            teamData.levelFail &&
            teamData.levelFail[index]
          )
            return { x: teamData[xKey][index], y: 25 };
          return { x: teamData[xKey][index], y: 40 };
        });
      }

      const list = teamData
        ? teamData[key]?.map(
            (bottom: number | string, index: number | string) => ({
              x: teamData[xKey][index],
              y: bottom,
            })
          )
        : [];

      return list;
    };

    setGraphPoints([
      getPointList(y1Axis, xAxis),
      getPointList(y2Axis, xAxis),
      getPointList(y3Axis, xAxis),
    ]);
    let keys = [
      y1Axis.charAt(0).toUpperCase() +
        y1Axis.replace(/([A-Z])/g, " $1").substring(1),
    ];
    if (y2Axis)
      keys.push(
        y2Axis.charAt(0).toUpperCase() +
          y2Axis.replace(/([A-Z])/g, " $1").substring(1)
      );
    if (y3Axis)
      keys.push(
        y3Axis.charAt(0).toUpperCase() +
          y3Axis.replace(/([A-Z])/g, " $1").substring(1)
      );
    setKeys(keys);
  }, [xAxis, y1Axis, y2Axis, y3Axis, graphType, teamData]);

  useEffect(() => {
    let keys = Object.keys(teamData);
    removeFromArray("teamNum", keys);
    removeFromArray("hangFail", keys);
    removeFromArray("attemptHang", keys);
    keys.push("endgamePoints");
    keys.push("teleopPoints");
    keys.push("autonPoints");

    setKeyOptions(keys);
  }, [teamData]);

  return (
    <div
      style={{
        justifyContent: "center",
        display,
        flexDirection: "column",
        marginTop: "1%",
      }}
    >
      {teamData && (
        <>
          <HStack alignItems="center" justifyContent="center">
            <Text>X-Axis:</Text>
            <Select
              onChange={(e) => setXAxis(e.target.value)}
              maxWidth="10%"
              value={xAxis}
            >
              {keyOptions.map((key, index) => (
                <option value={key} key={index}>
                  {key.charAt(0).toUpperCase() +
                    key.replace(/([A-Z])/g, " $1").substring(1)}
                </option>
              ))}
            </Select>
            <Text>Y-Axis:</Text>
            <Select
              onChange={(e) => setY1Axis(e.target.value)}
              maxWidth="10%"
              value={y1Axis}
            >
              {keyOptions.map((key, index) => (
                <option value={key} key={index}>
                  {key.charAt(0).toUpperCase() +
                    key.replace(/([A-Z])/g, " $1").substring(1)}
                </option>
              ))}
            </Select>
            <Select
              onChange={(e) => setY2Axis(e.target.value)}
              maxWidth="10%"
              value={y2Axis}
            >
              <option value="">None</option>
              {keyOptions.map((key, index) => (
                <option value={key} key={index}>
                  {key.charAt(0).toUpperCase() +
                    key.replace(/([A-Z])/g, " $1").substring(1)}
                </option>
              ))}
            </Select>
            <Select
              onChange={(e) => setY3Axis(e.target.value)}
              maxWidth="10%"
              value={y3Axis}
            >
              <option value="">None</option>
              {keyOptions.map((key, index) => (
                <option value={key} key={index}>
                  {key.charAt(0).toUpperCase() +
                    key.replace(/([A-Z])/g, " $1").substring(1)}
                </option>
              ))}
            </Select>

            <Text>Graph Type:</Text>
            <Select
              onChange={(e) => {
                const val: any = e.target.value;
                setGraphType(val);
              }}
              maxWidth="10%"
            >
              <option value="Bar">Bar</option>
              <option value="Area">Area</option>
              <option value="Line">Line</option>
              <option value="Scatter">Scatter</option>
              <option value="Pie">Pie</option>
            </Select>
            <Tooltip label="Delete Graph">
              <IconButton
                aria-label="Delete Graph"
                icon={<DeleteIcon />}
                onClick={() => setDisplay("none")}
                colorScheme="red"
              />
            </Tooltip>
          </HStack>
          <Graph
            data={graphPoints}
            xLabel={
              xAxis.charAt(0).toUpperCase() +
              xAxis.replace(/([A-Z])/g, " $1").substring(1)
            }
            keys={keys}
            type={graphType}
          />
        </>
      )}
    </div>
  );
};

export default GraphInput;

import { IconButton } from "@chakra-ui/button";
import { DeleteIcon } from "@chakra-ui/icons";
import { HStack, Text } from "@chakra-ui/layout";
import { Select } from "@chakra-ui/select";
import { Tooltip } from "@chakra-ui/tooltip";
import React, { FC, useEffect, useState } from "react";
import Graph, { PointList } from "./Graph";

interface RegionalGraphInputProps {
  regionalData: any;
}

const RegionalGraphInput: FC<RegionalGraphInputProps> = ({ regionalData }) => {
  const [keys, setKeys] = useState<string[]>();
  const [keyOptions, setKeysOptions] = useState<string[]>();
  const xAx = "teamNum";
  const [y1Axis, setY1Axis] = useState<string>("ccwm");
  const [y2Axis, setY2Axis] = useState<string>("opr");
  const [y3Axis, setY3Axis] = useState<string>("dpr");
  const [display, setDisplay] = useState<string>("flex");
  const [graphData, setGraphData] = useState<PointList[]>();
  const [graphType, setGraphType] = useState<
    "Bar" | "Area" | "Line" | "Scatter"
  >("Bar");

  useEffect(() => {
    if (regionalData) {
      const keys = Object.keys(
        regionalData[Object.keys(regionalData)[0]] || {}
      );
      removeFromArray("comments", keys);
      removeFromArray("length", keys);
      setKeysOptions(keys);
    }
  }, [regionalData]);

  useEffect(() => {
    const getPointList = (yAx: string) => {
      return Object.keys(regionalData)
        .map((team) => {
          let point: any = {};
          point.x = team;
          point.y = regionalData[team][yAx || ""];

          return point;
        })
        .sort((a, b) => {
          return -regionalData[a.x].ranking + regionalData[b.x].ranking;
        });
    };
    setGraphData([
      getPointList(y1Axis),
      getPointList(y2Axis),
      getPointList(y3Axis),
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
  }, [xAx, y1Axis, y2Axis, y3Axis, regionalData]);

  const removeFromArray = (key: string, array: string[]) => {
    const index = array.indexOf(key);
    if (index > -1) {
      array.splice(index, 1);
    }
  };

  return (
    <div
      style={{
        justifyContent: "center",
        display,
        flexDirection: "column",
        marginTop: "1%",
      }}
    >
      {regionalData && (
        <>
          <HStack alignItems="center" justifyContent="center">
            <Text>X-Axis: Team Number</Text>
            <Text>Y-Axis:</Text>
            <Select
              onChange={(e) => setY1Axis(e.target.value)}
              maxWidth="10%"
              value={y1Axis}
            >
              {keyOptions?.map((key, index) => (
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
              {keyOptions?.map((key, index) => (
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
              {keyOptions?.map((key, index) => (
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
            data={graphData || [[]]}
            xLabel={
              xAx
                ? xAx.charAt(0).toUpperCase() +
                  xAx.replace(/([A-Z])/g, " $1").substring(1)
                : ""
            }
            keys={keys || []}
            type={graphType || "Bar"}
          />
        </>
      )}
    </div>
  );
};

export default RegionalGraphInput;

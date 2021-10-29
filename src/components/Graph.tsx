import React, { FC, useEffect, useState } from "react";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  Area,
  ComposedChart,
  Bar,
  Scatter,
} from "recharts";

export interface Point {
  x: string | number;
  y: string | number;
}

export type PointList = Point[];

interface GraphProps {
  data: PointList[];
  type: "Bar" | "Area" | "Line" | "Scatter" | "Pie";
  keys: string[];
  xLabel?: string;
  yLabel?: string;
}

const Graph: FC<GraphProps> = ({ data, type, keys, xLabel, yLabel }) => {
  const [graphData, setGraphData] = useState<any>([]);
  const colors = ["#260245", "#ffc410", "#dab0ec", "#550575"];
  useEffect(() => {
    let gData: any[] = [];
    data?.forEach((pointList, index) => {
      pointList?.forEach((point) => {
        let found = false;
        for (let i = 0; i < gData.length && !found; i++) {
          if (gData[i].x === point.x) {
            gData[i][keys[index]] = point.y;
            found = true;
          }
        }
        if (!found) {
          gData = [
            ...gData,
            {
              x: point.x,
            },
          ];
          gData[gData.length - 1][keys[index]] = point.y;
        }
      });
    });
    setGraphData(gData);
  }, [data, keys]);
  return (
    <>
      <ComposedChart
        width={1000}
        height={250}
        data={graphData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <XAxis
          dataKey="x"
          label={{ value: xLabel, position: "insideBottomRight", offset: 0 }}
        />
        <YAxis label={{ value: yLabel, angle: -90, position: "insideLeft" }} />
        <CartesianGrid strokeDasharray="3 3" />
        <Legend verticalAlign="top" height={36} />
        <Tooltip />
        {keys.map((key, index) => {
          const props = {
            // type:"monotone",
            dataKey: key,
            stroke: colors[index % colors.length],
            fillOpacity: 0.3,
            fill: colors[index % colors.length],
          };
          if (type === "Area")
            return <Area type="monotone" key={index} {...props} />;
          if (type === "Line")
            return <Line type="monotone" key={index} {...props} />;
          if (type === "Bar") return <Bar key={index} {...props} />;
          else return <Scatter key={index} {...props} />;
        })}
      </ComposedChart>
    </>
  );
};

export default Graph;

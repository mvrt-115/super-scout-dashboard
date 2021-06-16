import React, { useEffect, useState } from "react";
import * as math from "mathjs";
import {
  Crosshair,
  HorizontalBarSeries,
  HorizontalGridLines,
  LabelSeries,
  VerticalGridLines,
  XAxis,
  XYPlot,
  YAxis,
} from "react-vis";

const MeanGraph = ({ ballsScored, gameState, colors, team, units }) => {
  const [data, setData] = useState({});

  const [crosshair, setCrosshair] = useState([]);

  useEffect(() => {
    setData({
      min: [{ y: team, x: math.min(ballsScored.length ? ballsScored : [0]) }],
      mean: [
        {
          y: team,
          x:
            math.mean(ballsScored.length ? ballsScored : [0]) -
            math.min(ballsScored.length ? ballsScored : [0]),
        },
      ],
      max: [
        {
          y: team,
          x:
            math.max(ballsScored.length ? ballsScored : [0]) -
            math.mean(ballsScored.length ? ballsScored : [0]),
        },
      ],
    });
  }, [ballsScored]);

  return (
    <XYPlot
      yType="ordinal"
      width={1200}
      height={200}
      xDistance={100}
      stackBy="x"
      onMouseLeave={() => setCrosshair([])}
    >
      <VerticalGridLines />
      <HorizontalGridLines />
      <HorizontalBarSeries
        data={data.min}
        color={colors[0]}
        onNearestX={(value) => {
          setCrosshair([{ value }]);
        }}
      />
      <HorizontalBarSeries
        data={data.mean}
        color={colors[1]}
        onNearestX={(value) => {
          setCrosshair([{ value }]);
        }}
      />
      <HorizontalBarSeries
        data={data.max}
        color={colors[2]}
        onNearestX={(value) => {
          setCrosshair([{ value }]);
        }}
      />

      {data.min && data.min.length > 0 && (
        <LabelSeries
          data={[
            { x: data.min[0].x, y: 115, label: "Min: " },
            { x: data.mean[0].x, y: 115, label: "Mean: " },
            { x: data.max[0].x, y: 115, label: "Max: " },
          ]}
          getLabel={(d) => d.label + Math.round(d.x * 100) / 100 + " " + units}
        />
      )}
      <XAxis title={`${units} scored in ${gameState}`} />
      <YAxis />
      <Crosshair
        values={crosshair}
        titleFormat={() => ({ title: "Team", value: data.team })}
        itemsFormat={() => {
          return [
            {
              title: "Min",
              value: data.min[0].x + ` ${units} scored`,
            },
            {
              title: "Mean",
              value: data.mean[0].x + data.min[0].x + ` ${units} scored`,
            },
            {
              title: "Max",
              value:
                data.max[0].x +
                data.mean[0].x +
                data.min[0].x +
                ` ${units} scored`,
            },
          ];
        }}
      />
    </XYPlot>
  );
};

export default MeanGraph;

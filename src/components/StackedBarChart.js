import React, { useState } from "react";
import {
  Crosshair,
  DiscreteColorLegend,
  HorizontalGridLines,
  VerticalBarSeries,
  VerticalGridLines,
  XAxis,
  XYPlot,
  YAxis,
} from "react-vis";

const StackedBarChart = ({
  data1,
  data2,
  color1,
  color2,
  label1,
  label2,
  tickFormat,
  tickValues,
  xLabel,
  yLabel,
}) => {
  const [crosshair, setCrosshair] = useState([]);

  return (
    <XYPlot
      xType="ordinal"
      width={1200}
      height={400}
      xDistance={100}
      stackBy="y"
      onMouseLeave={() => {
        setCrosshair([]);
      }}
    >
      <DiscreteColorLegend
        style={{ position: "absolute", left: "50px", top: "10px" }}
        orientation="vertical"
        items={[
          {
            title: label1,
            color: color1,
          },
          {
            title: label2,
            color: color2,
          },
        ]}
      />
      <VerticalGridLines />
      <HorizontalGridLines />
      <VerticalBarSeries
        onNearestX={(value, { index }) => {
          setCrosshair([{ ...data1[index] }, { ...data2[index] }]);
        }}
        className="vertical-bar-series-example"
        data={data1}
        color={color2}
      />
      <VerticalBarSeries data={data2} color={color1} />
      <XAxis title={xLabel} tickFormat={tickFormat} tickValues={tickValues} />
      <YAxis title={yLabel} />
      <Crosshair
        values={crosshair}
        titleFormat={(d) => ({ title: "Match", value: d[0].x })}
        itemsFormat={(d) => [
          { title: label1, value: d[0].y },
          { title: label2, value: d[1].y },
        ]}
      />
    </XYPlot>
  );
};

export default StackedBarChart;

import React, { FC } from "react";
import { Route } from "react-router-dom";
import RegionalData from "../pages/RegionalData";
import Regionals from "../pages/Regionals";
import TeamData from "../pages/TeamData";
import Teams from "../pages/Teams";

interface RoutesProps {}

const Routes: FC<RoutesProps> = () => {
  return (
    <>
      <Route exact path="/" component={Regionals} />
      <Route exact path="/regional/:regional/" component={Teams} />
      <Route
        exact
        path="/regional/:regional/teams/:team"
        component={TeamData}
      />
      <Route exact path="/regional-data/:regional" component={RegionalData} />
    </>
  );
};

export default Routes;

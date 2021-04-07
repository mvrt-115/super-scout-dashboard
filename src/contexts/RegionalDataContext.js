import React, { createContext, useContext, useState } from "react";
import { db } from "../firebase";

const RegionalDataContext = createContext();

export const useRegionalData = () => {
  return useContext(RegionalDataContext);
};

export const RegionalDataProvider = ({ children }) => {
  const [regionalData, setRegionalData] = useState({});
  const [regionals, setRegionals] = useState([]);

  const updateRegionalData = async (regional) => {
    const teamsRef = await db
      .collection("regional")
      .doc(regional)
      .collection("teams")
      .get();

    console.log(regional);

    let teams = teamsRef.docs.map((doc) => doc.id);
    let regionalData = {};

    teams.forEach(async (team) => {
      const teamRef = await db
        .collection("regional")
        .doc(regional)
        .collection("teams")
        .doc(team)
        .collection("matches")
        .get();
      const teamData = teamRef.docs.map((doc) => doc.data());

      regionalData[team] = {};
      let hangAttempted = true;

      Object.keys(teamData[0].data).forEach((key) => {
        if (
          Number.isSafeInteger(teamData[0].data[key]) &&
          key !== "scout_id" &&
          key !== "match" &&
          key !== "matchNum" &&
          key !== "teamNum"
        ) {
          const arr = teamData.map((team) => team.data[key]);

          regionalData[team][key] = arr;
        }
      });
      const endgamePoints = teamData.map((match) => {
        let points = 0;
        if (match.data.attemptHang && !match.data.hangFail) points = 25;
        if (match.data.attemptLevel && !match.data.levelFail) points += 15;
        if (!match.data.attemptHang && !match.data.attemptLevel) points = 5;
        return points;
      });
      regionalData[team]["endgamePoints"] = endgamePoints;
    });

    console.log(
      "Min, Mean, Median, Max Data for all teams at regional",
      regionalData
    );
    setRegionalData(regionalData);
    return regionalData;
  };

  const updateRegionals = async () => {
    const regionalsRequest = await db.collection("regional").get();
    let regionals = regionalsRequest.docs.map((regional) => regional.id);
    setRegionals(regionals);
    return regionals;
  };

  const value = {
    regionalData,
    regionals,
    updateRegionalData,
    updateRegionals,
  };

  return (
    <RegionalDataContext.Provider value={value}>
      {children}
    </RegionalDataContext.Provider>
  );
};

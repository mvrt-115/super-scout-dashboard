import React, { createContext, useContext, useEffect, useState } from "react";
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

    let teams = teamsRef.docs.map((doc) => doc.id);
    let regionalData = {};

    const teamRefs = await Promise.all(
      teams.map((team) =>
        db
          .collection("regional")
          .doc(regional)
          .collection("teams")
          .doc(team)
          .collection("matches")
          .get()
      )
    );

    teamRefs.forEach((teamRef, index) => {
      const teamData = teamRef.docs.map((doc) => doc.data());

      regionalData[teams[index]] = {};

      Object.keys(teamData[0].data).forEach((key) => {
        if (
          Number.isSafeInteger(teamData[0].data[key]) &&
          key !== "scout_id" &&
          key !== "match" &&
          key !== "matchNum" &&
          key !== "teamNum"
        ) {
          const arr = teamData.map((team) => team.data[key]);

          regionalData[teams[index]][key] = arr;
        }
      });
      const endgamePoints = teamData.map((match) => {
        let points = 0;
        if (match.data.attemptHang && !match.data.hangFail) points = 25;
        if (match.data.attemptLevel && !match.data.levelFail) points += 15;
        if (!match.data.attemptHang && !match.data.attemptLevel) points = 5;
        return points;
      });
      regionalData[teams[index]]["endgamePoints"] = endgamePoints;
    });
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

  useEffect(() => {
    updateRegionalData();
    updateRegionals();
  }, []);

  return (
    <RegionalDataContext.Provider value={value}>
      {children}
    </RegionalDataContext.Provider>
  );
};

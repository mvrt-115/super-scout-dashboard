import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { db } from '../firebase';

const SearchTeams = () => {
    const [submitted, setSubmitted] = useState(false);
    const [incorrectSubmisssion, setIncorrectSubmisssion] = useState(false);
    const history = useHistory();

    const searchTeams = (event) => {
        event.preventDefault();
        setIncorrectSubmisssion(false)

        const regional = event.target.elements["regional"].value;
        const team = event.target.elements["team"].value;
        const matchNum = event.target.elements["match"].value;

        if(!matchNum && !team){
            setIncorrectSubmisssion(true)
            return
        }
        if(team)
            history.push("/teams/" + regional + "/" + team + "/" + matchNum);
        else {
            history.push("/regional/" + regional + "/match/" + matchNum);
        }
    }

    return (
        <>
            <h4>Search for a team or match, enter a regional and either a team or match</h4>
            <form onSubmit={searchTeams}>
                <input name="regional" placeholder="regional" required />
                <input name="team" placeholder="team number" type="number" />
                <input name="match" placeholder="match number" type="number" />
                <button>Search Teams</button>
            </form>
            {incorrectSubmisssion && (<h3 style={{ color: 'red' }}>Please enter regional and match number or team number</h3>)}
            <div style={{ display: "flex", margin: "2%", marginLeft: 0}}>
                <button>Time Series</button>
                <button>Stats</button>
            </div>

        </>
    )
}

export default SearchTeams;
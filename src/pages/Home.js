import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { db } from '../firebase';
import SearchTeams from './SearchTeams';

function Home() {
  const [regionals, setRegionals] = useState([])
  useEffect(() => {
    const fetchData = async () => {
      try {
        const regional = 'CASF';
        const match = '31';
        const alliance = 'blue';
        const team = '31';
        const request = await db
          .collection('regional')
          .doc(regional)
          .collection('matches')
          .doc(match)
          .collection(alliance)
          .doc(team)
          .get();
        console.log(request.data());
        const regionalRequest = await db.collection('regional').get();
        setRegionals(regionalRequest.docs.map(doc => doc.id));
      } catch (e) {
        console.log(e);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <h1>home</h1> 
      <SearchTeams />
      <Link to="/scanner">Scanner</Link>;
      <ul>
        {regionals.map((regional, index) => (
          <li className = "link" key={regional}><Link to={`/regional/${regional}`} >{regional}</Link></li>
        ))}
      </ul>
    </>
  );
}

export default Home;

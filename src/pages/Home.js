import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { db } from '../firebase';
import SearchTeams from './SearchTeams';

function Home() {
  const [regionals, setRegionals] = useState([]);
  const [incorrectSubmisssion, setIncorrectSubmisssion] = useState(false);
  const history = useHistory();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
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
      {/* <h1>home</h1> 
      <SearchTeams /> */}
      <ul>
        {regionals.map((regional) => (
          <li className = "link" key={regional}><Link to={`/regional/${regional}`} >{regional}</Link></li>
        ))}
      </ul>
    </>
  );
}

export default Home;

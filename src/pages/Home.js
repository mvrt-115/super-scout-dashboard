import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';

// homepage
function Home() {
  const [regionals, setRegionals] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      console.log("=========LOADING DATA=========");
      // fetch regional data
      try {
        const regionalRequest = await db.collection('regional').get();
        setRegionals(regionalRequest.docs.map(doc => doc.id));

        console.log("Regionals Array", regionalRequest.docs.map(doc => doc.id));
        console.log("=========DATA LOADED=========");
      } catch (e) {
        console.log(e);
      }
    };
    console.log("=========IN HOME USE EFFECT=========");
    fetchData().then(() => console.log("=========OUT OF HOME USE EFFECT"));
  }, []);

  return (
    <>
      <h3>Regionals: </h3>
      <ul>
        {regionals.map((regional) => (
          <li className = "link" key={regional}><Link to={`/regional/${regional}`} >{regional}</Link></li>
        ))}
      </ul>
    </>
  );
}

export default Home;

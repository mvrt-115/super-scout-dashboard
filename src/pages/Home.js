import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';

// homepage
function Home() {
  const [regionals, setRegionals] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      // fetch regional data
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

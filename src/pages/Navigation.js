import React, { useEffect, useState } from "react";
import { Nav, Navbar, Dropdown, Form, Button } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import { db } from "../firebase";

// Navbar to navigate website
function Navigation() {
  const [regionals, setRegionals] = useState([]);
  const [regional, setRegional] = useState("");
  const [match, setMatch] = useState("");
  const [team, setTeam] = useState("");
  const history = useHistory();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const regionalRequest = await db.collection("regional").get();
        const regionals = regionalRequest.docs.map((doc) => doc.id);
        setRegionals(regionals);
        setRegional(regionals[0]);
      } catch (e) {
        console.log(e);
      }
    };
    fetchData();
  }, []);

  // when the user searches, redirect them to a team at a regional/team at a match at the regional
  const searchTeams = (event) => {
    event.preventDefault();

    if (!team && !match) return;

    if (team) {
      history.push("/teams/" + regional + "/" + team + "/" + match);
    } else {
      history.push("/regional/" + regional + "/match/" + match);
    }
  };

  return (
    <Navbar collapseOnSelect expand="lg">
      {/* Top left title of website */}
      <Navbar.Brand
        as={Link}
        to="/"
        style={{ color: "#7300b5", fontSize: "2em" }}
      >
        MVRT Super Scout Dashboard
      </Navbar.Brand>
      <Navbar.Text as={Link} to="/scanner">
        MVRT Super Scout Scanner
      </Navbar.Text>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      {/* Form for searching for a regional */}
      <Navbar.Collapse className="justify-content-end">
        <Nav>
          <Navbar.Text style={{ color: "black" }}>
            Select a regional
          </Navbar.Text>
          <Dropdown style={{ marginLeft: "5px" }}>
            <Dropdown.Toggle id="dropdown-basic">{regional}</Dropdown.Toggle>
            <Dropdown.Menu>
              {regionals.map((regional) => (
                <Dropdown.Item
                  onSelect={(e) => setRegional(regional)}
                  key={regional}
                >
                  {regional}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <Form
            onSubmit={searchTeams}
            inline
            style={{ marginLeft: "5px", marginRight: "5px" }}
          >
            <Form.Label style={{ marginLeft: "5px", marginRight: "5px" }}>
              Search for a team
            </Form.Label>
            <Form.Control
              type="number"
              className="mr-sm-2"
              style={{ width: 90 }}
              onChange={(e) => setTeam(e.target.value)}
              placeholder="team"
            />
            <Form.Label style={{ marginRight: "5px" }}>
              and or a match
            </Form.Label>
            <Form.Control
              type="number"
              className="mr-sm-2"
              style={{ width: 90 }}
              onChange={(e) => setMatch(e.target.value)}
              placeholder="match"
            />
            <Button type="submit" disabled={!team && !match}>
              Search
            </Button>
          </Form>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Navigation;

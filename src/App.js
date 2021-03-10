  import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Home from './pages/Home';
import Match from './pages/Match';
import Regional from './pages/Regional';
import TeamData from './pages/TeamData';
import '../node_modules/react-vis/dist/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navigation from './pages/Navigation';
import { Container } from 'react-bootstrap';

function App() {
  return (
    <Router>
      <Navigation />
      <Container className="justify-content-center">
        <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/scanner" component={() => { 
                window.location.href = 'https://mvrt-super-scout-scanner.web.app/'; 
                return null;
            }} />
            <Route exact path="/regional/:regional" component={Regional} />
            <Route exact path="/regional/:regional/match/:match" component={Match} />
            <Route exact path="/teams/:regional/:team/:match" component={TeamData} />
            <Route exact path="/teams/:regional/:team/" component={TeamData} />
          </Switch>
      </Container>
    </Router>
  );
}

export default App;

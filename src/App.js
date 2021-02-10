import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Home from './pages/Home';
import Match from './pages/Match';
import Regional from './pages/Regional';
import Scanner from './pages/Scanner';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/scanner" component={Scanner} />
        <Route exact path="/regional/:regional" component={Regional} />
        <Route exact path="/regional/:regional/match/:match" component={Match} />
      </Switch>
    </Router>
  );
}

export default App;

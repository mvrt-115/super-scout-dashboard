import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Home from './pages/Home';
import Scanner from './pages/Scanner';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/scanner" component={Scanner} />
      </Switch>
    </Router>
  );
}

export default App;

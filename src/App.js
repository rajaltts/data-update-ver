import React, { Component} from "react";
import { Route } from 'react-router-dom';
import "./App.css";
import Layout from './components/Layout/Layout';
import PlotBuilder from './containers/PlotBuilder/PlotBuilder'

class App extends Component{
    
  render(){
    
    return(
      <div className="App">
          <Layout>
              <Route path="/" component={PlotBuilder} />
          </Layout>
      </div>
    );
  }
}

export default App;
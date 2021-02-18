import React, {useState } from 'react';
import { Layout, Button, Col, Row} from 'antd';
import 'antd/dist/antd.css';
import DRContainer from './containers/PlotBuilder/DRContainer'
//import PlotlyChart from 'react-plotlyjs-ts';
//import TodoList from './components/TodoList';
//import MyModule from './assets/mymodule/mymodule';
import FileLoader from './components/FileLoader/FileLoader.js';

import PlotBuilder from './containers/PlotBuilder/PlotBuilder'
import ReactDOM from 'react-dom';
//<DRContainer modelState={modelState}/>
const modelState={url:"http://localhost:7050/MaterialCenter",query:"3;AG6N9w:AGlxTw,AG6N6A:AGlxTw,AG6N8Q:AGlxTw,AG6Ntg:AGlxTw,AG6N3g:AGlxTw;this"};
//const modelState={url:"http://localhost:7050/MaterialCenter",query:"3;AdlUUQ:AIY,jLgAAPvPA:elM,AcehFw:AIY,jLgAAPviw:elM;this"};
/*<Layout>
    <Header> </Header>
    <Layout>
      <Content>
      <DRContainer modelState={modelState}/>
      </Content>
    </Layout>
  </Layout>
  <PlotBuilder 
            data_input = {data_file}
            template_input = {tensile_template} parentCallback = {""}/>
  
  */

const App: React.FC = () => {
  const { Header, Footer, Sider, Content } = Layout;

  let tensile_template = require('./data/template_tensile.json');
  let data_file = require('./data/data.json');

 /* 
  // App with file from disk
  const [input,setInput] = useState(
    {
      "type": "tensile",
      "xtype": "strain_engineering",
      "ytype": "stress_engineering",
      "xunit": "no",
      "yunit": "MPa",
      "groups" : [{"label": "my_group1",
                    "curves": [ {"label": "curve1",
                                 "x" : [ ],
                                 "y" : [ ]
                                }
                              ]
                    }
                  ]
    }
  );
  const [curves,setCurves] = useState([]);

  const handleOnFileLoad = (result) => {
    console.log("----CSV handler ----");
    const s = result[0].data.length;
    let curves_ = [];
    // st = [ { x: [1,2,..], y: [1,2,3,..], label: 'curve1'} , ....]
    for(let i=0; i<s/2; i++){
        const xs = result.map( line => line.data[2*i]);
        const ys = result.map( line => line.data[2*i+1]);

        let xs_:number[]=[];
        let ys_:number[]=[];
        for(let i=0; i<xs.length; i++){
          if(xs[i] !== undefined && xs[i].length >0){
            xs_.push(parseFloat(xs[i]));
            ys_.push(parseFloat(ys[i]));
          }
        }
        const curve_id = i+1;
        const curve = { id: i+1, x: xs_, y: ys_, label: 'curve'+curve_id};
        curves_.push(curve);
    } 

    setCurves(curves_);
  }

  const addDataHandler = () => {
    if(curves.length > 0) {
      const group_ = [{ label: 'browse', curves: curves }];
      const input_updated = {...input, groups: group_};
      setInput(input_updated);
    } else {
      setInput(data_file);
    }
  }

  return (
    <Layout style={{height:"100vh"}}>
    <Content >
      <h1>Data Reduction App</h1>
      <p>Select a strain-stress csv file (comma separated, no headers) </p>
      <FileLoader handleOnFileLoad={handleOnFileLoad}/>
      <Button type="primary" onClick={addDataHandler}>Init</Button>
      <hr style={{width:"100%"}}/>
      <PlotBuilder  
                  data_input = {input}
                  template_input = {tensile_template}
                  parentCallback = {""}/>
    </Content>
    </Layout>
  )
  
*/
   // App with local file loading
   
  return (
    <Layout style={{height:"90%"}}>
      <Content >
      <PlotBuilder 
            data_input = {data_file}
            template_input = {tensile_template} parentCallback = {""}/>

      </Content>
    </Layout>
 );
 
 
 
 


}


function renderDRContainer(model, element) {
  ReactDOM.render(<DRContainer modelState={model} />, element);
//  ReactDOM.render(
   // React.createElement(DRContainer, {modelState: model}, null),element);
  console.log("Test External Method element:" + element);
}

(window as any).renderDRContainer = renderDRContainer;

export default App;

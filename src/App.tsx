import React, {useState } from 'react';
import { Layout, Col, Row} from 'antd';
import 'antd/dist/antd.css';
import DRContainer from './containers/PlotBuilder/DRContainer'
//import PlotlyChart from 'react-plotlyjs-ts';
//import TodoList from './components/TodoList';
//import MyModule from './assets/mymodule/mymodule';
import FileLoader from './components/FileLoader/FileLoader.js';

import PlotBuilder from './containers/PlotBuilder/PlotBuilder'
import ReactDOM from 'react-dom';
//<PlotBuilder  data_input = {data_file} template_input = {tensile_template}/>
//<DRContainer modelState={modelState}/>
//const modelState={url:"http://localhost:7050/MaterialCenter",query:"3;AdlUUQ:AIY,AcehFw:AIY;this"};
const modelState={url:"http://localhost:7050/MaterialCenter",query:"3;AdlUUQ:AIY,jLgAAPvPA:elM,AcehFw:AIY,jLgAAPviw:elM;this"};
/*<Layout>
    <Header> </Header>
    <Layout>
      <Content>
      <DRContainer modelState={modelState}/>
      </Content>
    </Layout>
  </Layout>*/

const App: React.FC = () => {
  const { Header, Footer, Sider, Content } = Layout;

  let tensile_template = require('./data/template_tensile.json');
  //let tensile_template = require('./data/template_tensile_no_extrapolation.json');

  // App with file from disk
  /*
  const [showBrowser,setShowBrowser ] = useState(true);
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

    const group_ = [{ label: 'browse', curves: curves_ }];
    const input_updated = {...input, groups: group_};
    setInput(input_updated);
   
    setShowBrowser(false);
  }

  return (
    <Layout style={{height:"100vh"}}>
    <Content >
      <h1>Data Reduction App</h1>
      {showBrowser&&<FileLoader handleOnFileLoad={handleOnFileLoad}/>}
      {!showBrowser&&<PlotBuilder  
                  data_input = {input}
                  template_input = {tensile_template}
                  parentCallback = {""}/>}
    </Content>
    </Layout>
  )
  */

   // App with local file loading
   
  let data_file = require('./data/data.json');
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

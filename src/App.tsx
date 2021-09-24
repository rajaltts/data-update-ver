import React from 'react';
import { Layout } from 'antd';
import 'antd/dist/antd.css';
import DRContainer from './containers/PlotBuilder/DRContainer'
import FileLoader from './components/FileLoader/FileLoader.js';
import ImportFromDisk from './components/ImportFromDisk/ImportFromDisk'
import PlotBuilder from './containers/PlotBuilder/PlotBuilder'
import ReactDOM from 'react-dom';

//<DRContainer modelState={modelState}/>
//let modelState = require('./data/data1.json');
const modelState={newLoad:true,url:"http://localhost:7050/MaterialCenter",query:"3;YZ4AE40rw:AEjKjA,YZ4AE40Aw:AEjKjA,YZ4AE40og:AEjKjA,YZ4AE40wQ:AEjKjA,YZ4AE40UQ:AEjKjA,YZ4AE407w:AEjKjA,YZ4AE40OA:AEjKjA;this"};
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
  let data_file = require('./data/data1.json'); // default curve file, only for Development

  // App with compenent for curve loading from the local disk - Standalone version
  /*
  return (
    <ImportFromDisk template_input={tensile_template} data_input={data_file}/>
  );
  */
 
   // App with default files, no input files needed 
        let drContainer = process.env.NODE_ENV === 'production'?'':<DRContainer modelState={modelState}/>;
  return (
    <Layout style={{height:"90%"}}>
      <Content >
      {drContainer}

      </Content>
    </Layout>
 );
 

}


function renderDRContainer(model, element) {
  //Comment this piece of code to activate logging
  if (process.env.NODE_ENV === 'production') {
    const noop = () => {}
    ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml',
      'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
      'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
      'timeline', 'timelineEnd', 'timeStamp', 'trace',
    ].forEach((method) => {
      window.console[method] = noop
    })
  }
  ReactDOM.render(<DRContainer modelState={model} />, element);
//  ReactDOM.render(
   // React.createElement(DRContainer, {modelState: model}, null),element);
  //console.log("Test External Method element:" + element);
}

(window as any).renderDRContainer = renderDRContainer;

export default App;

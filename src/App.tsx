import React from 'react';
import { Layout } from 'antd';
import 'antd/dist/antd.css';
import DRContainer from './containers/PlotBuilder/DRContainer'
import FileLoader from './components/FileLoader/FileLoader.js';
import ImportFromDisk from './components/ImportFromDisk/ImportFromDisk'
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
  let data_file = require('./data/data.json'); // default curve file, only for Development

  // App with compenent for curve loading from the local disk - Standalone version
  /*
  return (
    <ImportFromDisk template_input={tensile_template} data_input={data_file}/>
  );
  */
 
   // App with default files, no input files needed 
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

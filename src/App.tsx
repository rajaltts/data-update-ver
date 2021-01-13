import React from 'react';
import { Layout, Col, Row} from 'antd';
import 'antd/dist/antd.css';
import DRContainer from './containers/PlotBuilder/DRContainer'
//import PlotlyChart from 'react-plotlyjs-ts';
//import TodoList from './components/TodoList';
//import MyModule from './assets/mymodule/mymodule';

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

  let data_file = require('./data/data.json');
  let tensile_template = require('./data/tensile_template.json');


  return (

    <Layout>
      <Content>
      <PlotBuilder  
            data_input = {data_file}
            template_input = {tensile_template}/>
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

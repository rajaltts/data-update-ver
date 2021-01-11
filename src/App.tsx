import React from 'react';
import { Layout, Col, Row} from 'antd';
import 'antd/dist/antd.css';
import DRContainer from './containers/PlotBuilder/DRContainer'
//import PlotlyChart from 'react-plotlyjs-ts';
//import TodoList from './components/TodoList';
//import MyModule from './assets/mymodule/mymodule';

import PlotBuilder from './containers/PlotBuilder/PlotBuilder'
//<PlotBuilder  data_input = {data_file} template_input = {tensile_template}/>
//<DRContainer modelState={modelState}/>
const modelState={url:"http://localhost:7050/MaterialCenter",query:"3;jLgAAPumg:elM,jLgAAPvPA:elM,jLgAAPviw:elM;this"};
const App: React.FC = () => {
  const { Header, Footer, Sider, Content } = Layout;

  let data_file = require('./data/data.json');
  let tensile_template = require('./data/tensile_template.json');


  return (
    <Layout style={{height:"100vh"}}>
      <Content >
      <PlotBuilder  
            data_input = {data_file}
            template_input = {tensile_template}/>
      </Content>
    </Layout>
  );
}

export default App;

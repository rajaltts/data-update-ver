import React from 'react';
import { Layout, Col, Row} from 'antd';
import 'antd/dist/antd.css';
import PlotBuilder from './containers/PlotBuilder/PlotBuilder'

const App: React.FC = () => {
  const { Header, Footer, Sider, Content } = Layout;

  let data_file = require('./data/data.json');
  let tensile_template = require('./data/tensile_template.json');


  return (
    <Layout>
      <Header> </Header>
      <Layout>
        <Content>
          <PlotBuilder  
            data_input = {data_file}
            template_input = {tensile_template}/>
        </Content>
      </Layout>
  </Layout>
  );
}

export default App;

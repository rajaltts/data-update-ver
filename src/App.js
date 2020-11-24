import React, {Fragment} from 'react';
import { Route } from 'react-router-dom';
import { Layout, Col, Row } from 'antd';
import 'antd/dist/antd.css';
import PlotBuilder from './containers/PlotBuilder/PlotBuilder'

const app = () => {
  const { Header, Footer, Sider, Content } = Layout;
  return (
    <Layout>
    <Header>Header</Header>
    <Layout>
      <Content>
        <PlotBuilder />
      </Content>
    </Layout>
    <Footer>MSC Software</Footer>
  </Layout>
  );
}
    
export default app;
// import React from "react";
// import ReactDOM from "react-dom";
// import {BrowserRouter} from 'react-router-dom'
// import App from "./App.js";

// const app = (
//     <BrowserRouter>
//         <App />
//     </BrowserRouter>
// );
// ReactDOM.render(app, document.getElementById("root"));



import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom'
import App from "./App.js";


const app = (
        <App />
);

ReactDOM.render(app, document.getElementById("root"));

// import React, { useState } from 'react';
// import { render } from 'react-dom';
// import { Layout, DatePicker, message, Alert } from 'antd';
// import 'antd/dist/antd.css';
// import './index.css';

// const App = () => {
//   const { Header, Footer, Sider, Content } = Layout;
//   const [date, setDate] = useState(null);
//   const handleChange = value => {
//     message.info(`Selected Date: ${value ? value.format('YYYY-MM-DD') : 'None'}`);
//     setDate(value);
//   };
//   return (
//     <Layout>
//     <Header>Header</Header>
//     <Layout>
//       <Sider>Sider</Sider>
//       <Content>Content</Content>
//     </Layout>
//     <Footer>Footer</Footer>
//   </Layout>
//   );
// };

// render(<App />, document.getElementById('root'));
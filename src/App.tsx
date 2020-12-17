import React from 'react';
import { Layout, Col, Row } from 'antd';
import 'antd/dist/antd.css';

//import PlotlyChart from 'react-plotlyjs-ts';
//import TodoList from './components/TodoList';
//import MyModule from './assets/mymodule/mymodule';

import PlotBuilder from './containers/PlotBuilder/PlotBuilder'

const App: React.FC = () => {
  const { Header, Footer, Sider, Content } = Layout;
  return (
    <Layout>
    <Header>Header</Header>
    <Layout>
      <Content>
        <PlotBuilder/>
      </Content>
    </Layout>
    <Footer>MSC Software</Footer>
  </Layout>
  );
}


// MyModule(MyModule)
//  .then( () =>  {
//   const foo = new MyModule.Foo();
//   foo.setVal(123);
//   console.log(foo.getVal());
//   const bar = new MyModule.Bar(555);
//   bar.doSomething();
//   console.log(bar.get_value());

//   const curve = new MyModule.Curve('toto');
//   curve.addPoint(1,2);
//   const nb = curve.numberOfPoints();
//   console.log("number points:"+nb);
 
//  });

//  import Module from './assets/dataclean/dataclean';

// Module(Module)
//  .then( () =>  {
//   var vecX = new Module.VectorDouble();
//   vecX.push_back(100);
//   vecX.push_back(200);
//   const n = vecX.size();
//   console.log("number element in vec:"+n);
 
//  });


// const App: React.FC = () => {
//   const todos = [{ id: 't1', text: 'Finish the course!' }];


//     // ant
//     const { Header, Footer, Sider, Content } = Layout;
//     // plotly
//     const handleClick = (evt: any) => alert('click');
//     const handleHover = (evt: any) => alert('hover');
//     const data = [
//         {
//             marker: {
//                 color: 'rgb(16, 32, 77)'
//             },
//             type: 'scatter',
//             x: [1, 2, 3],
//             y: [6, 2, 3]
//         },
//         {
//             name: 'bar chart example',
//             type: 'bar',
//             x: [1, 2, 3],
//             y: [6, 2, 3],
//         }
//     ];
//     const layout = {
//         annotations: [
//             {
//                 text: 'simple annotation',
//                 x: 0,
//                 xref: 'paper',
//                 y: 0,
//                 yref: 'paper'
//             }
//         ],
//         title: 'simple example',
//         xaxis: {
//             title: 'time'
//         },
//     };
//   return (
//     <Layout>
//     <Header>Header</Header>
//     <Layout>
//       <Content>
//       <TodoList items={todos} />
//       <PlotlyChart data={data}
//                          layout={layout}
//                          onClick={handleClick}
//                          onHover={handleHover}
//             />
//       </Content>
//     </Layout>
//     <Footer>MSC Software</Footer>
//   </Layout>
//   );

// };



export default App;

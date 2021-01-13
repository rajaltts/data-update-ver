import React  from 'react';
import PlotlyChart from 'react-plotlyjs-ts';
import {Table } from 'antd';

import { Curve } from '../../data.model';
import { colors } from '../../components/DragNDrop/DragNDrop'

interface PlotCurveProps {
   curves: Curve[];
   data: any[];
};

const PlotCurve: React.FC<PlotCurveProps> = (props) => {
  console.log("Create in Plot");
  let data: any = [];
  
  for(let i=0; i<props.curves.length; i++){
    console.log(props.curves[i].name);
    let line : any = {
      type: 'scatter',
      //mode: 'lines+markers',
      mode: 'lines',
      x: props.curves[i].x,
      y: props.curves[i].y,
      name: props.curves[i].name,
      opacity: props.curves[i].opacity,
      line: { color: colors[i] },
    // visible: props.curves[i].selected,
    };
    if(props.curves[i].name==='average'){
      line = {...line,  line: {color: 'rgb(0, 0, 0)', width: 4} };
    }
    data.push(line);
  }

  //const layout = { width: 1000, height: 600, modebardisplay: false};
  const layout = { 
    modebardisplay: false,
    showlegend: false
  };
  const config = {
    displaylogo: false, // remove plotly icon
    reponsive: true
  };
 /*
  var config = {
    displaylogo: false, // remove plotly icon
    reponsive: true,
    modeBarButtonsToAdd: [
      {
        name: 'show markers',
        icon: Plotly.Icons.pencil,
        direction: 'up',
        click: function(gd) {
          var newMode = 'lines+markers';
          Plotly.restyle(gd, 'mode', newMode);
        }
      },
      {
        name: 'hide markers',
        icon: Plotly.Icons.eraseshape,
        click: function(gd) {
          console.log(gd);
          var newMode = 'lines';
          Plotly.restyle(gd, 'mode', newMode);
        }
      }
    ],
    modeBarButtonsToRemove: [ 'hoverClosestCartesian', 'hoverCompareCartesian'] // 2D: zoom2d, pan2d, select2d, lasso2d, zoomIn2d, zoomOut2d, autoScale2d, resetScale2d
                                                  //'Cartesian', hoverClosestCartesian, hoverCompareCartesian
                                                  //-'Other', hoverClosestGl2d, hoverClosestPie, toggleHover, resetViews, toImage, sendDataToCloud, toggleSpikelines, resetViewMapbox
  }
   */ 

  function DisplayData(props) {

    const columns =[
      {title: 'Parameter', dataIndex: 'parameter', key: 'name'},
      {title: 'Value', dataIndex: 'value', key: 'value'}
    ];


    let datasource: any[] = [];
    props.data.forEach( (e,index) => {
      if(e.label !== '')
        datasource.push({key: index.toString(), parameter: e.label, value: e.value});
    });

    if(datasource.length>0){
      return <Table dataSource={datasource} columns={columns} size='small' bordered={true} pagination={false}  style={{width: '500px'}}/>;
    } else {
      return <div></div>;
    }    
  } 

  return(
    <>
    <PlotlyChart
      data = { data }
      layout = { layout }
      config = { config }
      //onUpdate = { (event) => props.updatePlot(event) }
      //onClick = { (data) => props.clickPointHandler(data) }
      //onLegendDoubleClick =  { (event) => props.doubleClickLegendHandler(event)}
      //onLegendClick =  { (event) => props.clickLegendHandler(event)}
    />
    <DisplayData
       data={props.data}/>
    </>

  );
}
   
export default PlotCurve;
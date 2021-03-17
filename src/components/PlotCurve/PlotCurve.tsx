import React, {useState, useEffect}  from 'react';
import PlotlyChart from 'react-plotlyjs-ts';
import Plotly from 'plotly.js/dist/plotly';
import {Table } from 'antd';

import { Curve } from '../../data.model';
import { colors } from '../../assets/colors.js';

interface PlotCurveProps {
   curves: Curve[];
   data: any[];
   keys: string[];
   axisLabel: { xlabel: string, ylabel: string};
};

const PlotCurve: React.FC<PlotCurveProps> = (props) => {

  const [data,setData] = useState<any>([]);

  useEffect(() => {
    let data_: any = [];
    for(let i=0; i<props.curves.length; i++){
      //console.log(props.curves[i].name);
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
      data_.push(line);
    }
    setData(data_);

  },[props.curves,props.keys]);

  const layout = { 
    modebardisplay: false,
    showlegend: false,
    autosize: true,
    // width: 800,
    height: 550,
    margin: {
      l: 70,
      r: 50,
      b: 50,
      t: 50,
      pad: 4
    },
    plot_bgcolor: '#fdfdfd',
    xaxis: {
      title: {
        text: props.axisLabel.xlabel
      }
    },
    yaxis: {
      title: {
        text: props.axisLabel.ylabel
      }
    }
  };
  const config = {
    displaylogo: false, // remove plotly icon
    reponsive: true,
    modeBarButtonsToRemove: [ 'hoverClosestCartesian', 'hoverCompareCartesian', 'resetScale2d', , 'toggleHover'],
    modeBarButtonsToAdd: [
      {
        name: 'show markers',
        icon: Plotly.Icons.drawcircle,
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
    ]
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
      {title: 'Property', dataIndex: 'parameter', key: 'name'},
      {title: 'Value', dataIndex: 'value', key: 'value'}
    ];


    let datasource: any[] = [];
    props.data.forEach( (e,index) => {
      if(e.label !== ''){
        datasource.push({key: index.toString(), parameter: e.label, value:  e.value });
      }
    });

    if(datasource.length>0){
      return <Table dataSource={datasource} columns={columns} size='small' bordered={true} pagination={false}  style={{width: '500px', margin: 'auto', paddingTop: '20px'}}/>;
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
    <div>
    <DisplayData
       data={props.data}/>
    </div>
    </>

  );
}
   
export default PlotCurve;
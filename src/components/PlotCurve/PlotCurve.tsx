import React, {useState, useEffect}  from 'react';
import PlotlyChart from 'react-plotlyjs-ts';
import Plotly from 'plotly.js/dist/plotly';
import {Table, Switch, Space } from 'antd';

import { Curve } from '../../data.model';
import { colors } from '../../assets/colors.js';

interface PlotCurveProps {
   group: number;
   curves: Curve[];
   data: any[];
   keys: string[];
   axisLabel: { xlabel: string, ylabel: string};
   clickPoint: (data: any) => boolean;
   plotUpdate: boolean;
   showMarkers: boolean;
   resultsView: number;
   changeView: (v: number) => void;
};

const PlotCurve: React.FC<PlotCurveProps> = (props) => {

  const [dataPlot,setDataPlot] = useState<any>([]);
  const [currentGroup,setCurrentGroup] = useState(-1);
  const [displayInitCurves,setDisplayInitCurves ] = useState(false);
  const [showSwitch,setShowSwitch] = useState(false);

  useEffect(() => {
  
    const avg_cur_index = props.curves.findIndex( c => c.name==='average');
    const withAvgResult = (avg_cur_index===-1?false:true);
    if(withAvgResult)
      setShowSwitch(true);
    else
      setShowSwitch(false);

    if(withAvgResult&&props.resultsView !== undefined){
      const view = (props.resultsView===0?false:true);
      setDisplayInitCurves(view);
    } else {
      setDisplayInitCurves(false);
    }

    let data_: any = [];
    if(withAvgResult){
      const line : any = {
        type: 'scatter',
        mode: 'lines',
        x: props.curves[avg_cur_index].x,
        y: props.curves[avg_cur_index].y,
        name: props.curves[avg_cur_index].name,
        opacity: props.curves[avg_cur_index].opacity,
        line: { color: '#000000', width: 4 },
      };
      data_.push(line);
    }

    if(displayInitCurves){
      console.log("PLOT init curves");
      for(let i=0; i<props.curves.length; i++){
        if(i===avg_cur_index)
         continue;
        const line : any = {
          type: 'scatter',
          mode: 'lines',
          x: props.curves[i].x0,
          y: props.curves[i].y0,
          name: props.curves[i].name,
          opacity: props.curves[i].opacity,
          line: { color: colors[i] },
        };
        data_.push(line);
      }
      if(props.showMarkers){
        for(let i=0; i<props.curves.length; i++){
          if(props.curves[i].marker){
            const x_marker2 = props.curves[i].x0[props.curves[i].marker];
            const y_marker2 = props.curves[i].y0[props.curves[i].marker];
            const point2 = { type: 'scatter', mode: 'markers', name: props.curves[i].name,  marker: { color: 'black', symbol: ['x'], size: 10 }, x: [x_marker2], y: [y_marker2] };
            data_.push(point2);
            
          }
        }
      }
    } else {
      console.log("PLOT result curves");
      for(let i=0; i<props.curves.length; i++){
        if(i===avg_cur_index)
          continue;
        const line : any = {
          type: 'scatter',
          mode: 'lines',
          x: props.curves[i].x,
          y: props.curves[i].y,
          name: props.curves[i].name,
          opacity: props.curves[i].opacity,
          line: { color: colors[i] },
        };
        data_.push(line);
      }
      if(props.showMarkers){
        for(let i=0; i<props.curves.length; i++){
          if(props.curves[i].marker){
            const x_marker = props.curves[i].x[props.curves[i].marker];
            const y_marker = props.curves[i].y[props.curves[i].marker];
            const point = { type: 'scatter', mode: 'markers', name: props.curves[i].name,  marker: { color: 'black', symbol: ['x'], size: 10 }, x: [x_marker], y: [y_marker] };
            data_.push(point);
          }
        }
      }
    }
    setDataPlot(data_);

    if(props.group!==currentGroup){
      setCurrentGroup(props.group);
    } 
  },[props.curves,props.keys,displayInitCurves,props.plotUpdate]);

  const AddPoint = (data_point: any) =>{
    if(!props.clickPoint(data_point))
      return;
    const curve_idx = data_point.points[0].curveNumber;
    const x = data_point.points[0].x;
    const y = data_point.points[0].y;
    const pt_index = data_point.points[0].pointIndex;
    const curve_name = data_point.points[0].data.name;
    const data_up = [...dataPlot];
    // check if marker already exist
    const c = data_up.find( c => (c.mode==='markers'&&c.name === curve_name));
    if(c){ // replace by new value
      c.x = [x];
      c.y = [y];
    } else { // insert new point
      const point = { type: 'scatter', mode: 'markers', name: curve_name,  marker: { color: 'black', symbol: ['x'], size: 10 }, x: [x], y: [y] };
      data_up.push(point);
    }
    
    setDataPlot(data_up);
    
  }

  const config = {
    displaylogo: false, // remove plotly icon
    reponsive: true,
    modeBarButtonsToRemove: [ 'hoverClosestCartesian', 'hoverCompareCartesian', 'resetScale2d', 'lasso2d','select2d', 'toggleHover'],
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

  const  DisplayData = () => {
    
    if(props.data === undefined)
       return <div></div>;
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

  const switchChange = (checked: boolean, event: Event) => {
    setDisplayInitCurves(checked);
    const up = (checked===true?1:0);
    props.changeView(up);
  }
  const layoutHandler = () => {
    const layout_c = { 
      modebardisplay: false,
      showlegend: false,
      autosize: true,
      height: 530,
      hovermode: "closest",
      uirevision:  currentGroup.toString(), // will keep the zoom if not changed
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
    return layout_c;
  }

  return(
    <>
      <div style={{height: '20px', fontSize: '12px', paddingLeft: '5px'}}>
      {showSwitch&&
      <Space align='center'>
             Shifted Curves
             <Switch size="small" checked={displayInitCurves}  onChange={switchChange} />
             Initial Curves
      </Space>}
      </div>
      
      <PlotlyChart
        data = { dataPlot }
        layout = { layoutHandler() }
        config = { config }
        onClick = {AddPoint}
      />

    

    <div>
    <DisplayData/>
    </div>
    </>
   

  );
}
   
export default PlotCurve;
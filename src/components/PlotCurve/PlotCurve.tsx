import React, {useState, useEffect}  from 'react';
import PlotlyChart from 'react-plotlyjs-ts';
import Plotly from 'plotly.js/dist/plotly';
import {Table, Switch, Space } from 'antd';

import { Data, Curve } from '../../containers/PlotBuilder/Model/data.model';
import { colors } from '../../assets/colors.js';
import './PlotCurve.css';
import { PropertySafetyOutlined } from '@ant-design/icons';
import { NodeBuilderFlags } from 'typescript';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { MenuOutlined, LineOutlined } from '@ant-design/icons';
import { arrayMoveImmutable } from 'array-move';

interface PlotCurveProps {
   data: Data;
   interpolationData: {x: number[], y: number[]};
   group: number;
   curves: Curve[];
   postData: any[];
   keys: string[];
   axisLabel: { xlabel: string, ylabel: string};
   clickPoint: (data: any) => boolean;
   plotUpdate: boolean;
   showMarkers: boolean;
   resultsView: number;
   changeView: (v: number) => void;
   displayGids: string[];
   mode: string;
   failureInterpolation: (curves: string[]) => void;
};

const PlotCurve: React.FC<PlotCurveProps> = (props) => {

  const [dataPlot,setDataPlot] = useState<any>([]);
  const [currentGroup,setCurrentGroup] = useState(-1);
  const [displayInitCurves,setDisplayInitCurves ] = useState(false);
  const [showSwitch,setShowSwitch] = useState(false);
  const [selectedLines,setSelectedLines] = useState<string[]>([]);
  //const [interpolationLine,setInterpolationLine] = useState();
  const [sortedTable,setSortedTable]= useState([]);

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
    
    if(props.mode==='normal'){
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
          if(props.curves[i].markerId){
            const x_marker2 = props.curves[i].x0[props.curves[i].markerId];
            const y_marker2 = props.curves[i].y0[props.curves[i].markerId];
            const opacity = (props.curves[i].selected?1.0:0.2);
            const point2 = { type: 'scatter', mode: 'markers', name: props.curves[i].name, opacity: opacity, marker: { color: 'black', symbol: ['x'], size: 10 }, x: [x_marker2], y: [y_marker2] };
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
          if(props.curves[i].markerId){
            const x_marker = props.curves[i].x[props.curves[i].markerId];
            const y_marker = props.curves[i].y[props.curves[i].markerId];
            const opacity = (props.curves[i].selected?1.0:0.2);
            const point = { type: 'scatter', mode: 'markers', name: props.curves[i].name, opacity: opacity, marker: { color: 'black', symbol: ['x'], size: 10 }, x: [x_marker], y: [y_marker] };
            data_.push(point);
          }
        }
      }
    }
    }
    // display all other averaged curves
    if(props.mode==='average'){
      for(let gid=0;gid<props.data.groups.length;gid++){
        const curves = props.data.groups[gid].curves;
        const avg_cur_index = curves.findIndex( c => c.name==='average');
        const withAvgResult = (avg_cur_index===-1?false:true);
        if(withAvgResult/*&&gid!==props.group*/){
            const color = colors[gid]; 
            const showCurve = (props.displayGids.findIndex(k => k === '0-'+gid.toString())===-1?false:true);
            
            const line : any = {
                type: 'scatter',
                mode: 'lines',
                x: curves[avg_cur_index].x,
                y: curves[avg_cur_index].y,
                name: props.data.groups[gid].label, //gid,
                opacity: 1.,
                line: { color: color, width: 4 },
              };
              if(showCurve)
                data_.push(line);
        }
      }
      if(props.interpolationData&&props.interpolationData.x.length>0){
        const line : any = {
          type: 'scatter',
          mode: 'lines',
          x: props.interpolationData.x,
          y: props.interpolationData.y,
          name: 'failureLine',
          opacity: 1,
          line: { color: '#000000', width: 2, dash: 'dot' },
        };
        data_.push(line);
      }
    }

    setDataPlot(data_);

    if(props.group!==currentGroup){
      setCurrentGroup(props.group);
    } 
  },[props.curves,props.keys,displayInitCurves,props.plotUpdate,props.displayGids,props.mode]);

  const AddPoint = (data_point: any) =>{

    if(props.mode==='average'){
      const line : string = data_point.points[0].data.name.toString();
      let update: string[];
      if(selectedLines.length<3){
        update = [...selectedLines,line];
      } else {
        update = [line];
      }
      setSelectedLines(update);
      if(update.length===1){
        const data_up = [...dataPlot];
        const id = data_up.findIndex( e => e.name === 'failureLine');
        if(id!==-1){
          data_up.splice(id,1);
          setDataPlot(data_up);
        } 
        
      }
      else if(update.length===2){
        props.failureInterpolation(update);
      } else if(update.length===3){
        props.failureInterpolation(update);
      }

    } else if(props.mode==='normal') {
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
    return; 
    
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
const DisplayDataAll = () => {

  // check if we have results to display
  const gid = props.data.groups.findIndex( g => g.result);
  if(gid===-1)
    return <div></div>;
  
  let columns: any[] = [ {title: 'Sort',dataIndex: 'sort', width:30, className: 'drag-visible', key: 'sort', render: () => <DragHandle />},
                        {title: 'Curve', dataIndex: 'curve', className: 'drag-visible',  key: 'curve'}];
  // data
  let allResults = false;
  allResults = true;
  let datasource: any[] = [];
  if(sortedTable.length===0){
    props.data.groups.forEach( (g,idg: number) => {
      const row = { curve: <Space size={0} direction='vertical'>{g.label} <LineOutlined style={{fontSize: '24px', verticalAlign: 'middle', color: colors[idg]}}/> </Space>, key: idg.toString(), index: idg};
      g.data.forEach( (p,idp) => {
        if(p.hide===false)
          Object.assign(row, { [p.name.toString()]: p.value});
      });
      datasource.push(row);
    });
  } else {
    datasource = [...sortedTable];
    props.data.groups.forEach( (g,idg: number) => {
      const r = datasource.find( r => r.index===idg);
      g.data.forEach( (p,idp) => {
        if(p.hide===false) {
          r[p.name] = p.value;
        }
      });
    });
  }
  // build a table for column color
  const paramVec = [];
  props.data.groups[gid].data.forEach( (p,ind) => {
    if(p.hide===false){
      paramVec.push( {name: p.name, value: []});
    }
  });
  datasource.forEach( g => {
    for(const r of paramVec){
      if(g[r.name])
         r.value.push(g[r.name]);
    }
  });

  const columnColor = paramVec.map( r => {
    const monotonus_inc = r.value.every( (e,i,a) => {if(i) return e >= a[i-1]; else return true;});
    const monotonus_dec = r.value.every( (e,i,a) => {if(i) return e <= a[i-1]; else return true;});
    if(monotonus_inc ||monotonus_dec) 
        return {name: r.name, color: "green"};
      else 
        return {name: r.name, color: "red"};
  });
  const columnStyle = (paramName: string) => {
    const e = columnColor.find( r => r.name===paramName);
    if(e)
      return { color: e.color };
    else
      return {};
  };
                         
  props.data.groups[gid].data.forEach( (p,ind) => {
    if(p.hide===false)
      columns.push({title: p.label, dataIndex: p.name, render(text,record) {
        return {
               props: {
                 style: columnStyle(p.name)
               },
               children: <div>{text}</div>
             };
      }});
  });
  
  const DragHandle = SortableHandle(() => <MenuOutlined style={{ cursor: 'grab', color: '#999' }} />);
  const SortableItem = SortableElement(props => <tr {...props} />);
  const SortableContainer2 = SortableContainer(props => <tbody {...props} />);

  class SortableTable extends React.Component {
    state = {
      dataSource: datasource,
    };

    onSortEnd = ({ oldIndex, newIndex }) => {
      const { dataSource } = this.state;
      if (oldIndex !== newIndex) {
        const newData = arrayMoveImmutable([].concat(dataSource), oldIndex, newIndex).filter(el => !!el);
        this.setState({ dataSource: newData });
        setSortedTable(newData);
      }
    };

    DraggableContainer = props => (
      <SortableContainer2
        useDragHandle
        disableAutoscroll
        helperClass="row-dragging"
        onSortEnd={this.onSortEnd}
        {...props}
      />
    );

    DraggableBodyRow = ({ className, style, ...restProps }) => {
      const { dataSource } = this.state;
      // function findIndex base on Table rowKey props and should always be a right array index
      const index = dataSource.findIndex(x => x.index === restProps['data-row-key']);
      return <SortableItem index={index} {...restProps} />;
    };

    render() {
      const { dataSource } = this.state;
  
      return (
        <Table
          style={{fontSize: '12px'}}
          pagination={false}
          size='small' bordered={true}
          dataSource={dataSource}
          columns={columns}
          rowKey="index"
          components={{
            body: {
              wrapper: this.DraggableContainer,
              row: this.DraggableBodyRow,
            },
          }}
        />
      );
    }
  }
  
  return <SortableTable />
}
  
  const  DisplayData = () => {
    
    if(props.postData === undefined)
       return <div></div>;
    const columns =[
      {title: 'Property', dataIndex: 'parameter', key: 'name'},
      {title: 'Value', dataIndex: 'value', key: 'value'}
    ];

    let datasource: any[] = [];
    props.postData.forEach( (e,index) => {
      if(e.label !== ''&&e.hide===undefined){
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
     // autosize: true,
      height: 530,
      width: 700,
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

    

    {/* <div>
    <DisplayData/>
    </div> */}
    <div>
    <DisplayDataAll/>
    </div>
    </>
   

  );
}
   
export default PlotCurve;
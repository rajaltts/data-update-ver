import React  from 'react';
import Plotly from 'plotly.js/dist/plotly';
import createPlotlyComponent from 'react-plotly.js/factory';
//import classes from './PlotCurve.module.css';

const PlotCurve = (props) => {
  console.log("Create in Plot");
  const Plot = createPlotlyComponent(Plotly);
  let data = [];

  for(let i=0; i<props.curves.length; i++){
    console.log(props.curves[i].name);
    let line = {
      type: 'scatter',
      //mode: 'lines+markers',
      mode: 'lines',
      x: props.curves[i].x,
      y: props.curves[i].y,
      name: props.curves[i].name,
      opacity: props.curves[i].opacity,
    // visible: props.curves[i].selected,
    };
    if(props.curves[i].name==='average'){
      line = {...line,
                line: {
                  color: 'rgb(0, 0, 0)',
                  width: 4
                }
              };
    }
    data.push(line);
  }

  const layout = { width: 1000, height: 600, modebardisplay: false};
  
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
    
  return(
    <Plot
      graphDiv = 'graph'
      data = { data }
      layout = { layout }
      config = { config }
      //onUpdate = { (event) => props.updatePlot(event) }
      onClick = { (data) => props.clickPointHandler(data) }
      onLegendDoubleClick =  { (event) => props.doubleClickLegendHandler(event)}
      onLegendClick =  { (event) => props.clickLegendHandler(event)}
    />
  );
}
   
export default PlotCurve;
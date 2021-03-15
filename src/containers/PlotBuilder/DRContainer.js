import React, { Fragment, useEffect, useState, useReducer } from 'react';
import { Col, Row, Descriptions, Button, Checkbox , Steps} from 'antd';
import 'antd/dist/antd.css';

import ReactDOM from "react-dom";
import SelectProperties from '../../MC/SelectProperties.js'
import DefineGroups from '../../MC/DefineGroups.js';
import PlotBuilder from './PlotBuilder';
import SaveResults from '../../MC/SaveResults.js';

const { Step } = Steps;

class DRContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = (!props.modelState.newLoad)? this.state= props.modelState:
         {
            query: props.modelState.query,
            url: props.modelState.url,
            propDefs: [],
            loaded: false,
            current:0,
            previous: false,
            reloadStep2: false,
            propDefs:[],
            selectedPropDef:[],
            selectedCurves:[],
            groups:[],
            plotBuildModel:{},
            propLabelMap:{},
            selected_resProp:{},
            salt:props.modelState.salt,
            widget:props.modelState.widgetId,
            hidId:props.modelState.hidId,
            precision:6
        }
        this.updateState = this.updateState.bind(this);
        //this.getPropertyDef = this.getPropertyDef.bind(this);
        const { Step } = Steps;


    }
    updateState =() =>{
      console.log("Update State to JSF Widget: "+this.state);
      window.updateDRState(this.state);
    }
    callbackFunctionStep1 = (childData) => {
        console.log("Parent recieved Selector Data: "+ childData);
        this.setState({
            current: childData.current,
            selectedPropDef: childData.selectedPropDef,
            previous: childData.previous,
            propDefs : childData.propDefs,
            analysisTypes: childData.analysisTypes,
            selectedAnalysisType: childData.selectedAnalysisType,
            propLabelMap: childData.propLabelMap,
            reloadStep2 : childData.stateChanged
       });
       this.updateState();
       console.log("callbackFunctionStep1 "+childData);
    }

    callbackFunctionStep2 = (childData) => {
        console.log("Parent recieved Selector Data: "+JSON.stringify(childData),childData.sections);
        let groups1 = childData.groups;
        let newGroups = childData.groups.slice(1);
        childData.groups = newGroups;
        console.log("Model for PlotBuilder");
        console.log(childData);
        this.setState({
            current: childData.current,
             previous: childData.previous,
             groups : groups1,
             selectedCurves: childData.selectedCurves,
             plotBuildModel : childData,
             groupSelected:childData.groupSelected,		
            selectedCriteria:childData.selectedCriteria,
            groupsCriteria:childData.groupsCriteria,
            criteria:childData.criteria,
            targetType: childData.targetType,
            res_curve: childData.res_curve,
            res_var1: childData.res_var1,
            targetClass: childData.targetClass,
            xtype: childData.xtype,
            xunit: childData.xunit,
            ytype: childData.ytype,
            yunit: childData.yunit,
            unitSystem: childData.unitSystem,
            xQuantityType: childData.xQuantityType,
            yQuantityType:childData.yQuantityType,
            precision:childData.precision,
       });
       this.updateState();
    }

    callbackFunctionStep3 = (childData) => {
      
     console.log("Parent recieved Selector Data: "+JSON.stringify(childData));
      this.setState({
          current: childData.current,
           previous: childData.previous,
           reloadStep2 : childData.stateChanged,
           plotBuildModel : childData.data

     });
     this.updateState();
  }

  callbackFunctionStep4 = (childData) => {
    console.log("Parent recieved Selector Data: "+JSON.stringify(childData));
    this.setState({
        current: childData.current,
         previous: childData.previous,
         selected_resProp: childData.selected_resProp,
   });
   this.updateState();
}

    render() {
        let propDefJson ={
            query:this.props.modelState.query,
            url:this.props.modelState.url,
            previous:this.state.previous,
            propDefs:this.state.propDefs,
            selectedPropDef:this.state.selectedPropDef,
            analysisTypes: this.state.analysisTypes,
            selectedAnalysisType: this.state.selectedAnalysisType,
            propLabelMap: this.state.propLabelMap
        }
        let curveJson ={
            query:this.props.modelState.query,
            url:this.props.modelState.url,
            previous:this.state.previous,
            groups:this.state.groups,
            selectedCurves:this.state.selectedCurves,
            selectedPropDef:this.state.selectedPropDef,
            selectedAnalysisType:this.state.selectedAnalysisType,
            groupSelected:this.state.groupSelected,		
            selectedCriteria:this.state.selectedCriteria,
            groupsCriteria:this.state.groupsCriteria,
            criteria:this.state.criteria,
            reload:this.state.reloadStep2,
            xtype:this.state.xtype,
            ytype:this.state.ytype,
            precision:this.state.precision,
        }
        if(this.state.res_var1!==undefined && this.state.res_curve!==undefined){
          if(JSON.stringify(this.state.selected_resProp) === JSON.stringify({})||(this.state.selected_resProp===undefined)){
            this.state.selected_resProp = {};
            this.state.selected_resProp["res_curve"] = this.state.res_curve[0]
            Object.keys(this.state.res_var1).map((key, i) => {
              let resArray =  this.state.res_var1[key];
              this.state.selected_resProp[key] = resArray[0];
           })
          }
        }
        let saveResultsJson ={
          query:this.props.modelState.query,
          url:this.props.modelState.url,
          previous:this.state.previous,
          groups:this.state.groups,
          selectedCurves:this.state.selectedCurves,
          selectedPropDef:this.state.selectedPropDef,
          selectedAnalysisType:this.state.selectedAnalysisType,
          groupSelected:this.state.groupSelected,		
          selectedCriteria:this.state.selectedCriteria,
          groupsCriteria:this.state.groupsCriteria,
          criteria:this.state.criteria,
          plotBuildModel:this.state.plotBuildModel,
          targetType: this.state.targetType,
          res_curve: this.state.res_curve,
          res_var1: this.state.res_var1,
          selected_resProp: this.state.selected_resProp,
          targetClass: this.state.targetClass,
          xtype: this.state.xtype,
          xunit: this.state.xunit,
          ytype: this.state.ytype,
          yunit: this.state.yunit,
          unitSystem: this.state.unitSystem,
          xQuantityType: this.state.xQuantityType,
          yQuantityType:this.state.yQuantityType,
          widget:this.state.widget,
          newLoad:false,
          precision:this.state.precision,
      }

        let tensile_template = require('../../data/template_tensile.json');

        this.steps = [
            {
              title: 'Select Properties',
              content: <SelectProperties propState={propDefJson} parentCallback = {this.callbackFunctionStep1}/>
            },
            {
              title: 'Define Groups',
              content: <DefineGroups propState={curveJson} parentCallback = {this.callbackFunctionStep2}/>
            },
            {
              title: 'Data Analysis',
              content: <PlotBuilder  data_input = {this.state.plotBuildModel} template_input = {tensile_template} parentCallback = {this.callbackFunctionStep3}/>
            },
            {
              title: 'Save Results',
              content: <SaveResults propState={saveResultsJson} parentCallback = {this.callbackFunctionStep4}/>
            },
          ];
        const  current  = this.state.current;
        return (
            <>
                <div id='plotBuilderDiv'>

                <Steps current={current}>
          {this.steps.map(item => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
        <div className="steps-content" >{this.steps[current].content}</div>
        <div className="steps-action">

        </div>

            </div>
            </>
        )
    }
}

export default DRContainer;
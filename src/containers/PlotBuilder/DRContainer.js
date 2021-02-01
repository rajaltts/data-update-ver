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
        this.state = {
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
            propLabelMap:{}
        }
        //this.getPropertyDef = this.getPropertyDef.bind(this);
        const { Step } = Steps;


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

       console.log("callbackFunctionStep1 "+childData);
    }

    callbackFunctionStep2 = (childData) => {
        console.log("Parent recieved Selector Data: "+JSON.stringify(childData),childData.sections);
        this.setState({
            current: childData.current,
             previous: childData.previous,
             groups : childData.groups,
             selectedCurves: childData.selectedCurves,
             plotBuildModel : childData,
             groupSelected:childData.groupSelected,		
            selectedCriteria:childData.selectedCriteria,
            groupsCriteria:childData.groupsCriteria,
            criteria:childData.criteria,
       });
    }

    callbackFunctionStep3 = (childData) => {
      console.log("Parent recieved Selector Data: "+JSON.stringify(childData));
      this.setState({
          current: childData.current,
           previous: childData.previous,
           reloadStep2 : childData.stateChanged
     });
  }

  callbackFunctionStep4 = (childData) => {
    console.log("Parent recieved Selector Data: "+JSON.stringify(childData));
    this.setState({
        current: childData.current,
         previous: childData.previous,
         plotBuildModel : childData,
   });
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
            reload:this.state.reloadStep2
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
      }

        let tensile_template = require('../../data/tensile_template.json');

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
          {current < this.steps.length - 1 }
          {current === this.steps.length - 1 && (
            <Button type="primary" >
              Submit
            </Button>
          )}
        </div>

            </div>
            </>
        )
    }
}

export default DRContainer;
import React, { Component, Fragment} from 'react';
import classes from './PlotBuilder.module.css';
import FileLoader from '../../components/FileLoader/FileLoader';
import PlotCurve from '../../components/PlotCurve/PlotCurve';
import OperationControls from '../../components/OperationControls/OperationControls'
import PhysicalMeasurementForm from '../../components/PhysicalMeasurementForm/PhysicalMeasurementForm'

import DC from '../../assets/dataClean.js';
import DCWASM from '../../assets/dataClean.wasm';

const dc = DC({
    locateFile: () => {
        return DCWASM;
    },
});

class PlotBuilder extends Component{
    constructor(props){
        super(props);
        this.state = {
            curves: [ ],
            operations: [
                {
                    label: 'Cleaning End auto',
                    type: 'op_cleaning_end_auto'
                },
                {
                    label: 'Cleaning End manual',
                    type: 'op_cleaning_end_manual',
                    hasParam: true,
                    value: '0.05'
                },
                {
                    label: 'Shifting',
                    type: 'op_shifting'
                },
                {
                    label: 'Averaging',
                    type: 'op_averaging'
                },
                {
                    label: 'Template',
                    type: 'op_template_plastic_tensile'
                }
            ],
            physicalMeasurementX: 'strain_true',
            physicalMeasurementY: 'stress_true',
        };
    }

    // Plot handler
    clickLegendHandler = (event) => {
        console.log("SIMPLE CLICK LEGEND");
        console.log(event);
       
        const curve_index = event.curveNumber;
        const updatedCurves = this.state.curves;

        const newSelected = !this.state.curves[curve_index].selected;
        let newOpacity = 1;
        if(this.state.curves[curve_index].opacity===1) {
            newOpacity = 0.2;
        }
        updatedCurves[curve_index].selected = newSelected;
        updatedCurves[curve_index].opacity = newOpacity;

        this.setState( { curves : updatedCurves});
        return false; // return false to disable the default behavior on plot_legendclick
    }

    doubleClickLegendHandler = (event) => {
        console.log("DOUBLE CLICK LEGEND");
        console.log(event);
       
        const curve_index = event.curveNumber;
        const updatedCurves = this.state.curves;

        updatedCurves.forEach(function(item,index,arr) {
            if(index===curve_index){
                arr[index].selected = true;
                arr[index].opacity  = 1;
            } else {
                arr[index].selected = false;
                arr[index].opacity  = 0.2;
            }
         });

         console.log(updatedCurves);

        this.setState( { curves : updatedCurves});
        return false; // return false to disable the default behavior on plot_legendclick
    }

    clickPointHandler = (data) => { // should be replace by a call to updateCurveHandler with the right ALGO/METHOD and id
        console.log("CLICK POINT HANDLER");
        console.log(data);
        const curve_idx = data.points[0].curveNumber;
        const x = data.points[0].x;
        const pt_index = data.points[0].pointIndex;
        console.log(curve_idx);
        const newCurves = this.state.curves;

        if(newCurves[curve_idx].selected){
            const x_new = [];
            const y_new = [];
            for(let i=0; i<= pt_index; i++){
                x_new.push(newCurves[curve_idx].x[i]);
                y_new.push(newCurves[curve_idx].y[i]);
            }
            // reset x and y
           newCurves[curve_idx].x.length = 0;
           newCurves[curve_idx].y.length = 0;
           // update x and y array
           newCurves[curve_idx].x = x_new;
           newCurves[curve_idx].y = y_new;
           console.log(newCurves[curve_idx]);
       }

        this.setState({curves: newCurves});
    }

    updatePlot = (event) => {
        console.log(event); 
    }
    
    //Operation Handler
    updatedCurveHandler = (type) => {
        console.log("----------transform curves-------------");
        const newCurves = this.state.curves;
        // use dataClean C++ lib    
        dc.then((core) => {
            // create a datase
            const dataset = new core.Dataset();
            // create Curves and add into dataset
            for(let curve_idx=0;curve_idx<newCurves.length;curve_idx++){
                // build Curve
                if(!newCurves[curve_idx].selected) { continue; }

                console.log("----------build curve:"+newCurves[curve_idx].name);
                const curve = new core.Curve(newCurves[curve_idx].name);
                var vecX = new core.VectorDouble();
                var vecY = new core.VectorDouble();
                for(let i=0; i<newCurves[curve_idx].x.length;i++){
                    if(newCurves[curve_idx].x[i]!==""){
                        vecX.push_back(newCurves[curve_idx].x[i]);
                        vecY.push_back(newCurves[curve_idx].y[i]);
                    }
                }
                console.log('nb points:' + vecX.size());
                // set name -> TODO should be define in the UI
                if(this.state.physicalMeasurementX==='strain_true'){
                    curve.setXName(core.PhysicalMeasurement.STRAIN_TRUE);
                }
                else if(this.state.physicalMeasurementX==='strain_engineering'){
                    curve.setXName(core.PhysicalMeasurement.STRAIN_ENGINEERING);
                }
                if(this.state.physicalMeasurementY==='stress_true'){
                    curve.setYName(core.PhysicalMeasurement.STRESS_TRUE);
                }
                else if(this.state.physicalMeasurementY==='stress_engineering'){
                    curve.setYName(core.PhysicalMeasurement.STRESS_ENGINEERING);
                }
               
                //curve.setXCoordinateType(core.CoordinateType.LINEAR);
                // set unit  -> TODO to read in the UI and defiend for each curve
                curve.setPoints(vecX,vecY);   
                dataset.addCurve(curve);
                // delete C++ object (not done automatically)
                curve.delete();
                vecX.delete();
                vecY.delete();
            }
           
            // create DataProcess
            const dataprocess = new core.DataProcess(dataset);
            
            let error_msg;
            let log;
            // promise
            const applyOperation = (dataprocess,type) => {
                return new Promise((success,failure) => {
                    console.log("OPERATION STARTED");
                    console.log(this.state.value);
                    let check = true;
                    //if(type==='op_cleaning_end_auto'){
                    if(type==='op_template_plastic_tensile'){
                        try{
                        // create operation
                        const operation = new core.Operation(core.ActionType.PLASTIC_TENSILE,core.MethodType.NO_EXTRAPOLATING);
                         operation.addParameterFloat("max", 0.01); // for shifting
                         operation.addParameterFloat("delta", 0.005);
                         operation.addParameterInt("regularization", -4); 
                        //operation.addParameterString("extrapolating_end_point","x_value"); // for extrapolating
                        //operation.addParameterFloat("extrapolating_end_point_value",0.05);
                        console.log(operation);
                         // apply operation
                         check = dataprocess.apply(operation);
                         operation.delete();
                        }
                        catch(err){
                            console.log(err);
                        }
                            
                    } else if(type==='op_cleaning_end_manual'){
                        // create operation
                        const operation = new core.Operation(core.ActionType.CLEANING_ENDS,core.MethodType.MAX_X);
                        const op_index = this.state.operations.findIndex( op => op.type === type);
                        const value = Number(this.state.operations[op_index].value);
                        operation.addParameterFloat("value", value); 
                        // apply operation
                         check = dataprocess.apply(operation);
                         operation.delete();
                    } else if(type==='op_shifting'){
                        // create operation
                        const operation = new core.Operation(core.ActionType.SHIFTING,core.MethodType.X_TANGENT_XRANGE);
                        operation.addParameterFloat("max", 0.01); 
                        // apply operation
                         check = dataprocess.apply(operation);
                         operation.delete();
                    }  else if(type==='op_averaging'){
                        // create operation
                        const operation = new core.Operation(core.ActionType.AVERAGING,core.MethodType.SPLINE);
                         operation.addParameterFloat("delta", 0.005);
                         operation.addParameterInt("regularization", -4); 
                        // apply operation
                         check = dataprocess.apply(operation);
                         operation.delete();
                    } 
                    else if(type==='op_cleaning_end_auto'){
                        // create operation
                        const operation = new core.Operation(core.ActionType.CLEANING_ENDS,core.MethodType.Y_MAX);
                        console.log(operation);
                         // apply operation
                         check = dataprocess.apply(operation);
                         operation.delete();
                    }
                    // else if(type==='op_template_plastic_tensile'){
                    //     // create operation
                    //     try{
                    //         const operation = new core.Operation(core.ActionType.CLEANING_ENDS,core.MethodType.Y_MAX);
                    //         // operation.addParameterFloat("max", 0.01); // for shifting
                    //         // operation.addParameterFloat("delta", 0.005);
                    //         // operation.addParameterInt("regularization", -4); 
                    //        // operation.addParameterString("extrapolating_end_point","x_value"); // for extrapolating
                    //        // operation.addParameterFloat("extrapolating_end_point_value",0.05);
                    //         // apply operation
                    //          check = dataprocess.apply(operation);
                    //          operation.delete();
                    //     }
                    //     catch(err){
                    //         console.log(err);
                    //     }
                    // } 
                    if(check) {
                        success(dataprocess);
                    } else {
                        failure(dataprocess);
                    }
                });
            }

            const todoAfterOperationApplied = (dataprocess) => {
                console.log("LOG OK:"+dataprocess.logfile());
                
                 // get results
                const dataset_out = dataprocess.getOutputDataset();
                // get curves
                for(let curve_idx=0;curve_idx<newCurves.length;curve_idx++){
                    const curve_out = dataset_out.getCurve(newCurves[curve_idx].name);
                    // get Xs, Ys
                    console.log("new points");
                    let vecX_out = curve_out.getX();
                    let vecY_out = curve_out.getY();
                    console.log("new size: "+vecX_out.size());
        
                    // update newCurves
                    const x_new = [];
                    const y_new = [];
                    for(let i=0; i< vecX_out.size(); i++){
                        x_new.push(vecX_out.get(i));
                        y_new.push(vecY_out.get(i));
                    }
                    console.log("----------new X,Y-------------");
                    console.log("new size:"+x_new.length);
                
                    // update selected curves
                    if(newCurves[curve_idx].selected){
                         // reset x and y
                        newCurves[curve_idx].x.length = 0;
                        newCurves[curve_idx].y.length = 0;
                        // update x and y array
                        newCurves[curve_idx].x = x_new;
                        newCurves[curve_idx].y = y_new;
                    }
                    // delete C++ object
                    curve_out.delete();
                    vecX_out.delete();
                    vecY_out.delete();
                        
                }
                if(dataset_out.hasCurve('averaging')){
                    const curve_out = dataset_out.getCurve('averaging');
                    let vecX_out = curve_out.getX();
                    let vecY_out = curve_out.getY();
                    const x_avg = [];
                    const y_avg = [];
                    for(let i=0; i< vecX_out.size(); i++){
                        x_avg.push(vecX_out.get(i));
                        y_avg.push(vecY_out.get(i));
                    }
                    const curve_average = { x: x_avg, y: y_avg, name: 'average', selected: true, opacity: 1};
                    newCurves.push(curve_average)
                    curve_out.delete();
                    vecX_out.delete();
                    vecY_out.delete();
                }

                // update the state with the new curves
                console.log("UPDATE STATE");                
                this.setState({curves: newCurves});
            }

            const todoOperationFailed = (datprocess) => {
                console.log("ERROR KO"+dataprocess.getErrorMessage());
                console.log("LOG OK:"+dataprocess.logfile());
            }

            const promise = applyOperation(dataprocess,type);
            promise.then(todoAfterOperationApplied,todoOperationFailed);
        }); 
    }

    changedParamHandler = (event, type) => {
        const operationIndex = this.state.operations.findIndex( op => op.type === type);
        const operation = {
            ...this.state.operations[operationIndex]
        }
        operation.value = event.target.value;
        const operations = [...this.state.operations];
        operations[operationIndex] = operation;
        this.setState({operations: operations});
    }


    //CSV handler
    handleOnFileLoad = (result) => {
        //console.log("----CSV handler ----");
        //console.log(result);
        const s = result[0].data.length;
        let st = [];
        // st = [ { x: [1,2,..], y: [1,2,3,..], name: 'curve1'} , { x: [1,2,..], y: [1,2,3,..], name: 'curve2'}]
        for(let i=0; i<s/2; i++){
            const xs = result.map( line => line.data[2*i]);
            const ys = result.map( line => line.data[2*i+1]);
            xs.forEach( function(item,index,arr) { arr[index] = parseFloat(item); });
            ys.forEach( function(item,index,arr) { arr[index] = parseFloat(item); });
            const curve = { x: xs, y: ys, name: 'curve'+i, selected: true, opacity: 1};
            st.push(curve)
        } 
        //console.log(st);
        this.setState( { curves: st })
    }

    // handler Curve specifications
    changePhysicalMeasurementXHandler = (event) => {
        this.setState({physicalMeasurementX: event.target.value});
    }
    changePhysicalMeasurementYHandler = (event) => {
        this.setState({physicalMeasurementY: event.target.value});
    }

    render() {
        
        return (
            <div>
                <h1> DataClean Application </h1>
                <div className={classes.FileLoader}>
                    <FileLoader 
                    handleOnFileLoad={this.handleOnFileLoad}/>
                </div>
                
                <div>
                    <PhysicalMeasurementForm
                    variable='x'
                    value={this.state.physicalMeasurementX}
                    handleChange={this.changePhysicalMeasurementXHandler} />
                    <PhysicalMeasurementForm
                    variable='y'
                    value={this.state.physicalMeasurementY}
                    handleChange={this.changePhysicalMeasurementYHandler} />
                </div>

                <div className={classes.PlotBuilder}>
                    <OperationControls
                    operations={this.state.operations}
                    value={this.state.value}
                    updatedCurve={this.updatedCurveHandler}
                    changedParam={this.changedParamHandler}
                    />
                    <PlotCurve
                        curves={this.state.curves}
                        //updatePlot = {this.updatePlot}
                        //doubleClickLegendHandler={this.doubleClickLegendHandler} // Do not work seems to know
                        clickLegendHandler={this.clickLegendHandler}
                        clickPointHandler = {this.clickPointHandler}
                    />
                </div>
            </div>
           

            

            // <Fragment className={classes.PlotBuilder}>
                
            //     <h1> DataClean Application </h1>
            //     <FileLoader 
            //         handleOnFileLoad={this.handleOnFileLoad}/>
            //      <PlotCurve
            //             curves={this.state.curves}
            //             //updatePlot = {this.updatePlot}
            //             //doubleClickLegendHandler={this.doubleClickLegendHandler} // Do not work seems to know
            //             clickLegendHandler={this.clickLegendHandler}
            //             clickPointHandler = {this.clickPointHandler}
            //         />
            //     <OperationControls
            //         value={this.state.value}
            //         updatedCurve={this.updatedCurveHandler}
            //     />
            // </Fragment>
        );
    }

}

export default PlotBuilder;
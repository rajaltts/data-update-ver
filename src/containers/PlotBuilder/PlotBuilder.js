import React, { Fragment, useEffect, useState, useReducer } from 'react';
import { Col, Row } from 'antd';
import 'antd/dist/antd.css';
import FileLoader from '../../components/FileLoader/FileLoader';
import PhysicalMeasurementForm from '../../components/PhysicalMeasurementForm/PhysicalMeasurementForm';
import OperationControls from '../../components/OperationControls/OperationControls';
import PlotCurve from '../../components/PlotCurve/PlotCurve';
import DataTree from '../../components/DataTree/DataTree';

import DC from '../../assets/dataClean.js';
import DCWASM from '../../assets/dataClean.wasm';

// dataReducer manages action on curves and associated data (tree,...)
const dataReducer = (currentData, action) => {
    switch( action.type ) {
        case 'SET':{
            // input: curves
            // output: replace current curves by the input curves and init tree
            const dt = [];
            const dt_entry = {title: 'group1', key: '0-0', children: []};
            action.curves.forEach( (item,i) => {
                const index = i+1;
                const dt_entry_curve ={ title: 'curve'+i, key: '0-'+index};
                dt_entry.children.push(dt_entry_curve);
            });
            dt.push(dt_entry);
            return {curves: action.curves, tree: dt, keys: currentData.keys};
        }
        case 'UPDATE_CURVES':{
            // input: curves
            // output: replace current curves by the input curves and update keys
            const keys = [];
            action.curves.forEach( (item,i) => {
                if(item.selected){
                    const index = i+1;
                    keys.push('0-'+index);
                } 
            });
            return {...currentData, curves: action.curves, keys: keys };
        }
        case 'CHECK_CURVES':{
            // input: keys is the array of selected curves
            // output: modify current curves selected and opacity properties
            currentData.curves.forEach( (item,i) => {
                item.selected = false;
                item.opacity = 0.2;
            });
            action.keys.forEach( (item,i) => {
                const index_curve = parseInt(item.charAt(item.length-1))-1; // TODO do not work more than 10 curves
                if(index_curve>=0){ // not for 0-0 the group checkbox
                    currentData.curves[index_curve].selected = true;
                    currentData.curves[index_curve].opacity = 1; 
                }
            });

            return {...currentData, keys: action.keys };
        }
        default:
            throw new Error('Not be reach this case');
    }
}

const dc = DC({
    locateFile: () => {
        return DCWASM;
    },
});

const PlotBuilder = () => {
    const [physicalMeasurementX, setPhysicalMeasurementX] = useState('strain_true');
    const [physicalMeasurementY, setPhysicalMeasurementY] = useState('stress_true');
    const [data, dispatch]  =  useReducer(dataReducer,{curves: [],
                                                       tree: [{title: 'no data', key: '0-0', disabled: true}],
                                                       keys: ['0-0']
                                                    }
                                            );

    const [operations, setOperations] =  useState([
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
    ]);

    useEffect( () => {
        console.log("UseEffect");
    });

    //CSV handler
    const handleOnFileLoad = (result) => {
        console.log("----CSV handler ----");
        const s = result[0].data.length;
        let st = [];
        // st = [ { x: [1,2,..], y: [1,2,3,..], name: 'curve1'} , { x: [1,2,..], y: [1,2,3,..], name: 'curve2'}]
        for(let i=0; i<s/2; i++){
            const xs = result.map( line => line.data[2*i]);
            const ys = result.map( line => line.data[2*i+1]);
            xs.forEach( function(item,index,arr) { arr[index] = parseFloat(item); });
            ys.forEach( function(item,index,arr) { arr[index] = parseFloat(item); });
            const curve = { x: xs, y: ys, name: 'curve'+i, selected: true, opacity: 1};
            st.push(curve);
        } 
        dispatch({type: 'SET', curves: st});
    }

    // handler Curve specifications
    const changePhysicalMeasurementXHandler = (event) => {
        setPhysicalMeasurementX(event.target.value);
    };
    const changePhysicalMeasurementYHandler = (event) => {
        setPhysicalMeasurementY(event.target.value);
    };

    //Operation Handler
    const updatedCurveHandler = (type) => {
        
        console.log("----------transform curves-------------");
        const newCurves = []; // do not use newCurves = curves because it will a reference because curves must be unchanged to activate the update, newCurves = [...curves] or curves.slice() are not a deep copy but a shallow copy -> does not work
        // perform a hard copy by hand
        for(let ic=0; ic<data.curves.length; ic++){
            const curve = { x: data.curves[ic].x, y: data.curves[ic].y, name: 'curve'+ic, selected: data.curves[ic].selected, opacity: data.curves[ic].opacity};
            newCurves.push(curve);
        }
        
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
                if(physicalMeasurementX==='strain_true'){
                    curve.setXName(core.PhysicalMeasurement.STRAIN_TRUE);
                }
                else if(physicalMeasurementX==='strain_engineering'){
                    curve.setXName(core.PhysicalMeasurement.STRAIN_ENGINEERING);
                }
                if(physicalMeasurementY==='stress_true'){
                    curve.setYName(core.PhysicalMeasurement.STRESS_TRUE);
                }
                else if(physicalMeasurementY==='stress_engineering'){
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
                        const op_index = operations.findIndex( op => op.type === type);
                        const value = Number(operations[op_index].value);
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
                dispatch({type: 'UPDATE_CURVES', curves: newCurves});                
            }

            const todoOperationFailed = (datprocess) => {
                console.log("ERROR KO"+dataprocess.getErrorMessage());
                console.log("LOG OK:"+dataprocess.logfile());
            }

            const promise = applyOperation(dataprocess,type);
            promise.then(todoAfterOperationApplied,todoOperationFailed).then( () => {
                    console.log("Second then");
                });
        }); 
    
    }
    
    const changedParamHandler = (event, type) => {
        const operationIndex = operations.findIndex( op => op.type === type);
        const operation = {
            ...operations[operationIndex]
        }
        operation.value = event.target.value;
        const operations = [...operations];
        operations[operationIndex] = operation;
        setOperations(operations);
    }

    // Plot handler
    const clickLegendHandler = (event) => {
        const curve_index = event.curveNumber;
        const updatedCurves = data.curves;

        const newSelected = !data.curves[curve_index].selected;
        let newOpacity = 1;
        if(data.curves[curve_index].opacity===1) {
            newOpacity = 0.2;
        }
        updatedCurves[curve_index].selected = newSelected;
        updatedCurves[curve_index].opacity = newOpacity;

        //setCurves(updatedCurves);
        dispatch({type: 'UPDATE_CURVES', curves: updatedCurves});    
        return false; // return false to disable the default behavior on plot_legendclick
    }

    const clickPointHandler = (data) => { // should be replace by a call to updateCurveHandler with the right ALGO/METHOD and id
        console.log("CLICK POINT HANDLER");
        console.log(data);

        const curve_idx = data.points[0].curveNumber;
        const x = data.points[0].x;
        const pt_index = data.points[0].pointIndex;
        console.log(curve_idx);
        const newCurves = [];

        for(let ic=0; ic<data.curves.length; ic++){
            if(ic===curve_idx){
                const x_new = [];
                const y_new = [];
                for(let i=0; i<= pt_index; i++){
                    x_new.push(data.curves[curve_idx].x[i]);
                    y_new.push(data.curves[curve_idx].y[i]);
                }
                const curve = { x: x_new, y: y_new, name: 'curve'+ic, selected: true, opacity: 1};
                newCurves.push(curve);
            } else {
                const curve = { x: data.curves[ic].x, y: data.curves[ic].y, name: 'curve'+ic, selected: data.curves[ic].selected, opacity: data.curves[ic].opacity};
                newCurves.push(curve);

            }
        }
       dispatch({type: 'UPDATE_CURVES', curves: newCurves});  
    }

    // DataTree handler
    const checkDataTreeHandler =  (checkedKeys) => {
        console.log('onCheck', checkedKeys);
        const keys = [];
        if(checkedKeys.length>0){
            const group_index = checkedKeys[checkedKeys.length-1].charAt(0);
            checkedKeys.forEach( (item, index) =>
            {
                if(item.charAt(0)===group_index){
                    keys.push(item);
                }  
            });
        }
        dispatch({ type: 'CHECK_CURVES', keys: keys});
      };

    return (
        <>
            <Row>
                <Col span={6}>
                    <FileLoader 
                        handleOnFileLoad={handleOnFileLoad}/>
                </Col>
                <Col span={6}>
                    <PhysicalMeasurementForm
                        variable='x'
                        value={physicalMeasurementX}
                        handleChange={changePhysicalMeasurementXHandler}
                    />
                    <PhysicalMeasurementForm
                        variable='y'
                        value={physicalMeasurementY}
                        handleChange={changePhysicalMeasurementYHandler}
                    />
                </Col>
                <Col span={12}>
                    <DataTree
                        treeData={data.tree}
                        checkedKeys={data.keys}
                        onCheck={checkDataTreeHandler} />
                </Col>
            </Row>
            <Row>
                <Col span={8}>
                    <OperationControls
                        operations={operations}
                        updatedCurve={updatedCurveHandler}
                        changedParam={changedParamHandler}
                    />
                </Col>
                <Col span={12}>
                    <PlotCurve
                        curves={data.curves}
                        //updatePlot = {updatePlot}
                        clickLegendHandler={clickLegendHandler}
                        clickPointHandler = {clickPointHandler}
                    />
                </Col>
            </Row>
        </>
    );
}

export default PlotBuilder;
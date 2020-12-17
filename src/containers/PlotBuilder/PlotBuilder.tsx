import React, { Fragment, useEffect, useState, useReducer } from 'react';
import { Col, Row , Descriptions, Button } from 'antd';
import 'antd/dist/antd.css';
import PlotCurve from '../../components/PlotCurve/PlotCurve';
import OperationControls from '../../components/OperationControls/OperationControls'
import CurveControls from '../../components/CurveControls/CurveControls'

import { Data, Group, Curve, Tree, GroupData, CurveData } from '../../data.model';
import { Operation } from '../../template.model';

//import Module from '../../assets/dataclean/dataclean';
import ReactWasm from '../../assets/dataclean/dataclean.js'
interface EmscriptenModule {
    [key: string]: any
}

// use discriminated union type
type Action = 
    | {type: 'CHECK_CURVES', keys: string[], groupid: number}
    | {type: 'SET', input: any}
    | {type: 'UPDATE_CURVES', curves: Curve[] };

const dataReducer = (currentData: Data, action: Action) => {
   switch (action.type) {
        case 'SET':{
            const data: Data = {type: action.input.type,
                                xtype: action.input.xtype,
                                ytype: action.input.xtype,
                                xunit: action.input.xtype,
                                yunit: action.input.ytype,
                                groups: [],
                                tree: { groupData: [],
                                        keys: [],
                                        selectedGroup: 0}
                                };
           
            action.input.groups.forEach( (g,index_g) => {
                const group_c: Group = { id: index_g, curves: []};
                const group_d: GroupData = { title: g.label, treeData: []};

                g.curves.forEach( (c, index_c) => {
                    const curve_d: Curve = { id: index_c,
                                             x: c.x, y: c.y,
                                             name: c.label,
                                             selected: true, opacity: 1};
                    
                    group_c.curves.push(curve_d);

                    const curve_data: CurveData = { title: c.label,key: ''};
                    curve_data.key = index_g.toString()+'-'+index_c.toString();
                    group_d.treeData.push(curve_data);
                    if(index_g===0)
                        data.tree.keys.push(curve_data.key);
                });
                data.groups.push(group_c);
                data.tree.groupData.push(group_d);
            });
            return data;
        }
        case 'CHECK_CURVES':{
            const newData = {...currentData};
            // input: keys is the array of selected curves
            // output: modify current curves selected and opacity properties
            newData.groups[action.groupid].curves.forEach( (item,i) => {
                item.selected = false;
                item.opacity = 0.2;
            });
            action.keys.forEach( (item,i) => {
               const index_curve = parseInt(item.charAt(item.length-1)); // TODO do not work more than 10 curves
               newData.groups[action.groupid].curves[index_curve].selected = true;
               newData.groups[action.groupid].curves[index_curve].opacity = 1; 
            });
            newData.tree.keys = action.keys;
            newData.tree.selectedGroup = action.groupid;
            return newData;
        }
        case 'UPDATE_CURVES':{
            // input: curves
            // output: replace current curves by the input curves
            console.log(currentData);
            const group_new = [...currentData.groups];
            group_new[currentData.tree.selectedGroup].curves = action.curves;
            console.log(group_new);
            return {...currentData, groups: group_new};
        }
        default:
            throw new Error('Not be reach this case'); 
   }
};

interface PlotBuilderProps {};

const PlotBuilder: React.FC<PlotBuilderProps> = (props) => {
    const [data, dispatch]  =  useReducer(dataReducer,
        {
            type: 'tensile', xtype: '', ytype: '', xunit: '', yunit: '',
            groups: [{id: -1,
                      curves: [ {id: -1, x: [], y: [], name: 'toto', selected: false, opacity: 0} ]
                     }
                    ],
            tree: { groupData: [ {title:'group1',
                                  treeData: [{title: 'curve1', key: '0-0'}]
                                  }
                                ],
                    keys: [],
                    selectedGroup: 0}
        }
        );
    
    const [operations, setOperations] = useState( [
            {
                action: 'Cleaning_ends',
                methods: [
                    { 
                        label: 'none',
                        type: 'None',
                        params: []
                    },
                    {
                        label: 'Y_Max',
                        type: 'Y_Max',
                        params: []
                    },
                    {
                        label: 'Max_X',
                        type: 'Max_X',
                        params: [{name: 'x',  value: '0.05'}]
                    }
                   
                ],
                selected_method: 'None'
            },
            {
                action: 'Shifting',
                methods: [
                    { 
                        label: 'none',
                        type: 'None',
                        params: []
                    },
                    {
                        label: 'X_shift_defined',
                        type: 'X_shift_defined',
                        params: [{name: 'x',  value: '0.05'}]
                    },
                    {
                        label: 'X_tangent_xrange',
                        type: 'X_tangent_xrange',
                        params: []
                    }
                ],
                selected_method: 'None'
            },
            {
                action: 'Averaging',
                methods: [
                    { 
                        label: 'none',
                        type: 'None',
                        params: []
                    },
                    {
                        label: 'spline',
                        type: 'Spline',
                        params: [{name: 'number of points', value: '30'}, {name: 'delta', value: '0.005'}, { name: 'regularization', value: '-4'} ]
                    },
                    {
                        label: 'polynomial',
                        type: 'Polynomial',
                        params: [{name: 'number of points', value: '30'},{name: 'order', value: '6'}]
                    }
                ],
                selected_method: 'None'
            }
        ]);

    // a template is an array of operations
    const [template, setTemplate] = useState<Operation[]>([{action: '', method: ''}]);

    const [init,setInit] = useState<Boolean>(false);

    // fct called by  init button to init data and template 
    //function initHandler() {
    const initHandler = () => { 
        let data_file = require('../../data/data.json');
        dispatch({type: 'SET', input: data_file});
       

       let tensile_template: Operation[] = require('../../data/tensile_template.json');
       setTemplate(tensile_template);

       // update operations with the template
       // NB: I do not use template but tensile_template because useState is asynchroneous, not sure that template is defined
       // Need to use useEffect to track
       // TO BE CHANGED
        tensile_template.forEach( (elem,index) => {
            const op_index = operations.findIndex( op => op.action === elem.action );
            if(op_index===-1)
                throw new Error("ERROR in tensile template: action not found");
            const op = operations[op_index];
            const meth_index = op.methods.findIndex( met => met.type === elem.method);
            if(meth_index===-1)
                throw new Error("ERROR in tensile template: action not found");
            const operationsUpdated = [...operations];
            const paramsUpdated= elem.params;
            operationsUpdated[op_index].methods[meth_index].params.length = 0;
            for(let i=0; i< paramsUpdated!.length; i++){
                const new_param = { name: paramsUpdated![i].name, value:  paramsUpdated![i].value.toString()  };
                operationsUpdated[op_index].methods[meth_index].params.push(new_param);
            }
            operationsUpdated[op_index].selected_method = elem.method;
            setOperations(operationsUpdated);         
        }
        );

    };

    
    const updateTemplateHandler = () => {

    };

    const changeSelectedMethodHandler = (selectedMethod: string,action: string) => {
        console.log(selectedMethod+"--"+action);
        const operationsUpdate = [...operations]; //copy
        const op_index = operationsUpdate.findIndex(op => op.action === action );
        if( op_index === -1)
            throw new Error('Action '+action+' not known');
        operationsUpdate[op_index].selected_method = selectedMethod;
        setOperations(operationsUpdate);
    };

    // DataTree handler
    const checkDataTreeHandler =  (checkedKeys: string[], group_id: number) => {
        console.log('onCheck', checkedKeys);
        const keys = [];
        let group_index = '-1';
        if(checkedKeys.length>0){
            //const group_index = checkedKeys[checkedKeys.length-1].charAt(0);
            group_index = checkedKeys.slice(-1)[0].charAt(0);  // index group of last check
            checkedKeys.forEach( (item, index) =>
            {
                if(item.charAt(0)===group_index){
                    keys.push(item);
                }  
            });
        }
        dispatch({ type: 'CHECK_CURVES', keys: keys, groupid: group_id});
    };

    //Operation Handler
    const updatedCurveHandler = (event,type) => {
        console.log("----------transform curves-------------");
        const newCurves = []; // do not use newCurves = curves because it will a reference because curves must be unchanged to activate the update, newCurves = [...curves] or curves.slice() are not a deep copy but a shallow copy -> does not work
        // perform a hard copy by hand
        const curves = data.groups[data.tree.selectedGroup].curves;
        for(let ic=0; ic<data.groups[data.tree.selectedGroup].curves.length; ic++){
            const curve = { x: curves[ic].x, y: curves[ic].y, name: 'curve'+ic, selected: curves[ic].selected, opacity: curves[ic].opacity};
            newCurves.push(curve);
        }
        
        // test
        const Module: EmscriptenModule  = {};
        ReactWasm(Module).then( () => {
           

        // use dataClean C++ lib   
        
        //Module(Module).then(() => {
            // create a datase
            const dataset = new Module.Dataset();
            // create Curves and add into dataset
            for(let curve_idx=0;curve_idx<newCurves.length;curve_idx++){
                // build Curve
                if(!newCurves[curve_idx].selected) { continue; }

                console.log("----------build curve:"+newCurves[curve_idx].name);
                const curve = new Module.Curve(newCurves[curve_idx].name);
                var vecX = new Module.VectorDouble();
                var vecY = new Module.VectorDouble();
                for(let i=0; i<newCurves[curve_idx].x.length;i++){
                    if(newCurves[curve_idx].x[i]!==""){
                        vecX.push_back(newCurves[curve_idx].x[i]);
                        vecY.push_back(newCurves[curve_idx].y[i]);
                    }
                }
                console.log('nb points:' + vecX.size());
                 // set name -> TODO should be define in the UI
                 if(data.xtype==='strain_true'){
                    curve.setXName(Module.PhysicalMeasurement.STRAIN_TRUE);
                }
                else if(data.xtype==='strain_engineering'){
                    curve.setXName(Module.PhysicalMeasurement.STRAIN_ENGINEERING);
                }
                if(data.ytype==='stress_true'){
                    curve.setYName(Module.PhysicalMeasurement.STRESS_TRUE);
                }
                else if(data.ytype==='stress_engineering'){
                    curve.setYName(Module.PhysicalMeasurement.STRESS_ENGINEERING);
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
            const dataprocess = new Module.DataProcess(dataset);
            
            let error_msg;
            let log;
            // promise
            const applyOperation = (dataprocess,type) => {
                return new Promise((success,failure) => {
                    console.log("OPERATION STARTED");
                    let check = true;
                    if(type==='Y_Max'){
                        // create operation
                        const operation = new Module.Operation(Module.ActionType.CLEANING_ENDS,Module.MethodType.Y_MAX);
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
        
    };

    return (
        <>
            <Row>
                <Button size="small" type="primary" onClick={() => initHandler()}>Init</Button>
            </Row>
            <Row justify="space-around">
                <Col span={6}>
                    <OperationControls
                         operations={operations}
                         updateTemplate={updateTemplateHandler}
                         changeSelectedMethod={changeSelectedMethodHandler}
                         updatedCurve={updatedCurveHandler}/>
                </Col>
                <Col span={12}>
                    <PlotCurve
                       curves={data.groups[data.tree.selectedGroup].curves} />
                </Col>
                <Col span={6}>
                    <CurveControls 
                        groupData={data.tree.groupData}
                        checkedKeys={data.tree.keys}
                        onCheck={checkDataTreeHandler} />
                        
                </Col>
            </Row>
        </>
    );
        
}

export default PlotBuilder;
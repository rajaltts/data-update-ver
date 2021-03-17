import React, { Fragment, useEffect, useState, useReducer } from 'react';
import { Col, Row , Alert, Button } from 'antd';
import {LineOutlined, SafetyCertificateTwoTone} from '@ant-design/icons'
import 'antd/dist/antd.css';
import PlotCurve from '../../components/PlotCurve/PlotCurve';
import OperationControls from '../../components/OperationControls/OperationControls'
import CurveControls from '../../components/CurveControls/CurveControls'
import Steps from '../../components/Steps/Steps';
import { Data, Group, Curve, Tree, GroupData, CurveData } from '../../data.model';
import { Operation } from '../../template.model';

import ReactWasm from '../../assets/dataclean/dataclean.js'
import {colors} from '../../assets/colors';
import { tensile_operations_config } from '../../assets/tensile_operations_config.js';



//---------INTERFACE-----------------------------
interface EmscriptenModule {
    [key: string]: any    
};

interface PlotBuilderProps {
    data_input: any;
    template_input: any;
    parentCallback: any;
};

//--------REDUCER-----------------------------------

// use discriminated union type
type Action = 
    | {type: 'CHECK_CURVES', keys: string[], groupid: number}
    | {type: 'SET', input: any}
    | {type: 'UPDATE_CURVES', curves: Curve[], data: any[], result: boolean }
    | {type: 'RESET_CURVES', input: any}
    | {type: 'RESET_CURVES_INIT', groupid: number}
    ;

const dataReducer = (currentData: Data, action: Action) => {
   switch (action.type) {
        case 'SET':{
            if(action.input === undefined)
                return currentData;
            const data: Data = {type: action.input.type,
                                xtype: action.input.xtype,
                                ytype: action.input.ytype,
                                xunit: action.input.xunit,
                                yunit: action.input.yunit,
                                groups: [],
                                tree: { groupData: [],
                                        selectedGroup: 0}
                                };
           
            action.input.groups.forEach( (g,index_g) => {
                const group_c: Group = { id: index_g, curves: [], data: [], label:g.label, result: false};
                const group_d: GroupData = { title: g.label, treeData: [], keys: [] };

                g.curves.forEach( (c, index_c) => {
                    const curve_d: Curve = { id: index_c,
                                             x: [...c.x], y: [...c.y],
                                             name: (c.matDataLabel?c.matDataLabel:c.label),
                                             label: (c.matDataLabel?c.matDataLabel:c.label),
                                             matDataLabel: c.matDataLabel,
                                             oid: c.oid,
                                             selected: true, opacity: 1,
                                             x0: [...c.x], y0: [...c.y]};
                    
                    group_c.curves.push(curve_d);
                    group_c.data.push({label:'',value: 0});

                    const curve_data: CurveData = { title: curve_d.label,key: '',icon: <LineOutlined style={{fontSize: '24px', color: colors[index_c]}}/>};
                    curve_data.key = index_g.toString()+'-'+index_c.toString();

                    group_d.treeData.push(curve_data);
                    group_d.keys.push(curve_data.key);
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
                if(item.name&&item.name.indexOf('average')===-1){
                    item.selected = false;
                    item.opacity = 0.2;
                }
            });
            action.keys.forEach( (item,i) => {
               const index_curve = parseInt(item.split('-')[1]);
               newData.groups[action.groupid].curves[index_curve].selected = true;
               newData.groups[action.groupid].curves[index_curve].opacity = 1; 
            });
            newData.tree.groupData[action.groupid].keys = action.keys;
            newData.tree.selectedGroup = action.groupid;
            return newData;
        }
        case 'UPDATE_CURVES':{
            // input: curves
            // output: replace current curves by the input curves
            console.log('UPDATE_CURVES');
            console.log(currentData);
            const group_new = [...currentData.groups];
            group_new[currentData.tree.selectedGroup].curves = action.curves;
            group_new[currentData.tree.selectedGroup].data = action.data;
            group_new[currentData.tree.selectedGroup].result = action.result;
            console.log(group_new);
            return {...currentData, groups: group_new};
        }
        case 'RESET_CURVES': {
             const group_new = [...currentData.groups];
             group_new[action.input.groupId].curves = action.input.curves;
             return {...currentData, groups: group_new}
        }
        case 'RESET_CURVES_INIT':{
            console.log('RESET_CURVES_INIT');
            const group_new = [...currentData.groups];
            group_new[action.groupid].curves.map( (val,index,arr) => {
                if(val.name !== 'average') { 
                    arr[index].x = [...arr[index].x0];  arr[index].y = [...arr[index].y0];
                }});
            // remove additional curve (average curve)
            const index_avg =  group_new[action.groupid].curves.findIndex( e => e.name ==='average');
            if(index_avg !== -1)
                group_new[action.groupid].curves.splice(index_avg,1); 
            // remove all data (young, ...)
            group_new[action.groupid].data.length = 0;
            console.log(group_new);
            return {...currentData, groups: group_new}
        }
        default:
            throw new Error('Not be reach this case'); 
   }
};

//--------COMPONENT-----------------------------------------
const PlotBuilder: React.FC<PlotBuilderProps> = (props) => {

    //-----------STATE----------------------------------------
    // datat represents the state related to curves management 
    const [data, dispatch]  =  useReducer(dataReducer,
        {
            type: 'tensile', xtype: '', ytype: '', xunit: '', yunit: '',
            groups: [{id: -1,
                      curves: [ {id: -1, x: [], y: [], name: 'toto', selected: false, opacity: 0, x0: [], y0: [], oid:'', matDataLabel:'', label:''} ],
                      data: [ {label: '', value: 0} ],
                      label:'',
                      result: false
                     }
                    ],
            tree: { groupData: [ {title:'group1',
                                  treeData: [{title: 'curve1', key: '0-0', icon: <LineOutlined/>}],
                                  keys: []
                                  }
                                ],
                    selectedGroup: 0}
        }
        );
   
    // operations represent the state related to actions/methods/parameters
    // Each action has:
    // status: 'waiting' (initial value), 'failed', 'success' depending on the success of the action  
    const [operations, setOperations] = useState<Operation[]>([{ action: 'None', 
                                                                action_label: 'None',
                                                                 methods: [{label: 'None', type: 'None', params: []}],
                                                                 selected_method: 'None',
                                                                status: 'waiting',
                                                                error: ''}]);

      // template is an input json file for dataclean library 
    const [template, setTemplate] = useState({"operations": []});

    // need to manage the state to manage group changes
    // should be better to use useContext hook to share these state with Steps component
    const [current, setCurrent] = useState(0);
    const [auto, setAuto] = useState(true);
    const [precision,setPrecision] = useState(3);


    //---------EFFECT-----------------------------------------
    // initialize the states (componentDidMount)
    useEffect( () => {
        dispatch({type: 'SET', input: props.data_input}); // init data(curves) state with props
        // TODO init Operations with the right congig (tensile, compression, ...) depending on analysis_type given by props.analysisType 
        setOperations(tensile_operations_config); // init operations state with the tensile structure (default values)
        setTemplate(props.template_input); // init template from props
        if(props.data_input.precision)
            setPrecision(props.data_input.precision);   
    },[props.data_input]);

    // use to update operations state from template state
    // update operations state from template state (componentDidUpdate)
    useEffect( () => {
        try { // if action/methods found in template does not correspond to value in operations state, the template is not used and default values for operations will appear. A console log error is used but we must inform the user with a notifications (TODO)
            initOperationsFromTemplate();
        } catch(e) {
            console.log("ERROR: Input template not valid."+e.message+" Operations are set to default value");
        }
    },[template]);
    //------------FUNCTIONS-------------------------------------
    // initialize the Operations state with a dataclean input json file
    // Several diffences between structure of Operations and template file
    // - in Operations value is always a number, for string value the value is a index in a selection array
    // - no Extrapolation action in Operations, it is inside Averaging
    const initOperationsFromTemplate = () => {
        if(template.operations.length>1){
            // manage Averaging to put extrapolation parameters
            const op_avg = template.operations.find( op => op.action === "Averaging");
            const op_extr = template.operations.find( op => op.action === "Extrapoling");
            if(op_extr){
                op_avg.parameters.push( {extrapolation: op_extr.method.toLowerCase()} );
                op_extr.parameters.forEach( par => op_avg.parameters.push(par) );
            }

            template.operations.forEach( (elem,index) => {
                // check if Action and Operations in template file are found in local operations
                const op_index = operations.findIndex( op => op.action === elem.action );
                let params_extrapolating: object[] = [];
                if(op_index!==-1){
                    const op = operations[op_index];
                    const meth_index = op.methods.findIndex( met => met.type === elem.method);
                    if(meth_index!==-1){
                        // update local operations with template file    
                        const operationsUpdated = [...operations];
                        if('parameters' in elem) { // some operation has no parameters
                            const params_input= elem.parameters;
                            
                            const param_cur = operationsUpdated[op_index].methods[meth_index].params;
                            const param_new = [];
                            for(let i=0; i<param_cur.length;i++ ){
                                const name_c = param_cur[i].name;
                                const param_temp = params_input.find( p => Object.keys(p)[0]===name_c);
                                if(param_temp !== undefined ){ // param found in the input template
                                    let param_value = Object.values(param_temp)[0];
                                    if(param_cur[i].selection){
                                        param_value = param_cur[i].selection.findIndex( e => e.name===param_value)
                                    }
                                    const new_param ={...param_cur[i], value: param_value};
                                    param_new.push(new_param);
                                } else { // keep the default
                                    const default_param={...param_cur[i]};
                                    param_new.push(default_param);
                                }
                            }
                            operationsUpdated[op_index].methods[meth_index].params.length = 0;
                            operationsUpdated[op_index].methods[meth_index].params = param_new;
                        }
                        operationsUpdated[op_index].selected_method = elem.method;
                        // check if we must convert the data, only if engineering type
                        // if(elem.action === "Convert"){
                        //     if(data.xtype.search("engineering") * data.ytype.search("engineering") < 0)
                        //         throw new Error("ERROR in data definition: cannot mix true and engineering data type");
                        //     if(data.xtype.search("engineering") < 0){ // not found 
                        //         operationsUpdated[op_index].status = 'hide';
                        //     }
                        // }
                        
                        setOperations(operationsUpdated);         
                    } else if(elem.action!=='Extrapoling')
                        throw new Error("ERROR in tensile template: method not recognized.");
                } else if (elem.action!=='Extrapoling'){
                    throw new Error("ERROR in tensile template: action not recognized.");
                }
            });
        }
    }

    //---------HANDLER-------------------------------------------
    const changeOperationsHandler = (new_ops: Operation[]) => { 
        setOperations(new_ops);
     }
     // fct called by  resetAll button 
    const initHandler = () => { 
        dispatch({type: 'SET', input: props.data_input}); // init curves
        setTemplate(props.template_input); // init operations
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
        // check result status of the group
        const result_status = data.groups[group_id].result;
        if(!result_status){ // if no result reset data and set to first step with auto mode
            restoreInitdataHandler();
            setCurrent(0);
            setAuto(true);
        }
    };

    const handlePrevious = () =>{
        let json = {
            current: 1,
            previous: true,
            stateChanged: false,
            data: data
        }
        sendData(json);
    }

    const handleNext= () =>{
        console.log('handleNext'+data.groups[0].curves[0].x);

        let json = {
            current: 3,
            previous: false,
            data: data
        }
        sendData(json);
    }

    const sendData = (result) => {
        props.parentCallback(result);
    }

    const changeParameterHandler = (name: string, value: number, action: string) => {
        const operationsUpdate = [...operations];
        const a = operationsUpdate.find( (el) => el.action === action);
        const sm = a.selected_method;
        const m = a.methods.find( e => e.type === sm);
        const p = m.params.find( e => e.name === name);
        p.value = value;
        setOperations(operationsUpdate);
    }
    //Operation Handler
    const updatedCurveHandler = (action) => {
        // always reset curve between update
        restoreInitdataHandler();
        const group_id = data.tree.selectedGroup;
        
        let op_target = 0;
        if(action==='Template'){ // last operation
            op_target = operations.length-1;
        } else {
            op_target = operations.findIndex( (el) => el.action === action);
        }
        
         // use dataClean C++ lib 
        const Module: EmscriptenModule  = {};
        ReactWasm(Module).then( () => {    
            console.log("----------transform curves-------------");
            const newCurves = []; // do not use newCurves = curves because it will a reference because curves must be unchanged to activate the update, newCurves = [...curves] or curves.slice() are not a deep copy but a shallow copy -> does not work
            // perform a hard copy by hand -> use rfdc
            const curves = data.groups[group_id].curves;
            for(let ic=0; ic<data.groups[group_id].curves.length; ic++){
                if(curves[ic].name!=='average'){
                    const curve = { x: curves[ic].x,
                                    y: curves[ic].y,
                                    name: 'curve'+ic,
                                    label: curves[ic].label,
                                    selected: curves[ic].selected,
                                    opacity: curves[ic].opacity,
                                    x0: curves[ic].x0,
                                    y0: curves[ic].y0};
                    newCurves.push(curve);
                }
            }
            // create a datase
            const dataset = new Module.Dataset();
            // create Curves and add into dataset
            for(let curve_idx=0;curve_idx<newCurves.length;curve_idx++){
                // build Curve
                if(!newCurves[curve_idx].selected) { continue; }

                //console.log("----------build curve:"+newCurves[curve_idx].name);
                const curve = new Module.Curve(newCurves[curve_idx].name);
                var vecX = new Module.VectorDouble();
                var vecY = new Module.VectorDouble();
                for(let i=0; i<newCurves[curve_idx].x.length;i++){
                    if(newCurves[curve_idx].x[i]!==""){
                        vecX.push_back(newCurves[curve_idx].x[i]);
                        vecY.push_back(newCurves[curve_idx].y[i]);
                    }
                }
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
            const applyOperation = (dataprocess) => {
                return new Promise((success,failure) => {
                    console.log("OPERATION STARTED");
                    let check = true;
                    
                    // create a template file from operations and run 
                    let ops: object[] = [];
                    for(let op_index=0; op_index <= op_target; op_index++){
                        const op = operations[op_index];
                        const action = op.action;
                        const method = op.methods.find( e => e.type === op.selected_method);
                        const params = method.params;
                        let par: object[] = [];
                        method.params.forEach( param => {
                            // do not add parameter for extrapolation, manage after
                            const extra_index = param.label.toLowerCase().indexOf('extrapolation')
                            if( extra_index === -1){
                                if(typeof param.value !== 'undefined'&& param.value!==null){ 
                                    const name = param.name;
                                    if(param.selection){
                                        par.push( {[name] : param.selection[param.value].name});
                                    } else { 
                                        let val = param.value;
                                        if(param.float){ // if the float is an integer number we need to add decimal separator in order to well interpreted by dataclean.lib
                                            val = (val===0?1e-15:val*(1+1e-15));
                                        } 
                                        par.push( {[name] : val})
                                    }
                                }
                            }
                        });
                        ops.push({action: action, method: op.selected_method, parameters: par});

                        // manage Extrapolation action in Averaging
                        if(action === 'Averaging'){
                            const avg_method = op.methods.find( e => e.type === op.selected_method);
                            const extrapolation_parm = avg_method.params.find( e => e.name === 'extrapolation');
                            const extrapolation_method = extrapolation_parm.selection[extrapolation_parm.value].name;
                            if(extrapolation_method !== 'none'){ // !none
                                const params: object[] = [];
                                avg_method.params.forEach( param => {
                                    const extra_index = param.label.toLowerCase().indexOf('extrapolation')
                                    if(extra_index !== -1 && param.name !== 'extrapolation'){
                                        if(typeof param.value !== 'undefined'){
                                            const name = param.name;
                                            if(param.selection) {
                                                params.push( {[name] : param.selection[param.value].name});
                                            } else {
                                                (param.float?    params.push( {[name] : (param.value+1e-8/param.value)}):params.push( {[name] : param.value}));
                                            }
                                        }
                                    }
                                });
                                ops.push({action: 'Extrapoling' , method: extrapolation_method, parameters: params})
                            }
                        }
                        
                    }
                    const template = {operations: ops};
                    let s = JSON.stringify(template);
                    console.log('Template '+s);
                    try{
                        const op = new Module.Operation(s);
                        // apply operation
                        check = dataprocess.apply(op);
                        op.delete();

                    } catch {
                        console.log("Error with template");
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
                // get data anaytics
                let data_analytics: any[] = [{label:'', value:0}];
                // result flag (true is we have an averagin curve)
                let result_flag = false;
                // get curves
               // if(!dataset_out.hasCurve('averaging')){ // do not replace the curve when an averaging curve is generated, we would like to see the ref curves
                    for(let curve_idx=0;curve_idx<newCurves.length;curve_idx++){
                        const curve_out = dataset_out.getCurve(newCurves[curve_idx].name);
                        // get Xs, Ys
                        //console.log("new points");
                        let vecX_out = curve_out.getX();
                        let vecY_out = curve_out.getY();
                        //console.log("new size: "+vecX_out.size());
            
                        // update newCurves
                        const x_new = [];
                        const y_new = [];
                        for(let i=0; i< vecX_out.size(); i++){
                            x_new.push(vecX_out.get(i));
                            y_new.push(vecY_out.get(i));
                        }
                        //console.log("----------new X,Y-------------");
                        //console.log("new size:"+x_new.length);
                    
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
               // }
                if(dataset_out.hasCurve('averaging')){
                    result_flag = true;
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

                    // DataAnaytics
                    // create DataProcess
                    const dp_data = new Module.DataProcess(dataset_out);
                    // create operation                   
                    const op_slope = new Module.Operation(Module.ActionType.DATA_ANALYTICS,Module.MethodType.SLOPE_POINT);
                    // apply operation
                    const check = dp_data.apply(op_slope);
                    const dp_data_out = dp_data.getOutputDataset();
                    const curve_data_out = dp_data_out.getCurve('averaging');
                    let vecY_data_out = curve_data_out.getY();
                    const young = vecY_data_out.get(0).toExponential(precision);
                    console.log("Young ="+young);
                    data_analytics.length = 0;
                    data_analytics.push({label: "Young's Modulus", value: young, name: "young"});
                    op_slope.delete();
                    dp_data.delete();

                    /*
                    // create DataProcess
                    const dp_data_slope = new Module.DataProcess(dataset_out);
                    // create operation                   
                    const op_slope_range = new Module.Operation(Module.ActionType.DATA_ANALYTICS,Module.MethodType.SLOPE_RANGE_POINT);
                    op_slope_range.addParameterFloat("x_begin",0.0005);
                    //op_slope_range.addParameterFloat("x_end",0.0025);
                    op_slope_range.addParameterFloat("x_end",0.005);
                    // apply operation
                    const check_slope_range = dp_data_slope.apply(op_slope_range);
                    console.log("ERROR KO"+dp_data_slope.getErrorMessage());
                    console.log("LOG OK:"+dp_data_slope.logfile());
                    const dp_data_slope_range_out = dp_data_slope.getOutputDataset();
                    const curve_data_slope_out = dp_data_slope_range_out.getCurve('averaging');
                    let vecX_data_slope_out = curve_data_slope_out.getY();
                    let vecY_data_slope_out = curve_data_slope_out.getY();
                    const young_range = vecX_data_slope_out.get(0);
                    console.log("Young Range ="+young_range);
                    data_analytics.length = 0;
                    data_analytics.push({label: "Young's Modulus 2", value: young_range});
                    op_slope_range.delete();
                    dp_data_slope.delete();
                    */

                    // create DataProcess
                    const dp_data_end = new Module.DataProcess(dataset_out);                 
                    const op_end = new Module.Operation(Module.ActionType.DATA_ANALYTICS,Module.MethodType.END_POINT);
                    const check_end = dp_data_end.apply(op_end);
                    const dp_data_end_out = dp_data_end.getOutputDataset();
                    const curve_data_end_out = dp_data_end_out.getCurve('averaging');
                    const vecX_data_end_out = curve_data_end_out.getX();
                    const vecY_data_end_out = curve_data_end_out.getY();
                    const strain_at_break = vecX_data_end_out.get(0).toExponential(precision);
                    const stress_at_break = vecY_data_end_out.get(0).toExponential(precision);
                    data_analytics.push({label: "Strain at Break", value: strain_at_break, name: "strain_at_break"});
                    data_analytics.push({label: "Strength at Break", value: stress_at_break, name: "stress_at_break"});
                    op_end.delete();
                    dp_data_end.delete();

                    // create DataProcess
                    const dp_data_max = new Module.DataProcess(dataset_out);                 
                    const op_max = new Module.Operation(Module.ActionType.DATA_ANALYTICS,Module.MethodType.MAX_POINT);
                    const check_max = dp_data_max.apply(op_max);
                    const dp_data_max_out = dp_data_max.getOutputDataset();
                    const curve_data_max_out = dp_data_max_out.getCurve('averaging');
                    const vecX_data_max_out = curve_data_max_out.getX();
                    const vecY_data_max_out = curve_data_max_out.getY();
                    const strain_at_ultimate_strength = vecX_data_max_out.get(0).toExponential(precision);
                    const stress_at_ultimate_strength = vecY_data_max_out.get(0).toExponential(precision);
                    data_analytics.push({label: "Strain at Ultimate Strength", value: strain_at_ultimate_strength, name: "strain_at_ultimate_strength"});
                    data_analytics.push({label: "Strength at  Ultimate Strength", value: stress_at_ultimate_strength, name: "stress_at_ultimate_strength"});
                    op_max.delete();
                    dp_data_max.delete();
                }

                // update the state with the new curves
                //console.log("UPDATE STATE");
                dispatch({type: 'UPDATE_CURVES', curves: newCurves, data: data_analytics, result: result_flag});
                // flag status operation
                const operationsUpdate = [...operations];
                if(action==='Template'){
                    operationsUpdate.forEach( e => e.status='success');
                } else {
                    const ind = operationsUpdate.findIndex( (el) => el.action === action);
                    for(let i=0; i <= ind; i++){
                        operationsUpdate[i].status = 'success';
                    }
                    for(let i = ind+1; i<operationsUpdate.length; i++){
                        operationsUpdate[i].status = 'waiting';
                    }
                }
                setOperations(operationsUpdate);
            }

            const todoOperationFailed = (dataprocess) => {
                console.log("ERROR KO"+dataprocess.getErrorMessage());
                console.log("LOG OK:"+dataprocess.logfile());
                // flag status operation
                const operationsUpdate = [...operations];
                const error_msg = dataprocess.getErrorMessage();
                let action_error = action;
                if(action==='Template'){
                    // find the action name from the error message,i f not found put on the last action
                    const err =  dataprocess.getErrorMessage();
                    const i0 = err.indexOf('[');
                    const i1 = err.indexOf(']');
                    let action: string="";
                    if(i0!==-1&&i1!==-1) {
                        action_error = err.substring(i0+1,i1);
                    }
                    else {
                        action_error = operations[operations.length-1].action;
                    }
                }
                if(action_error==="Extrapoling")
                    action_error = "Averaging";
                operationsUpdate.find( (el) => el.action === action_error).status = 'failed';
                operationsUpdate.find( (el) => el.action === action_error).error = error_msg;
                
                
                setOperations(operationsUpdate);
            }

            const promise = applyOperation(dataprocess);
            promise.then(todoAfterOperationApplied,todoOperationFailed).then( () => {
                   // console.log("Second then");
                });
        });
        
    };

    // cancel an operation and restore previous data state
    // const resetOperationHandler = (event, action) => {
    //     dispatch({type: 'RESET_CURVES',input: previousCurves});
    //      // flag status operation
    //     const operationsUpdate = [...operations];
    //     const ind = operationsUpdate.findIndex( (el) => el.action === action);
    //     operationsUpdate[ind].status = 'waiting';
    //     setOperations(operationsUpdate);
    // };

    // restore initial curves
    const restoreInitdataHandler = () => {
        const group_id = data.tree.selectedGroup;
        dispatch({type: 'RESET_CURVES_INIT',groupid: group_id}); 
         // flag waiting status for all operations
        const operationsUpdate = [...operations];
        operationsUpdate.forEach( (val,index,arr) => {arr[index].status='waiting'});
        setOperations(operationsUpdate);
    }


    const getAxisLabel = () => {
        let axis_label = { xlabel: data.xtype, ylabel: data.ytype };
        if(data.xtype.split('_').length>1)
            axis_label.xlabel = data.xtype.split('_')[0];
        if(data.ytype.split('_').length>1)
            axis_label.ylabel = data.ytype.split('_')[0];
        return axis_label;
    }

    const tempgroups = [...data.groups];
    let disableNextBtn = false;
    for(let ic=0; ic<tempgroups.length; ic++){
        if(tempgroups[ic].data.length===0 ||tempgroups[ic].data[0].name===undefined){
            disableNextBtn = true;
            break;
        }
        

    }

    return (
        <div style={{paddingTop: '20px'}}>
            <Row justify="space-around">
                <Col span={6}>
                    <Steps operations={operations}
                           changeSelectedMethod={changeSelectedMethodHandler}
                           changeParameter= {changeParameterHandler}
                           updatedCurve={updatedCurveHandler}
                           resetAll={initHandler}
                           changeOperations={changeOperationsHandler}
                           restoreInitdata={restoreInitdataHandler}
                           resultStatus={data.groups[data.tree.selectedGroup].result}
                           currentIn={current}
                           autoIn={auto}
                           changeCurrent={ (cur) => setCurrent(cur)}
                           changeAuto={ (val) => setAuto(val)}
                    />
                </Col>
                <Col span={12}>
                    <PlotCurve
                       curves={data.groups[data.tree.selectedGroup].curves}
                       data={data.groups[data.tree.selectedGroup].data}
                       keys={data.tree.groupData[data.tree.selectedGroup].keys}
                        axisLabel={getAxisLabel()}
                      />
                </Col>
                <Col span={6}>
                    <CurveControls 
                        groupData={data.tree.groupData}
                        onCheck={checkDataTreeHandler}
                        />
                        
                </Col>
            </Row>
            
            <div className="ButtonPanel">
                    <div className="ButtonPrevious">
                        <Button  onClick={e => { handlePrevious() }}>Previous</Button>
                    </div>
                    <div className="ButtonNext">
                        <Button type="primary" disabled={disableNextBtn} onClick={e => { handleNext() }}>Next</Button>
                    </div>
                </div>
        </div>
    );
        
}

export default PlotBuilder;
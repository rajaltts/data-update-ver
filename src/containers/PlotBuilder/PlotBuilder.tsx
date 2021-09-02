import React, {  useEffect, useState, useReducer } from 'react';
import { Col, Row , Button } from 'antd';
import {LineOutlined, PropertySafetyOutlined} from '@ant-design/icons'
import 'antd/dist/antd.css';
import PlotCurve from '../../components/PlotCurve/PlotCurve';
import CurveControls from '../../components/CurveControls/CurveControls'
import Steps from '../../components/Steps/Steps';
import { Data, Group, Curve, Tree, GroupData, CurveData } from '../../data.model';
import { Operation } from '../../template.model';
import ReactWasm from '../../assets/dataclean/dataclean.js'
import {colors} from '../../assets/colors';
import { tensile_operations_config } from '../../assets/tensile_operations_config.js';
const clone = require('rfdc')();

import dataReducer from './Model/Reducer';
import initalModel from './Model/InitialModel';
import actions from './Model/Actions';

import useModel from './UseModel';

//---------INTERFACE-----------------------------
interface EmscriptenModule {
    [key: string]: any    
};

interface PlotBuilderProps {
    data_input: any;
    template_input: any;
    parentCallback: any;
};

//--------COMPONENT-----------------------------------------
const PlotBuilder: React.FC<PlotBuilderProps> = (props) => {

    //-----------STATE----------------------------------------
    // datat represents the state related to curves management 
    //const [data, dispatch]  =  useReducer(dataReducer,initalModel);
    const [data,dispatch,
        getMeasurement] = useModel();
   
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

    // current template
    const [currentTemplate, setCurrentTemplate] = useState({});

    // need to manage the state to manage group changes
    // should be better to use useContext hook to share these state with Steps component
    const [current, setCurrent] = useState(0);
    const [precision,setPrecision] = useState(3);
    const [action,setAction]= useState("");
    const [plotUpdate, setPlotUpdate] = useState(false);
    const [showMarkers, setShowMarkers] = useState(false);
    const [disableNextButton,setDisableNextButton] = useState(true);

    //---------EFFECT-----------------------------------------
    // initialize the states (componentDidMount)
    useEffect( () => {
       // console.log("useEffect data_input");
        dispatch(actions.setModel(props.data_input)); // init data(curves) state with props
        // TODO init Operations with the right congig (tensile, compression, ...) depending on analysis_type given by props.analysisType 
        // 2 cases:
        // 1 - props.template_input is a dataclean lib input file (from step2 to step3) { operations:[{...},{...}]}
        // 2 - props.template_input i an opearion object from a previous result (from step4 to step3) [{...},{...}]
        const isPreviousOperations =('operations' in props.template_input?false:true); 
        if(isPreviousOperations){
            const operations_init = clone(props.template_input); 
            setOperations(operations_init);
            // check if we must show the markers
            const op_clean = props.template_input.find( op => op.action === "Cleaning_ends");
            if(op_clean.selected_method === "Max_Xs"){
                setShowMarkers(true); 
                updatePlotHandler();
            }
        } else {
            setOperations(tensile_operations_config); // init operations state with the tensile structure (default values)
            setTemplate(props.template_input); // init template from props
            //setCurrentTemplate(props.template_input);
        }
        // console.log("Template in PlotBuider");
        // console.log(props.template_input);
        if(props.data_input.precision)
            setPrecision(props.data_input.precision);   
        if(props.data_input.measurement)
            dispatch(actions.setMeasurement(props.data_input.measurement));
            //setMeasurement(props.data_input.measurement);      
    },[props.data_input]);

    // use to update operations state from template state
    // update operations state from template state (componentDidUpdate)
    useEffect( () => {
        // console.log("useEffect template");
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
        // console.log("initOperationsFromTemplate");
        // console.log(template.operations);
        if(template.operations.length>1){
            // manage Averaging to put extrapolation parameters
            const op_avg = template.operations.find( op => op.action === "Averaging");
            const op_extr = template.operations.find( op => op.action === "Extrapoling");
            if(op_extr){
                op_avg.parameters.push( {extrapolation: op_extr.method.toLowerCase()} );
                op_extr.parameters.forEach( par => op_avg.parameters.push(par) );
            }

            const operationsUpdated = clone(operations); // efficient deep copy

            template.operations.forEach( (elem,index) => {
                // check if Action and Operations in template file are found in local operations
                const op_index = operations.findIndex( op => op.action === elem.action );
                let params_extrapolating: object[] = [];
                if(op_index!==-1){
                    const op = operations[op_index];
                    const meth_index = op.methods.findIndex( met => met.type === elem.method);
                    if(meth_index!==-1){
                        // update local operations with template file    
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
                    } else if(elem.action!=='Extrapoling')
                        throw new Error("ERROR in tensile template: method not recognized.");
                } else if (elem.action!=='Extrapoling'){
                    throw new Error("ERROR in tensile template: action not recognized.");
                }
            });
            setOperations(operationsUpdated); 

            // check if we must show the markers
            const op_clean = template.operations.find( op => op.action === "Cleaning_ends");
            if(op_clean.method === "Max_Xs"){
                setShowMarkers(true); 
                updatePlotHandler();
            }

        }
    }

    //---------HANDLER-------------------------------------------
    const changeOperationsHandler = (new_ops: Operation[]) => { 
        setOperations(new_ops);
     }

    const changeSelectedMethodHandler = (selectedMethod: string,action: string) => {
        console.log(selectedMethod+"--"+action);
        const operationsUpdate = [...operations]; //copy
        const op_index = operationsUpdate.findIndex(op => op.action === action );
        if( op_index === -1)
            throw new Error('Action '+action+' not known');
        operationsUpdate[op_index].selected_method = selectedMethod;
        setOperations(operationsUpdate);
        if(action==='Cleaning_ends'){ // for other action we keep status defined in Cleaning_ends
            setShowMarkers((selectedMethod==='Max_Xs'?true:false));
        }
        
        updatePlotHandler();
        
    };

    // Curve handler
    const clickPointHandler = (data_plot) : boolean =>  { // should be replace by a call to updateCurveHandler with the right ALGO/METHOD and id
        console.log("CLICK POINT HANDLER");
        //console.log(data_plot);

        // check if we click on a merker
        const isMarker = (data_plot.points[0].data.mode==='markers'?true:false);
        if(isMarker)
           return false;

        const x = data_plot.points[0].x;
        const pt_index = data_plot.points[0].pointIndex;
        const curve_name = data_plot.points[0].data.name;

        // set operations parameters
        const operationsUpdate = [...operations];
        const a = operationsUpdate.find( (el) => el.action === "Cleaning_ends");
        const sm = a.selected_method;
        const m = a.methods.find( e => e.type === sm);

        if(m.type!=='Max_Xs')
            return false;
        //  check if already inserted
        const group_id = data.tree.selectedGroup;
        const index = m.params[0].curveId.findIndex( e => (e.curveName === curve_name && e.groupId === group_id) );
        if(index===-1){
            m.params[0].value = [...m.params[0].value,  pt_index]; // pt_index
            m.params[0].curveId = [...m.params[0].curveId, {groupId: group_id,curveName: curve_name}];
        } else {
            m.params[0].value[index] =  pt_index; 
        }
       

      
       setOperations(operationsUpdate);
       // add marker in the curve
       dispatch(actions.setMarker(curve_name,pt_index ));
       return true;
    }

    const changeViewHandler = (val: number) => {
        dispatch(actions.setView(val));
        console.log(data);
    }

    const removeAllPoints = () => {
        const group_id = data.tree.selectedGroup;
       
        const operationsUpdate = [...operations];
        const a = operationsUpdate.find( (el) => el.action === "Cleaning_ends");
        const m = a.methods.find( m => m.type=='Max_Xs');
        if(m){
            const new_value= [];
            const new_id = [];
            for(let i=0; i<  m.params[0].curveId.length; i++){
                if(m.params[0].curveId[i].groupId!==group_id){
                    new_id.push(m.params[0].curveId[i]);
                    new_value.push(m.params[0].value[i]);
                }
            }
            m.params[0].value.length = 0;
            m.params[0].curveId.length = 0;
            m.params[0].value = [...new_value];
            m.params[0].curveId = [...new_id];
        }
        dispatch(actions.resetMarkers(group_id));
        updatePlotHandler();
    }

    // DataTree handler
    const checkDataTreeHandler =  (checkedKeys: string[], group_id: number) => {
        console.log('onCheck', checkedKeys);
        const keys = [];
        let group_index = '-1';
        if(checkedKeys.length>0){
            group_index = checkedKeys.slice(-1)[0].charAt(0);  // index group of last check
            checkedKeys.forEach( (item, index) =>
            {
                if(item.charAt(0)===group_index){
                    keys.push(item);
                }  
            });
        }
        dispatch(actions.checkCurves(keys,group_id));
        // check result status of the group
        const result_status = data.groups[group_id].result;
        if(!result_status){ // if no result reset data and set to first step
            restoreInitdataHandler();
            setCurrent(0);
        }
    };

    
    // convert all curves in all groups
    const convertToTrueHandler = () => {

        const Module: EmscriptenModule  = {};
        ReactWasm(Module).then( () => {   
            // create a datase
            const dataset = new Module.Dataset();
            let ic = 0;
            for(let gid=0; gid<data.groups.length;gid++){
                for(let cid=0; cid<data.groups[gid].curves.length; cid++){
                    const curve = data.groups[gid].curves[cid];
                    if(curve.x0===undefined) // no manage average curve
                       continue;
                    const curve_ds = new Module.Curve(ic.toString());
                    curve_ds.setXName(Module.PhysicalMeasurement.STRAIN_ENGINEERING);
                    curve_ds.setYName(Module.PhysicalMeasurement.STRESS_ENGINEERING);
                    const vecX = new Module.VectorDouble();
                    const vecY = new Module.VectorDouble();
                    for(let i=0; i<curve.x0.length;i++){
                        vecX.push_back(curve.x0[i]);
                        vecY.push_back(curve.y0[i]);
                    }
                    curve_ds.setPoints(vecX,vecY);
                    dataset.addCurve(curve_ds);
                    curve_ds.delete();
                    vecX.delete();
                    vecY.delete();
                    ic++;
                }
            }
            // create DataProcess
            const dataprocess = new Module.DataProcess(dataset);
            let error_msg: string;
            let log: string;
            const applyOperation = (dataprocess) => {
                return new Promise((success,failure) => {
                    let check = true;
                    const convert_op = JSON.stringify( {"operations":[ {"action":"Convert", "method":"Engineering_to_true"}]} );
                    console.log('Convert '+convert_op);
                    try{
                        const op = new Module.Operation(convert_op);
                        check = dataprocess.apply(op);
                        op.delete();
                    } catch {
                        console.log("Error during convert engineering to true");
                    }
                    if(check) {
                        success(dataprocess);
                    } else {
                        failure(dataprocess);
                    }
                });
            }
            const todoAfterOperationApplied = (dataprocess: any) => {
                const dataset_out = dataprocess.getOutputDataset();
                const groups_new = [...data.groups];
                let ic = 0;
                for(let gid=0; gid<data.groups.length;gid++){
                    for(let cid=0; cid<data.groups[gid].curves.length; cid++){
                        if(data.groups[gid].curves[cid].x0===undefined) // do not consider avaerage curve
                            continue;
                        const curve_out = dataset_out.getCurve(ic.toString());
                        let vecX_out = curve_out.getX();
                        let vecY_out = curve_out.getY();
                        const x_new = [];
                        const y_new = [];
                        for(let i=0; i< vecX_out.size(); i++){
                            x_new.push(vecX_out.get(i));
                            y_new.push(vecY_out.get(i));
                        }
                        if(groups_new[gid].curves[cid].x0){  // not for average curve
                            groups_new[gid].curves[cid].x0.length=0;
                            groups_new[gid].curves[cid].y0.length=0;
                            groups_new[gid].curves[cid].x0 = [...x_new];
                            groups_new[gid].curves[cid].y0 = [...y_new];
                        }
                        curve_out.delete();
                        vecX_out.delete();
                        vecY_out.delete();
                        ic++;
                    }
                }
               dispatch(actions.setMeasurement('true'));
            }
            const todoOperationFailed = (dataprocess: any) => {
                console.log("ERROR KO"+dataprocess.getErrorMessage());
                console.log("LOG OK:"+dataprocess.logfile());
            }
            const promise = applyOperation(dataprocess);
            promise.then(todoAfterOperationApplied,todoOperationFailed).then( () => {
                console.log('Finish convert');
                for(let gid=0; gid<data.groups.length;gid++){
                    restoreInitdataHandler(gid);
                }
                updatePlotHandler();
            });
        });
    }

    const updatePlotHandler = () => {
        console.log("UPDATE PLOT");
        setPlotUpdate( prevState => !prevState);
    }

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
            data: data,
            template: operations//currentTemplate
        }
        sendData(json);
    }

    const sendData = (result) => {
        props.parentCallback(result);
    }

    //Operation Handler
    const updatedCurveHandler = (action) => { 
        // always reset curve between update
        restoreInitdataHandler();
       
        setAction(action);
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
                    let curve: Curve = {
                                    id: curves[ic].id,
                                    oid: curves[ic].oid,
                                    matDataLabel: curves[ic].matDataLabel,
                                    x: curves[ic].x,
                                    y: curves[ic].y,
                                    name: curves[ic].name,
                                    label: curves[ic].label,
                                    selected: curves[ic].selected,
                                    opacity: curves[ic].opacity,
                                    x0: curves[ic].x0,
                                    y0: curves[ic].y0
                                };
                    if(curves[ic].markerId){
                        curve = {...curve, markerId: curves[ic].markerId};
                    }
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
            
            let error_msg: string;
            let log: string;;
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
                            const extra_index = param.name.toLowerCase().indexOf('extrapolat')
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
                                        if(param.curveId){
                                            const curve_names = [];
                                            const values = [];
                                            param.curveId.forEach( (p,i) => {
                                                if(p.groupId === group_id){
                                                    curve_names.push(p.curveName);
                                                    values.push(val[i]);
                                                }
                                            })
                                            par.push( {curveId : curve_names });
                                            par.push( {[name] : values})
                                        } else {
                                            par.push( {[name] : val})
                                        }
                                    }
                                }
                            }
                        });
                        if(action==='Averaging')
                            ops.push({action: action, method: op.selected_method, parameters: par, result: 'Shifting'});
                        else 
                            ops.push({action: action, method: op.selected_method, parameters: par});

                        // manage Extrapolation action in Averaging
                        if(action === 'Averaging'){
                            const avg_method = op.methods.find( e => e.type === op.selected_method);
                            const extrapolation_parm = avg_method.params.find( e => e.name === 'extrapolation');
                            const extrapolation_method = extrapolation_parm.selection[extrapolation_parm.value].name;
                            if(extrapolation_method !== 'none'){ // !none
                                const params: object[] = [];
                                avg_method.params.forEach( param => {
                                    const extra_index = param.name.toLowerCase().indexOf('extrapolat')
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
                                ops.push({action: 'Extrapoling' , method: extrapolation_method, parameters: params, result: 'Shifting'})
                            }
                        }
                        
                    }
                    const template = {operations: ops};
                    //setCurrentTemplate(template);
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
                    // update selected curves
                    if(newCurves[curve_idx].selected){
                        // reset x and y
                        newCurves[curve_idx].x.length = 0;
                        newCurves[curve_idx].y.length = 0;
                        // update x and y array
                        newCurves[curve_idx].x = [...x_new];
                        newCurves[curve_idx].y = [...y_new];
                    }
                    // delete C++ object
                    curve_out.delete();
                    vecX_out.delete();
                    vecY_out.delete();
                }
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
                    let young = 0;
                    let yield_strength = 0;
                    let strain_at_break = 0;
                    let stress_at_break = 0;
                    let strain_at_ultimate_strength = 0;
                    let stress_at_ultimate_strength = 0;
                    const dp_data = new Module.DataProcess(dataset_out);                
                    const op_slope = new Module.Operation(Module.ActionType.DATA_ANALYTICS,Module.MethodType.NONE);
                    op_slope.addParameterString("stiffness","averaging");
                    op_slope.addParameterString("last_point","averaging");
                    op_slope.addParameterString("point_max_y","averaging");
                    op_slope.addParameterString("offset_yield_strength","averaging");
                    op_slope.addParameterString("slope_range","first_point"); // not use range to avoid not enough points

                    const check = dp_data.apply(op_slope); 
                    if(!check){
                        console.log("ERROR: "+dp_data.getErrorMessage());
                        console.log("LOG: "+dp_data.logfile());
                    }
                    else {
                        const report_test = dp_data.getReport();
                        const stiffness = report_test.getPropertyFirst(Module.ActionType.DATA_ANALYTICS,"averaging","stiffness");
                        young = stiffness.toExponential(precision);
                        const offset_yield_strength = report_test.getPropertySecond(Module.ActionType.DATA_ANALYTICS,"averaging","offset_yield_strength");
                        yield_strength = offset_yield_strength.toExponential(precision);
                        const last_point_x = report_test.getPropertyFirst(Module.ActionType.DATA_ANALYTICS,"averaging","last_point");
                        const last_point_y = report_test.getPropertySecond(Module.ActionType.DATA_ANALYTICS,"averaging","last_point");
                        strain_at_break = last_point_x.toExponential(precision);
                        stress_at_break = last_point_y.toExponential(precision);
                        const point_max_y_x = report_test.getPropertyFirst(Module.ActionType.DATA_ANALYTICS,"averaging","point_max_y");
                        const point_max_y_y = report_test.getPropertySecond(Module.ActionType.DATA_ANALYTICS,"averaging","point_max_y");
                        strain_at_ultimate_strength = point_max_y_x.toExponential(precision);
                        stress_at_ultimate_strength = point_max_y_y.toExponential(precision);
                    }
        
                    data_analytics.length = 0;
                    data_analytics.push({label: "Young's Modulus", value: young, name: "young"});
                    data_analytics.push({label: "Yield Strength", value: yield_strength, name: "yield_strength"});
                    data_analytics.push({label: "Strain at Break", value: strain_at_break, name: "strain_at_break"});
                    data_analytics.push({label: "Strength at Break", value: stress_at_break, name: "stress_at_break"});
                    data_analytics.push({label: "Strain at Ultimate Strength", value: strain_at_ultimate_strength, name: "strain_at_ultimate_strength"});
                    data_analytics.push({label: "Strength at Ultimate Strength", value: stress_at_ultimate_strength, name: "stress_at_ultimate_strength"});
                    op_slope.delete();
                    dp_data.delete();
                }

                // update the state with the new curves
                //console.log("UPDATE STATE");
                dispatch(actions.updateCurves(newCurves,data_analytics,result_flag));
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
                updatePlotHandler();
                // check if all group have data
                let results_true = true;
                data.groups.forEach( g => { if(g.result==false){ results_true=false; }});
                setDisableNextButton(!results_true);
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
                    console.log("Second then");
                });
        });
        
    };

    // restore initial curves
    const restoreInitdataHandler = (gid: number = -1) => {
        let group_id: number;
        if(gid===-1)
            group_id = data.tree.selectedGroup;
        else
            group_id = gid;
        //const group_id = data.tree.selectedGroup;
        dispatch(actions.resetCurves(group_id)); 
         // flag waiting status for all operations
        const operationsUpdate = [...operations];
        operationsUpdate.forEach( (val,index,arr) => {arr[index].status='waiting'});
        setOperations(operationsUpdate);
        setDisableNextButton(true);
    }

    const getAxisLabel = () => {
        let axis_label = { xlabel: data.xtype, ylabel: data.ytype };
        return axis_label;
    }

    const dataTypeHandler = () => {
        if(data.type === undefined)
         return 'tensile';
        else
         return data.type;
    }

    return (
        <>
        <div className="OuterDivScroll">
        <div style={{paddingTop: '20px'}}>
            <Row justify="space-around">
                <Col span={6}>
                    <Steps operations={operations}
                           changeSelectedMethod={changeSelectedMethodHandler}
                           updatedCurve={updatedCurveHandler}
                           changeOperations={changeOperationsHandler}
                           restoreInitdata={restoreInitdataHandler}
                           currentIn={current}
                           changeCurrent={ (cur) => setCurrent(cur)}
                           setAction={ (val) => setAction(val)}
                           updatePlot={updatePlotHandler}
                           removeAllPoints={removeAllPoints}
                           dataType={dataTypeHandler()}
                    />
                </Col>
                <Col span={12}>
                    <PlotCurve
                       group={data.tree.selectedGroup}
                       curves={data.groups[data.tree.selectedGroup].curves}
                       data={data.groups[data.tree.selectedGroup].data}
                       keys={data.tree.groupData[data.tree.selectedGroup].keys}
                       axisLabel={getAxisLabel()}
                       clickPoint={clickPointHandler}
                       plotUpdate={plotUpdate}
                       showMarkers={showMarkers}
                       resultsView={data.tree.groupData[data.tree.selectedGroup].resultsView}
                       changeView={changeViewHandler}
                      />
                </Col>
                <Col span={6}>
                    <CurveControls 
                        groupData={data.tree.groupData}
                        onCheck={checkDataTreeHandler}
                        measurement={getMeasurement()}
                        convertToTrue={convertToTrueHandler}
                        />
                        
                </Col>
            </Row>
            </div>
            </div>
            <div className="ButtonPanel">
                    <div className="ButtonPrevious">
                        <Button  onClick={e => { handlePrevious() }}>Previous</Button>
                    </div>
                    <div className="ButtonNext">
                        <Button type="primary" disabled={disableNextButton} onClick={e => { handleNext() }}>Next</Button>
                    </div>
                </div>
    </>
        
    );
        
}

export default PlotBuilder;
import React, {useEffect, useState } from 'react';
import {  Button } from 'antd';
import { Operation } from '../../template.model';
import { tensile_operations_config } from '../../assets/tensile_operations_config.js';
import actions from './Model/Actions';
import useModel from './UseModel';
import PlotBuilderView from './PlotBuilderView';
const clone = require('rfdc')();

//---------INTERFACE-----------------------------
interface PlotBuilderProps {
    data_input: any;
    template_input: any;
    parentCallback: any;
};

//--------COMPONENT-----------------------------------------
const PlotBuilder: React.FC<PlotBuilderProps> = (props) => {

    //-----------MODEL----------------------------------------
    const [data,dispatch,
           operations,setOperations,
           convertToTrue,updatedCurve] = useModel();
   
    // template is an input json file for dataclean library 
    const [template, setTemplate] = useState({"operations": []});
    const [precision,setPrecision] = useState(3);
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
        }
        updatePlotHandler();
    };

    // convert all curves in all groups
    const convertToTrueHandler = () => {
        const postConvert = () => {
            console.log('Finish convert');
            for(let gid=0; gid<data.groups.length;gid++){
                restoreInitdataHandler(gid);
            }
            updatePlotHandler();
        }

        convertToTrue(postConvert);       
    }

    const updatePlotHandler = () => {
        setPlotUpdate( prevState => !prevState);
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

        const postUpdate = () => {
            console.log('Finish update');
            updatePlotHandler();
            // check if all group have data
            let results_true = true;
            data.groups.forEach( g => { if(g.result==false){ results_true=false; }});
            setDisableNextButton(!results_true);
        }

        updatedCurve(action,group_id,op_target,precision,postUpdate);
    }

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

    // Handler for Next/Previous Button 
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

    return (
    <>
        <PlotBuilderView
            data = {data}
            operations={operations}
            plotUpdate={plotUpdate}
            showMarkers={showMarkers}
            changeOperationsHandler_={changeOperationsHandler}
            changeSelectedMethodHandler_={changeSelectedMethodHandler}
            updatedCurveHandler_={updatedCurveHandler}
            clickPointHandler_={clickPointHandler}
            restoreInitdataHandler_={restoreInitdataHandler}
            updatePlotHandler_={updatePlotHandler}
            removeAllPoints_={removeAllPoints}
            changeViewHandler_={changeViewHandler}
            checkDataTreeHandler_={checkDataTreeHandler}
            convertToTrueHandler_={convertToTrueHandler}
        />
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
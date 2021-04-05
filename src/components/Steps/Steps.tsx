import React, {Fragment, useEffect, useState, useRef} from 'react'
import {Button, Tooltip, Space, Steps as AntSteps, Checkbox } from 'antd';
import { CheckCircleFilled, RightCircleOutlined , ExclamationCircleTwoTone, CaretRightFilled, CaretLeftFilled } from '@ant-design/icons';
import Step from './Step/Step';
import { Operation } from '../../template.model';
import './Steps.css';
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript';
import { Parameter as parameter_type } from '../../template.model';

interface StepsProps {
    operations: Operation[];
    changeSelectedMethod: any;
    changeParameter: any;
    updatedCurve: (a: string) => void;
    resetAll: any;
    changeOperations: (a: Operation[]) => void;
    restoreInitdata: any;
    resultStatus: boolean;
    currentIn: number;
    autoIn: boolean;
    changeCurrent: (v: number) => void;
    changeAuto: (v: boolean) => void;
    setAction: (a: string) => void;
    updatePlot: () => void;
};

const Steps: React.FC<StepsProps> = (props) => {
    //-----------STATE----------------------------------------
    const [current, setCurrent] = useState(0);
    const [auto, setAuto] = useState(false);
    const paramsRef = useRef([]);


    //---------EFFECT------------------------------------------
    useEffect(() => {
        setCurrent(props.currentIn);
    },[props.currentIn]);
    useEffect(() => {
        setAuto(props.autoIn);
    },[props.autoIn]);


    //---------HANDLER----------------------------------------
    const saveParamsHandler = (p: parameter_type[] ) => {
        paramsRef.current = p;
    }
    const changeParametersHandler = () => {
        if(paramsRef.current.length===0)
          return;
         
        const operationsUpdate = [...props.operations];
        //const operationsUpdate = JSON.parse(JSON.stringify(props.operations)); // it is a deep copy
        const a = operationsUpdate[current];
        const sm = a.selected_method;
        const m = a.methods.find( e => e.type === sm);
        m.params.length = 0;
        m.params = [...paramsRef.current];
        props.changeOperations(operationsUpdate);
        
        paramsRef.current.length=0; // reset ref
    }


    const stepsOnChangeHandler = (current) => {
        console.log("useRef :");
        paramsRef.current.forEach( p => console.log(p.name+" = "+p.value));
        changeParametersHandler()
      //  if(!auto) { 
            const action = props.operations[current].action;
        //no run when click    props.updatedCurve(action);
      //  }
        setCurrent(current);
        props.changeCurrent(current);
        props.setAction(action);
       
    }

    const changeSelectedMethod2 = (select:string, action: string) => {
       
        return  props.changeSelectedMethod(select,action);
    }

    const changeParameter =  (name: string, value: number, action: string) => {
        return props.changeParameter(name, value, action);
    }
    // aplly button for a step
    const updatedCurveHandler = (action: string) => {
        if(action==='all'){
            const last_step = props.operations.length - 1;
            //setCurrent(last_step);
            const action = props.operations[last_step].action;
            return props.updatedCurve(action);
            //return props.updatedCurve('Template');
        }
        else
            return props.updatedCurve(action);
    }

    // const manualModeHandler = (event: any) => {
    //     const status = event.target.checked;
    //     // if status is check(true) -> auto=false
    //     setAuto(!status);
    //     props.changeAuto(!status);
    //     // get result status
    //     if(props.resultStatus){

    //     } else {
    //         setCurrent(0);
    //         props.changeCurrent(0);
    //         props.restoreInitdata();
    //     }        
    // }

    const resetModeHandler = (event: any) => {
        //setCurrent(0);
        //props.changeCurrent(0);
        props.restoreInitdata(-1,true); // -1 -> current group, true -> removePoints
        props.updatePlot();
    }

    const changeOperationsHandler = (new_ops: Operation[]) => { 
        props.changeOperations(new_ops);
     }
    
    //---------SUB-COMPONENTS------------------------------------
    function DisplayStep(props)  {
        let steps = [];
        props.operations.map( (op,i) => {
            let status_previous = 'success';
            let status_next = 'waiting';
            if(i!==0)
               status_previous = props.operations[i-1].status;
            if(i<props.operations.length-1)   
                status_next =  props.operations[i+1].status;    
            steps.push( 
                        <Step 
                              action_label={op.action_label}
                              automatic_mode = {auto}
                              methods = {op.methods}
                              selected_method = {op.selected_method}
                              changeSelectedMethod = {(select: string) => changeSelectedMethod2(select,op.action)}
                              changeParameter = { (name: string, value: number) => changeParameter(name, value, op.action)}
                              applyButton = { () => updatedCurveHandler(op.action)}
                              status = {op.status}
                              error_msg = { op.error}
                              changeOperations= { changeOperationsHandler }
                              operations = {props.operations}
                              action={op.action}
                              saveParams={saveParamsHandler}
                        />
                        );
        });
        return steps[current];
    }

   function DisplayProgress() {
       let items = [];
       for(let i=0;i<props.operations.length;i++){
            const description = props.operations[i].action_label;
            const label = i;
            let icon = <RightCircleOutlined/>; // for waiting
            if(props.operations[i].status==='success')
                icon = <CheckCircleFilled/>;
            else if (props.operations[i].status==='failed')
                icon = <ExclamationCircleTwoTone twoToneColor="#eb2f2f"/>;
            items.push(<AntSteps.Step icon={icon} title={description} key={i} />);
        }
        return(
            <AntSteps style={{paddingBottom: '10px'}} current={current} size='small' onChange={stepsOnChangeHandler}>{items}</AntSteps>
        );
    }

   
    //---------RENDER-----------------------------------------
    return(
    <Fragment>
        <div style={{height: '550px', borderStyle: 'solid', borderWidth: '2px', borderColor: '#d9d9d9', margin: 'auto', padding: '10px'}}>
            <div className="analysis-type-title">
                Analysis type: Tensile
            </div>

            <DisplayProgress/>
            
            <DisplayStep  operations={props.operations}/>
            
            <br/>
            <div style={{  float: 'right', paddingRight: '7px', paddingTop: '0px', paddingBottom: '10px'}}>
                <Button style={{fontSize: '12px', background: '#096dd9',  borderColor: '#096dd9'}} size="small" type="primary"  disabled={false} onClick={() => updatedCurveHandler('all')}>Apply All</Button>
            </div>

            <div style={{ float: 'right', paddingRight: '10px', paddingTop: '0px', paddingBottom: '10px'}}>
                <Button style={{fontSize: '12px', background: '#096dd9',  borderColor: '#096dd9'}} size="small" type="primary"  disabled={false} onClick={resetModeHandler}>Reset Curves</Button>
            </div>
            <br/>
            {/* <Checkbox  className="step-manual-mode" checked={!auto} onChange={manualModeHandler}>Manual mode</Checkbox> */}
        </div>
        
    </Fragment>
    );
};
//
export default Steps;
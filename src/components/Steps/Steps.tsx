import React, {Fragment, useEffect, useState} from 'react'
import {Button, Tooltip, Space, Steps as AntSteps, Checkbox } from 'antd';
import { CheckCircleFilled, RightCircleOutlined , ExclamationCircleTwoTone, CaretRightFilled, CaretLeftFilled } from '@ant-design/icons';
import Step from './Step/Step';
import { Operation } from '../../template.model';

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
};

const Steps: React.FC<StepsProps> = (props) => {
    //-----------STATE----------------------------------------
    const [current, setCurrent] = useState(0);
    const [auto, setAuto] = useState(true);

    //---------EFFECT------------------------------------------
    useEffect(() => {
        setCurrent(props.currentIn);
    },[props.currentIn]);
    useEffect(() => {
        setAuto(props.autoIn);
    },[props.autoIn]);


    //---------HANDLER----------------------------------------
    const stepsOnChangeHandler = (current) => {
        if(!auto) { 
            const action = props.operations[current].action;
            props.updatedCurve(action);
        }
        setCurrent(current);
        props.changeCurrent(current);
    }

    const changeSelectedMethod2 = (select:string, action: string) => {
        return  props.changeSelectedMethod(select,action);
    }

    const changeParameter =  (name: string, value: number, action: string) => {
        return props.changeParameter(name, value, action);
    }
    // aplly button for a step
    const updatedCurveHandler = (action: string) => {
        if(auto)
            return props.updatedCurve('Template');
        else
            return props.updatedCurve(action);
    }

    const manualModeHandler = (event: any) => {
        const status = event.target.checked;
        // if status is check(true) -> auto=false
        setAuto(!status);
        props.changeAuto(!status);
        // get result status
        if(props.resultStatus){

        } else {
            setCurrent(0);
            props.changeCurrent(0);
            props.restoreInitdata();
        }        
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
        <div style={{borderStyle: 'solid', borderWidth: '2px', margin: 'auto', padding: '10px'}}>
            <h1 style={{textAlign: 'center'}}>
                Analysis type: Tensile
            </h1>

            <DisplayProgress/>
            
            <DisplayStep  operations={props.operations}/>
            
            <br/>
            <Checkbox  checked={!auto} onChange={manualModeHandler}>Manual mode</Checkbox>
        </div>
        
    </Fragment>
    );

};

export default Steps;
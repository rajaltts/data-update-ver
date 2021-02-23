import React, {Fragment, useEffect, useState} from 'react'
import {Button, Tooltip, Space, Switch, Steps as AntSteps } from 'antd';
import { CheckCircleFilled, RightCircleOutlined , CaretRightFilled, CaretLeftFilled } from '@ant-design/icons';
import Step from './Step/Step';
import { Operation } from '../../template.model';

interface StepsProps {
    operations: Operation[];
    changeSelectedMethod: any;
    changeParameter: any;
    updatedCurve: any;
    resetCurve: any;
    resetAll: any;
    setOperations(ops: Operation[]): void;
    restoreInitdata: any;
    resetStep: boolean;
    resetOperations: any;
};

const Steps: React.FC<StepsProps> = (props) => {
    //-----------STATE----------------------------------------
    const [current, setCurrent] = useState(0);
    const [auto, setAuto] = useState(true);

    //---------EFFECT-----------------------------------------
    useEffect(() => {
        setCurrent(0);
    },[props.resetStep]);

    //---------HANDLER----------------------------------------
    const applyNextHandler = () => {
        if(current<props.operations.length-1)
            setCurrent(current+1);
    }

    const applyPreviousHandler = () => {
        if(current>0)
            setCurrent(current-1);
    }

    const changeSelectedMethod2 = (select:string, action: string) => {
        return  props.changeSelectedMethod(select,action);
    }

    const changeParameter =  (name: string, value: number, action: string) => {
        return props.changeParameter(name, value, action);
    }
    // aplly button for a step
    const updatedCurveHandler = (event:any, action: string,status: string) => {
        if(status==='success'){
            return props.updatedCurve(event,action,'restore_previous_curves');
        } else {
            return props.updatedCurve(event,action,'no_restore');
        }    
    }

    const resetCurveHandler = (event:any, action: string) => {
        return props.resetCurve(event,action);
    }

    const switchChange = (checked: boolean, event: Event) => {
        console.log('swtich to $(checked)');
        setAuto(checked);
        props.restoreInitdata();
    }
    const fctHandle = (op:Operation[]) => {
        props.setOperations(op);
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
                              index={i}
                              action_label={op.action_label}
                              automatic_mode = {auto}
                              methods = {op.methods}
                              selected_method = {op.selected_method}
                              changeSelectedMethod = {(select: string) => changeSelectedMethod2(select,op.action)}
                              changeParameter = { (name: string, value: number) => changeParameter(name, value, op.action)}
                              applyButton = { (event: any) => updatedCurveHandler(event,op.action,op.status)}
                              resetButton = { (event: any) => resetCurveHandler(event,op.action)}
                              status = {op.status}
                              status_previous = {status_previous}
                              status_next = {status_next}
                              error_msg = { op.error}
                              setOperations = { (op) => props.setOperations(op) }
                              operations = {props.operations}
                              action={op.action}
                        />
                        );
        });
        return steps[current];
    }

   function DisplayProgress({current}) {
        
       let items = [];
       for(let i=0;i<props.operations.length;i++){
        const description = props.operations[i].action_label;
        const label = i;
        const status =  (props.operations[i].status==='success'?true:false);
        items.push(<AntSteps.Step icon={status? <CheckCircleFilled/> : <RightCircleOutlined/> } title={description} key={i} />);
       }
       return(
        <AntSteps style={{paddingBottom: '10px'}} current={current} size='small' >{items}</AntSteps>
       );
    }

    //---------RENDER-----------------------------------------
    return(
    <Fragment>
        <div style={{borderStyle: 'solid', borderWidth: '2px', margin: 'auto', padding: '10px'}}>
            <h1 style={{textAlign: 'center'}}>
                Analysis type: Tensile
            </h1>
            <Space style={{width: '100%', justifyContent: 'center', padding: '10px'}}>
                Manual
                <Switch defaultChecked style={{backgroundColor: "grey"}} onChange={switchChange} />
                Auto
            </Space>
            
            <DisplayProgress current={(!auto?current:props.operations.length-1)}/>
            
            {!auto&&
            <Space style={{ width: '100%', justifyContent: 'space-between', paddingTop: '0px', paddingBottom: '10px'}}>
                <Button disabled={current===0}size="small" type="primary"  icon={<CaretLeftFilled />} onClick={applyPreviousHandler}>Previous</Button> 
                <Button disabled={!(current<props.operations.length-1 && props.operations[current].status==='success')} size="small"  type="primary" icon={<CaretRightFilled />} onClick={applyNextHandler}>Next</Button>
            </Space>
            }
            {auto&&
            <Space style={{ width: '100%', justifyContent: 'space-between', paddingTop: '0px', paddingBottom: '10px'}}>
                <Button size="small" type="primary"  icon={<CaretLeftFilled />} onClick={applyPreviousHandler}>Previous</Button> 
                <Button size="small"  type="primary" icon={<CaretRightFilled />} onClick={applyNextHandler}>Next</Button>
            </Space>
            }

            <DisplayStep  operations={props.operations}/>

            {auto&&
            <Space style={{paddingLeft: '15px', paddingTop: '15px'}}>
                {/* <Tooltip title="Reinitialize with initial curves" placement="bottom" mouseEnterDelay={1.0}>
                <Button size="small" type="primary" onClick={() => {props.restoreInitdata()}}>Cancel</Button>
                </Tooltip> */}
                <Tooltip title="Apply all operations at one" placement="bottom" mouseEnterDelay={1.0}>
                    <Button size="small" type="primary" onClick={(event: any) => {props.updatedCurve(event,'Template')}}>Apply</Button>      
                </Tooltip>
            </Space>
            }

            {!auto&&
            <Space style={{paddingLeft: '15px', paddingTop: '15px'}}>
                {/* <Tooltip title="Reinitialize with initial curves" placement="bottom" mouseEnterDelay={1.0}>
                <Button size="small" type="primary" onClick={() => {props.restoreInitdata()}}>Reset curves</Button>
                </Tooltip> */}
                <Tooltip title="Reinitialize with initial curves and default parameters" placement="bottom" mouseEnterDelay={1.0}>
                <Button size="small" type="primary" onClick={() => {props.resetOperations()}}>Cancel All</Button>
                </Tooltip>
            </Space>
            }

        </div>
    </Fragment>
    );

};

export default Steps;
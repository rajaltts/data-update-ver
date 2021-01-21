import React, {Fragment, useEffect, useState} from 'react'
import {Button, Tooltip, Space, Switch, Steps as AntSteps } from 'antd';
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
    const [auto, setAuto] = useState(false);

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

    const changeParameter =  (name: string, value: string, action: string) => {
        return props.changeParameter(name, value, action);
    }

    const updatedCurveHandler = (event:any, action: string) => {
        return props.updatedCurve(event,action);
    }

    const resetCurveHandler = (event:any, action: string) => {
        return props.resetCurve(event,action);
    }

    const switchChange = (checked: boolean, event: Event) => {
        console.log('swtich to $(checked)');
        setAuto(checked);
        props.restoreInitdata();
    }
    //---------SUB-COMPONENTS------------------------------------
    function DisplayStep(props)  {
        let steps = [];
        props.operations.map( (op,i) => {
            steps.push( 
                        <Step 
                              index={i}
                              action_label={op.action_label}
                              automatic_mode = {auto}
                              methods = {op.methods}
                              selected_method = {op.selected_method}
                              changeSelectedMethod = {(select: string) => changeSelectedMethod2(select,op.action)}
                              changeParameter = { (name: string, value: string) => changeParameter(name, value, op.action)}
                              applyButton = { (event: any) => updatedCurveHandler(event,op.action)}
                              resetButton = { (event: any) => resetCurveHandler(event,op.action)}
                              status = {op.status}
                              error_msg = { op.error}
                              setOperations = { (op:Operation[]) => props.setOperations(op) }
                              operations = {props.operations}
                              action={op.action}
                        />
                        );
        });
        return steps[current];
    }

   function DisplayProgress(props) {
       let items = [];
       for(let i=0;i<props.number;i++){
        items.push(<AntSteps.Step key={i}/>);
       }
       return(
        <AntSteps style={{paddingBottom: '10px'}} current={props.current} size='small'>{items}</AntSteps>
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
                <Switch style={{backgroundColor: "grey"}} onChange={switchChange} />
                Auto
            </Space>
            
        
        <DisplayProgress current={current} number={props.operations.length}/>
        
        <DisplayStep operations={props.operations}/>

        <Space style={{ width: '100%', justifyContent: 'flex-end', paddingTop: '10px'}}>
            {current>0 && <Button size="small"  onClick={applyPreviousHandler}>Previous</Button> }
            {current<props.operations.length-1 && <Button size="small"  onClick={applyNextHandler}>Next</Button>}
        </Space>
        </div>

        <Space style={{paddingLeft: '15px', paddingTop: '15px'}}>
            <Tooltip title="Reinitialize with initial curves" placement="bottom" mouseEnterDelay={1.0}>
                <Button size="small" type="primary" onClick={() => {props.restoreInitdata()}}>Cancel all</Button>
            </Tooltip>
            {auto && <Tooltip title="Apply all operations at one" placement="bottom" mouseEnterDelay={1.0}>
                         <Button size="small" type="primary" onClick={(event: any) => {props.updatedCurve(event,'Template')}}>Apply all</Button>
                     </Tooltip>}
        </Space>

        <br/>
        
        <Space style={{padding: '15px'}}>
        {!auto &&
            <Tooltip title="Reinitialize operations with initial template" placement="bottom" mouseEnterDelay={1.0}>
                <Button size="small" type="primary" onClick={() => {props.resetOperations()}}>Reset operations</Button>
            </Tooltip>
        }
        </Space>
        {/* <Space style={{padding: '15px'}}>
            <Button size="small" type="primary" onClick={() => {}}>Save results</Button>
        </Space> */}

    </Fragment>
    );

};

export default Steps;
import React, {useState, useRef, useEffect, useReducer, Fragment} from 'react'
import {Select, Alert } from 'antd';
import { Operation } from '../../../template.model';
import DisplayParametersForms from './DisplayParametersForms'
import { Parameter as parameter_type } from '../../../template.model';
import '../Steps.css';

interface StepProps {
    action_label: string;
    automatic_mode: boolean;
    methods: any[];
    selected_method: string;
    changeSelectedMethod: any;
    changeParameter: any;
    applyButton: any;
    status: string;
    error_msg: string;
    changeOperations: (a: Operation[]) => void;
    operations: Operation[];
    action: string;
};

const Step: React.FC<StepProps> = (props) => {
   
    const { Option } = Select;
    const [applyStatus,setApplyStatus] = useState(false);

    useEffect( () => {
        // after a success, if method is changed, the status is waiting by changeMethodHandler
        const status = props.operations.find((el) => el.action === props.action).status;
        if(status==='waiting')
          setApplyStatus(true);
    },[props.operations]);

    const changeMethodHandler = (selectedMethod: string) => {
        //setApplyStatus(true);
        props.changeSelectedMethod(selectedMethod);
        const operationsUpdate = [...props.operations];
        operationsUpdate.find((el) => el.action === props.action).status='waiting';
        props.changeOperations(operationsUpdate);
    }

    const changeParametersHandler = (params_: parameter_type[]) => {
        const operationsUpdate = [...props.operations];
        //const operationsUpdate = JSON.parse(JSON.stringify(props.operations)); // it is a deep copy
        const a = operationsUpdate.find( (el) => el.action === props.action);
        const sm = a.selected_method;
        const m = a.methods.find( e => e.type === sm);
        m.params.length = 0;
        m.params = params_;
        props.changeOperations(operationsUpdate);
        props.applyButton();
    }

    const DisplayAlert = () => {
        let ret: any;
        if(props.status==='failed')
            ret = <Alert style={{ fontSize: '10px'}} message={props.error_msg} type="error"/>;
        else
            ret = null;
        return ret;
    }

    return(
    <div style={{height: '360px',borderStyle: 'solid', borderWidth: '1px', paddingLeft: '5px', paddingBottom: '0px'}}>
    {/* <h1 style={{textAlign: 'center'}}>{props.action_label}</h1>  */}
    <div className="step-title">{props.action_label}</div>

    <Select value={props.selected_method} size="small" className="step-select-method"  onChange={changeMethodHandler} >{
            props.methods.map( met => {
                return(
                        <Option key={met.type} value={met.type} className="step-select-method">{met.label}</Option>
                );
            })
        }
    </Select>

    <DisplayParametersForms 
        initParams={props.methods.find( e => e.type===props.selected_method ).params}
        onChangeParameter={changeParametersHandler}
        autoMode={props.automatic_mode}
        apply={applyStatus}
        actionLabel={props.action_label}
    />   
    <div style={{paddingTop: '90px'}}>
    <DisplayAlert/>
    </div>
     
    </div>);
};


export default Step;
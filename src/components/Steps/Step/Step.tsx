import React, {useState, useRef, useEffect, useReducer, Fragment} from 'react'
import {Select, Button, Space, Input, Alert,  Row, Col, Slider, InputNumber, Divider  } from 'antd';
import { Operation } from '../../../template.model';
import DisplayParametersForms from './DisplayParametersForms'
import { Parameter as parameter_type } from '../../../template.model';

interface StepProps {
    index: Number;
    action_label: string;
    automatic_mode: boolean;
    methods: any[];
    selected_method: string;
    changeSelectedMethod: any;
    changeParameter: any;
    applyButton: any;
    status: string;
    status_previous: string;
    status_next: string;
    error_msg: string;
    changeOperations: (a: Operation[]) => void;
    operations: Operation[];
    action: string;
};

const Step: React.FC<StepProps> = (props) => {
   
    const [buttonDisabled,setButtonDisabled] = useState(false);
    const { Option } = Select;
    const [sliderValue,setSliderValue] = useState([]);
    const [applyStatus,setApplyStatus] = useState(false);

    useEffect( () => {
        const status = props.operations.find((el) => el.action === props.action).status;
        if(status==='waiting')
          setApplyStatus(true);
    },[props.operations]);

    const changeMethodHandler = (selectedMethod: string) => {
        setApplyStatus(true);
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
            ret = <Alert  message={props.error_msg} type="error"/>;
        else
            ret = null;
        return ret;
    }

    return(
    <>
    <div style={{borderStyle: 'solid', borderWidth: '1px', margin: 'auto', padding: '10px'}}>

     <h1>{props.action_label}</h1> 

     <Select value={props.selected_method} style={{ width: 200 }}  onChange={changeMethodHandler} >{
            props.methods.map( met => {
                return(
                        <Option key={met.type} value={met.type}>{met.label}</Option>
                );
            })
        }
    </Select>

    <DisplayParametersForms 
        initParams={props.methods.find( e => e.type===props.selected_method ).params}
        onChangeParameter={changeParametersHandler}
        mode={props.automatic_mode}
        apply={applyStatus}
    />   

    <DisplayAlert/>
     
    </div>
    </>);
};


export default Step;
import React, {useState, useRef, useEffect, useReducer, Fragment} from 'react'
import {Select, Button, Space, Input, Alert,  Row, Col, Slider, InputNumber, Divider  } from 'antd';
import { Operation } from '../../../template.model';

interface StepProps {
    index: Number;
    action_label: string;
    automatic_mode: boolean;
    methods: any[];
    selected_method: string;
    changeSelectedMethod: any;
    changeParameter: any;
    applyButton: any;
    resetButton: any;
    status: string;
    status_previous: string;
    status_next: string;
    error_msg: string;
    setOperations(ops: Operation[]): void; 
    operations: Operation[];
    action: string;
};

const Step: React.FC<StepProps> = (props) => {
   
    const [buttonDisabled,setButtonDisabled] = useState(false);
    const { Option } = Select;
    const [sliderValue,setSliderValue] = useState([]);

    useEffect( () => {
        const a = props.operations.find( el => el.action === props.action);
        const m = a.methods.find( e => e.type === a.selected_method);
        let sliderValue = [];
        m.params.forEach( p => {
            sliderValue.push({name: p.name, value: p.value});
        });
        setSliderValue(sliderValue);
    },[props.operations]);

    const onChangeParameter = (value: any, name: string) => {
        const sliderValueUpdate = [...sliderValue];
        const el = sliderValueUpdate.find( el => el.name===name);
        el.value = (typeof value === 'number' ? value : 0); // should be min and not 0
        setSliderValue(sliderValueUpdate);
        const operationsUpdate = [...props.operations];
        const a = operationsUpdate.find( (el) => el.action === props.action);
        const sm = a.selected_method;
        const m = a.methods.find( e => e.type === sm);
        const p = m.params.find( e => e.name === name);
        p.value = value;
        props.setOperations(operationsUpdate); 
        
    }

    const getValue  = (name: string) => {
        const v = sliderValue.find( e => e.name === name);
        if(v) {
            return (typeof v.value === 'number'? v.value : 0);
        } else { return 0; }
    }

   
    const changeMethodHandler = (selectedMethod: string) => {
        props.changeSelectedMethod(selectedMethod);
    }

    
    const  changeParameterHandler = (e: any, name: string) => {
        const operationsUpdate = [...props.operations];
        const a = operationsUpdate.find( (el) => el.action === props.action);
        const sm = a.selected_method;
        const m = a.methods.find( e => e.type === sm);
        const p = m.params.find( e => e.name === name);
        const value = e; //e.target.value;  
        p.value = value;
        props.setOperations(operationsUpdate); // in order to keep the focus we need to set state in this component
    }

 

    const selectParamHandler = (value:any, name: string, param: any) => {
        const value_num = param.selection.findIndex( e => e.name===value);
        props.changeParameter(name,value_num);
    }
        
    const DisplaySelect = ({parameter}) => {
        return(
        <Row>
            <Col span={10}>{parameter.label}</Col>
            <Col span={10}>
                <Select placeholder="Default value"
                        size='small'
                        value={parameter.selection[parameter.value].name}
                        style={{width: 200}}
                        onChange={ (e) => selectParamHandler(e,parameter.name,parameter)}>{
                            parameter.selection.map( (elm,index) => {
                                return(<Option value={elm.name} key={elm.name}>{elm.label}</Option>);
                            })
                        }
                </Select>
            </Col>
        </Row>
        );
    }

    const DisplayParameters = ({methods,selected_method}) => {
        const sm = methods.find( e => e.type===selected_method );
        let items = [];
        if(sm.params.length>0){
            sm.params.map( par => {
                if( 'selection' in par){  
                    items.push(
                        <DisplaySelect key={par.label} parameter={par}/>
                    );
                } else {
                  if('range' in par){
                    const value = getValue(par.name);
                    items.push(
                        <Row key={par.label}>
                            <Col span={10}> {par.label}</Col>
                            <Col span={10}>
                                <Slider
                                 min= {par.range.min}
                                 max= {par.range.max}
                                 defaultValue={par.value}
                                 onChange={ e => onChangeParameter(e,par.name)}
                                />
                            </Col>
                            <Col span={4}>
                                <p style={{margin: '0 16px'}} >{value}</p>
                            </Col>
                        </Row>
                      );

                  } else {
                    const step =  ((par.value!==undefined&&par.value!==0)?Math.pow(10,(Math.floor(Math.log10(Math.abs(par.value)))-1)):1);
                    items.push(
                        <Row key={par.label}>
                        <Col span={10}> {par.label}</Col>
                        <Col span={10}>
                            <InputNumber
                                size='small'
                                defaultValue={par.value}
                                step={step}
                                onChange={ e => changeParameterHandler(e,par.name)}
                            />
                        </Col>
                        <Col span={4}></Col>
                        </Row>
                    );
                  }  
                }
            });    
         
        } 
        return <>{items}</>;
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

    <DisplayParameters
        methods={props.methods}
        selected_method={props.selected_method}/>

    <br/>
    {(!props.automatic_mode ) &&<Space style={{ paddingTop: '10px'}}>
        {/* <Button size="small" type="primary" disabled={props.status_next==='success'} onClick={props.resetButton}>Cancel</Button> */}
        <Button size="small" type="primary" disabled={props.status_previous!=='success'} onClick={props.applyButton}>Apply</Button>
   </Space>}

    {!props.automatic_mode && <DisplayAlert/>}
     
    </div>
    </>);
};


export default Step;
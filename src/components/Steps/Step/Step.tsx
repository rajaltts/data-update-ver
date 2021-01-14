import React, {useState, useRef, useEffect, useReducer} from 'react'
import {Select, Button, Space, Input, Alert } from 'antd';

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
    error_msg: string;
};



const Step: React.FC<StepProps> = (props) => {
   
    const [buttonDisabled,setButtonDisabled] = useState(false);
    const { Option } = Select;

    const changeMethodHandler = (selectedMethod: string) => {
        props.changeSelectedMethod(selectedMethod);
    }

    const changeParameterHandler =  (e: any, name: string) => {
        const value: string = e.target.value;
        return props.changeParameter(name,value);
    }

    const selectParamHandler = (value:any, name: string) => {
        return props.changeParameter(name,value);
    }
    
    function DisplaySelect(props) {
        return(
        <>
        <br/>
        {props.parameter.label}
        <Select placeholder="Default value"
                size='small'
                value={props.parameter.value}
                style={{width: 150}}
                onChange={ (e) => selectParamHandler(e,props.parameter.name)}>{
                    props.parameter.selection.map( (elm,index) => {
                         return(<Option value={elm.name} key={elm.name}>{elm.label}</Option>);
                    })
                }
        </Select>
        </>
        );
    }

    const DisplayParameters = (props) => {
        const sm = props.methods.find( e => e.type===props.selected_method );
        let items = [];
        if(sm.params.length>0){
          sm.params.map( par => {
              if( 'selection' in par){
                items.push(<DisplaySelect parameter={par} key={par.label}/>);
              } else {
                items.push(<Input   key={par.label}
                                    size='small' type="text"
                                    addonBefore={par.label}
                                    defaultValue={par.value.toString()}
                                    onChange={ e => changeParameterHandler(e,par.name)} />
                )
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
                        <Option value={met.type}>{met.label}</Option>
                );
            })
        }
    </Select>

    <DisplayParameters
        methods={props.methods}
        selected_method={props.selected_method}/>

    <br/>
    {(!props.automatic_mode ) &&<Space style={{ paddingTop: '10px'}}>
        <Button size="small" type="primary" onClick={props.resetButton}>Cancel</Button>
        <Button size="small" type="primary" disabled={props.status==='success'} onClick={props.applyButton}>Apply</Button>
   </Space>}

    {!props.automatic_mode && <DisplayAlert/>}
     
    </div>
    </>);
};


export default Step;
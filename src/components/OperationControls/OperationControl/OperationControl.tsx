import React, { Fragment, useEffect, useState } from 'react';
import { Select, Button, Input, Space, Alert, Typography, Divider  } from 'antd';


interface OperationControlProps {
    methods: any[];
    selected_method: string;
    automatic_mode: boolean;
    changeSelectedMethod: any;
    applyButton: any;
    resetButton: any;
    changeParameter: any;
    status: string;
};



const OperationControl: React.FC<OperationControlProps> = (props) => {
    type param_type = { name: string; value: string;};
    type Param_type = { hasParam: boolean; params: param_type[]; type: string};
    
    const { Option } = Select;
    
    const changeMethodHandler = (selectedMethod: string) => {
        props.changeSelectedMethod(selectedMethod);
    }
    
    const changePamaterHandler =  (e: any, name: string) => {
        const value: string = e.target.value;
        return props.changeParameter(name,value);
    }

    const selectParamHandler = (value:any, name: string) => {
        return props.changeParameter(name,value);
    }

    const DisplayParameters = () => {
        const sm = props.methods.find( e => e.type===props.selected_method );
        let items = [];
        if(sm.params.length>0){
          sm.params.map( par => {
              if( 'selection' in par){
                items.push(
                    <>
                    <br/>
                    {par.label}
                    <Select placeholder="Default value" size='small' value={par.value} style={{width: 150}} onChange={ (e) => selectParamHandler(e,par.name)}>{
                        par.selection.map( (elm,index) => {
                            return(<Option value={elm.name}>{elm.label}</Option>);
                        })
                    }
                    </Select>
                    </>
                );

              } else {
                items.push(
                    <Input size='small' type="text" addonBefore={par.label} defaultValue={par.value.toString() } onChange={ e => changePamaterHandler(e,par.name)} />
                  )
              }
              
             
          });            
        } 
        return <>{items}</>;
    }

    const DisplayAlert = () => {
        let ret: any;
        if(props.status==='failed')
            ret = <Alert  message="FAILED" type="error"/>;
        else
            ret = null;
        return ret;
    }

    return(
        <>
        <Select value={props.selected_method} style={{ width: 200 }}  onChange={changeMethodHandler} >{
            props.methods.map( met => {
                return(
                        <Option value={met.type}>{met.label}</Option>
                );
            })
        }
        </Select>
       
        <DisplayParameters/>
        
        <br/>
        <br/>
        {/* && (props.status==='success'||props.status==='waiting') */}
        {(!props.automatic_mode ) && <Space>
                <Button size="small" type="primary" onClick={props.resetButton}>Cancel</Button>
                <Button size="small" type="primary" onClick={props.applyButton}>Apply</Button>
         </Space>
         }
         {!props.automatic_mode && <DisplayAlert/>}

        </>
    
    );
};

export default OperationControl;




import React, { Fragment, useState } from 'react';
import { Select, Button, Input, Space, List, Typography, Divider  } from 'antd';


interface OperationControlProps {
    methods: any[];
    selected_method: string;
    automatic_mode: boolean;
    changeSelectedMethod: any;
    updated: any;
};



const OperationControl: React.FC<OperationControlProps> = (props) => {
    type param_type = { name: string; value: string;};
    type Param_type = { hasParam: boolean; params: param_type[]; type: string};
    const [param, setParam] = useState<Param_type>({hasParam: false, params: [], type:''});
    
    const { Option } = Select;
    
    const changeMethodHandler = (selectedMethod: string) => {
        props.changeSelectedMethod(selectedMethod);
        const selected_method = props.methods.find( e => e.type===selectedMethod );
        if(selected_method.params.length>0){
            setParam({hasParam: true, params: selected_method.params, type: selectedMethod });
        } else {
            setParam({hasParam: false, params: [], type: selectedMethod});
        }
    }

    const handleSelectedMethod= () => { 
    return props.selected_method;
     };
    

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
       
        {param.hasParam && param.params.map( par => {
            return(
                <Input size='small' addonBefore={par.name} defaultValue={par.value.toString() } onChange={ () => {} } />
            );
        })}
        
        <br/>
        <br/>
        
        {!props.automatic_mode && <Space>
                <Button size="small" type="primary" onClick={() => {}}>Reset</Button>
                <Button size="small" type="primary" onClick={(event) => props.updated(event,param.type)}>Apply</Button>
         </Space>}
        </>
    
    );
};

export default OperationControl;




import React , {useState, useEffect} from 'react'
import { Parameter as parameter_type } from '../../../template.model';
import {Select, Button, Space, Input, Alert,  Row, Col, Slider, InputNumber, Divider  } from 'antd';
interface DisplayParameterProps {
    initParams: parameter_type[];
    onChangeParameter: (a: any) => any;
    autoMode: boolean;
    apply: boolean;
};

const DisplayParametersFroms: React.FC<DisplayParameterProps> = ({initParams, onChangeParameter,autoMode,apply}) => {
    const [params,setParams] = useState<parameter_type[]>([]);
    const [applyStatus,setApplyStatus] = useState(false);
    const { Option } = Select;

    useEffect( () => {
        //const param_init = [...initParams];  // it is a shallow copy
        const param_init = JSON.parse(JSON.stringify(initParams)); // it is a deep copy
        setParams(param_init);
        setApplyStatus(apply);
    }
    ,[initParams,apply]);

    const changeParamHandler = (event: any,name: string) => {
        const new_params = [...params];
        const par = new_params.find( e => e.name===name);
        if(par)
            par.value=event;
        setParams(new_params);
        setApplyStatus(true);
    }

    const selectParamHandler = (value:any, name: string, param: any) => {
        setApplyStatus(true);
        const value_num = param.selection.findIndex( e => e.name===value);
        const new_params = [...params];
        const par = new_params.find( e => e.name===name);
        if(par)
            par.value=value_num;
        setParams(new_params);
    }

    const displayParameters = params.map( p => {
        if( 'selection' in p){  
            return (<>
                <Row key={p.label}>
                <Col span={10}>{p.label}</Col>
                <Col span={10}>
                    <Select placeholder="Default value"
                         size='small'
                         value={p.selection[p.value].name}
                         style={{width: 200}}
                         onChange={ (e) => selectParamHandler(e,p.name,p)}>{
                            p.selection.map( (elm,index) => {
                                return(<Option value={elm.name} key={elm.name}>{elm.label}</Option>);
                            })
                        }
                    </Select>
                </Col>
                </Row>
            </>);
        } else if ('range' in p) {
            return(
                <Row key={p.label}>
                <Col span={10}> {p.label}</Col>
                <Col span={10}>
                    <InputNumber
                        key={p.label}
                        size='small'
                        min= {p.range.min}
                        max= {p.range.max}
                        defaultValue={p.value}
                        onChange={ (event: any) => changeParamHandler(event,p.name)}
                    />                       
                </Col>
                </Row>
            );
        } else {
            let step: number = 1;
            if(p.float)
              step =  ((p.value!==undefined&&p.value!==0)?Math.pow(10,(Math.floor(Math.log10(Math.abs(p.value)))-1)):1);
            return(
                <>
                <Row key={p.label}>
                <Col span={10}> {p.label}</Col>
                <Col span={10}>
                <InputNumber
                    key={p.name}
                    size='small'
                    defaultValue={p.value}
                    step={step}
                    onChange={  (event:any) => changeParamHandler(event,p.name)}
                />
                </Col>
                <Col span={4}></Col>
                </Row>
                </>
            );
        }
    }
        
    );

    const submit = (e: any) => {
        e.preventDefault();
        onChangeParameter(params);
        setParams([]);
    };

    return(
        <>
        {displayParameters}
        <br/>
        <Space style={{ paddingTop: '10px', paddingBottom: '10px'}}>
            <Button size="small" type="primary" disabled={!autoMode&&!applyStatus} onClick={submit}>Apply</Button>
        </Space>
        </>
    );

};

export default DisplayParametersFroms;
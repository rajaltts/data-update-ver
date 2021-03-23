import React , {useState, useEffect} from 'react'
import { Parameter as parameter_type } from '../../../template.model';
import '../../../App.css';
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
    const [linked,setLinked] = useState([]);

    useEffect( () => {
        //const param_init = [...initParams];  // it is a shallow copy
        const param_init = JSON.parse(JSON.stringify(initParams)); // it is a deep copy
        setParams(param_init);
        setApplyStatus(apply);
        const linked_init = [];
        param_init.forEach(p => {
            if('selection' in p){
                const l = p.selection[p.value].link;
                if(l){
                    linked_init.push( {parameter: p.name, value: [l]});
                } else {
                    linked_init.push( {parameter: p.name, value: []});
                }
            }
        });
        setLinked(linked_init);
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

        
        const linked_curr = linked;
        const t = linked_curr.find( e => e.parameter===name);
        const link = par.selection[value_num].link;
        if(t){
            if(link)
              t.value.push(link);
            else
              t.value=[]; 
            setLinked(linked_curr);
        } 
    }
    const fontStyle = {
        fontSize: '12px',
    };

    const displayParameters = params.map( p => {
        if( p.label.length==0){
            return;
        }
        else if( 'selection' in p){  
            return (
                <Row key={p.label}>
                <Col span={10}>{p.label}</Col>
                <Col span={10}>
                    <Select placeholder="Default value"
                         value={p.selection[p.value].name}
                         className="step-select-method"
                         size="small"
                         onChange={ (e) => selectParamHandler(e,p.name,p)}>{
                            p.selection.map( (elm,index) => {
                                return(<Option value={elm.name} key={elm.name} className="step-select-method">{elm.label}</Option>);
                            })
                        }
                    </Select>
                </Col>
                </Row>
            );
        } else if ('range' in p) {
            return(
                <Row key={p.label}>
                <Col span={10}> {p.label}</Col>
                <Col span={10}>
                    <InputNumber
                        key={p.label}
                        className="step-input-parameter"
                        size="small"
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
            if(p.conditional){ // show if in the linked array
                const t = linked.find( e => e.parameter===p.conditional);
                let ii = -1;
                if(t){
                    ii = t.value.findIndex( e => e===p.name)
                }
                if(ii!==-1){
                    return(
                        <Row key={p.label}>
                        <Col span={10}> {p.label}</Col>
                        <Col span={10}>
                        <InputNumber
                            key={p.name}
                            className="step-input-parameter"
                            size="small"
                            defaultValue={p.value}
                            step={step}
                            onChange={  (event:any) => changeParamHandler(event,p.name)}
                        />
                        </Col>
                        <Col span={4}></Col>
                        </Row>
                    );
                }
            } else  {
                return(
                   <Row key={p.label}>
                   <Col span={10}> {p.label}</Col>
                   <Col span={10}>
                   <InputNumber
                       key={p.name}
                       style={fontStyle}
                       size="small"
                       defaultValue={p.value}
                       step={step}
                       onChange={  (event:any) => changeParamHandler(event,p.name)}
                   />
                   </Col>
                   <Col span={4}></Col>
                   </Row>
               );
            }
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
        <div  style={{...fontStyle, height: '300px'}} >
        {displayParameters}
        <br/>
        </div>
        <div>
        <Space style={{ position: 'absolute', right: '10px', paddingTop: '10px', paddingBottom: '10px'}}>
            <Button size="small" type="primary" disabled={!applyStatus} onClick={submit}>Apply</Button>
        </Space>
        </div>
        </>
    );

};

export default DisplayParametersFroms;
import React, { useEffect, useState } from 'react';
import OperationControl from './OperationControl/OperationControl';
import { Tabs, Switch, Space, Button, message } from 'antd';
import { Operation, Parameter } from '../../template.model';

interface OperationControlsProps {
    operations:  any;
    updateTemplate: any;
    changeSelectedMethod: any;
    updatedCurve: any;

};

const OperationControls: React.FC<OperationControlsProps> = (props) => {

    const [current, setCurrent] = useState('1');
    const [auto, setAuto] = useState(true);

   
    const { TabPane } = Tabs;

    function callback(key) {
      console.log("Tab change : "+key);
    }

    const tabClickHandler = (key: string, event: any) => {
        console.log("Tab click : "+key);
        console.log(event);
        // disable all except except one on left
        setCurrent(key);
    }

    const disabledFct = (key: string) => { // to disable tab not around the current tab
        if(!auto){
            const dist = Number(key)-Number(current);
            if(dist===0||dist===1||dist===-1)
                return false;
            else
                return true;
        } else {
            return false;
        }
    }

    const changeSelectedMethod2 = (select:string, action: string) => {
        return  props.changeSelectedMethod(select,action);
    }

    const switchChange = (checked: boolean, event: Event) => {
        console.log('swtich to $(checked)');
        setAuto(checked);
    };

   

    return (
    <>
    <div style={{borderStyle: 'solid', borderWidth: '2px', margin: 'auto', padding: '10px'}}>
        <h1 style={{textAlign: 'center'}}>
            Treatment: Tensile
        </h1>
        <Space align='center'>
            Manual
            <Switch  defaultChecked style={{backgroundColor: "grey"}} onChange={switchChange} />
            Auto
        </Space>
            
        <br/>
        <br/>

        <Tabs style={{borderStyle: 'solid', borderWidth: '2px', margin: 'auto', padding: '10px'}}
            defaultActiveKey="1"  type="card"
            onChange={callback}
            onTabClick={tabClickHandler}
            >{
            props.operations.map( (op,index) => {
                const tab_name = "Step "+(++index).toString();
                return(
                    <TabPane tab={tab_name}
                             key={index.toString()}
                             disabled={disabledFct(index.toString())}>
                        Operation {op.action}
                        <br/>
                        <OperationControl
                            methods = {op.methods}
                            selected_method = {op.selected_method}
                            automatic_mode = {auto}
                            changeSelectedMethod = {(select: string) => changeSelectedMethod2(select,op.action)}
                            updated= {props.updatedCurve}/>
                    </TabPane>
                );
            })
        }</Tabs>
    </div>
    <br/>
    <br/>
    
    <Space style={{paddingLeft: '15px'}}>
            <Button size="small" type="primary" onClick={() => {}}>Reset all</Button>
            <Button size="small" type="primary" onClick={() => {}}>Apply all</Button>
    </Space>
    
    <br/>
    <br/>
    <Space style={{padding: '15px'}}>
        <Button size="small" type="primary" onClick={() => {}}>Save results</Button>
    </Space>
   
    </>
    );
/*
    return (
        <Tabs defaultActiveKey="1"  type="card" onChange={callback} onTabClick={tabClickHandler}>
            <TabPane tab={<span style={{ color: "red" }}>Tab1</span>} disabled={disabledFct("1")} key="1">
            Content of Tab Pane 1
            </TabPane>
        </Tabs>
    );
*/

};

export default OperationControls;

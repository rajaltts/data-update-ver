import React, { useState, useEffect} from 'react';
import  {Tabs, Table, Checkbox, Divider, Row, Col, Button, Space, InputNumber } from 'antd';
import { GroupData } from '../../containers/PlotBuilder/Model/data.model';
import './Consolidation.css';
import {LineOutlined, PropertySafetyOutlined} from '@ant-design/icons';
import {colors} from '../../assets/colors';

interface IConsolidation {
    groupData: GroupData[];
    postData: any[];
    selectedCurves: string[];
    listAvg: boolean[];
    adjustCurves: (algo: string, curves: string[], parameters: {curve: string, parameter: string, value: number}[] ) => void;
    cancelAdjustCurves: (curves: string[]) => void;
};

const Consolidation: React.FC<IConsolidation> = (props) => {

    const [selectedTab,setSelectedTab] = useState('1');
    const [checkedFailureCurves,setCheckedFailureCurves] = useState<string[]>([]);
    const [checkedStiffnessCurves,setCheckedStiffnessCurves] = useState<string[]>([]);
    const [parameterValues,setParameterValues] = useState<{curve: string, parameter: string, value: number}[] >([]);

    useEffect(()=>{
        let parameterValuesInit: {curve: string, parameter: string, value: number}[] = [];
        for(let index=0; index<props.groupData.length; index++){
            if(props.postData[index].length>1){
                const young_value = (props.postData[index].find(p => p.name==='young')?props.postData[index].find(p => p.name==='young').value:undefined);
                const strain_value = (props.postData[index].find(p => p.name==='proportional_limit_strain')?props.postData[index].find(p => p.name==='proportional_limit_strain').value:undefined);
               
                parameterValuesInit.push({curve: props.groupData[index].title, parameter: 'young', value: young_value });
                parameterValuesInit.push({curve: props.groupData[index].title, parameter: 'strain', value: strain_value });
            }
        }
        setParameterValues(parameterValuesInit);
    },[props.postData]);
    
    const { TabPane } = Tabs;

    const onChangeHandler = (key: string) => {
        setSelectedTab(key);
    }
    
    const onFailureHandler = (e) => {
        setCheckedFailureCurves(e);
    }
    
    const onClickAdjustHandler = () => {
        if(checkedFailureCurves.length===0&&checkedStiffnessCurves.length===0)
           return;
        const algo = (selectedTab==='1'?'failure':'stiffness');
        if(algo==='failure')
          props.adjustCurves(algo,checkedFailureCurves,null);
        else if(algo==='stiffness')
          props.adjustCurves(algo,checkedStiffnessCurves,parameterValues);

    }

    const onClickCancelAdjustHandler = () => {
        if(checkedFailureCurves.length===0&&checkedStiffnessCurves.length===0)
           return;
        const algo = (selectedTab==='1'?'failure':'stiffness');
        if(algo==='failure'){
           setCheckedFailureCurves([]);
           props.cancelAdjustCurves(checkedFailureCurves);
        } else if(algo==='stiffness') {
           setCheckedStiffnessCurves([]);
           props.cancelAdjustCurves(checkedStiffnessCurves);
        }
    }

    const onChangeParameterHandler = (event: any, curveName: string, paramName: string) => {
        let checkedCurvesUp = checkedStiffnessCurves;
        checkedCurvesUp = checkedCurvesUp.filter(e => e!==curveName).concat([curveName]); // Add only if not yet in
        setCheckedStiffnessCurves(checkedCurvesUp);

        let parameterValuesUp = parameterValues;
        const elt = parameterValuesUp.find( e => (e.curve===curveName&&e.parameter===paramName));
        if(elt){
            elt.value = event;
        } else {
            parameterValuesUp.push({curve: curveName, parameter: paramName, value: event});
        }
        setParameterValues(parameterValuesUp);
    }

    const datasourceYoung:any[] = props.groupData.map( (g,index) => {
        return({key: index.toString(), group: g.title, young: '0', strain: '0'} );  
    });

    return (<>
    <div style={{height: '400px', fontWeight: 'normal', fontSize: '12px', borderStyle: 'solid', borderWidth: '2px', borderColor: '#d9d9d9', margin: 'auto', padding: '10px'}}>
    <Tabs 
        style={{ height: '350px', borderStyle: 'solid', borderWidth: '0px', borderColor: '#d9d9d9', margin: 'auto', padding: '10px'}}
        onChange={onChangeHandler} type="card">
        <TabPane tab="Failure" key="1">
            <Divider orientation='left' style={{fontSize: '12px'}}>Select 2 or 3 averaged curves</Divider>
            <Checkbox.Group onChange={onFailureHandler}>{
                props.groupData.map( (g,index) => {
                    if(props.listAvg[index]){
                      const dis = (props.selectedCurves.findIndex( e => e===g.title)===-1?false:true);
                      return(
                        <Row key={'row'+index} >
                          <Checkbox  style={{fontSize: '12px'}} value={g.title} disabled={dis}> <LineOutlined style={{fontSize: '24px', verticalAlign: 'middle', color: colors[index]}}/>{g.title}</Checkbox>
                        </Row>
                      )
                    }
                })
            }
            </Checkbox.Group>
        </TabPane>

        <TabPane tab="Stiffness" key="2">
            <Row style={{fontSize: '12px', fontWeight: 'bold', paddingBottom: '10px'}}>
                <Col span={8}>
                     Group
                </Col>
                <Col span={8}>
                     Young
                </Col>
                <Col span={8}>
                     {/* Strain */}
                </Col>
            </Row>
            {props.groupData.map( (g,index) => {
             if(props.postData[index].length>1){
                 return(    
                      <Row style={{fontSize: '12px'}} key={g.title}>
                          <Col span={8}>
                            <LineOutlined style={{fontSize: '24px', verticalAlign: 'middle', color: colors[index]}}/> {g.title}
                          </Col>
                          <Col span={8}>
                          <InputNumber
                              style={{fontSize: '12px'}}
                              key='young'
                              size="small"
                              defaultValue={ (props.postData[index].find(p => p.name==='young')?props.postData[index].find(p => p.name==='young').value:0)}
                              step={10}
                              onChange={  (event:any) =>onChangeParameterHandler(event,g.title,'young')}
                          />
                          </Col>
                          {/* <Col span={8}>
                          <InputNumber
                              key='strain'
                              size="small"
                              defaultValue={ (props.postData[index].find(p => p.name==='proportional_limit_strain')?props.postData[index].find(p => p.name==='proportional_limit_strain').value:0)}
                              step={0.01}
                              onChange={  (event:any) => onChangeParameterHandler(event,g.title,'strain')}
                          />
                          </Col> */}
                      </Row>
                 );
             }
           })}  
        </TabPane>
    </Tabs>
    <Space style={{ float: 'right', paddingRight: '7px', paddingBottom: '10px'}}>
                <Button style={{fontSize: '12px'}} size="small" type="primary" onClick={onClickAdjustHandler}>Adjust</Button>
                <Button style={{fontSize: '12px'}} size="small" type="primary" onClick={onClickCancelAdjustHandler}>Cancel</Button>
           </Space>
    </div>
    </>);
}

export default Consolidation;
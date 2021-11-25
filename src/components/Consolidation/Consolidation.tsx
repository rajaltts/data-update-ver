import React, { useState, useEffect} from 'react';
import  {Tabs, Table, Checkbox, Divider, Row, Col, Button, Space, InputNumber } from 'antd';
import { DataAnalytics, GroupData } from '../../containers/PlotBuilder/Model/data.model';
import './Consolidation.css';
import {LineOutlined, PropertySafetyOutlined} from '@ant-design/icons';
import {colors} from '../../assets/colors';

interface IConsolidation {
    xunit: string;
    groupData: GroupData[];
    postData: DataAnalytics[][];
    selectedCurves: string[]; // selected curves used to generate curve interpolation
    listAvg: boolean[];
    adjustCurves: (algo: string, curves: string[], parameters: {curve: string, parameter: string, value: number}[] ) => void;
    resetConsolidationActions: (algo: string) => void;
    unselectAll: boolean; // deselect all checked curves for failure operation
    cleanError: () => void;
    selectConsolidationAlgo: (algo: string) => void;
};

const Consolidation: React.FC<IConsolidation> = (props) => {

    const [selectedTab,setSelectedTab] = useState('1');
    const [checkedFailureCurves,setCheckedFailureCurves] = useState<string[]>([]);  // selected curves to be adjusted
    const [checkedStiffnessCurves,setCheckedStiffnessCurves] = useState<string[]>([]);
    const [parameterValues,setParameterValues] = useState<{curve: string, parameter: string, value: number}[] >([]);
    const [adjustStatus,setAdjustStatus] = useState<string>("");

    useEffect(()=>{
        let parameterValuesInit: {curve: string, parameter: string, value: number}[] = [];
        for(let index=0; index<props.groupData.length; index++){
            if(props.postData[index].length>1){
                const young_value = (props.postData[index].find(p => p.name==='young')?props.postData[index].find(p => p.name==='young').value:undefined);
                const strain_value = (props.xunit==="POURCENT"?1.0:0.01);
                parameterValuesInit.push({curve: props.groupData[index].title, parameter: 'young', value: young_value });
                parameterValuesInit.push({curve: props.groupData[index].title, parameter: 'strain', value: strain_value });
            }
        }
        setParameterValues(parameterValuesInit);
    },[props.postData]);

    useEffect(() => {
        setCheckedFailureCurves([]);
    },[props.unselectAll]);
    
    const { TabPane } = Tabs;

    const onChangeHandler = (key: string) => {
        setSelectedTab(key);
        const algo = (key==='1'?'failure':'stiffness');
        props.selectConsolidationAlgo(algo);
    }
    
    const onFailureHandler = (e) => {
        const ind = checkedFailureCurves.findIndex(it => it === e.target.value);
        if(ind===-1){
            const up = [...checkedFailureCurves, e.target.value];
            setCheckedFailureCurves(up);
        } else {
            const up = [...checkedFailureCurves];
            up.splice(ind,1);
            setCheckedFailureCurves(up);
        }  
    }
    
    const onClickAdjustHandler = () => {
        if(checkedFailureCurves.length===0&&checkedStiffnessCurves.length===0)
           return;
        const algo = (selectedTab==='1'?'failure':'stiffness');
        setAdjustStatus(algo);
        if(algo==='failure')
          props.adjustCurves(algo,checkedFailureCurves,null);
        else if(algo==='stiffness')
          props.adjustCurves(algo,checkedStiffnessCurves,parameterValues);
    }

    const onClickResetHandler = () => {
        setAdjustStatus('');
        props.cleanError();
        const algo = (selectedTab==='1'?'failure':'stiffness');
        if(algo==='failure'){
           setCheckedFailureCurves([]);
           props.resetConsolidationActions(algo);
        } else if(algo==='stiffness') {
           setCheckedStiffnessCurves([]);
           props.resetConsolidationActions(algo);
        }
    }

    const cancelEnabled = ((selectedTab==='1'&&adjustStatus==='failure')||(selectedTab==='2'&&adjustStatus==='stiffness'));

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
    <div style={{height: '410px', fontWeight: 'normal', fontSize: '12px', borderStyle: 'solid', borderWidth: '2px', borderColor: '#d9d9d9', margin: 'auto', padding: '10px'}}>
    <Tabs 
        style={{ height: '350px', borderStyle: 'solid', borderWidth: '1px', borderColor: '#d9d9d9', margin: 'auto', padding: '10px'}}
        onChange={onChangeHandler} type="card">
        <TabPane tab="Failure" key="1">
            <Divider orientation='left' style={{fontSize: '12px'}}>Select 2 or 3 averaged curves</Divider>
                {props.groupData.map( (g,index) => {
                    if(props.listAvg[index]){
                      const dis = (props.selectedCurves.findIndex( e => e===g.title)===-1?false:true);
                      const checked = (checkedFailureCurves.findIndex(e => e===g.title)===-1?false:true);
                      return(
                        <Row key={'row'+index} >
                          <Checkbox  style={{fontSize: '12px'}} value={g.title} disabled={dis} checked={checked} onChange={onFailureHandler}> <LineOutlined style={{fontSize: '24px', verticalAlign: 'middle', color: colors[index]}}/>{g.title}</Checkbox>
                        </Row>
                      )
                    }
                })
            }
        </TabPane>

        <TabPane tab="Stiffness" key="2">
          <Divider orientation='left' style={{fontSize: '12px'}}>Elastic Range Correction</Divider>
            <Row style={{fontSize: '12px', fontWeight: 'bold', paddingBottom: '10px'}}>
                <Col span={8}>
                     Group
                </Col>
                <Col span={8}>
                    Targeted Young
                </Col>
                <Col span={8}>
                    Strain Range
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
                              defaultValue={ (parameterValues.find(e => e.parameter==='young')?parameterValues.find(e => e.parameter==='young').value:0) }
                              step={10}
                              onChange={  (event:any) =>onChangeParameterHandler(event,g.title,'young')}
                          />
                          </Col>
                          <Col span={8}>
                          <InputNumber
                              key='strain'
                              size="small"
                              defaultValue={ (parameterValues.find(e => e.parameter==='strain')?parameterValues.find(e => e.parameter==='strain').value:0) }
                              step={0.01}
                              onChange={  (event:any) => onChangeParameterHandler(event,g.title,'strain')}
                          />
                          </Col>

                      </Row>
                 );
             }
           })}  
        </TabPane>
    </Tabs>
    <Space style={{ float: 'right', paddingRight: '7px', paddingBottom: '10px', paddingTop: '10px'}}>
                <Button style={{fontSize: '12px'}} size="small" type="primary" onClick={onClickAdjustHandler}>Adjust</Button>
                <Button style={{fontSize: '12px'}} size="small" type="primary" disabled={!cancelEnabled} onClick={onClickResetHandler}>Reset</Button>
           </Space>
    </div>
    </>);
}

export default Consolidation;
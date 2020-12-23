import React, { useState } from 'react';
import { GroupData } from '../../data.model';
import { Space, Tree, Radio, Input } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import CurveSelection from './CurveSelection/CurveSelection'

interface CurveControlsProps {
   groupData: GroupData[];
   checkedKeys: string[];
   onCheck: any;
};

const CurveControls: React.FC<CurveControlsProps> = (props) => {
    const [group,setGroup] = useState(0);

    const onChangeGroup = (e: RadioChangeEvent) => {
        console.log('radio checked', e.target.value);
        const group_index = e.target.value;
        setGroup(group_index);
        const keys = [];
        props.groupData[group_index].treeData.forEach( (c,index) => {
            const key = group_index.toString()+'-'+index;
            keys.push(key);
        })
        props.onCheck(keys,group_index)
    };

    const onCheckCurve = (e) => {
        props.onCheck(e,group);
    }

   
    const radioStyle = {
        display: 'block',
        height: '30px',
        lineHeight: '30px',
    };

    return(
        <>
        <div style={{borderStyle: 'solid', borderWidth: '2px', margin: 'auto', padding: '10px'}}>
          <h1 style={{textAlign: 'center'}}>
            Curves
          </h1>
          <br/>
          <Space align='start'>
            <Radio.Group onChange={onChangeGroup} value={group}>{
                props.groupData.map( (g,index) => {
                    return(
                    <Radio style={radioStyle} value={index}>{g.title}</Radio>
                    );
                })
            }</Radio.Group>
                <CurveSelection 
                    treeData = {props.groupData[group].treeData}
                    checkedKeys = {props.checkedKeys}
                    onCheck = {onCheckCurve}
                />
          </Space>
        </div>
        </>
    );
}
export default CurveControls;
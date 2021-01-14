import React, { useState } from 'react';
import { Tree } from 'antd';
import { CurveData } from '../../../data.model';

interface CurveSelection {
    treeData: CurveData[];
    checkedKeys: string[];
    onCheck: any;
 };
 
 const CurveSelection: React.FC<CurveSelection> = (props) => {
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [autoExpandParent, setAutoExpandParent] = useState(true);

    const onSelect = (selectedKeys, info) => {
        console.log('onSelect', info);
        setSelectedKeys(selectedKeys);
      };

     return(
        <>
            <Tree
            showIcon
            checkable
            checkedKeys={props.checkedKeys}
            selectedKeys={selectedKeys}
            onCheck={props.onCheck}
            onSelect={onSelect}
            autoExpandParent={autoExpandParent}
            treeData={props.treeData} />
        </>
     );
}
export default CurveSelection;
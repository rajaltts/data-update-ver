import React, { useState } from 'react';
import { Tree } from 'antd';
// const treeData = [
//   {
//     title: 'group1',
//     key: '0-0',
//     children: [
//         {
//           title: 'curve1',
//           key: '0-1',
//         },
//         {
//           title: 'curve2',
//           key: '0-2',
//         },
//         {
//           title: 'curve3',
//           key: '0-3',
//         },
//       ],
    
//   },
//   {
//     title: 'group2',
//     key: '1-0',
//     children: [
//       {
//         title: 'curve1',
//         key: '1-1',
//       },
//       {
//         title: 'curve2',
//         key: '1-2',
//       },
//       {
//         title: 'curve3',
//         key: '1-3',
//       },
//     ],
//   }
// ];
//const treeData = [ {title: 'no data', key: '0-0', disabled: true} ];

const DataTree = (props) => {
  const [expandedKeys, setExpandedKeys] = useState(['0-0']);
  //const [checkedKeys, setCheckedKeys] = useState(['0-0']);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  const onExpand = (expandedKeys) => {
    console.log('onExpand', expandedKeys); // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.

    setExpandedKeys(expandedKeys);
    setAutoExpandParent(false);
  };

//   const onCheck = (checkedKeys) => {
//     console.log('onCheck', checkedKeys);
//     const last = checkedKeys[checkedKeys.length-1];
//     console.log(last);
//     //const group_index = last.charAt(0);
//     const group_index = checkedKeys[checkedKeys.length-1].charAt(0);
    
//     console.log(group_index);
//     const keys = [];
//     checkedKeys.forEach( (item, index) =>
//         {
//             if(item.charAt(0)===group_index)
//              keys.push(item);
//         });
//     console.log(keys);
//     setCheckedKeys(keys);
//   };

  const onSelect = (selectedKeys, info) => {
    console.log('onSelect', info);
    setSelectedKeys(selectedKeys);
  };

  return (
    <Tree
      checkable
      multiple='true'
      onExpand={onExpand}
      expandedKeys={expandedKeys}
      autoExpandParent={autoExpandParent}
      onCheck={props.onCheck}
      checkedKeys={props.checkedKeys}
      onSelect={onSelect}
      selectedKeys={selectedKeys}
      treeData={props.treeData}
    />
  );
};

export default DataTree;

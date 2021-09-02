import React from 'react';
import {LineOutlined} from '@ant-design/icons';

const InitialModel = {
    type: 'tensile', xtype: '', ytype: '', xunit: '', yunit: '', measurement: 'engineering',
    groups: [{id: -1,
              curves: [ {id: -1, x: [], y: [], name: 'toto', selected: false, opacity: 0, x0: [], y0: [], oid:'', matDataLabel:'', label:''} ],
              data: [ {label: '', value: 0} ],
              label:'',
              result: false
             }
            ],
    tree: { groupData: [ {title:'group1',
                          treeData: [{title: 'curve1', key: '0-0', icon: <LineOutlined/>}],
                          keys: [],
                          resultsView: 0
                          }
                        ],
            selectedGroup: 0}
};

export default InitialModel;
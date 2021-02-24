export type Curve = {
    id: number;
    x: number[];
    y: number[];
    name: string;
    selected: boolean;
    opacity: number;
    x0: number[];
    y0: number[];
    oid: string;
    matDataLabel: string;
    label: string;
};


export type Group = {
    id: number;
    curves: Curve[]; 
    data: any[];
    label: string;
};

export type Data = {
    type: string;
    xtype: string;
    ytype: string;
    xunit: string;
    yunit: string;
    groups: Group[];
    tree: Tree;
};

// use to initialize ant Tree component
export type CurveData = {
    title: string; // curve name
    key: string;   // group_id-curve_id
    icon: any;
};

export type GroupData = {
    title: string; // group name
    treeData: CurveData[];
    keys: string[];
}

export type Tree = {
    groupData: GroupData[] ;
    selectedGroup: number;
};




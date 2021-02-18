
export type Selection = {
 label: string;
  name: string;
};

export type Range = {
  min: number;
  max: number;
};

export type Parameter = {
    label: string;
    name: string;
    selection?: Selection[];
    range?: Range;
    value: number;
   };
   
   export type Method = {
    label: string;
    type: string;
    params: Parameter[];
   };
   
   export type Operation = {
    action: string;
    action_label: string;
    methods: Method[];
    selected_method: string;
    status: string;
    error: string;
   };
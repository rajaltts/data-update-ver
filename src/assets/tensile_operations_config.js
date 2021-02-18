// for tensile case
export const tensile_operations_config = [
    {
        action: 'Convert',
        action_label: 'Convert',
        methods: [
            { 
                label: 'Engineering to True',
                type: 'Engineering_to_true',
                params: []
            },
            { 
                label: 'None',
                type: 'None',
                params: []
            }
        ],
        selected_method: 'Engineering_to_true',
        status: 'waiting',
        error: ''
    },
    {
        action: 'Cleaning_ends',
        action_label: 'Cleaning ends',
        methods: [
            { 
                label: 'None',
                type: 'None',
                params: []
            },
            {
                label: 'Strength',
                type: 'Y_Max',
                params: []
            },
            {
                label: 'Max strain',
                type: 'X_Max',
                params: []
            },
            {
                label: 'Strain',
                type: 'Max_X',
                params: [{label: 'value', name: 'value',  value: 0.05}]
            },
            {
                label: 'Stress',
                type: 'Max_Y',
                params: [{label: 'value', name: 'value',  value: 1000}]
            }
        ],
        selected_method: 'None',
        status: 'waiting',
        error: ''
    },
    {
        action: 'Shifting',
        action_label: 'Shifting',
        methods: [
            { 
                label: 'None',
                type: 'None',
                params: []
            },
            {
                label: 'Defined strain',
                type: 'X_shift_defined',
                params: [{label: 'value', name: 'value',  value: -0.01}]
            },
            {
                label: 'Stiffness stress based',
                type: 'X_tangent_yrange',
                params: [{label: 'min stress', name: 'min', value: 0},
                         {label: 'max stress', name: 'max', value: 100}]
            },
            {
                label: 'Stiffness strain based',
                type: 'X_tangent_xrange',
                params: [{label: 'min strain', name: 'min', value: 0},
                         {label: 'max strain',  name: 'max',value: 0.001}]
            }
        ],
        selected_method: 'None',
        status: 'waiting',
        error: ''
    },
    {
        action: 'Averaging',
        action_label: 'Averaging',
        methods: [
            { 
                label: 'none',
                type: 'None',
                params: []
            },
            {
                label: 'spline',
                type: 'Spline',
                params: [{label:'number of points', name: 'number_of_points',  value: 30},
                         {label:'number of nodes', name: 'number_of_nodes', value: 10, range: {min: 5, max: 20}},
                         {label:'regularization', name: 'regularization', value: 5, range: {min: 1, max: 9}},
                         {label:'Averaging end point method', name: 'end_point',  selection: [{label:'strain',name:'x_value'},
                                                                                              {label:'mean max strain', name:'mean_max_x'},
                                                                                              {label:'min max strain', name:'min_max_x'}
                                                                                             ],
                                                                                             value: 2},
                         {label:'end point value', name: 'end_point_value',  value: undefined},
                         {label:'Extrapolation method', name: 'extrapolation', selection:[{label:'none',name:'none'},
                                                                                          {label:'based on specific curve', name:'based_on_curve'},
                                                                                          {label:'tangent', name:'tangent'}
                                                                                         ],
                                                                                         value: 2},
                        {label: 'extrapolation end point', name: 'extrapolating_end_point', selection:[{label:'mean max strain', name:'mean_max_x'},
                                                                                                        {label:'max max strain', name:'max_max_x'}
                                                                                                      ],
                                                                                                      value: 1}
                         ]
            },
            {
                label: 'polynomial',
                type: 'Polynomial',
                params: [{label:'number of points', name: 'number_of_points', value: 30},
                         {label:'order', name: 'order', value: 6},
                         {label:'Averaging end point method', name: 'end_point',  selection: [{label:'strain',name:'x_value'},
                                                                                              {label:'mean max strain', name:'mean_max_x'},
                                                                                              {label:'min max strain', name:'min_max_x'}
                                                                                            ], value: 2},
                         {label:'end point value', name: 'end_point_value',  value: undefined},
                         {label:'Extrapolation method', name: 'extrapolation', selection:[{label:'none',name:'none'},
                                                                                          {label:'based on specific curve', name:'based_on_curve'},
                                                                                          {label:'tangent', name:'tangent'}
                                                                                        ],
                                                                                        value: 0}
                        ]
            }
        ],
        selected_method: 'None',
        status: 'waiting',
        error: ''
    }
];
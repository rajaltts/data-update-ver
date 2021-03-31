// for tensile case
export const tensile_operations_config = [
    {
        action: 'Cleaning_ends',
        action_label: 'Cleaning Ends',
        methods: [
            { 
                label: 'None',
                type: 'None',
                params: []
            },
            {
                label: 'Max Stress',
                type: 'Y_Max',
                params: []
            },
            {
                label: 'Max Strain',
                type: 'X_Max',
                params: []
            },
            {
                label: 'User Defined Strain',
                type: 'Max_X',
                params: [{label: 'Value', name: 'value',  value: 0.05, float: true }]
            },
            {
                label: 'User Defined Stress',
                type: 'Max_Y',
                params: [{label: 'Value', name: 'value',  value: 1000, float: true}]
            },
            {
                label: 'User Defined Point',
                type: 'Max_Xs',
                params: [ {label: '', name: 'value', value: [], curveId: []}]
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
                label: 'User Defined Strain',
                type: 'X_shift_defined',
                params: [{label: 'Value', name: 'value',  value: 0, float: true}]
            },
            {
                label: 'Linear Regression Stress',
                type: 'X_tangent_yrange',
                params: [{label: 'Initial Stress', name: 'min', value: 0, float: true},
                         {label: 'Final Stress', name: 'max', value: undefined, float: true}]
            },
            {
                label: 'Linear Regression Strain',
                type: 'X_tangent_xrange',
                params: [{label: 'Initial Strain', name: 'min', value: 0, float: true},
                         {label: 'Final Strain',  name: 'max',value: 0.001, float: true}]
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
                label: 'None',
                type: 'None',
                params: []
            },
            {
                label: 'Spline',
                type: 'Spline',
                params: [{label:'Number of Points', name: 'number_of_points',  value: 30},
                         {label:'Number of Nodes', name: 'number_of_nodes', value: 10, range: {min: 5, max: 100}},
                         {label:'Smoothing', name: 'regularization', value: 5, range: {min: 1, max: 9}},
                         {label:'Averaging End Point', name: 'end_point',  selection: [{label:'User Defined Strain',name:'x_value',link:'end_point_value'},
                                                                                              {label:'Min Max Strain', name:'min_max_x'}
                                                                                             ],
                                                                                             value: 1},
                         {label:'Value', name: 'end_point_value',  value: undefined, float: true, conditional: 'end_point'},
                         {label:'Extrapolation Method', name: 'extrapolation', selection:[{label:'None',name:'none'},
                                                                                          {label:'Max Strain Curve', name:'based_on_curve'},
                                                                                          {label:'Tangent', name:'tangent'}
                                                                                         ],
                                                                                         value: 1},
                        {label: 'Extrapolation End Point', name: 'extrapolating_end_point', selection:[{label:'Mean Max Strain', name:'mean_max_x'},
                                                                                                        {label:'Max Max Strain', name:'max_max_x'},
                                                                                                        {label:'User Defined Strain',name:'x_value',link:'extrapolating_end_point_value'}
                                                                                                      ],
                                                                                                      value: 0},
                        {label:'Value', name: 'extrapolating_end_point_value',  value: undefined, float: true, conditional: 'extrapolating_end_point'},   
                         ]
            },
            {
                label: 'Polynomial',
                type: 'Polynomial',
                params: [{label:'Number of points', name: 'number_of_points', value: 30},
                         {label:'Order', name: 'order', value: 6},
                         {label:'Averaging End Point', name: 'end_point',  selection: [{label:'User Defined Strain',name:'x_value',link:'end_point_value'},
                                                                                              {label:'Min Max Strain', name:'min_max_x'}
                                                                                            ], value: 1},
                         {label:'Value', name: 'end_point_value',  value: undefined, float: true, conditional: 'end_point'},
                         {label:'Extrapolation Method', name: 'extrapolation', selection:[{label:'None',name:'none'},
                                                                                          {label:'Max Strain Curve', name:'based_on_curve'},
                                                                                          {label:'Tangent', name:'tangent'}
                                                                                        ],
                                                                                        value: 1},
                        {label: 'Extrapolation End Point', name: 'extrapolating_end_point', selection:[ {label:'Mean Max Strain', name:'mean_max_x'},
                                                                                                        {label:'Max Max Strain', name:'max_max_x'},
                                                                                                        {label:'User Defined Strain',name:'x_value',link:'extrapolating_end_point_value'}
                                                                                                      ],
                                                                                                      value: 0},
                        {label:'Value', name: 'extrapolating_end_point_value', value: undefined, float: true, conditional: 'extrapolating_end_point'},   
                        ]
            }
        ],
        selected_method: 'None',
        status: 'waiting',
        error: ''
    }
];
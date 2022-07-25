// for tensile case
export enum ACTION {
    CleaningEnds = 0,
    Shifting,
    Averaging,
  };


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
                tip: 'Remove after maximum stress',
                params: []
            },
            {
                label: 'Max Strain',
                type: 'X_Max',
                tip: 'Remove after maximum strain',
                params: []
            },
            {
                label: 'User Defined Strain',
                type: 'Max_X',
                tip: 'Remove after a given stress',
                params: [{label: 'Value', name: 'value',  value: 0.05, float: true }]
            },
            {
                label: 'User Defined Stress',
                type: 'Max_Y',
                tip: 'Remove after a given strain',
                params: [{label: 'Value', name: 'value',  value: 1000, float: true}]
            },
            {
                label: 'User Defined Point',
                type: 'Max_Xs',
                tip: 'Remove after a selected point',
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
            // {
            //     label: 'User Defined Strain',
            //     type: 'X_shift_defined',
            //     tip: 'Shift all curves by a given value',
            //     params: [{label: 'Value', name: 'value',  value: 0, float: true}]
            // },
            {
                label: 'Linear Regression Stress',
                type: 'X_tangent_yrange',
                tip: 'Shift each curve to ensure curve passing by the origin using points in a defined stress range',
                params: [{label: 'Initial Stress', name: 'min', value: 0, float: true},
                         {label: 'Final Stress', name: 'max', value: undefined, float: true}]
            },
            {
                label: 'Linear Regression Strain',
                type: 'X_tangent_xrange',
                tip: 'Shift each curve to ensure curve passing by the origin using points in a defined strain range',
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
                tip: 'Interpolate curves using cubic splines',
                params: [{label:'Number of Points', name: 'number_of_points',  value: 100, tip: 'Number of averaging curve points'},
                         {label:'Number of Splines', name: 'number_of_nodes', value: 10, range: {min: 5, max: 100}, tip: 'Number of cubic splines'},
                         {label:'Smoothing', name: 'regularization', value: 5, range: {min: 1, max: 9}, tip: 'Smoothing effect'},
                         {label:'Range for Averaging', name: 'end_point', tip: 'Strain range used to compute the averaged curve',
                                selection: [{label:'User Defined Strain',name:'x_value',link:['end_point_value'], tip:'Define the end strain range  to compute the averaged curve'},
                                            {label:'Default', name:'min_max_x', tip:'Compute the averaged curve on the largest possible strain range'}
                                            ],
                                value: 1},
                         {label:'Value', name: 'end_point_value',  value: undefined, float: true, conditional: 'end_point'},
                         {label:'Extrapolation Method', name: 'extrapolation', tip: 'Define how the averaged curved is prolongated',
                                selection:[{label:'None',name:'none'},
                                           {label:'Max Strain Curve', name:'based_on_curve', tip: 'Use the shape of the largest strain curve'},
                                           {label:'Tangent', name:'tangent', tip: 'Use a straight line to prologate'}
                                           ],
                                value: 1},
                        {label: 'Extrapolation End Point', name: 'extrapolating_end_point', tip: 'Define the end strain value',
                                selection:[{label:'Mean Strain', name:'mean_max_x', tip: 'Use the average of all  end strain values'},
                                           {label:'Max Strain', name:'max_max_x', tip: 'Use the largest strain of all end strain values'},
                                           {label:'User Defined Strain',name:'x_value',link:['extrapolating_end_point_value'], tip: 'Define the largest strain value.\nWARNING: Can be larger than max strain. No check performed.'}
                                           ],
                                value: 0},
                        {label:'Value', name: 'extrapolating_end_point_value',  value: undefined, float: true, conditional: 'extrapolating_end_point'},
                        {label:'Averaging Type', name: 'averaging_type', tip:'Define how curves are averaged', advanced: true,
                                selection: [{label:'Standard',name:'standard',tip:'Unweighted average'},
                                            {label:'Weighted',name:'weighted',tip:'Weighted average. Select a curve on the plot area.'}],      
                                value:0},
                        {label:'Linear Correction', name:'linear_correction', tip: 'Define a targeted stiffness',  advanced: true,
                              selection: [{label:'No',name:'linear_correction_no',tip: ''},
                                          {label:'Yes',name:'linear_correction_yes',link:['linear_correction_stiffness','linear_correction_strain'],tip: ''}],
                              value: 0},  
                        {label:'Stiffness', name:'linear_correction_stiffness', tip: 'Define a targeted stiffness',  advanced: true, value: undefined, float: true, conditional: 'linear_correction'},
                        {label:'Strain', name:'linear_correction_strain', tip: 'Define strain value',  advanced: true, value: undefined, float: true, conditional: 'linear_correction'},
                        {label:'Distribution', name:'distribution', tip: 'Define points distribution',  advanced: true, 
                           selection:[{label:'Linear refinement', name:'linear_refinement', tip: 'Special refinelement to compute Young modulus'}],
                           value: 0},
                         ]
            },
            {
                label: 'Polynomial',
                type: 'Polynomial',
                tip: 'Interpolate curves using a polynomial function',
                params: [{label:'Number of points', name: 'number_of_points', value: 100, tip: 'Number of averaging curve points' },
                         {label:'Order', name: 'order', value: 6, tip: 'Polynomial order of the interpolated curve'},
                         {label:'Range for Averaging', name: 'end_point', tip: 'Strain range used to compute the averaged curve',
                                selection: [{label:'User Defined Strain',name:'x_value',link:['end_point_value'], tip:'Define the end strain range  to compute the averaged curve'},
                                            {label:'Default', name:'min_max_x', tip:'Compute the averaged curve on the largest possible strain range'}
                                            ],
                                value: 1},
                         {label:'Value', name: 'end_point_value',  value: undefined, float: true, conditional: 'end_point'},
                         {label:'Extrapolation Method', name: 'extrapolation', tip: 'Define how the averaged curved is prolongated',
                                selection:[{label:'None',name:'none'},
                                           {label:'Max Strain Curve', name:'based_on_curve', tip: 'Use the shape of the largest strain curve'},
                                           {label:'Tangent', name:'tangent', tip: 'Use a straight line to prologate'}
                                           ],
                                value: 1},
                        {label: 'Extrapolation End Point', name: 'extrapolating_end_point', tip: 'Define the end strain value',
                                selection:[{label:'Mean Strain', name:'mean_max_x', tip: 'Use the average of all  end strain values'},
                                           {label:'Max Strain', name:'max_max_x', tip: 'Use the largest strain of all end strain values'},
                                           {label:'User Defined Strain',name:'x_value',link:['extrapolating_end_point_value'], tip: 'Define the largest strain value.\nWARNING: Can be larger than max strain. No check performed.'}
                                           ],
                                value: 0},
                        {label:'Value', name: 'extrapolating_end_point_value',  value: undefined, float: true, conditional: 'extrapolating_end_point'},
                        {label:'Averaging Type', name: 'averaging_type', tip:'Define how curves are averaged', advanced: true,
                                selection: [{label:'Standard',name:'standard',tip:'Unweighted average'},
                                            {label:'Weighted',name:'weighted',tip:'Weighted average. Select a curve on the plot area.'}],      
                                value:0},
                        {label:'Linear Correction', name:'linear_correction', tip: 'Define a targeted stiffness',  advanced: true,
                              selection: [{label:'No',name:'linear_correction_no',tip: ''},
                                          {label:'Yes',name:'linear_correction_yes',link:['linear_correction_stiffness','linear_correction_strain'],tip: ''}],
                              value: 0},  
                        {label:'Stiffness', name:'linear_correction_stiffness', tip: 'Define a targeted stiffness',  advanced: true, value: undefined, float: true, conditional: 'linear_correction'},
                        {label:'Strain', name:'linear_correction_strain', tip: 'Define strain value',  advanced: true, value: undefined, float: true, conditional: 'linear_correction'},
                        {label:'Distribution', name:'distribution', tip: 'Define points distribution',  advanced: true, 
                           selection:[{label:'Linear refinement', name:'linear_refinement', tip: 'Special refinelement to compute Young modulus'}],
                           value: 0},    
                        ]
            }
        ],
        selected_method: 'None',
        status: 'waiting',
        error: ''
    }
];
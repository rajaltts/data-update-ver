import React from 'react';
import OperationControl from './OperationControl/OperationControl';
import classes from './OperationControls.module.css';

// const operations = [
//     { label: 'Cleaning End auto', type: 'op_cleaning_end_auto'},
//     { label: 'Cleaning End manual', type: 'op_cleaning_end_manual'},
//     { label: 'Shifting', type: 'op_shifting'},
//     { label: 'Averaging', type: 'op_averaging'},
//     { label: 'Template', type: 'op_template_plastic_tensile'},
// ];

const operationControls = (props) =>  (
    <div className={classes.OperationControls}> 
        {props.operations.map(op => (
            <OperationControl
                key={op.type}
                label={op.label}
                hasParam={op.hasParam}
                value={op.value}
                changed= { (event) => props.changedParam(event,op.type) }
                updated={() => props.updatedCurve(op.type)} // and not props.updatedCurve(op.type), we need to give  fct and not a value of this fct
            />
        ))}
    </div>
);

export default operationControls;
import React from 'react';
import classes from './OperationControl.module.css';
import PropTypes from 'prop-types';

const operationControl = (props) => (
    <div className={classes.OperationControl}>
        <div className={classes.Label}>{props.label}</div>
        { props.hasParam && <input type="text" value={props.value.toString()} onChange={props.changed} /> }
        <button className={classes.button} onClick={props.updated}>Apply</button>
    </div>
);

// const operationControl = (props) => (
//     <div>
//         <div>{props.label}</div>
//         <button onClick={props.updated}>Apply</button>
//     </div>
// );

// operationControl.propTypes = {
//     value: PropTypes.number
// };

export default operationControl;
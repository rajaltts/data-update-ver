import React, { Fragment } from 'react';

const physicalMeasurementForm = (props) =>  {
    const variable = props.variable;
    
    if(variable==='x'){
        return(
            <Fragment>
                <form>
                    <label>
                    Select X type: 
                    <select value={props.value} onChange={props.handleChange}>
                        <option value="strain_true">Strain true</option>
                        <option value="strain_engineering">Strain engineering</option>
                    </select>
                    </label>
                </form>
            </Fragment>
        );

    } else if(variable==='y'){
        return(
            <Fragment>
                <form>
                    <label>
                    Select Y type: 
                    <select value={props.value} onChange={props.handleChange}>
                        <option value="stress_true">Stress true</option>
                        <option value="stress_engineering">Stress engineering</option>
                    </select>
                    </label>
                </form>
            </Fragment>
        );

    }

    

}

    


export default physicalMeasurementForm;
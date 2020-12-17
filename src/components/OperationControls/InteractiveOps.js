import React from 'react';
import OperationControl from './OperationControl/OperationControl';

import { Collapse } from 'antd';

const interactiveOps = (props) => {
    const { Panel } = Collapse;

    function handleUpdate(event,type) {
        props.updated(event,type);
    }

    return(
        <Collapse accordion>{
            props.operations.map( op =>{
                if(op.action!=='Template')
                    return(
                        <Panel header={op.action} key={op.action}>{
                            <OperationControl
                                methods = {op.methods}
                                default_method = {op.default_method}
                                updated= {handleUpdate}        
                            />
                        }
                        </Panel>
                    );
            }
            )
        }
        </Collapse>
    );


};

export default interactiveOps;
import React from 'react';
import { Col, Row} from 'antd';
import PlotCurve from '../../components/PlotCurve/PlotCurve';
import CurveControls from '../../components/CurveControls/CurveControls'
import Steps from '../../components/Steps/Steps';
import { Operation } from '../../template.model';
import { Data} from '../../data.model';

interface PlotBuilderViewProps {
    data: Data;
    operations: Operation[];
    plotUpdate: boolean;
    showMarkers: boolean;
    changeOperationsHandler_: (nops: Operation[]) => void;
    changeSelectedMethodHandler_: (m: string, a: string ) =>void;
    updatedCurveHandler_:(a: string) => void;
    clickPointHandler_: (dp: any) =>  boolean;
    restoreInitdataHandler_:(i: number) => void;
    updatePlotHandler_: () => void;
    removeAllPoints_: () => void;
    changeViewHandler_: (i: number) => void;
    checkDataTreeHandler_: (ss: string[], i: number) => void;
    convertToTrueHandler_: () => void;
}

const PlotBuilderView: React.FC<PlotBuilderViewProps> = (props)  => {

    const {
        data,
        operations,
        plotUpdate,
        showMarkers,
        changeOperationsHandler_,
        changeSelectedMethodHandler_,
        updatedCurveHandler_,
        clickPointHandler_,
        restoreInitdataHandler_,
        updatePlotHandler_,
        removeAllPoints_,
        changeViewHandler_,
        checkDataTreeHandler_,
        convertToTrueHandler_,
    } = props;

    //------FUNCTIONS---------------------------------------------------
    // --from props----
    const changeOperationsHandler = (new_ops: Operation[]) => {changeOperationsHandler_(new_ops)}
    const changeSelectedMethodHandler = (selectedMethod: string,action: string) => {changeSelectedMethodHandler_(selectedMethod,action)};
    const updatedCurveHandler = (action) => { updatedCurveHandler_(action) };
    const clickPointHandler = (data_plot: any) => { return clickPointHandler_(data_plot)};
    const restoreInitdataHandler = (gid: number) => {restoreInitdataHandler_(gid)};
    const updatePlotHandler = () => {updatePlotHandler_()};
    const removeAllPoints = () => { removeAllPoints_()};
    const changeViewHandler = (val: number) => {changeViewHandler_(val)};
    const checkDataTreeHandler =  (checkedKeys: string[], group_id: number) => { checkDataTreeHandler_(checkedKeys,group_id)};
    const convertToTrueHandler = () => {convertToTrueHandler_()};

    // --internal functions---
    const axisLabel = { xlabel: data.xtype, ylabel: data.ytype };

    const dataTypeHandler = () => {
        return (data.type === undefined?'tensile':data.type);
    }
    
    return (
        <>
        <div className="OuterDivScroll">
        <div style={{paddingTop: '20px'}}>
            <Row justify="space-around">
                <Col span={6}>
                    <Steps operations={operations}
                           changeSelectedMethod={changeSelectedMethodHandler}
                           updatedCurve={updatedCurveHandler}
                           changeOperations={changeOperationsHandler}
                           restoreInitdata={restoreInitdataHandler}
                           updatePlot={updatePlotHandler}
                           removeAllPoints={removeAllPoints}
                           dataType={dataTypeHandler()}
                    />
                </Col>
                <Col span={12}>
                    <PlotCurve
                       group={data.tree.selectedGroup}
                       curves={data.groups[data.tree.selectedGroup].curves}
                       data={data.groups[data.tree.selectedGroup].data}
                       keys={data.tree.groupData[data.tree.selectedGroup].keys}
                       axisLabel={axisLabel}
                       clickPoint={clickPointHandler}
                       plotUpdate={plotUpdate}
                       showMarkers={showMarkers}
                       resultsView={data.tree.groupData[data.tree.selectedGroup].resultsView}
                       changeView={changeViewHandler}
                      />
                </Col>
                <Col span={6}>
                    <CurveControls 
                        groupData={data.tree.groupData}
                        onCheck={checkDataTreeHandler}
                        measurement={data.measurement}
                        convertToTrue={convertToTrueHandler}
                        />
                        
                </Col>
            </Row>
            </div>
            </div>
    </>
        
    );
};

export default PlotBuilderView;
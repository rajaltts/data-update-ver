import React, {useState, useEffect} from 'react';
import { Col, Row, Tabs, Collapse} from 'antd';
import PlotCurve from '../../components/PlotCurve/PlotCurve';
import CurveControls from '../../components/CurveControls/CurveControls'
import Steps from '../../components/Steps/Steps';
import { Operation } from './Model/template.model';
import { Data} from './Model/data.model';
import Consolidation from '../../components/Consolidation/Consolidation';
const { TabPane } = Tabs;
const { Panel } = Collapse;

interface PlotBuilderViewProps {
    data: Data;
    interpolationData: {x: number[], y: number[]};
    operations: Operation[];
    plotUpdate: boolean;
    showMarkers: boolean;
    plotMode: string;
    changeOperationsHandler_: (nops: Operation[]) => void;
    changeSelectedMethodHandler_: (m: string, a: string ) =>void;
    updatedCurveHandler_:(a: string, post: () => void) => void;
    clickPointHandler_: (dp: any) =>  boolean;
    restoreInitdataHandler_:(i: number) => void;
    updatePlotHandler_: () => void;
    removeAllPoints_: () => void;
    changeViewHandler_: (i: number) => void;
    checkDataTreeHandler_: (ss: string[], i: number) => void;
    convertToTrueHandler_: () => void;
    changeCollapseHandler_: (key: string | string[]) => void;
    failureInterpolationHandler_: (curves: string[]) =>  void;
    adjustCurvesHandler_: (algo:string, curves:string[], parameters: {curve: string, parameter: string, value: number}[], post: () => void) => void;
    cancelAdjustCurvesHandler_: () => void;
}

const PlotBuilderView: React.FC<PlotBuilderViewProps> = (props)  => {

    const {
        data,
        interpolationData,
        operations,
        plotUpdate,
        showMarkers,
        plotMode,
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
        changeCollapseHandler_,
        failureInterpolationHandler_,
        adjustCurvesHandler_,
        cancelAdjustCurvesHandler_

    } = props;

    // --- STATE VARIABLES --------------------------------------------
    // Stae variables only used for View, they do not change the Model
    const [displayGids,setDisplayGids] = useState<string[]>([]);
    const [selectedCurves,setSelectedCurves] = useState<string[]>([]);
    const [computationInProgress,setComputationInProgress] = useState(false);

    // --- EFFECT -----------------------------------------------------
    useEffect( () => {
        let k = new Array();
        for(let gid=0; gid<data.groups.length; gid++){
            k.push('0-'+gid.toString());
        }
        setDisplayGids(k);
    },[plotUpdate])

    //------FUNCTIONS---------------------------------------------------
    const postOp = () => {
        setComputationInProgress( false );
    };
    // --from props----
    const changeOperationsHandler = (new_ops: Operation[]) => {changeOperationsHandler_(new_ops)}
    const changeSelectedMethodHandler = (selectedMethod: string,action: string) => {changeSelectedMethodHandler_(selectedMethod,action)};
    const updatedCurveHandler = (action) => { 
        setComputationInProgress( true); 
        updatedCurveHandler_(action,postOp) };
    const clickPointHandler = (data_plot: any) => { return clickPointHandler_(data_plot)};
    const restoreInitdataHandler = (gid: number) => {restoreInitdataHandler_(gid)};
    const updatePlotHandler = () => {updatePlotHandler_()};
    const removeAllPoints = () => { removeAllPoints_()};
    const changeViewHandler = (val: number) => {changeViewHandler_(val)};
    const checkDataTreeHandler =  (checkedKeys: string[], group_id: number) => { checkDataTreeHandler_(checkedKeys,group_id)};
    const convertToTrueHandler = () => {convertToTrueHandler_()};
    const changeCollapseHandler = (key: string | string[]) => {changeCollapseHandler_(key)};
    const failureInterpolationHandler = (curves: string[]) => { 
        setSelectedCurves(curves);
        return failureInterpolationHandler_(curves)
    };
    const adjustCurvesHandler = (algo:string, curves:string[], parameters: {curve: string, parameter: string, value: number}[]) => { 
        setComputationInProgress( true);     
        return adjustCurvesHandler_(algo,curves,parameters,postOp);
    };
    const cancelAdjustCurvesHandler = () => {cancelAdjustCurvesHandler_()};

    // --internal functions---
    const axisLabel = { xlabel: data.xtype, ylabel: data.ytype };

    const dataTypeHandler = () => {
        return (data.type === undefined?'tensile':data.type);
    }
    
    const tabChangeHandler =  (key) => {
        console.log(key);
    }

    const checkDataTreeAvgHandler = (slectedCurves) => {
        setDisplayGids(slectedCurves);
        
    }

    return (
        <>
        
            <div className="OuterDivScroll">
            <div style={{paddingTop: '20px', cursor: computationInProgress? 'wait' : 'auto'}}>
            <Row justify="start" style={{ pointerEvents: computationInProgress? 'none' : 'auto' }}>
                <Col flex="400px">
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
                <Col flex="700px">
                    <PlotCurve
                       data={data}
                       interpolationData={interpolationData}
                       group={data.tree.selectedGroup}
                       curves={data.groups[data.tree.selectedGroup].curves}
                       postData={data.groups[data.tree.selectedGroup].data}
                       keys={data.tree.groupData[data.tree.selectedGroup].keys}
                       axisLabel={axisLabel}
                       clickPoint={clickPointHandler}
                       plotUpdate={plotUpdate}
                       showMarkers={showMarkers}
                       resultsView={data.tree.groupData[data.tree.selectedGroup].resultsView}
                       changeView={changeViewHandler}
                       displayGids={displayGids}
                       mode={plotMode}
                       failureInterpolation={failureInterpolationHandler}
                      />
                </Col>
                <Col flex="400px">

                <Collapse accordion bordered={false} defaultActiveKey={['1']} onChange={changeCollapseHandler}>
                    <Panel header="Curve selection" key="1" style={{fontWeight: 'bold'}}  >
                        <CurveControls 
                            groupData={data.tree.groupData}
                            onCheck={checkDataTreeHandler}
                            measurement={data.measurement}
                            convertToTrue={convertToTrueHandler}
                        />
                    </Panel>
    
                    <Panel header="Consolidation" key="2" style={{fontWeight: 'bold'}}>
                        <Consolidation
                            groupData={data.tree.groupData}
                            postData = {data.groups.map(g => g.data)}
                            selectedCurves={selectedCurves}
                            listAvg={data.groups.map(g => g.result)}
                            adjustCurves={adjustCurvesHandler}
                            cancelAdjustCurves={cancelAdjustCurvesHandler}
                        />
                    </Panel>
                   
                </Collapse>

                    {/* <CurveAvgControls 
                       data={data}
                       workingGroup={data.tree.selectedGroup}
                       onCheck={checkDataTreeAvgHandler}
                    /> */}
                    
                </Col>
            </Row>
            </div>
            </div>
           
    </>
        
    );
};

export default PlotBuilderView;
import React from 'react';
import { Col, Row, Descriptions, Button, Checkbox ,Skeleton, Layout, Modal, Input, Space, Select} from 'antd';
import 'antd/dist/antd.css';
import axios from '../axios-orders';
import PlotCurve from '../components/PlotCurveComponent/PlotCurve';
import "../App.css";
import DragNDrop  from '../components/DragNDrop/DragNDrop.js'

class SaveResults extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            groups:[],
            selectedCurves:[],
            selectedPropDef:[],
            groupSelected:[0],
            loadCurve: false,
            isModalVisible: false,
            selectedCriteria:[],
            groupsCriteria:{},
            showGroupCriteria: false,
        }
        this.sendData = this.sendData.bind(this);
        this.handlePrevious = this.handlePrevious.bind(this);
        this.onCheckBoxChange = this.onCheckBoxChange.bind(this);
        this.onResultCurve = this.onResultCurve.bind(this);
        this.onResultVar = this.onResultVar.bind(this);
        this.updateAttribute = this.updateAttribute.bind(this);
        this.handleSave = this.handleSave.bind(this);
     }

     onResultCurve(checkedValues, oldValue) {
        let res = this.props.propState.res_curve[checkedValues].name;
        this.setState({
            selected_res_curve : res,
       })

       let json = {
        current: 4,
        previous: false,
        selected_res_curve: this.state.selected_res_curve,
    }
    this.sendData(json);
        
    }

      onResultVar(checkedValues, oldValue) {
        let propdef = this.props.propState.res_var1;
        let res = this.props.propState.res_var1[checkedValues].name;
        this.setState({
            selected_res_var : res,
       })

       let json = {
        current: 4,
        previous: false,
        selected_res_var: this.state.selected_res_var
        }
    this.sendData(json);
        
    }

     updateAttribute = (value,crname,index) =>{
        let group = this.state.groups[index+1];
        group.criteria[crname] = value;
        this.state.groups[index+1] = group;
        let json = {
            current: 4,
            previous: false,
            selectedCurves: this.state.selectedCurves,
            groups: this.state.groups,
            type: this.state.xyDisplayScale,
            xtype: this.state.xtype,
            xunit: this.state.xunit,
            ytype: this.state.ytype,
            yunit: this.state.yunit,
            groupSelected:this.state.groupSelected,		
            selected_group: 0,
            tree: [],
            keys: [],
            selectedCriteria:this.state.selectedCriteria,
            groupsCriteria:this.state.groupsCriteria,
            criteria:this.state.criteria,
        }
        this.sendData(json);
    }

     onCheckBoxChange(checked,e){
        let upDatedGroups =this.state.groups.map((grp, grpI) =>  { 
            
            if(e === grpI){
                 grp.isSelected = checked;
            }
            return grp;
        }
        )
        this.setState({
            groups:upDatedGroups
        })
        let json = {
            current: 4,
            previous: true,
            selectedCurves: this.state.selectedCurves,
            groups: this.state.groups,
            type: this.state.xyDisplayScale,
            xtype: this.state.xtype,
            xunit: this.state.xunit,
            ytype: this.state.ytype,
            yunit: this.state.yunit,
            groupSelected:this.state.groupSelected,		
            selected_group: 0,
            numberOfGroups:1,
            selectedCriteria:this.state.selectedCriteria,
            groupsCriteria:this.state.groupsCriteria,
            criteria:this.state.criteria,
        }
     this.sendData(json);
 }
    handleSave(){
        const url = this.props.propState.url;
        const saltId = this.props.propState.salt;
        let json = {
            propState: this.props.propState,
            currentState: this.state,
        }
        console.log(json);
        axios.post(url +'/servlet/rest/dr/save',{data:json},{headers:{'Content-Type': 'application/json',clientAppType:'REST_API', salt:saltId}})
            .then(response => {
                console.log(response);
                const res = response.data;
            })
    }
    handlePrevious() {
        let json = {
            current: 3,
            previous: true,
            selectedCurves: this.state.selectedCurves,
            groups: this.state.groups,
            type: this.state.xyDisplayScale,
            xtype: this.state.xtype,
            xunit: this.state.xunit,
            ytype: this.state.ytype,
            yunit: this.state.yunit,
            groupSelected:this.state.groupSelected,		
            selectedCriteria:this.state.selectedCriteria,
            groupsCriteria:this.state.groupsCriteria,
            criteria:this.state.criteria,
            targetType: this.state.targetType,
            res_curve: this.state.res_curve,
            res_var1: this.state.res_var1
        }
        this.sendData(json);
    } 

    componentDidMount() {       
        if(this.props.propState.selectedCriteria.length>0){
            this.state.showGroupCriteria = true;
        }
        this.setState({
            groups: this.props.propState.groups,
            selectedCurves: this.props.propState.selectedCurves,
            selectedPropDef : this.props.propState.selectedPropDef,
            loaded: true,
            type: this.props.propState.xyDisplayScale,
            xtype:this.props.propState.xtype,
            xunit: this.props.propState.xunit,
            ytype: this.props.propState.ytype,
            yunit: this.props.propState.yunit,		
            selected_group: 0,
            groupSelected:this.props.propState.groupSelected,		
            selectedCriteria:this.props.propState.selectedCriteria,
            groupsCriteria:this.props.propState.groupsCriteria,
            criteria:this.props.propState.criteria,
            selectedAnalysisType: this.props.propState.selectedAnalysisType,
            plotBuildModel: this.props.propState.plotBuildModel,
            targetType: this.props.propState.targetType,
            res_curve: this.props.propState.res_curve,
            res_var1: this.props.propState.res_var1
        })
    


        
    }

    

    sendData = (result) => {
        this.props.parentCallback(result);
    }


    render() {

          let allCurves = [];
          let colorsArray = [];
   let criteria=[];
   let count = 1;
   let numberOfGroups = this.state.numberOfGroups;

    Object.keys(this.props.propState.criteria).map((key, i) => {
        let obj = new Object();
        obj["label"] = key;
        obj["value"] = key;
        criteria.push(obj);
    })
    
    

   
 
let criteriaGrp = {};
              
                this.state.groups.map((group, index1)=>{
                 let critObj = group.criteria;
                 if(critObj !== undefined){
                    this.state.selectedCriteria.map((key, i) => {
                    let valArray = criteriaGrp[key];
                    if(valArray === undefined){
                        valArray = [];
                    }
                    valArray.push(critObj[key]===undefined?"":critObj[key]);
                    criteriaGrp[key] = valArray;
                 })}
})

let outputLabelsSet = new Set();

let outputGrp = {};
              
                this.props.propState.plotBuildModel.groups.map((group, index1)=>{
                 let outputs = group.data;
                 if(outputs !== undefined){
                    outputs.map((data, i) => {
                    let valObj = outputGrp[data.label];
                    if(valObj === undefined){
                        valObj = {};
                    }
                    outputLabelsSet.add(data.label);
                    valObj[group.label] = data.label===undefined?"":data.value;
                    outputGrp[data.label] = valObj;
                 })}
                })
                 

let outputLabels = Array.from(outputLabelsSet);


let unSelectedCriteriaSet = new Set();
let unSelectedCriteriaGrp = {};
              
                this.state.groups.map((group, index1)=>{
                 let critObj = group.criteria;
                 if(critObj !== undefined){
                     
                    Object.keys(this.props.propState.criteria).map((key, i) => {
                        if(!this.state.selectedCriteria.includes(key)){
                            unSelectedCriteriaSet.add(key);
                            let valArray = unSelectedCriteriaGrp[key];
                            if(valArray === undefined){
                                valArray = [];
                            }
                            valArray.push(critObj[key]===undefined?"":critObj[key]);
                            unSelectedCriteriaGrp[key] = valArray;
                        }
                 })}
                })
    
let unSelectedCriteria = Array.from(unSelectedCriteriaSet)

          
let table = !(this.state.showGroupCriteria && this.state.selectedCriteria.length>0)?"":<table className="Grid">
<thead><tr key={'mattr01'}><th key='propCol0'></th>{
    
this.state.groups.map((group, index)=>{
    return(index!==0?<th style={{textAlign: 'center'}}  key={'propCol'+index+1}><Checkbox key={"checkbox"+index+1} checked={group.isSelected} onChange={(e)=>this.onCheckBoxChange(e.target.checked,index)}/>{group.label}</th>:"")
})}</tr>
</thead>
<tbody>
    {
        this.state.selectedCriteria.map((cr, index) =>{
            let crObj = this.state.criteria[cr];
            let leftHeaderLabel = crObj.label +" - "+crObj.targetLabel;
            let values = criteriaGrp[cr];
            return(
                <tr key={'proptr'+index}>
                     <td  key={'proptd'+index} className="MatData"> <span> {leftHeaderLabel }</span></td>
                     { 
                       values!==undefined?values.map((val,i)=>{
                           return(<td><span className='AttributeValue' style={{width:'60%'}}>{val}</span></td>) 

                       }):""                         
                       
                     }
                </tr>
            )

        })
    }{

        unSelectedCriteria.map((cr, index) => {
            let crObj = this.state.criteria[cr];
            let leftHeaderLabel = crObj.label +" - "+crObj.targetLabel;
            let values = unSelectedCriteriaGrp[cr];
            return(
                <tr key={'proptr'+index}>
                     <td  key={'proptd'+(index+this.state.selectedCriteria.length)} className="MatData"> <span> {leftHeaderLabel }</span></td>
                     { 
                       values!==undefined?values.map((val,i)=>{
                           return(<td><Input value={val} onChange={(e)=>this.updateAttribute(e.target.value,crObj.label,i)}style={{width:'60%'}} placeholder="" /></td>) 

                       }):""                         
                       
                     }
                </tr>
            )

        })
    }


<tr key={'mattr01'}><td key='propCol0'></td>{
    
this.state.groups.map((group, index)=>{
    return(index!==0?<td style={{textAlign: 'center'}}  key={'propCol'+index+1}></td>:"")
})}</tr>


        <tr key={'proptr_Curve'}> <td  key={'proptdColCurve'} className="MatData"> <span> {'Curve Preview' }</span></td>{
        this.props.propState.plotBuildModel.groups.map((group, index1) =>{
            return(<td style={{textAlign: 'center'}}  key={'propColCurve'+index1+1}> <Select size='small' value={this.props.propState.res_curve[0].name} style={{width: '60%'}} onChange={(e)=>this.onResultCurve(e,this.state.selectedAnalysisType)}>
            {
             this.props.propState.res_curve.map( (resc,index) => {
                 return(<Select.Option key={'propOption'+index} value={resc.name}>{resc.label}</Select.Option>);
             })
         }
         </Select></td>)
        })}
        </tr>

        <tr key={'proptr_Curve'}> <td  key={'proptdColCurve'} className="MatData"> <span> {'Curve Preview' }</span></td>{
        this.props.propState.plotBuildModel.groups.map((group, index1) =>{
            return(<td style={{textAlign: 'center'}}  key={'propColCurve'+index1+1}> <PlotCurve onClick={e => { this.handleCurveClick(index1) }}
            curves={group.curves} showLegend={false} isThumbnail={true} showOnlyAverage={true} groupIndex={group.id}
        /></td>)
        })}
        </tr>


        <tr key={'proptr_Curve'}> <td  key={'proptdColCurve'} className="MatData"> <span> {'Curve Preview' }</span></td>{
        this.props.propState.plotBuildModel.groups.map((group, index1) =>{
            return(<td style={{textAlign: 'center'}}  key={'propColCurve'+index1+1}> <Select size='small' value={this.props.propState.res_var1[0].name} style={{width: '60%'}} onChange={(e)=>this.onResultVar(e,this.state.selectedAnalysisType)}>
            {
             this.props.propState.res_var1.map( (resc,index) => {
                 return(<Select.Option key={'propOption'+index} value={resc.name}>{resc.label}</Select.Option>);
             })
         }
         </Select></td>)
        })}
        </tr>

    {
        Object.keys(outputGrp).map((data, index) =>{
            let leftHeaderLabel = data;
            let values = outputGrp[data];
            return(
                leftHeaderLabel===''?'':
                <tr key={'proptr'+index}>
                     <td  key={'proptd'+index} className="MatData"> <span> {leftHeaderLabel }</span></td>
                     { 
                       values!==undefined?this.props.propState.plotBuildModel.groups.map((group,i)=>{
                           let val = values[group.label]!==undefined?values[group.label]:""
                           return(<td><span className='AttributeValue' style={{width:'60%'}}>{val}</span></td>) 

                       }):""                         
                       
                     }
                </tr>
            )

        })        
    }
   
    
    </tbody>
    </table>  



        return (
            <> 
                <Layout className="DRLayout">
               <Row className="DefineGroupsDiv">
                <Col>              

                    <Skeleton loading={!this.state.loaded}>
                <div id='DefineGroup' className="DefineGroup">
                    <Space direction='vertical'>
                    <div  className="AnalysisTypeContainer">
                    <span className='AnalysisResultLabel'> Analysis Result Type </span>
                        <Input size='small' value={this.props.propState.targetType} style={{width: 150}} disabled='true' >                      
                        </Input>
                    </div>
                    <div className="DropContainer">
                       { table}
                    </div>  
                                    
                    </Space>
                </div>
                        </Skeleton>


             
                </Col>
               
                    </Row>
                <div className="ButtonPanel">
                    <div className="ButtonPrevious">
                        <Button  onClick={e => { this.handlePrevious() }}>Previous</Button>
                    </div>
                    
                    <div className="ButtonCancel">
                        <Button>Cancel</Button>
                    </div>
                    <div className="ButtonSave">
                        <Button type="primary"  onClick={e => { this.handleSave() }}>Save</Button>
                    </div>
                </div>


                </Layout>
                
            </>
        )
    }
}

export default SaveResults;
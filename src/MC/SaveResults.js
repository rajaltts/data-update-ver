import React from 'react';
import { Col, Row, Descriptions, Button, Checkbox ,Skeleton, Layout, Modal, Input, Space, Select, Transfer } from 'antd';
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
            showAttributeDialog: false,
            targetClass:[],
            sourceData:[],
            targetKeys:[],
            targetClassMap:{},
            selected_resProp:{}
        }
        this.sendData = this.sendData.bind(this);
        this.handlePrevious = this.handlePrevious.bind(this);
        this.onCheckBoxChange = this.onCheckBoxChange.bind(this);
        this.onResultCurve = this.onResultCurve.bind(this);
        this.onResultVar = this.onResultVar.bind(this);
        this.updateAttribute = this.updateAttribute.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.onClassificationChange = this.onClassificationChange.bind(this);
        this.addClassificationAttribute = this.addClassificationAttribute.bind(this);
        this.openClassificationAttribute = this.openClassificationAttribute.bind(this);
        this.handleAttributeChange = this.handleAttributeChange.bind(this);
     }

     handleAttributeChange = (targetKeys, direction, moveKeys) => {
        //console.log(targetKeys, direction, moveKeys);
        this.state.showAttributeDialog = false;
        if(direction === 'left'){
            moveKeys.forEach(attr1 => {
                this.state.targetClass.map((attr,index)=> {
                    if(attr1 === attr.name){
                        this.state.targetClass.splice(index,1);
                    }
                });
            });
        }else if(direction === 'right'){
            this.state.schemaAttributes.forEach(attr => {               
                moveKeys.forEach(attr1 => {
                    if(attr1 === attr.name)
                        this.state.targetClass.push(attr);
                });
            });
        }
        this.setState({showAttributeDialog:true});
      };

     openClassificationAttribute = () =>{
        let selectedAnalysisType = this.props.propState.selectedAnalysisType.title;
        const url = this.props.propState.url;
        this.state.classificationLoaded = false;
        axios.get(url + '/servlet/rest/dr/get_Attribute?analysisType='+selectedAnalysisType+'&format=json&user=smroot&passwd=sdm')
            .then(response => {
                //console.log(response);
                const res = response.data;
                this.setState({
                    schemaAttributes: res.schemaAttributes,
                    classificationLoaded:true,
                    showAttributeDialog: true
                })
            })
     }
     addClassificationAttribute = () =>{

     }


     onClassificationChange = (value,attribute,index) =>{
        //let group = this.state.groups[index+1];
        this.state.targetClass[index]["value"] = value;
        //this.state.groups[index+1] = group;
        let json = {
            current: 3,
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

     onResultCurve(checkedValues) {
        this.props.propState.res_curve.map((val,index)=>{
            if(val.property === checkedValues){
                this.state.selected_resProp["res_curve"] = val;
            }
        })
        let json = {
        current: 3,
        previous: false,
        selected_resProp: this.state.selected_resProp,
    }
    this.sendData(json);
        
    }

      onResultVar(checkedValues, data) {
        let valArray = this.props.propState.res_var1[data];
        valArray.map((val,index)=>{
            if(val.property === checkedValues){
                this.state.selected_resProp[data] = val;
            }
        })
        
       let json = {
        current: 3,
        previous: false,
        selected_resProp: this.state.selected_resProp
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
    handleCancel(){
        window.closeDataReductionWidget(this.props.propState.widget,'cancelDRWidget' , '');
    }
    handleSave(){
        const url = this.props.propState.url;
        const saltId = this.props.propState.salt;
        let json = {
            propState: this.props.propState,
            currentState: this.state,
        }
        //console.log(json);
        axios.post(url +'/servlet/rest/dr/save',{data:json},{headers:{'Content-Type': 'application/json',clientAppType:'REST_API', salt:saltId}})
            .then(response => {
                //console.log(response);
                const res = response.data;
                window.closeDataReductionWidget(this.props.propState.widget,'saveDRWidget' , res.outputs);
            })
    }
    handlePrevious() {
        let json = {
            current: 2,
            previous: true,
            groupSelected:this.state.groupSelected,		
            selectedCriteria:this.state.selectedCriteria,
            targetType: this.state.targetType,
            res_curve: this.state.res_curve,
            res_var1: this.state.res_var1,
            targetClass: this.state.targetClass,
        }
        this.sendData(json);
    } 

    componentDidMount() {       
        this.state.targetClass = this.props.propState.targetClass;
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
            res_var1: this.props.propState.res_var1,
            targetClass: this.props.propState.targetClass,
            unitSystem: this.props.propState.unitSystem,
            xQuantityType: this.props.propState.xQuantityType,
            yQuantityType:this.props.propState.yQuantityType,
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

let outputLabels = {};

let outputGrp = {};
              
                this.props.propState.plotBuildModel.groups.map((group, index1)=>{
                 let outputs = group.data;
                 if(outputs !== undefined){
                    outputs.map((data, i) => {
                    let valObj = outputGrp[data.name];
                    if(valObj === undefined){
                        valObj = {};
                    }
                    outputLabels[data.name] = data.label;
                    valObj[group.label] = data;
                    outputGrp[data.name] = valObj;
                 })}
                })
                 




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

let attributeTable = !(this.props.propState.targetClass && this.props.propState.targetClass.length>0)?"":<table className="Grid">
    <thead><tr key={'attr01'}><th key='attpropCol0'>{'Attribute'}</th><th>{'Value'}</th></tr>
    </thead>
    <tbody>
    {
        this.props.propState.targetClass.map((attr, index) =>{
            return(
                <tr key={'proptr'+index}>
                     <td  key={'proptd'+index} className="MatData"> <span> {attr.label }</span></td>
                     <td>
                         <Input size='small' className='InputAttribute' key={'attd'+index} onChange={(e)=>this.onClassificationChange(e.target.value, attr.attribute, index)}>                      
                        </Input>
                    </td>
                </tr>
            )

        })
    }
    </tbody>            
</table>

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
            let leftHeaderLabel = crObj.label;
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
            let leftHeaderLabel = crObj.label;
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

        <tr key={'proptr_Curve'}> <td  key={'proptdColCurve'} className="MatData"> <span> {'Curve Result' }</span>
            <br></br>
           {this.props.propState.res_curve.length >1 ?   
            <Select size='small' value={this.state.selected_resProp["res_curve"].name} style={{width: '100%'}} onChange={(e)=>this.onResultCurve(e)}>
            {
             this.props.propState.res_curve.map( (resc,index) => {
                 return(<Select.Option key={'propOption'+index} value={resc.property}>{resc.label}</Select.Option>);
             })
            }
            </Select>:this.props.propState.res_curve.length ===1?<Input size='small' value={this.props.propState.res_curve[0].label} className='InputAttribute' disabled='true' />:""}
           
            </td>{
            this.props.propState.plotBuildModel.groups.map((group, index1) =>{
                return(<td style={{textAlign: 'center'}}  key={'propColCurve'+index1+1}> <PlotCurve onClick={e => { this.handleCurveClick(index1) }}
                curves={group.curves} showLegend={false} isThumbnail={true} showOnlyAverage={true} groupIndex={group.id} xtype={this.state.xtype} ytype={this.state.ytype}
            /></td>)
            })}
        </tr>

    {
        Object.keys(outputGrp).map((data, index) =>{
            let leftHeaderLabel = outputLabels[data];
            let values = outputGrp[data];
            return(
                leftHeaderLabel===''?'':
                <tr key={'proptr'+index}>
                     <td  key={'proptd'+index} className="MatData"> <span> {leftHeaderLabel }</span>
                     <br></br>
                     {this.props.propState.res_var1[data].length >1 ?  
                     <Select size='small' value={this.props.propState.selected_resProp[data]["property"]} style={{width: '100%'}} onChange={(e)=>this.onResultVar(e,data)}>
                        {
                        this.props.propState.res_var1[data].map( (resc,index) => {
                            return(<Select.Option key={'propOption'+index} value={resc.property}>{resc.label}</Select.Option>);
                        })
                        }
                    </Select>:this.props.propState.res_var1[data].length ===1?<Input size='small'  style={{width: '100%'}}value={this.props.propState.res_var1[data][0].label} className='InputAttribute' disabled='true' />:""

                    }
                     
                     
                     
                     
                     </td>
                     { 
                       values!==undefined?this.props.propState.plotBuildModel.groups.map((group,i)=>{
                           let val = values[group.label]!==undefined?values[group.label].value:""
                           return(<td><span className='AttributeValue' style={{width:'60%'}}>{val}</span></td>) 

                       }):""                         
                       
                     }
                </tr>
            )

        })        
    }
   
    
    </tbody>
    </table>  

    if(this.state.showAttributeDialog){
        this.state.targetClassMap = {};
        this.state.sourceData = [];
        this.state.targetKeys = [];
        this.state.targetClass.forEach(attr => {
            this.state.targetClassMap[attr.name] = attr;
        });
        this.state.schemaAttributes.forEach(attr => {
            let obj = {};
            obj.key = attr.name;
            obj.title = attr.label;
            obj.chosen = false;
            if(this.state.targetClassMap[attr.name]!==undefined){
                obj.chosen = true;
                this.state.targetKeys.push(attr.name);
            }
            this.state.sourceData.push(obj);
        });
    }


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
                        <Input className='InputAttribute' size='small' value={this.props.propState.targetType} style={{width:'60%'}} disabled='true' >                      
                        </Input>
                    </div>
                    <div className="DropContainerButton">
                    <Button type="primary" className='SingleButton' onClick={e => { this.openClassificationAttribute() }}>Add Attribute</Button>
                        <Modal
                            title="Add Attribute"
                            centered
                            visible={this.state.showAttributeDialog}
                            onOk= {e => { this.addClassificationAttribute();this.setState({showAttributeDialog:false});  }}
                            onCancel={() => this.setState({showAttributeDialog:false})}
                            width={1000}
                        >
                            <Transfer
                                dataSource={this.state.sourceData}
                                targetKeys={this.state.targetKeys}
                                render={item => item.title}
                                oneWay={false}
                                onChange={this.handleAttributeChange}
                                false
                            />
                            <br />
                        </Modal>
                    </div>  
                    <div className="DropContainer">
                       { attributeTable}
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
                    <div className="ButtonSave">
                        <Button type="primary"  onClick={e => { this.handleSave() }}>Save</Button>
                    </div>                
                    <div className="ButtonCancel">
                        <Button   onClick={e => { this.handleCancel() }}>Cancel</Button>
                    </div>

                    <div className="ButtonSave">
                        <Button>Export Excel</Button>
                    </div>
                </div>


                </Layout>
                
            </>
        )
    }
}

export default SaveResults;
import React from 'react';
import { Col, Row, Descriptions, Button, Checkbox,Skeleton, Layout } from 'antd';
import 'antd/dist/antd.css';
import axios from '../axios-orders';
import "../App.css";

class SelectProperties extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedPropDef:[],
            propDefs:[],
            loaded:false
        }
        this.getPropertyDef = this.getPropertyDef.bind(this);
        this.handleNext = this.handleNext.bind(this);
        this.onChangeCheckbox = this.onChangeCheckbox.bind(this);
        this.sendData = this.sendData.bind(this);
    }

    handleNext(){
        let json={
            selectedPropDef : this.state.selectedPropDef,
            current : 1,
            previous : false,
            propDefs : this.state.propDefs,
            stateChanged:this.state.stateChanged
        }
        this.sendData(json);
    }

    onChangeCheckbox(checkedValues) {
        this.state.selectedPropDef = checkedValues;
        this.state.stateChanged = true;
      }

    componentDidMount() {
        if(this.props.propState.propDefs.length == 0)
            this.getPropertyDef();
        else{
            this.setState({
                propDefs: this.props.propState.propDefs,
                selectedPropDef: this.props.propState.selectedPropDef,
                loaded: true,
                stateChanged: false
            })
        }
    }

    getPropertyDef() {
        let propDefs = [];
        console.log(this.props.propState);
        const url = this.props.propState.url;
        const query = this.props.propState.query;
        axios.get(url + '/servlet/rest/dr/get_PropertyDef?query=' + query + '&format=json&user=smroot&passwd=sdm')
            .then(response => {
                console.log(response);
                const res = response.data;
                this.setState({
                    propDefs: res.propDef,
                    loaded: true
                })



            })


    }

    sendData = (result) => {
        this.props.parentCallback(result);
      }




    render() {
        return (
            <>
                <Layout className="DRLayout">
                <div id='PropertyDef' className="PropertyDef">

                   <Row><Skeleton loading={!this.state.loaded}>
                          <Checkbox.Group options={this.state.propDefs} onChange={this.onChangeCheckbox} defaultValue={this.state.selectedPropDef}/> 
                        </Skeleton>

                    </Row>
                </div>
                <div className="ButtonPanel">
                    <div className="ButtonNext">
                        <Button type="primary" onClick={e => { this.handleNext() }}>Next</Button>
                    </div>
                </div>
                </Layout>
            </>
        )
    }
}

export default SelectProperties;
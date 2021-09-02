import {useState,useReducer} from 'react';
import dataReducer from './Model/Reducer';
import initalModel from './Model/InitialModel';
import { Data } from '../../data.model';
import ReactWasm from '../../assets/dataclean/dataclean.js'
import actions from './Model/Actions';

interface EmscriptenModule {
    [key: string]: any    
};

const useModel = () => {
    const [data, dispatch]  =  useReducer(dataReducer,initalModel);
    
    const getMeasurement = () => {
        return data.measurement;
    }



    return [data,dispatch,getMeasurement] as const; // as const to ensure argument order not guaranteed
};

export default useModel;
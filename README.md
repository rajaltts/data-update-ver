# Introduction 
This project is related to the development of Data cleaning/analytics dev report


# Getting Started
This project builds a SPA using React, Typescript and WebAssembly.
The WebAssembly(wasm) file (dataClean.wasm) is generated from C++ using emscripten.
Today this wasm file is commited in the project (src/assets) but it should be generated from C++ code in the future.

You need to install node to build the project.
To install
1. clone the rep on your system
    git clone https://icme@dev.azure.com/icme/DataReduction/_git/DataReduction
2. install all dependencies
    npm install  (in the DataReduction folder)
3. Start in dev mode
    npm run start
4. Open your browser (http://localhost:3000/)
5. To build the production version
    npm run build
    results will be generate in dist folder
end 
    
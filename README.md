# RINPn Online

( &raquo; [Japanese](./README_JAPANESE.md) )


Simplified version of [RINPn](https://github.com/RINEARN/rinpn), available on web browsers.


## How to Use

Open the following HTML file by your web browser (by double-clicking):

    English/index.html

Then the calculator will be displayed on the web browser's screen.

## How to Build

This app is an open source software. You can get the source code and build it as follows:

    # Download the source code
    git clone https://github.com/RINEARN/rinpn-online.git

    # Go to the app directory
    cd ./rinpn-online/English

    # Setup environment
    npm init   # Only when "package.json" is not initialized yet
    npm install --save-dev typescript
    npm install --save-dev @types/node 
    npm install --save-dev esbuild

    # Build
    npx esbuild rinpn-online.ts --bundle --outfile=rinpn-online-bundled.js

When all the building steps complete successfully, single JavaScript file "rinpn-online-bundled.js" is generated. The file will be loaded from index.html.


## License

* RINPn Online: MIT License

Dependencies: 

* [Exevalator](https://github.com/RINEARN/exevalator) (an expression-calculator library): Unlicense


## About Us

The RINPn and the RINPn Online are developed by a Japanese software development studio: [RINEARN](https://www.rinearn.com/). The author is Fumihiro Matsui.

Please feel free to contact us if you have any questions, feedback, or other comments.


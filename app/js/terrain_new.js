var cols, rows;
var scl = 40;
var w = 5000;
var h = 1600;

var flying = 0;
var terrain = [];

let videoDeviceId;
let audioDeviceId;
let capture;
let startAudio = false;
let audioStarted = false;

// the shader variable
let camShader;
var mic;
var vid;
let fft;
let shaderLayer;
let copyLayer;

var amplitude;
var backgroundColor;

// :: Beat Detect Variables
// how many draw loop frames before the beatCutoff starts to decay
// so that another beat can be triggered.
// frameRate() is usually around 60 frames per second,
// so 20 fps = 3 beats per second, meaning if the song is over 180 BPM,
// we wont respond to every beat.
var beatHoldFrames = 30;

// what amplitude level can trigger a beat?
var beatThreshold = 0.02; 

// When we have a beat, beatCutoff will be reset to 1.1*beatThreshold, and then decay
// Level must be greater than beatThreshold and beatCutoff before the next beat can trigger.
var beatCutoff = 0;
var beatDecayRate = 0.98; // how fast does beat cutoff decay?
var framesSinceLastBeat = 0; // once this equals beatHoldFrames, beatCutoff starts to decay.

var micLevel;

let new_height;
let new_width;

let aspect_ratio;

let rect_color_offset;

var testCounter = 0;
var xoff = 0;

windowResized = () => {
    // aspect_ratio = width / height
    // boils down to something like 1.33 : 1, or 1.33 width units for every 1 height unit

    aspect_ratio = windowWidth / windowHeight;
    // we might want to round this to like 2 or 3 decimals
    resizeCanvas(windowWidth, windowHeight);
}

window.onresize = windowResized


const initialize = () => {
    // this isn't going to work until I get https working......
    navigator.mediaDevices.enumerateDevices().then((devices) => {
        // debugger
        var videoSelect = document.getElementById('videoSourceSelect');
        var audioSelect = document.getElementById('audioSourceSelect');

        videoSelect.innerHTML = '';
        audioSelect.innerHTML = '';

        devices.forEach((device, index) => {
            var option = document.createElement('option');
            option.value = device.deviceId;
            console.log(device)
            if (device.kind.toLowerCase() === 'audioinput') {
                option.text = device.label || 'microphone ' + (audioSelect.length + 1);
                audioSelect.appendChild(option);
            } else if (device.kind.toLocaleLowerCase() === 'videoinput') {
                option.text = device.label || 'camera ' + (videoSelect.length + 1);
                videoSelect.appendChild(option);
            }

        })
    })
}

initialize();

setVideoSource = () => {
    var videoSelect = document.getElementById('videoSourceSelect');
    videoDeviceId = videoSelect.value

    if (vid) {
        // debugger
        vid.getSources().then(devices => {
            devices.forEach((device, i) => {
                vid.setSource(i)
                vid.start()
                console.log(vid)
                // debugger
            })
        })
    }
}

setAudioSource = () => {
    var audioSelect = document.getElementById('audioSourceSelect');
    audioDevice = audioSelect.value

    if (mic) {
        mic.getSources().then(devices => {
            devices.forEach((device, i) => {
                if (device.deviceId == audioDevice) {
                    mic.setSource(i)
                    mic.start()
                    console.log(mic)
                }
            })
        });
    }
}

startLoop = () => {
    var videoSelect = document.getElementById('videoSourceSelect');
    var audioSelect = document.getElementById('audioSourceSelect');
    var startButton = document.getElementById('start');

    videoSelect.style.display = 'none';
    audioSelect.style.display = 'none';
    startButton.style.display = 'none';

    // let constraints = {
    //     video: {
    //         deviceId: videoDeviceId,
    //         optional: [{ maxFrameRate: 10 }]
    //     },
    //     audio: false
    // }

    // capture = createCapture(constraints);
    // capture.size(width/2, height/2)
    // capture.size(640, 480)
    // capture.hide();

    startAudio = true;
    loop();
}

detectBeat = (level, micLevel) => {
    if (level  > beatCutoff && level > beatThreshold) {
        // rainbowCycleOn(50);
        onBeat(micLevel);
        beatCutoff = level *1.2;
        framesSinceLastBeat = 0;
    } else{
        if (framesSinceLastBeat <= beatHoldFrames) {
            framesSinceLastBeat ++;
        }
        else{
            beatCutoff *= beatDecayRate;
            beatCutoff = Math.max(beatCutoff, beatThreshold);
        }
    }
}
  
onBeat = (micLevel) => {
    // console.log('add that beat')
    // console.log('micLevel', micLevel)
    // addRect(micLevel)
    // addSphere(micLevel)
    // flying = micLevel
    // console.log(micLevel)
    // xoff = micLevel
}

setup = () => {
    // createCanvas( 600, 600, WEBGL );
    // createCanvas( width, height, WEBGL );
    // createCanvas( windowWidth, windowHeight, WEBGL)

    windowResized()
    noLoop()
    let cnv = createCanvas(windowWidth, windowHeight, WEBGL);
    // let cnv = createCanvas(windowWidth, windowHeight);
    cnv.mousePressed(userStartAudio);

    console.log(width)
    console.log(height)
    cols = w / scl;
    rows = h / scl;

    for ( var i = 0; i < cols; i++ ) {
        terrain[i] = [];
        for ( var j = 0; j < rows; j++ ) {
            terrain[i][j] = [];
        }
    }

    mic = new p5.AudioIn();
    mic.start()
    mic.getSources().then(devices => {
        mic.setSource(0);
        mic.start()
    })
    console.log('mic', mic)

    // let constraints = {
    //     video: {
    //         deviceId: videoDeviceId,
    //         optional: [{ maxFrameRate: 10 }]
    //     },
    //     audio: false
    // };
    // vid = createCapture(VIDEO)
    // vid.size(windowWidth, windowHeight);
    // vid.hide()
    // textAlign(CENTER);

    // fft = new p5.FFT();
    // fft.setInput(mic)

    amplitude = new p5.Amplitude()
    amplitude.setInput(mic)
    amplitude.smooth(0.9);

    frameRate( 20 );
}

draw = () => {
    background( 0 );
    stroke( 255 );
    noFill();
    let micLevel;
    let level;
    if (startAudio) {
        console.log('start the audio')
        mic.start();
        audioStarted = true;
        startAudio = false;
    } 
    testCounter += 1
    if (audioStarted) {
        micLevel = mic.getLevel();
        level = amplitude.getLevel();
        // console.log(level)
        // console.log('detect the beat')
        // console.log('level', level)
        // console.log('micLevel', micLevel)
        detectBeat(level, micLevel);
    } else {     
        // fill(255);   
        // text('tap to start', width/2, height /2);
    }

    var rotateXOffset = 2.75;

    translate( width / 2, height / 2 + 100 );
    rotateX( PI / rotateXOffset );
    flying -= 0.05;
    // flying = 0
    translate( -w / 2, -h / 2 );

    var yoff = flying;

    for ( var y = 0; y < rows; y++ ) {
        var xoff = 0;

        for ( var x = 0; x < cols; x++ ) {
            terrain[ x ][ y ] = map( noise( xoff, yoff ), 0, 1, -150, 150 );
            // var n = noise( xoff, yoff )
            // var m = level
            // console.log('n', n)
            // console.log(m)
            // terrain[ x ][ y ] = map( noise(level, yoff), -1, 1, -150, 150 );
            // console.log(terrain[ x ][ y ])
            xoff += 0.1;
        }

        yoff += level;
    }

    for ( var y = 0; y < rows - 1; y = y + 1 ) {
        beginShape( TRIANGLE_STRIP );
        for ( var x = 0; x < cols; x = x + 1 ) {
            vertex( x * scl, y * scl, terrain[ x ][ y ] );
            vertex( x * scl, ( y + 1 ) * scl, terrain[ x ][ y + 1 ] );
            // vertex( ( x + 2 ) * scl, y * scl, terrain[ x ][ y ] );
        }
        endShape( );
    }
}

// var createVisualizer = function( p ) {
// const runTime = trackData.features.duration_ms;
// const sections = trackData.analysis.sections;
// each section has a duration and start
//


// let angle = 0;
// var song;
// var FFT;
// var button;
// var amplitude;

// var spectrumHistory = [];
// // var displayHistory = [];
// var currentDisplay = 0;

// var xspacing = 16;    // Distance between each horizontal location
// var w;                // Width of entire wave
// var theta = 0.0;      // Start angle at 0
// var waveHeight = 75.0; // Height of wave
// var period = 500.0;   // How many pixels before the wave repeats
// var dx;               // Value for incrementing x
// var yvalues;  // Using an array to store height values for the wave
// var level;

// var segments = trackData.analysis.segments;
// var beats = trackData.analysis.beats;
// var i = 0;
// var fr = 1 / beats[ 0 ].duration;
// var timeZero;

// p.preload = function() {
//     // debugger

// };

// p.setup = function() {
//     p.createCanvas( 700, 350 );
//     w = p.width + 16;
//     dx = ( p.TWO_PI / period ) * xspacing;
//     yvalues = new Array( p.floor( w / xspacing ) );
//     p.colorMode( p.HSB );
//     fft = new p5.FFT( 0.9, 16 );
//     p.frameRate( fr );

//     // set timeZero to time.now
//     timeZero = Date.now();
// };

// set a variable to track height / loudness_max for smooth transitions

// var drawVertex = function( segment ) {
//     // var color = p.map( segment.loudness_max, 0, 1, 255, 10 );
//     p.stroke( 255 );
//     // var y = p.map( segment.loudness_max, 0, 1, 0, p.height / 2 );
//     // console.log( y, segment.loudness_max, p.height );
//     p.vertex(30 + i, 20);
//     p.vertex(30 + i, 75);
//     p.vertex(50 + i, 20);
//     p.vertex(50 + i, 75);
//     p.vertex(70 + i, 20);
//     p.vertex(70 + i, 75);
//     p.vertex(90 + i, 20);
//     p.vertex(90 + i, 75);
//     i += 1
// };

// p.draw = function() {
// timeNext = timeZero + segment[ i ].duration
// when timeZero === time.now => i += 1
// drawVertex( segments[ i ] )


    // p.background( 0 );
    // var spectrum = fft.waveform(32);
    // spectrumHistory.push( spectrum );

    // p.noFill();
    // p.stroke( 255 );

    // p.beginShape(p.QUAD_STRIP);
    // setTimeout( drawVertex( segments[ i ] ), segments[ i ].duration );
    // p.endShape();

    // if( spectrumHistory.length > p.width ) {
    //   spectrumHistory.splice( 0, 1);
    // }



    // var displayHistory = [];
    // var totalLength = 0;
    // p.background( 0 );

    // // p.noFill();
    // // p.stroke( 255 );

    // var counter = 0;
    //   p.beginShape();
    //   setInterval(
    //     function() {
    //       var i = counter;
    //       displayHistory.push( spectrumHistory[ i ].loudness_max );
    //       // var color = p.map( displayHistory[ i ], 0, 1, 255, 10 );
    //       // p.stroke( color, 100, 150 );
    //       p.stroke = ( 255 );
    //       var y = p.map( displayHistory[ i ] * 0.001, 0, 1, p.height / 2, 0);
    //       console.log( y );

    //       // p.vertex( i, y );

    //       p.vertex( i, 100 );
    //       console.log( "duration",  spectrumHistory[ i ].duration * 10000 )
    //       counter++
    //       // totalLength += displayHistory[ i ];
    //     },
    //     spectrumHistory[ counter ].duration * 10000
    //   );
    //   p.endShape();

    // if( totalLength > p.width ) {
    //   spectrumHistory.splice( 0, 1);
    // }
// }
// };
  
  // var myp5 = new p5( createVisualizer, 'visualizer-container' );
  
  // let angle = 0;
  // var song;
  // var FFT;
  // var button;
  // var amplitude;
  
  // var spectrumHistory = [];
  
  // var xspacing = 16;    // Distance between each horizontal location
  // var w;                // Width of entire wave
  // var theta = 0.0;      // Start angle at 0
  // var waveHeight = 75.0; // Height of wave
  // var period = 500.0;   // How many pixels before the wave repeats
  // var dx;               // Value for incrementing x
  // var yvalues;  // Using an array to store height values for the wave
  // var level;
  
  // function toggleSong()  {
  //   if ( song.isPlaying() ) {
  //     song.pause();
  //   }
  //   else {
  //     song.play();
  //   }
  // }
  
  // function preload() {
  //   song = loadSound( 'audio/jack_straw.ogg' );
  // }
  
  // function setup() {
  //   createCanvas( 700, 350 );
  //   w = width + 16;
  //   dx = ( TWO_PI / period ) * xspacing;
  //   yvalues = new Array( floor( w / xspacing ) );
  //   colorMode( HSB );
  
  //   fft = new p5.FFT( 0.9, 16 );
  
  //   button = createButton( 'toggle' );
  //   button.mousePressed( toggleSong );
  // }
  
  // function draw() {
  //   background( 0 );
  //   var spectrum = fft.waveform(32);
  
  //   spectrumHistory.push( spectrum );
  
  //   noFill();
  //   stroke( 255 );
  
  //   beginShape();
  //   for ( var i = 0; i < spectrumHistory.length; i++ ) {
  //     var color = map( spectrumHistory[ i ][ 0 ], 0, 1, 255, 10 );
  //     stroke( color, 100, 150 );
  //     var y = map( spectrumHistory[ i ][ 0 ], 0, 1, height / 2, 0);
  //     vertex( i, y );
  //   }
  //   endShape();
  
  //   if( spectrumHistory.length > width ) {
  //     spectrumHistory.splice( 0, 1);
  //   }
  // }
  
  // function calcWave() {
  //   theta += 0.02;
  
  //   var x = theta;
  //   for ( var i = 0; i < yvalues.length; i++ ) {
  //     yvalues[ i ] = sin( x ) * waveHeight;
  //     x += dx;
  //   }
  // }
  
  // function renderWave() {
  //   push();
  //   fill( 200, 100, 150 );
  //   noStroke();
  //   for ( var x = 0; x < yvalues.length; x++ ) {
  //     ellipse( x * xspacing, height / 2 + yvalues[ x ], 16, 16 );
  //   }
  //   pop();
  // }
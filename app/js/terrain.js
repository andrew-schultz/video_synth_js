var createTerrainVisualizer = function( p ) {
    var cols, rows;
    var scl = 40;
    var w = 2000;
    var h = 1400;
  
    var flying = 0;
    var terrain = [];
  
    p.setup = function() {
      p.createCanvas( 600, 600, p.WEBGL );
      cols = w / scl;
      rows = h / scl;
  
      for ( var i = 0; i < cols; i++ ) {
        terrain[i] = [];
        for ( var j = 0; j < rows; j++ ) {
          terrain[i][j] = [];
        }
      }
  
      p.frameRate( 20 );
    }
  
    p.draw = function() {
      p.background( 0 );
      p.stroke( 255 );
      p.noFill();
  
      var rotateXOffset = 2.75;
  
      p.translate( p.width / 2, p.height / 2 + 100 );
      p.rotateX( p.PI / rotateXOffset );
      flying -= 0.07;
      // flying = 0
      p.translate( -w / 2, -h / 2 );
  
      var yoff = flying;
  
      for ( var y = 0; y < rows; y++ ) {
        var xoff = 0;
  
        for ( var x = 0; x < cols; x++ ) {
          terrain[ x ][ y ] = p.map( p.noise( xoff, yoff ), 0, 1, -150, 150 );
          xoff += 0.1;
        }
  
        yoff += 0.1;
      }
  
      for ( var y = 0; y < rows - 1; y = y + 1 ) {
        p.beginShape( p.TRIANGLE_STRIP );
        for ( var x = 0; x < cols; x = x + 1 ) {
          p.vertex( x * scl, y * scl, terrain[ x ][ y ] );
          p.vertex( x * scl, ( y + 1 ) * scl, terrain[ x ][ y + 1 ] );
          // p.vertex( ( x + 2 ) * scl, y * scl, terrain[ x ][ y ] );
        }
        p.endShape( );
      }
    }
  };
  
  var createVisualizer = function( p ) {
    // const runTime = trackData.features.duration_ms;
    // const sections = trackData.analysis.sections;
    // each section has a duration and start
    //
  
  
    let angle = 0;
    var song;
    var FFT;
    var button;
    var amplitude;
  
    var spectrumHistory = [];
    // var displayHistory = [];
    var currentDisplay = 0;
  
    var xspacing = 16;    // Distance between each horizontal location
    var w;                // Width of entire wave
    var theta = 0.0;      // Start angle at 0
    var waveHeight = 75.0; // Height of wave
    var period = 500.0;   // How many pixels before the wave repeats
    var dx;               // Value for incrementing x
    var yvalues;  // Using an array to store height values for the wave
    var level;
  
    var segments = trackData.analysis.segments;
    var beats = trackData.analysis.beats;
    var i = 0;
    var fr = 1 / beats[ 0 ].duration;
    var timeZero;
  
    p.preload = function() {
      // debugger
  
    };
  
    p.setup = function() {
      p.createCanvas( 700, 350 );
      w = p.width + 16;
      dx = ( p.TWO_PI / period ) * xspacing;
      yvalues = new Array( p.floor( w / xspacing ) );
      p.colorMode( p.HSB );
      fft = new p5.FFT( 0.9, 16 );
      p.frameRate( fr );
  
      // set timeZero to time.now
      timeZero = Date.now();
    };
  
  // set a variable to track height / loudness_max for smooth transitions
  
    var drawVertex = function( segment ) {
      // var color = p.map( segment.loudness_max, 0, 1, 255, 10 );
      p.stroke( 255 );
      // var y = p.map( segment.loudness_max, 0, 1, 0, p.height / 2 );
      // console.log( y, segment.loudness_max, p.height );
      p.vertex(30 + i, 20);
      p.vertex(30 + i, 75);
      p.vertex(50 + i, 20);
      p.vertex(50 + i, 75);
      p.vertex(70 + i, 20);
      p.vertex(70 + i, 75);
      p.vertex(90 + i, 20);
      p.vertex(90 + i, 75);
      i += 1
    };
  
    p.draw = function() {
  // timeNext = timeZero + segment[ i ].duration
  // when timeZero === time.now => i += 1
  // drawVertex( segments[ i ] )
  
  
      p.background( 0 );
      // var spectrum = fft.waveform(32);
      // spectrumHistory.push( spectrum );
  
      p.noFill();
      p.stroke( 255 );
  
      p.beginShape(p.QUAD_STRIP);
        setTimeout( drawVertex( segments[ i ] ), segments[ i ].duration );
      p.endShape();
  
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
    }
  };
  
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
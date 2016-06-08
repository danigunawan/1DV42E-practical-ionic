angular.module( 'BookingSystem.imageResizeServices',

  // Dependencies
  [

  ] )

  .factory( 'ImageResize', [ 'UPLOAD_IMG_MAX_WIDTH', 'UPLOAD_IMG_MAX_HEIGHT', '$q', ( UPLOAD_IMG_MAX_WIDTH, UPLOAD_IMG_MAX_HEIGHT, $q ) => {

    let img,
      canvas,
      deferred,
      returnImageData;

    /* Private functions START */

    const getHalfScaleCanvas = ( canvas ) => {
      const halfCanvas = document.createElement( 'canvas' );
      halfCanvas.width = canvas.width / 2;
      halfCanvas.height = canvas.height / 2;

      halfCanvas.getContext( '2d' ).drawImage( canvas, 0, 0, halfCanvas.width, halfCanvas.height );

      return halfCanvas;
    };

    const applyBilinearInterpolation = ( srcCanvasData, destCanvasData, scale ) => {
      function inner( f00, f10, f01, f11, x, y ) {
        const un_x = 1.0 - x;
        const un_y = 1.0 - y;
        return ( f00 * un_x * un_y + f10 * x * un_y + f01 * un_x * y + f11 * x * y );
      }
      let i, j;
      let iyv, iy0, iy1, ixv, ix0, ix1;
      let idxD, idxS00, idxS10, idxS01, idxS11;
      let dx, dy;
      let r, g, b, a;
      for ( i = 0; i < destCanvasData.height; ++i ) {
        iyv = i / scale;
        iy0 = Math.floor( iyv );
        // Math.ceil can go over bounds
        iy1 = ( Math.ceil( iyv ) > ( srcCanvasData.height - 1 ) ? ( srcCanvasData.height - 1 ) : Math.ceil( iyv ) );
        for ( j = 0; j < destCanvasData.width; ++j ) {
          ixv = j / scale;
          ix0 = Math.floor( ixv );
          // Math.ceil can go over bounds
          ix1 = ( Math.ceil( ixv ) > ( srcCanvasData.width - 1 ) ? ( srcCanvasData.width - 1 ) : Math.ceil( ixv ) );
          idxD = ( j + destCanvasData.width * i ) * 4;
          // matrix to vector indices
          idxS00 = ( ix0 + srcCanvasData.width * iy0 ) * 4;
          idxS10 = ( ix1 + srcCanvasData.width * iy0 ) * 4;
          idxS01 = ( ix0 + srcCanvasData.width * iy1 ) * 4;
          idxS11 = ( ix1 + srcCanvasData.width * iy1 ) * 4;
          // overall coordinates to unit square
          dx = ixv - ix0;
          dy = iyv - iy0;
          // I let the r, g, b, a on purpose for debugging
          r = inner( srcCanvasData.data[idxS00], srcCanvasData.data[idxS10], srcCanvasData.data[idxS01], srcCanvasData.data[idxS11], dx, dy );
          destCanvasData.data[idxD] = r;

          g = inner( srcCanvasData.data[idxS00 + 1], srcCanvasData.data[idxS10 + 1], srcCanvasData.data[idxS01 + 1], srcCanvasData.data[idxS11 + 1], dx, dy );
          destCanvasData.data[idxD + 1] = g;

          b = inner( srcCanvasData.data[idxS00 + 2], srcCanvasData.data[idxS10 + 2], srcCanvasData.data[idxS01 + 2], srcCanvasData.data[idxS11 + 2], dx, dy );
          destCanvasData.data[idxD + 2] = b;

          a = inner( srcCanvasData.data[idxS00 + 3], srcCanvasData.data[idxS10 + 3], srcCanvasData.data[idxS01 + 3], srcCanvasData.data[idxS11 + 3], dx, dy );
          destCanvasData.data[idxD + 3] = a;
        }
      }
    };

    const getScale = ( canvas ) => {

      let scaleToReturn;

      if ( canvas.width > canvas.height ) {
        scaleToReturn = UPLOAD_IMG_MAX_WIDTH / canvas.width;
      } else {
        scaleToReturn = UPLOAD_IMG_MAX_HEIGHT / canvas.height;
      }

      return scaleToReturn;
    };

    const scaleCanvasWithAlgorithm = ( canvas ) => {
      const scaledCanvas = document.createElement( 'canvas' );
      const scale = getScale( canvas );

      scaledCanvas.width = canvas.width * scale;
      scaledCanvas.height = canvas.height * scale;

      const srcImgData = canvas.getContext( '2d' ).getImageData( 0, 0, canvas.width, canvas.height );
      const destImgData = scaledCanvas.getContext( '2d' ).createImageData( scaledCanvas.width, scaledCanvas.height );

      applyBilinearInterpolation( srcImgData, destImgData, scale );

      scaledCanvas.getContext( '2d' ).putImageData( destImgData, 0, 0 );

      return scaledCanvas;
    };

    /* Private functions END */

    return {

      scaleImage: ( imgData ) => {

        // Init variables
        img = document.createElement( 'img' );
        canvas = document.createElement( 'canvas' );
        deferred = $q.defer();

        img.src = imgData;

        // When the image has been loaded.
        img.onload = () => {

          canvas.width = img.width;
          canvas.height = img.height;
          canvas.getContext( '2d' ).drawImage( img, 0, 0, canvas.width, canvas.height );

          while ( canvas.width >= ( 2 * UPLOAD_IMG_MAX_WIDTH ) ) {
            canvas = getHalfScaleCanvas( canvas );
          }

          if ( canvas.width > UPLOAD_IMG_MAX_WIDTH || canvas.height > UPLOAD_IMG_MAX_HEIGHT ) {
            canvas = scaleCanvasWithAlgorithm( canvas );
          }

          returnImageData = canvas.toDataURL( 'image/jpeg', 1.0 );

          /*
           // Remove invalid string
           returnImageData = returnImageData.replace(/^data:image\/jpeg;base64,/, "");
           */

          //returnImageData

          //console.log("inside imageResizeService RETURN " + returnImageData);

          deferred.resolve( returnImageData );
        };

        // Return promise
        return deferred.promise;
      }
    };
  }]
  );
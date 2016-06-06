angular.module( 'BookingSystem.filters',

  // Dependencies
  []
  )
  .filter( 'zpad', [ () => {

    return function( input, n ) {
      if ( input === undefined ) {
        input = '';
      }

      if ( input.length >= n ) {
        return input;
      }

      const zeros = '0'.repeat( n );
      return ( zeros + input ).slice( -1 * n );
    };
  }]
  )

  .filter( 'kr', () => {
    return function ( text ) {

      let t;
      // Only filter when defined
      if ( typeof text !== 'undefined' ){
        text = text.toString().replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1 ' );
        t = text + ' kr';
      }

      return t;
    };
  })

  .filter( 'count', () => {
    return function( text ) {
      return text + ' st';
    };
  })

  .filter( 'percentage', ['$filter', ( $filter ) => {
    return function ( input ) {
      return $filter( 'number' )( input * 100, 0 ) + '%';
    };
  }]
  );
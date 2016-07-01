angular.module( 'BookingSystem.authService',

  // Dependencies
  ['ngCookies']
)
  .service( 'AuthService', [ '$q', '$cookies', '$timeout', '$rootScope', 'API_URL', 'MODAL_ANIMATION', '$injector', function( $q, $cookies, $timeout, $rootScope, API_URL, MODAL_ANIMATION, $injector ) {

    // Init values
    const keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    const CURRENT_USER_STR = 'currentUser';
    const loginModalTemplateUrl = 'templates/modals/login.html';

    this.showLoginModal = function(){

      console.log( ( $rootScope.authModal !== undefined ? $rootScope.authModal.isShown() : 'nope' ) );

      if ( $rootScope.authModal === undefined || $rootScope.authModal === null || $rootScope.authModal !== undefined && !$rootScope.authModal.isShown() ) {

        $rootScope.authModal = {};

        // Inject ionic modal to avoid circular dependency.
        const ionicModal = $injector.get( '$ionicModal' );

        // Load modal template and set scope.
        ionicModal.fromTemplateUrl( loginModalTemplateUrl, {
          scope: $rootScope,
          animation: MODAL_ANIMATION,
          backdropClickToClose: false,
          hardwareBackButtonClose: false
        })
          .then( ( response ) => {

            // Store modal in root scope
            $rootScope.authModal = response;

            // Show the modal when loaded.
            $rootScope.authModal.show();
          });

        // Cleanup the modal when we're done with it
        $rootScope.$on( 'authModal.hidden', () => {
          console.log( 'hidden' );
          $rootScope.authModal.remove();
        });

        $rootScope.$on( 'authModal.removed', () => {
          console.log( 'removed' );
          $rootScope.authModal = null;
        });
      }
    };

    this.base64Encode = function ( input ) {
      let output = '';
      let chr1, chr2, chr3 = '';
      let enc1, enc2, enc3, enc4 = '';
      let i = 0;

      do {
        chr1 = input.charCodeAt( i++ );
        chr2 = input.charCodeAt( i++ );
        chr3 = input.charCodeAt( i++ );

        enc1 = chr1 >> 2;
        enc2 = ( ( chr1 & 3 ) << 4 ) | ( chr2 >> 4 );
        enc3 = ( ( chr2 & 15 ) << 2 ) | ( chr3 >> 6 );
        enc4 = chr3 & 63;

        if ( isNaN( chr2 ) ) {
          enc3 = enc4 = 64;
        } else if ( isNaN( chr3 ) ) {
          enc4 = 64;
        }

        output = output +
          keyStr.charAt( enc1 ) +
          keyStr.charAt( enc2 ) +
          keyStr.charAt( enc3 ) +
          keyStr.charAt( enc4 );
        chr1 = chr2 = chr3 = '';
        enc1 = enc2 = enc3 = enc4 = '';
      } while ( i < input.length );

      return output;
    };

    /* Not used at the moment

    const base64Decode = function ( input ) {
      let output = '';
      let chr1, chr2, chr3 = '';
      let enc1, enc2, enc3, enc4 = '';
      let i = 0;

      // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
      const base64test = /[^A-Za-z0-9\+\/\=]/g;

      if ( base64test.exec( input ) ) {
        console.log(
          'There were invalid base64 characters in the input text.\n' +
          'Valid base64 characters are A-Z, a-z, 0-9, \'+\', \'/\',and \'=\'\n' +
          'Expect errors in decoding.'
        );
      }
      input = input.replace( /[^A-Za-z0-9\+\/\=]/g, '' );

      do {
        enc1 = keyStr.indexOf( input.charAt( i++ ) );
        enc2 = keyStr.indexOf( input.charAt( i++ ) );
        enc3 = keyStr.indexOf( input.charAt( i++ ) );
        enc4 = keyStr.indexOf( input.charAt( i++ ) );

        chr1 = ( enc1 << 2 ) | ( enc2 >> 4 );
        chr2 = ( ( enc2 & 15 ) << 4 ) | ( enc3 >> 2 );
        chr3 = ( ( enc3 & 3 ) << 6 ) | enc4;

        output = output + String.fromCharCode( chr1 );

        if ( enc3 !== 64 ) {
          output = output + String.fromCharCode( chr2 );
        }
        if ( enc4 !== 64 ) {
          output = output + String.fromCharCode( chr3 );
        }

        chr1 = chr2 = chr3 = '';
        enc1 = enc2 = enc3 = enc4 = '';

      } while ( i < input.length );

      return output;
    };
    */

    this.login = function ( username, password, callback ) {

      /* Dummy authentication for testing, uses $timeout to simulate api call
       ----------------------------------------------*/
      $timeout( () => {

        const response = { success: username === 'test' && password === 'test' };

        if ( !response.success ) {
          response.message = 'Username or password is incorrect';
        }
        callback( response );
      }, 1000 );

      /* Use this for real authentication
       ----------------------------------------------*/
      //$http.post('/api/authenticate', { username: username, password: password })
      //    .success(function (response) {
      //        callback(response);
      //    });

    };

    this.isLoggedInCheck = function() {

      // Try to get cookie credentials. Determine if user is logged in.
      const isLoggedIn = $cookies.get( CURRENT_USER_STR ) !== undefined;

      // Update rootscope variable if needed
      if ( $rootScope.isLoggedIn !== isLoggedIn ) {
        $rootScope.isLoggedIn = isLoggedIn;
      }

      // If auth token is valid
      return isLoggedIn;
    };

    this.setCredentials = function ( username, password ) {

      const authData = base64Encode( username + ':' + password );

      const currentUser = {
        username: username,
        authData: authData
      };
      /*
      $rootScope.globals = {
        currentUser: currentUser
      };
      */

      // $http.defaults.headers.common.Authorization = 'Basic ' + authData;
      $cookies.put( CURRENT_USER_STR, currentUser );
    };

    this.getAuthHeader = function() {

      let returnValue = false;

      const currentUser = $cookies.get( CURRENT_USER_STR ) !== null;

      if ( currentUser.authData ) {
        returnValue = 'Basic ' + currentUser.authData;
      }

      return returnValue;
    };

    this.clearCredentials = function () {

      // Clear credentials from rootScope.
      // $rootScope.globals = {};

      // Clear credentials from cookie
      $cookies.remove( CURRENT_USER_STR );

      // Clear credentials from http headers
      // $http.defaults.headers.common.Authorization = 'Basic ';
    };

    this.apiUrlEqualsUrl = function( configUrl ){

      let apiUrlPartsArray, apiCompareUrl, currentCompareUrl;

      const urlPartsArray = configUrl.split( '/' );

      // If the url is a potential API url
      if ( urlPartsArray.length > 2 ) {

        apiUrlPartsArray = API_URL.split( '/' );

        // Build base urls to compare
        currentCompareUrl = urlPartsArray[0] + urlPartsArray[2];
        apiCompareUrl = apiUrlPartsArray[0] + apiUrlPartsArray[2];

        // If the base url of the request is the same as the API url
        return currentCompareUrl === apiCompareUrl;
      }

      return false;
    };
  }]
);
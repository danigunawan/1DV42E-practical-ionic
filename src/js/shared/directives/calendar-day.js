/**
 * Created by jopes on 2015-04-16.
 */

  // Declare module
  angular.module( 'BookingSystem.calendarDayDirective',

    // Dependencies
    [
    ]
  )

    // Directive specific controllers START
    .controller( 'CalendarDayCtrl', ['$scope', '$element', '$attrs', '$rootScope', '$location', '$q', function( $scope, $element, $attrs, $rootScope, $location, $q ) {

      /* Declare variables START */

      /* Declare variables END */

      /* Private methods START */

      /* Private methods END */

      /* Public methods START */

      $scope.changeToPreviousMonth = function(){

      };

      $scope.changeToNextMonth = function(){

      };

      /* Public methods END */

      /* Initialization START */

      /* Initialization END */
    }]
    )
    // Directive specific controllers END

    // Directives START
    .directive( 'calendarDay', [function() {
      return {
        restrict: 'E',
        replace: true,
        templateUrl: function( element, attr ){
          return 'templates/directives/calendar-day.html';
        },
        scope: true,
        link: function(){

        },
        controller: 'CalendarDayCtrl'
      };
    }]
    )

    .controller( 'CalendarTimeCtrl', ['$scope', function( $scope ) {

      let hour;
      const totalDayHours = 24;
      $scope.hoursArray = [];

      for ( hour = 0; hour < totalDayHours; hour++ ) {

        $scope.hoursArray.push( hour );

      }
    }]
    )

    .directive( 'calendarTime', [function() {
      return {
        restrict: 'E',
        replace: true,
        templateUrl: function( element, attr ){
          return 'templates/directives/calendar-time.html';
        },
        controller: 'CalendarTimeCtrl'
      };
    }]
    )

    .filter( 'digits', () => {
      return function( input ) {
        if ( input < 10 ) {
          input = '0' + input;
        }

        return input;
      };
    }
    );
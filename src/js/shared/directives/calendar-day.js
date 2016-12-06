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
    .controller( 'CalendarDayCtrl', ['$scope', '$element', '$attrs', '$rootScope', '$location', '$q', '$state', 'BookingHelper', '$interval', 'DEFAULT_CALENDAR_ZOOM', '$ionicScrollDelegate', '$window', '$document', '$ionicModal', 'MODAL_ANIMATION', 'BOOKING_TYPES', function( $scope, $element, $attrs, $rootScope, $location, $q, $state, BookingHelper, $interval, DEFAULT_CALENDAR_ZOOM, $ionicScrollDelegate, $window, $document, $ionicModal, MODAL_ANIMATION, BOOKING_TYPES ) {

      /* Declare variables START */
      const modalTemplateUrl = 'templates/modals/booking-create-choose-type.html';
      const calendarDayMomentDate = moment( $scope.date );
      const updateIntervalTime = 60000; // Every 60 seconds
      const maxColumnHeight = 200;
      const minColumnHeight = 35;
      let updateInterval = null;

      $scope.dayNumber = calendarDayMomentDate.format( 'D' );
      $scope.dayName = calendarDayMomentDate.format( 'ddd' );
      $scope.visibleAddButtonHour = null;
      $scope.columnHeight = minColumnHeight * $scope.zoom;
      $scope.bookingTypes = BOOKING_TYPES;

      // TODO: Store number of concurrent events in calendar event. Then let the other concurrent events calculate their width from this previous events value.

      /* Declare variables END */

      /* Private methods START */

      const setupModalIfNeeded = function(){

        if ( $scope.bookingsType === 'booking' ) {

          $ionicModal.fromTemplateUrl( modalTemplateUrl, {
            scope: $scope,
            animation: MODAL_ANIMATION
          })
            .then( ( response ) => {

              $scope.modal = response;
            });

          // Cleanup the modal when we're done with it!
          $scope.$on( '$destroy', () => {
            $scope.modal.remove();
          });
        }
      };

      const setupHours = function(){

        let hour;
        const totalDayHours = 24;
        $scope.hoursArray = [];

        for ( hour = 0; hour < totalDayHours; hour++ ) {

          $scope.hoursArray.push( hour );
        }
      };

      const getHourDecimal = function( hour, minute ) {
        return ( Number( hour ) + Number( minute / 60 ) );
      };

      const setColumnHeight = function() {

        const newValue = $scope.columnHeight + ( minColumnHeight * ( $scope.zoom - 1 ) );

        if ( newValue < maxColumnHeight && newValue > minColumnHeight ) {

          $scope.columnHeight = newValue;
        }
      };

      const scrollToTimeLineIfNeeded = function() {

        if ( $scope.isCurrentDay ) {
          $document.ready( () => {

            // Get offset from time-line element
            const offsetTop = angular.element( document.querySelector( '.time-line' ) ).prop( 'offsetTop' );

            $ionicScrollDelegate.scrollTo( 0, offsetTop - $scope.columnHeight, false );
          });
        }
      };

      const setIsCurrentDayVariables = function () {

        $scope.isCurrentDay = moment().format( 'YYYY-MM-DD' ) === calendarDayMomentDate.format( 'YYYY-MM-DD' );

        if ( $scope.isCurrentDay ) {

          const currentMoment = moment();
          const hour = currentMoment.format( 'H' );
          const minute = currentMoment.format( 'mm' );

          $scope.currentHour = getHourDecimal( hour, minute );

        } else {
          $scope.isDayOld = calendarDayMomentDate.isBefore( moment() );
        }

      };

      const startUpdateInterval = function (){

        if ( $scope.isCurrentDay ) {

          updateInterval = $interval( () => {

            setIsCurrentDayVariables();

          }, updateIntervalTime );
        }
      };

      const calculateStartHour = function( booking ) {

        const endTimeStartOfDay = moment( booking.EndTime ).startOf( 'day' );
        const startHour = moment( booking.StartTime ).format( 'H' );
        const startMinute = moment( booking.StartTime ).format( 'mm' );

        // If booking start on previous day or earlier.
        if (
          calendarDayMomentDate.date() !== moment( booking.StartTime ).date() &&
          moment( booking.StartTime ).isBefore( endTimeStartOfDay )
        ) {
          return 0;
        }

        return getHourDecimal( startHour, startMinute );
      };

      const calculateEndHour = function( booking ) {

        // If booking ends on next day or later.
        if ( moment( booking.EndTime ).isAfter( moment( calendarDayMomentDate ).endOf( 'day' ) ) ) {
          return 23.99;
        }

        return ( Number( moment( booking.EndTime ).format( 'H' ) ) + Number( moment( booking.EndTime ).format( 'mm' ) / 60 ) );
      };

      const setupBookings = function(){

        if ( $scope.bookings !== undefined ) {

          // Loop through all bookings for day.
          $scope.bookings.forEach( ( booking ) => {

            booking.StartHour = calculateStartHour( booking );
            booking.EndHour = calculateEndHour( booking );
            booking.Duration = ( booking.EndHour - booking.StartHour );

            // Make this booking aware of other concurrent bookings
            BookingHelper.setConcurrentBookingData( booking, $scope.bookings );
          });
        }
      };

      /* Private methods END */

      /* Public methods START */

      $scope.showAddHour = function( hour ){

        // Only if user is logged in, and its clickable
        if ( $rootScope.userInfo && $scope.isClickable ) {

          $scope.hideAllAddButtonsCallback();
          $scope.visibleAddButtonHour = hour;
        }
      };

      $scope.hideAddButton = function() {

        $scope.visibleAddButtonHour = null;
      };

      $scope.createEventForHour = function( hour, bookingTypeStr ) {

        const bookingType = bookingTypeStr || $scope.bookingsType;

        calendarDayMomentDate.set({
          'hour': hour
        });

        // If booking type is not set. Display a modal where the user can make a choice.
        if ( bookingType === 'booking' ) {

          $scope.modal.show();

        // Booking type is set, redirect
        } else {

          // Redirect to create view
          $state.go( 'app.' + bookingType + '-create', {
            startTime: moment( calendarDayMomentDate ),
            endTime: moment( calendarDayMomentDate ).add( 59, 'minutes' ),
            id: null
          });

          $scope.hideAddButton();
        }
      };

      $scope.createBookingOfType = function( bookingTypeStr ) {

        // Redirect to edit view
        $scope.createEventForHour( calendarDayMomentDate.hour(), bookingTypeStr );

        $scope.modal.hide();
      };

      $scope.showEvent = function( id ) {

        // Only if user is logged in, and its clickable
        if ( $rootScope.userInfo && $scope.isClickable ) {

          // Redirect to edit view
          $state.go( 'app.' + $scope.bookingsType + '-details', {
            id: id
          });
        }
      };

      /* Public methods END */

      /* Initialization START */

      setupHours();
      setIsCurrentDayVariables();
      startUpdateInterval();
      scrollToTimeLineIfNeeded();
      setupModalIfNeeded();

      // Listen to when AddButton should hide
      $scope.$on( 'hideAllAddButtons', ( event, msg ) => {

        $scope.hideAddButton();

      });

      // Add a watch on bookings. Passed from parent controller.
      $scope.$watch( 'bookings', ( newValue, oldValue ) => {

        if ( Array.isArray( newValue ) ) {

          setupBookings();
        }
      });

      // Add a watch on zoom. Passed from parent controller.
      $scope.$watch( 'zoom', ( newValue, oldValue ) => {

        setColumnHeight();
      });

      // Update column height on swipe
      $scope.$on( 'swipe-occurred', ( event ) => {

        $scope.columnHeight = minColumnHeight * DEFAULT_CALENDAR_ZOOM;
      });

      // Destroy the update interval when we leave parent view
      $scope.$on( 'leaving-view', ( event ) => {

        if ( updateInterval !== null ) {
          $interval.cancel( updateInterval );
        }
      });

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
        scope: {
          date: '=',
          hideAllAddButtonsCallback: '&',
          hideAddButton: '=',
          bookings: '=',
          bookingsType: '=',
          zoom: '=',
          isClickable: '='
        },
        link: function ( scope, element, attrs ) {
        },
        controller: 'CalendarDayCtrl'
      };
    }]
    )

    .controller( 'CalendarTimeCtrl', ['$scope', 'DEFAULT_CALENDAR_ZOOM', function( $scope, DEFAULT_CALENDAR_ZOOM ) {

      /* Declare variables START */
      const minColumnHeight = 35;
      $scope.columnHeight = minColumnHeight * $scope.zoom;
      const maxColumnHeight = 200;

      /* Declare variables END */

      /* Private methods START */

      const setWeekNumber = function () {
        $scope.weekNumber = moment( $scope.date ).isoWeek();
      };

      const setColumnHeight = function() {

        const newValue = $scope.columnHeight + ( minColumnHeight * ( $scope.zoom - 1 ) );

        if ( newValue < maxColumnHeight && newValue > minColumnHeight ) {
          $scope.columnHeight = newValue;
        }
      };

      const setupHours = function(){

        let hour;
        const totalDayHours = 24;
        $scope.hoursArray = [];

        for ( hour = 1; hour < totalDayHours; hour++ ) {

          $scope.hoursArray.push( hour );
        }
      };

      /* Private methods END */

      /* Public methods START */

      /* Public methods END */

      /* Initialization START */

      setupHours();
      setWeekNumber();

      // Add a watch on zoom. Passed from parent controller.
      $scope.$watch( 'zoom', ( newValue, oldValue ) => {

        setColumnHeight();
      });

      // Add a watch on date. Passed from parent controller.
      $scope.$watch( 'date', ( newValue, oldValue ) => {

        setWeekNumber();
      });

      // Update column height on swipe
      $scope.$on( 'swipe-occurred', ( event ) => {

        $scope.columnHeight = minColumnHeight * DEFAULT_CALENDAR_ZOOM;
      });

      /* Initialization END */

    }]
    )

    .directive( 'calendarTime', [function() {
      return {
        restrict: 'E',
        replace: true,
        scope: {
          date: '=',
          zoom: '='
        },
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
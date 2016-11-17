/**
 * Created by Johanna Larsson on 2016-04-21.
 */
'use strict';

angular.module( 'BookingSystem.resources',

  // Dependencies
  []
  )

  //List controller
  .controller( 'ResourcesListCtrl', [ '$rootScope', '$scope', '$state', '$mdToast', 'Resource', 'API_IMG_PATH_URL', 'PAGINATION_COUNT', ( $rootScope, $scope, $state, $mdToast, Resource, API_IMG_PATH_URL, PAGINATION_COUNT ) => {

    /* Init vars */
    $scope.API_IMG_PATH_URL = API_IMG_PATH_URL;
    $scope.noMoreItemsAvailable = false;
    $scope.resources = [];
    let pageNum = 1;

    /* Private methods START */

    /* Private Methods END */

    /* Public Methods START */

    $scope.loadMore = function() {

      const newItems = Resource.queryPagination({
        pageNum: pageNum,
        itemCount: PAGINATION_COUNT
      });

      newItems.$promise.then( () => {

        // If there aren't any more items
        if ( newItems.length === 0 || newItems.length < PAGINATION_COUNT ) {

          $scope.noMoreItemsAvailable = true;

        }

        newItems.forEach( ( newItem ) => {

          $scope.resources.push( newItem );
        });

        $scope.$broadcast( 'scroll.infiniteScrollComplete' );

      });

      pageNum++;
    };

    /* Public Methods END */

    /* Initialization START */

    /* Initialization END */
  }]
  )

  //Edit controller
  .controller( 'ResourceDetailsCtrl', [ '$rootScope', '$scope', '$stateParams', 'MODAL_ANIMATION', '$ionicModal', '$state', 'Resource', 'ResourceImage', 'API_IMG_PATH_URL', '$mdToast', '$q', ( $rootScope, $scope, $stateParams, MODAL_ANIMATION, $ionicModal, $state, Resource, ResourceImage, API_IMG_PATH_URL, $mdToast, $q ) => {
    /* Init vars */

    const modalTemplateUrl = 'templates/modals/resources-delete.html';
    const savePromisesArray = [];
    $scope.isEditMode = false;
    $scope.resourceBackup = {};
    $scope.API_IMG_PATH_URL = API_IMG_PATH_URL;

    /* Private methods START */

    const setupModal = function(){

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
    };

    const uploadImage = ( ResourceId ) => {

      const deferred = $q.defer();

      if ( typeof $scope.resource.ImageForUpload !== 'undefined' ) {

        const result = ResourceImage.upload( $scope.resource.ImageForUpload, ResourceId );

        // Image upload failed
        result.error( () => {

          $mdToast.show( $mdToast.simple()
              .content( 'Resursen "' + $scope.resource.Name + '" skapades, men det gick inte att ladda upp och spara den önskade bilden.' )
              .position( 'top right' )
              .theme( 'warn' )
          );
        });

        savePromisesArray.push( result );

        return result;
      }

      savePromisesArray.push( deferred.promise );

      // Return resolved promise if no image is available for upload
      deferred.resolve();

      return deferred.promise;
    };

    const saveSuccess = function() {
      // Display success message
      $mdToast.show( $mdToast.simple()
        .content( 'Resursen "' + $scope.resource.Name + '" sparades med ett lyckat resultat' )
        .position( 'top right' )
        .theme( 'success' )
      );
    };

    const getResource = function () {

      const resource = Resource.get(
        {
          resourceId: $stateParams.resourceId
        }
      );

      // In case resource cannot be fetched, display an error to user.
      resource.$promise.catch( () => {

        $mdToast.show( $mdToast.simple()
          .content( 'Resurs kunde inte hämtas, var god försök igen.' )
          .position( 'top right' )
          .theme( 'warn' )
        );
      });

      $scope.resource = resource;
    };

    const handleSaveErrors = function ( response ) {

      // If there there was a foreign key reference
      if ( response.status === 409 ){
        $mdToast.show( $mdToast.simple()
            .content( 'Det finns redan en resurs som heter "' + $scope.resource.Name +
            '". Två resurser kan inte heta lika.' )
            .position( 'top right' )
            .theme( 'warn' )
        );
      }

      // If there was a problem with the in-data
      else if ( response.status === 400 || response.status === 500 ){
        $mdToast.show( $mdToast.simple()
            .content( 'Ett oväntat fel uppstod när resursen skulle sparas' )
            .position( 'top right' )
            .theme( 'warn' )
        );
      }

      // If the entry was not found
      if ( response.status === 404 ) {
        $mdToast.show( $mdToast.simple()
            .content( 'Resursen "' + $scope.resource.Name + '" existerar inte längre. Hann kanske någon radera den?' )
            .position( 'top right' )
            .theme( 'warn' )
        );

        history.back();
      }
    };

    const handleDeleteErrors = function ( response ) {

      // If there there was a foreign key reference
      if (
        response.status === 400 &&
        response.data.Message !== 'undefined' &&
        response.data.Message === 'Foreign key references exists'
      ){
        $mdToast.show( $mdToast.simple()
            .content( 'Resursen kan inte raderas eftersom det finns' +
            ' en lokalbokning eller en lokalresurs som refererar till resursen' )
            .position( 'top right' )
            .theme( 'warn' )
        );
      }

      // If there was a problem with the in-data
      else if ( response.status === 400 || response.status === 500 ){
        $mdToast.show( $mdToast.simple()
            .content( 'Ett oväntat fel uppstod när resursen skulle tas bort' )
            .position( 'top right' )
            .theme( 'warn' )
        );
      }

      // If the entry was not found
      if ( response.status === 404 ) {
        $mdToast.show( $mdToast.simple()
            .content( 'Resursen "' + $scope.resource.Name + '" existerar inte längre. Hann kanske någon radera den?' )
            .position( 'top right' )
            .theme( 'warn' )
        );
      }

      history.back();
    };

    /* Private Methods END */

    /* Public Methods START */

    $scope.startEditMode = function () {
      const $scope = this;

      $scope.isEditMode = true;

      // Make backup of data if in editMode.
      $scope.resourceBackup = angular.copy( $scope.resource );
    };

    $scope.endEditMode = function () {
      const $scope = this;

      $scope.isEditMode = false;
    };

    $scope.abortEditMode = function() {
      const $scope = this;

      $scope.isEditMode = false;
      $scope.resource = $scope.resourceBackup;
    };

    $scope.saveResource = function() {

      const $scope = this;

      // Save resource
      Resource.save(
        {
          ResourceId: $stateParams.resourceId,
          Name: $scope.resource.Name,
          Count: $scope.resource.Count,
          ImageSrc: $scope.resource.ImageSrc,
          BookingPricePerHour: $scope.resource.BookingPricePerHour,
          MinutesMarginBeforeBooking: $scope.resource.MinutesMarginBeforeBooking,
          MinutesMarginAfterBooking: $scope.resource.MinutesMarginAfterBooking,
          WeekEndCount: $scope.resource.WeekEndCount
        }
      ).$promise

        // If everything went ok
        .then( ( response ) => {

          $scope.endEditMode();

          // Upload image
          uploadImage( response.ResourceId )

            .finally( () => {

              // Redirect
              history.back();
            });

          // Only show success message if all save promises resolved without errors.
          $q.all( savePromisesArray )
            .then( () => {

              saveSuccess();
            });

        // Something went wrong
        }).catch( ( response ) => {

          handleSaveErrors( response );
        });
    };

    $scope.deleteResource = function() {

      // Delete resource
      Resource.delete(
        {
          resourceId: $stateParams.resourceId
        }
      ).$promise

        // If everything went ok
        .then( ( response ) => {

          $mdToast.show( $mdToast.simple()
            .content( 'Resursen "' + $scope.resource.Name + '" raderades med ett lyckat resultat' )
            .position( 'top right' )
            .theme( 'success' )
          );

          history.back();
        })
        // Something went wrong
        .catch( ( response ) => {

          handleDeleteErrors( response );
        });
    };

    /* Public Methods END */

    /* Initialization START */

    setupModal();
    getResource();

    /* Initialization END */
  }]
  )

  //Create controller
  .controller( 'ResourceCreateCtrl', [ '$rootScope', '$stateParams', '$scope', '$state', 'Resource', '$mdToast', 'ResourceImage', '$q', ( $rootScope, $stateParams, $scope, $state, Resource, $mdToast, ResourceImage, $q ) => {

    /* Init vars */
    $scope.resource = {};
    const savePromisesArray = [];

    /* Private methods START */

    const uploadImage = ( ResourceId ) => {

      const deferred = $q.defer();

      if ( typeof $scope.resource.ImageForUpload !== 'undefined' ) {

        const result = ResourceImage.upload( $scope.resource.ImageForUpload, ResourceId );

        // Image upload failed
        result.error( () => {

          $mdToast.show( $mdToast.simple()
              .content( 'Resursen "' + $scope.resource.Name + '" skapades, men det gick inte att ladda upp och spara den önskade bilden.' )
              .position( 'top right' )
              .theme( 'warn' )
          );
        });

        savePromisesArray.push( result );

        return result;
      }

      savePromisesArray.push( deferred.promise );

      // Return resolved promise if no image is available for upload
      deferred.resolve();

      return deferred.promise;
    };

    // Display success message
    const saveSuccess = () => {

      // Display success message
      $mdToast.show( $mdToast.simple()
          .content( 'Resursen "' + $scope.resource.Name + '" sparades med ett lyckat resultat' )
          .position( 'top right' )
          .theme( 'success' )
      );
    };

    const handleSaveErrors = function( response ) {

      // If there there was a foreign key reference
      if ( response.status === 409 ){
        $mdToast.show( $mdToast.simple()
            .content( 'Det finns redan en resurs som heter "' + $scope.resource.Name +
            '". Två resurser kan inte heta lika.' )
            .position( 'top right' )
            .theme( 'warn' )
        );
      }

      // If there was a problem with the in-data
      else {
        $mdToast.show( $mdToast.simple()
            .content( 'Ett oväntat fel uppstod när resursen skulle sparas' )
            .position( 'top right' )
            .theme( 'warn' )
        );
      }
    };

    /* Private Methods END */

    /* Public Methods START */

    $scope.saveResource = function() {

      const $scope = this;

      // Save resource
      Resource.save(
        {
          ResourceId: 0,
          Name: $scope.resource.Name,
          Count: $scope.resource.Count,
          BookingPricePerHour: $scope.resource.BookingPricePerHour,
          MinutesMarginBeforeBooking: $scope.resource.MinutesMarginBeforeBooking,
          MinutesMarginAfterBooking: $scope.resource.MinutesMarginAfterBooking,
          WeekEndCount: $scope.resource.WeekEndCount
        }
      ).$promise

        // If everything went ok
        .then( ( response ) => {

          // Upload image
          uploadImage( response.ResourceId )

            .finally( () => {

              // Redirect
              history.back();
            });

          // Only show success message if all save promises resolved without errors.
          $q.all( savePromisesArray )
            .then( () => {

              saveSuccess();
            });

          // Something went wrong
        }).catch( ( response ) => {

          handleSaveErrors( response );
        });
    };

    /* Public Methods END */

    /* Initialization START */

    /* Initialization END */

  }]
  );

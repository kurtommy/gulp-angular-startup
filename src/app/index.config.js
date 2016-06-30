export function config($locationProvider, $httpProvider, $compileProvider, constantManagerProvider,
    $translatePartialLoaderProvider, $translateProvider, localStorageServiceProvider, toastrConfig, $provide,
    ENABLED_LOG_METHODS, loggerServiceProvider) {
  'ngInject';
  $compileProvider.debugInfoEnabled(constantManagerProvider.getConstant('ENV') !== 'production');
  $locationProvider.html5Mode(constantManagerProvider.getConstant('HTML5_MODE'));
  $httpProvider.useApplyAsync(constantManagerProvider.getConstant('USE_APPLYASYNC'));

  //Interceptor
  $httpProvider.interceptors.push('httpInterceptor');

  //Local storage configs
  localStorageServiceProvider.setPrefix(constantManagerProvider.getConstant('APP_NAME'));

  //i18n Configs
  $translatePartialLoaderProvider.addPart('app');
  $translateProvider.useLoader('$translatePartialLoader', {
    urlTemplate: '/app/i18n/{part}/{part}-{lang}.json'
  });
  $translateProvider.preferredLanguage('it');
  $translateProvider.useSanitizeValueStrategy('sanitizeParameters');

  //Toastr
  angular.extend(toastrConfig, {
    autoDismiss: false,
    containerId: 'toast-container',
    maxOpened: 3,
    newestOnTop: true,
    positionClass: 'toast-top-right',
    preventDuplicates: true,
    preventOpenDuplicates: true,
    target: 'body',
    timeOut: 3000,
    extendedTimeOut: 3000
  });

  //$log decoration
  $provide.decorator('$log', ($delegate) => {
    //Info
    var infoFn = $delegate.info;
    $delegate.info = function logInfo() {
      if (ENABLED_LOG_METHODS.info) {
        infoFn.apply(null, arguments);
      }
    };

    //Log
    var logFn = $delegate.log;
    $delegate.log = function logLog() {
      if (ENABLED_LOG_METHODS.log) {
        logFn.apply(null, arguments);
      }
    };

    //Debug
    var debugFn = $delegate.debug;
    $delegate.debug = function logDebug() {
      if (ENABLED_LOG_METHODS.debug) {
        debugFn.apply(null, arguments);
      }
    };

    //Debug
    var warnFn = $delegate.warn;
    $delegate.warn = function logWarn() {
      let logPayload = [].slice.call(arguments);
      loggerServiceProvider.warn(logPayload);
      if (ENABLED_LOG_METHODS.warn) {
        warnFn.apply(null, arguments);
      }
    };

    //Error
    var errorFn = $delegate.error;
    $delegate.error = function logError() {
      let logPayload = [].slice.call(arguments);
      loggerServiceProvider.error(logPayload);
      if (ENABLED_LOG_METHODS.error) {
        errorFn.apply(null, arguments);
      }
    };
    return $delegate;
  });

  //$exceptionHandler decoration
  $provide.decorator('$exceptionHandler', ($delegate) => {
    return (exception, cause) => {
      //By default Angular $exceptionHandler calls $log.error
      //Wich in turn calls loggerProvider
      $delegate(exception, cause);
    };
  });
}

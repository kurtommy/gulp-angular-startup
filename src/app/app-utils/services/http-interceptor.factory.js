export function HttpInterceptor($log, $injector) {
  'ngInject';

  let interceptor = {
    responseError: handleError,
    response: handleResponse,
    request: handleRequest
  };

  function handleRequest(request){
    // if (~request.url.indexOf('api')) {}
    return request;
  }

  function handleResponse(response) {
    let config = response.config;
    if (config.url.indexOf('api') > 0) {
      if (response.data && response.data.metadata && response.data.metadata.info) {
        //NOTE handle in app specific way
        _logInfosOrErrors(response);
      }
    }
    return response;
  }

  function handleError(response) {
    //NOTE handle in app specific way
    _logInfosOrErrors(response);
    return response;
  }

  function _logInfosOrErrors(response) {
    //TODO: avoid open multiple modals, ex push toast messages and add target to
    //message payload
    let modalManagerService = $injector.get('modalManagerService');
    let modalErrorPayload = {
      dismissable: false
    };
    let errorInfoData = response.data && response.data.metadata &&
        (response.data.metadata.error || response.data.metadata.info);
    if (errorInfoData) {
      angular.extend(modalErrorPayload, errorInfoData);
      modalErrorPayload.closeBtnTitle = 'Close';
      modalManagerService.open(modalErrorPayload);
      return true;
    } else if (response.data) {
      modalErrorPayload.message = response.data;
    } else {
      modalErrorPayload.message = 'Damn! Server error';
    }
    modalErrorPayload.title = 'Server error';
    modalErrorPayload.type = 'error';
    modalErrorPayload.closeBtnTitle = 'Close';
    modalManagerService.open(modalErrorPayload);
  }

  return interceptor;
}
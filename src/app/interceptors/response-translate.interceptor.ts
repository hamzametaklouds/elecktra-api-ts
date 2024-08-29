/**
 * These utilities i.e ExecutionContext and Call handler provide information about the current execution context
 * which can be used to build generic guards, filters, and interceptors
 */
import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Types } from 'mongoose';

/**
 * The purpose of this interceptor is to intercept request before it is received by the request handler here we are getting
    request from the execution context and getting the preferred languge from the header so that
    we can use it for later use when we are going to intercept response and alter it down to the
    prefered language
 *
 */
export class TranslatorInterceptor implements NestInterceptor {
  constructor() {}
  intercept(
    context: ExecutionContext,
    handler: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    /**
     * Every request is handled here before it is received by the request handler here we are getting
     * request from the execution context and getting the preferred languge from the header so that
     * we can use it for later use when we are going to intercept response and alter it down to the
     * prefered language
     */
    const request = context.switchToHttp().getRequest();
    const translatingLanguage = request.headers['preferred-language']
      ? request.headers['preferred-language']
      : request.headers['accept-language'];

    return handler.handle().pipe(
      map((response) => {
        if (translatingLanguage && translatingLanguage !== 'all') {
          response.data = this.toSingleLanguage(
            translatingLanguage,
            response.data,
          );
        }
        return response;
      }),
    );
  }

  /**
   * this method is designed for coverting multiple language data into single desired language
   * argument @data will be either object or object[] and the method similarly returns object or object[]
   * firstly, @data is turned into object[] so that @data can be processed in similiar ways
   * every field from every object from @data is then iterated and processed in following steps:
   * 1) value in field should not be null/Id
   * 2) if value is a multi-language object then translate it and iterate to next field
   * 3) if value is an array or a non multi-language object then the method act as a recursive function for it
   */
  toSingleLanguage = (languageCode, data): Object | Object[] => {
    let dataArray = Array.isArray(data) ? data : [data];
    dataArray = dataArray.map((object) => {
      object = object?._doc ? object.toObject() : object;
      const fields = Object.keys(object);
      type fields = { en: string; ar: string } | any;
      fields.forEach((field: fields) => {
        if (object[field] && !Types.ObjectId.isValid(object[field])) {
          if (object[field]?.en) {
            object[field] = object[field][languageCode]
              ? object[field][languageCode]
              : object[field]['en'];
          } else if (typeof object[field] === 'object') {
            object[field] = this.toSingleLanguage(languageCode, object[field]);
          }
        }
      });
      return object;
    });
    return Array.isArray(data) ? dataArray : dataArray[0];
  };
}

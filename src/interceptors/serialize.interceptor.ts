import {
  UseInterceptors,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToClass } from 'class-transformer';
import * as util from 'util';
import { UserDto } from '../users/dtos/user.dto';

export function Serialize(dto: any) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}

  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    //return something before handler
    //console.dir(context /*, { depth: null }*/);
    //console.log(util.inspect(context, false, null, true /* enable colors */));
    return handler.handle().pipe(
      map((data: any) => {
        return plainToClass(this.dto, data, {
          excludeExtraneousValues: true,
        });
        //return something before response
        //console.log(
        //'Im running before response is sent' + JSON.stringify(data),
        //);
      }),
    );
  }
}

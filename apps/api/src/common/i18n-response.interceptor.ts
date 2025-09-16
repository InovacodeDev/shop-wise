import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class I18nResponseInterceptor implements NestInterceptor {
    constructor(private readonly i18n: any) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const request = context.switchToHttp().getRequest();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const lang = (request.i18nLang as string) || 'en';

        return next.handle().pipe(
            map((data: any) => {
                if (data && typeof data === 'object') {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return this.translateResponse(data, lang);
                }
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return data;
            }),
        );
    }

    private translateResponse(data: any, lang: string): any {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (data.message && typeof data.message === 'string') {
            // Se a mensagem contém uma chave de tradução
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if ((data.message as string).includes('.')) {
                try {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
                    data.message = this.i18n.t(data.message as string, { lang });
                } catch {
                    // Keep original message if translation fails
                }
            }
        }
        return data;
    }
}

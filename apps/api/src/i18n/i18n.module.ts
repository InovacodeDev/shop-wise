import { Module } from '@nestjs/common';
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';

@Module({
    imports: [
        I18nModule.forRoot({
            fallbackLanguage: 'en',
            loaderOptions: {
                path: path.join(__dirname, '../../../locales/'),
                watch: true,
            },
            resolvers: [
                { use: QueryResolver, options: ['lang'] },
                { use: HeaderResolver, options: ['accept-language'] },
                new AcceptLanguageResolver(),
            ],
            // Disable type generation to avoid file system errors in development
            // typesOutputPath: path.join(__dirname, '../generated/i18n.generated.ts'),
        }),
    ],
})
export class I18nCustomModule {}

import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';

describe('AppController', () => {
    let appController: AppController;

    beforeEach(async () => {
        const mockAuthGuard = { canActivate: () => true };

        const app: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [AppService],
        })
            .overrideGuard(AuthGuard)
            .useValue(mockAuthGuard)
            .compile();

        appController = app.get<AppController>(AppController);
    });

    describe('root', () => {
        it('should return "Hello World!"', () => {
            expect(appController.getHello()).toBe('Hello World!');
        });
    });
});

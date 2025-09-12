import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';

import { PaymentPollingService } from './services/payment-polling.service';

@Injectable()
export class PaymentsLifecycleService implements OnApplicationBootstrap, OnApplicationShutdown {
    private readonly logger = new Logger(PaymentsLifecycleService.name);

    constructor(private readonly pollingService: PaymentPollingService) {}

    onApplicationBootstrap(): void {
        this.logger.log('Starting payment polling service...');
        this.pollingService.startPolling();
        this.logger.log('Payment polling service started successfully');
    }

    onApplicationShutdown(): void {
        this.logger.log('Stopping payment polling service...');
        this.pollingService.stopPolling();
        this.logger.log('Payment polling service stopped successfully');
    }
}

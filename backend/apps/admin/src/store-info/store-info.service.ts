import StoreInfo from '@app/entities/classes/store-info';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class StoreInfoService {

    constructor(@InjectRepository(StoreInfo) private readonly storeInfoRepository: Repository<StoreInfo>) {}

    getStoreInfo(): Promise<StoreInfo | null> {
        try {
            const storeInfo = this.storeInfoRepository.findOne({
                relations: {
                    address: true,
                    policies: true,
                    contactMessages: true,
                },
            });
            if (!storeInfo) {
                throw new Error('Store information not found');
            }
            return storeInfo;
        } catch (error) {
            throw new Error('Could not fetch store information');
        }
    }
}

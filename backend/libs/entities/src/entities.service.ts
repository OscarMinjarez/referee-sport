import { Injectable } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from "path";

@Injectable()
export class EntitiesService {

    constructor() {
        TypeOrmModule.forRoot({
            type: "postgres",
            host: "localhost",
            port: 5432,
            username: "postgres",
            password: "1234",
            database: "referee_sport",
            entities: [
                join(__dirname, "../**/*.entity.{ts,js}")
            ],
            synchronize: true // TODO: Quitar en producción
        });
    }
}

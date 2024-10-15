import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PokemonModule } from './pokemon/pokemon.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedModule } from './seed/seed.module';
import { AxiosAdapter } from './common/adapters/axios.adapter';
import { CommonModule } from './common/pipes/common.module';
import { EnvConfiguration } from './config/app.config';




@Module({
  controllers: [],
  providers: [AxiosAdapter],
  exports:[AxiosAdapter],
  imports: [
    ConfigModule.forRoot({
      load:[EnvConfiguration]
    }),
    ServeStaticModule.forRoot({ 
    rootPath: join(__dirname,'..','public'), 
    }),
    MongooseModule.forRoot('mongodb://mongo:iZXSmqITtVFOAGRxetApLreJSySNXhRz@autorack.proxy.rlwy.net:27674',{
      dbName:'pokemonsdb'
    } ),
    PokemonModule,
    SeedModule ,
    CommonModule
    ], 
})
export class AppModule {
}

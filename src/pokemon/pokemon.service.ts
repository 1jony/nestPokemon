
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, Query } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {
  private defaultLimit : number
  constructor(
    private readonly  configService:ConfigService,
    @InjectModel(Pokemon.name)
    private readonly pokemonModel = Model<Pokemon>
  
  ){
    this.defaultLimit = configService.get<number>('defaultLimit')
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase()
    try{
      const pokemon = await this.pokemonModel.create(createPokemonDto)
      return pokemon
    }
    catch(error){
      if(error.code === 1100 ){
        throw new BadRequestException('pokemon exit in db')
      }
      throw new InternalServerErrorException()
    }
  }

  findAll(paginationDto:PaginationDto) {
    const {limit=this.defaultLimit,offset=0} = paginationDto 
    return this.pokemonModel.find()
    .limit(limit)
    .skip(offset)
    .sort({
      no:1
    })
    .select('-__v')
  }


  async findOne(term: string) {
    
    let pokemon: Pokemon;

    if ( !isNaN(+term) ) {
      pokemon = await this.pokemonModel.findOne({ no: term });
    }

    // MongoID
    if ( !pokemon && isValidObjectId( term ) ) {
      pokemon = await this.pokemonModel.findById( term );
    }

    // Name
    if ( !pokemon ) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase().trim() })
    }


    if ( !pokemon ) 
      throw new NotFoundException(`Pokemon with id, name or no "${ term }" not found`);
    

    return pokemon;
  }

  async update( term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne( term );
    if ( updatePokemonDto.name )
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    
    try {
      await pokemon.updateOne( updatePokemonDto );
      return { ...pokemon.toJSON(), ...updatePokemonDto };
      
    } catch (error) {
      this.handleExceptions( error );
    }
  }


  remove(id: number) {
    return `This action removes a #${id} pokemon`;
  }

  private handleExceptions( error: any ) {
    if ( error.code === 11000 ) {
      throw new BadRequestException(`Pokemon exists in db ${ JSON.stringify( error.keyValue ) }`);
    }
    console.log(error);
    throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`);
  }

}




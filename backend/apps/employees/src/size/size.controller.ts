import { 
    Controller, 
    Get, 
    Post, 
    Put, 
    Delete, 
    Body, 
    Param, 
    HttpStatus, 
    HttpException 
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import Size from '@app/entities/classes/size.entity';
  
  @Controller('size')
  export class SizeController {
    constructor(
      @InjectRepository(Size)
      private sizeRepository: Repository<Size>,
    ) {}
  
    @Get()
    async findAll(): Promise<Size[]> {
      try {
        return await this.sizeRepository.find();
      } catch (error: any) {
        throw new HttpException('Error al obtener los tamaños', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Size> {
      try {
        const size = await this.sizeRepository.findOne({ where: { uuid: id } });
        if (!size) {
          throw new HttpException('Tamaño no encontrado', HttpStatus.NOT_FOUND);
        }
        return size;
      } catch (error: any) {
        if(error?.status === HttpStatus.NOT_FOUND) throw error;
        throw new HttpException('Error al obtener el tamaño', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  
    @Post()
    async create(@Body() sizeData: Partial<Size>): Promise<Size> {
      try {
        const size = this.sizeRepository.create(sizeData);
        return await this.sizeRepository.save(size);
      } catch (error: any) {
        throw new HttpException('Error al crear el tamaño', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  
    @Put(':id')
    async update(@Param('id') id: string, @Body() sizeData: Partial<Size>): Promise<Size> {
      try {
        await this.sizeRepository.update({ uuid: id }, sizeData);
        const updatedSize = await this.sizeRepository.findOne({ where: { uuid: id } });
        if (!updatedSize) {
          throw new HttpException('Tamaño no encontrado', HttpStatus.NOT_FOUND);
        }
        return updatedSize;
      } catch (error: any) {
        if (error?.status === HttpStatus.NOT_FOUND) throw error;
        throw new HttpException('Error al actualizar el tamaño', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  
    @Delete(':id')
    async delete(@Param('id') id: string): Promise<{ message: string }> {
      try {
        const size = await this.sizeRepository.findOne({ where: { uuid: id } });
        if (!size) {
          throw new HttpException('Tamaño no encontrado', HttpStatus.NOT_FOUND);
        }
        await this.sizeRepository.delete({ uuid: id });
        return { message: 'Tamaño eliminado correctamente' };
      } catch (error: any) {
        if(error?.status === HttpStatus.NOT_FOUND) throw error;
        throw new HttpException('Error al eliminar el tamaño', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
  
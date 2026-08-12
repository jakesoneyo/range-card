import { Injectable } from '@nestjs/common';
import { Map as MapModel } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MapsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<MapModel[]> {
    return this.prisma.map.findMany({ orderBy: { name: 'asc' } });
  }

  findBySlug(slug: string): Promise<MapModel | null> {
    return this.prisma.map.findUnique({ where: { slug } });
  }
}

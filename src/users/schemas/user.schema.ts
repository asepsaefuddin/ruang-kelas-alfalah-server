import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, select: false }) // select: false makes password hidden by default
  password: string;

  @Prop({ required: true })
  namaLengkap: string;

  @Prop({ required: true, unique: true })
  nipNim: string;

  @Prop({ required: true, enum: ['admin', 'guru', 'siswa'] })
  role: string;

  @Prop({ required: true, enum: ['aktif', 'tidak aktif'], default: 'aktif' })
  status: string;

  // Field khusus untuk siswa
  @Prop({ 
    required: function() { return this.role === 'siswa'; },
    validate: {
      validator: function(value: string) {
        if (this.role === 'siswa') return !!value;
        return true;
      },
      message: 'Kelas wajib diisi untuk siswa'
    }
  })
  kelas?: string; // Contoh: "10A", "11IPA1", "12IPS2"

  // Field khusus untuk guru
  @Prop({ 
    required: function() { return this.role === 'guru'; },
    validate: {
      validator: function(value: string) {
        if (this.role === 'guru') return !!value;
        return true;
      },
      message: 'Mata pelajaran wajib diisi untuk guru'
    }
  })
  mataPelajaran?: string; // Contoh: "Matematika", "Bahasa Indonesia", "Fisika"
}

export const UserSchema = SchemaFactory.createForClass(User);
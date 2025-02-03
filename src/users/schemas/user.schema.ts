import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class Profile {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  profileName: string;
}

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  age: number;

  @Prop({ type: Profile })
  profile: Profile;
}

export const UserSchema = SchemaFactory.createForClass(User);

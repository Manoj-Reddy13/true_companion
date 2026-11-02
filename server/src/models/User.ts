import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    anonymousUsername: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    nickname: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      select: false,
      default: '',
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    avatar: {
      type: String,
      default: 'avatar-1',
    },
    bio: {
      type: String,
      maxlength: 200,
      default: 'Here to listen and share.',
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user',
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'banned'],
      default: 'active',
      index: true,
    },
    warningCount: {
      type: Number,
      default: 0,
    },
    suspensionUntil: {
      type: Date,
      default: null,
    },
    bookmarks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
  },
  {
    timestamps: true,
  }
);

UserSchema.set('toJSON', {
  transform: function (_doc: any, ret: any, options: any) {
    ret._id = ret._id?.toString();
    if (!options?.includeSecrets) {
      delete ret.passwordHash;
    }
    delete ret.__v;
    return ret;
  },
});

export const UserModel = mongoose.model<any>('User', UserSchema);

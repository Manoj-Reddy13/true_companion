import mongoose, { Schema } from 'mongoose';

const BlockedUserSchema = new Schema(
  {
    blockerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    blockedUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

BlockedUserSchema.index({ blockerId: 1, blockedUserId: 1 }, { unique: true });

BlockedUserSchema.set('toJSON', {
  transform: function (_doc: any, ret: any) {
    ret._id = ret._id?.toString();
    delete ret.__v;
    return ret;
  },
});

export const BlockedUserModel = mongoose.model<any>('BlockedUser', BlockedUserSchema);

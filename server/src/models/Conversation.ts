import mongoose, { Schema } from 'mongoose';

const ConversationSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    chatRequestId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatRequest',
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
    status: {
      type: String,
      enum: ['active', 'ended', 'blocked'],
      default: 'active',
      index: true,
    },
    endedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

ConversationSchema.index({ participants: 1 });

ConversationSchema.set('toJSON', {
  transform: function (_doc: any, ret: any) {
    ret._id = ret._id?.toString();
    delete ret.__v;
    return ret;
  },
});

export const ConversationModel = mongoose.model<any>('Conversation', ConversationSchema);

import mongoose, { Schema } from 'mongoose';

const NotificationSchema = new Schema(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'chat_request_received',
        'chat_request_accepted',
        'chat_request_declined',
        'new_message',
        'report_update',
        'safety_notice',
        'system',
      ],
      required: true,
    },
    referenceId: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ recipientId: 1, createdAt: -1 });

NotificationSchema.set('toJSON', {
  transform: function (_doc: any, ret: any) {
    ret._id = ret._id?.toString();
    delete ret.__v;
    return ret;
  },
});

export const NotificationModel = mongoose.model<any>('Notification', NotificationSchema);

import mongoose, { Schema } from 'mongoose';

const ReportSchema = new Schema(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reportedUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      index: true,
    },
    messageId: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      index: true,
    },
    reason: {
      type: String,
      required: true,
      enum: [
        'Inappropriate messages',
        'Harassment',
        'Bullying',
        'Threats',
        'Spam',
        'Fake accounts',
        'Scams',
        'Inappropriate images',
        'Suspicious behaviour',
        'Immediate danger / self-harm concern',
        'Other',
      ],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'investigating', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    adminAction: {
      type: String,
      enum: [
        'none',
        'warning_issued',
        'post_removed',
        'account_suspended',
        'account_banned',
        'report_dismissed',
      ],
      default: 'none',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

ReportSchema.set('toJSON', {
  transform: function (_doc: any, ret: any) {
    ret._id = ret._id?.toString();
    delete ret.__v;
    return ret;
  },
});

export const ReportModel = mongoose.model<any>('Report', ReportSchema);

import mongoose, { Schema } from 'mongoose';

const PostAttachmentSchema = new Schema(
  {
    url: { type: String, required: true },
    filename: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { _id: false }
);

const PostSchema = new Schema(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Mental Wellbeing',
        'Loneliness',
        'Relationship Issues',
        'Academic Pressure',
        'Career Confusion',
        'Family Problems',
        'Personal Struggles',
        'Motivation',
        'Other',
      ],
      index: true,
    },
    attachments: [PostAttachmentSchema],
    chatEnabled: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['active', 'hidden', 'flagged'],
      default: 'active',
      index: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

PostSchema.index({ createdAt: -1 });
PostSchema.index({ category: 1, createdAt: -1 });
PostSchema.index({ title: 'text', description: 'text' });

PostSchema.set('toJSON', {
  transform: function (_doc: any, ret: any) {
    ret._id = ret._id?.toString();
    delete ret.__v;
    return ret;
  },
});

export const PostModel = mongoose.model<any>('Post', PostSchema);

// Shared toJSON transform for every model.
//  - _id becomes a string "id" (listed first, so it reads like the M2 shape)
//  - __v (Mongoose's version counter) is removed
// Sub-documents declared with { _id: false } have no _id, so they pass through.
export const jsonOptions = {
  transform(doc, ret) {
    delete ret.__v;
    if (ret._id === undefined) return ret;
    const { _id, ...rest } = ret;
    return { id: String(_id), ...rest };
  },
};

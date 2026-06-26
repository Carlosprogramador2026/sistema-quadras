// Encapsula handlers async, encaminhando qualquer erro para o errorHandler.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

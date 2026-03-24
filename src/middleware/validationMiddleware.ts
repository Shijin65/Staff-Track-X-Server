import { Request, Response, NextFunction, RequestHandler } from "express";
import { Schema, ValidationError } from "yup";

import { logger } from "../config/loggerConfig";
import { ApiResponse } from "../utils";

interface AuthRequest extends Request {
  user?: {
    userId?: string;
  };
}

/**
 * Middleware for validating request using Yup schema
 */
const validateSchema = (schema: Schema): RequestHandler => {
  const validation: RequestHandler = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    const user = req.user?.userId ?? "Unknown";

    try {
      await schema.validate(
        {
          body: req.body,
          query: req.query,
          params: req.params,
        },
        { abortEarly: false }
      );

      next();
    } catch (error) {
      const validationError = error as ValidationError;

      if (validationError.inner && validationError.inner.length > 0) {
        const firstError = validationError.inner[0];
        const errorMessage = firstError.message;

        logger.error(
          `Validation failed for user: ${user}, Error: ${errorMessage}`
        );

        return res.status(400).json(new ApiResponse(400, errorMessage));
      }

      return res
        .status(400)
        .json(new ApiResponse(400, "Validation Error"));
    }
  };

  return validation;
};

export default validateSchema;
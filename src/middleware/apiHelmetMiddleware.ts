import { Request, Response, NextFunction } from "express";

const apiHelmet = (req: Request, res: Response, next: NextFunction): void => {
  if (req.path.startsWith("/api/swagger")) {
    res.removeHeader("X-Powered-By");
    return next();
  }

  // Content Security Policy
  // res.setHeader("Content-Security-Policy", "default-src 'self'");
  // Strict Transport Security
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  // Origin-Agent-Cluster
  res.setHeader("Origin-Agent-Cluster", "?1");

  // Referrer Policy
  res.setHeader("Referrer-Policy", "no-referrer");

  // DNS Prefetch Control
  res.setHeader("X-DNS-Prefetch-Control", "off");

  // Content Type Options
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Download Options
  res.setHeader("X-Download-Options", "noopen");

  // Frame Options
  res.setHeader("X-Frame-Options", "DENY");

  // XSS Protection
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Remove Express signature
  res.removeHeader("X-Powered-By");

  next();
};

export default apiHelmet;
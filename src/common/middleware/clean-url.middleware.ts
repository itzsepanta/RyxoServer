import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class CleanUrlMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const originalUrl = req.originalUrl || req.url;

    // Regex targeting common legacy web extensions (.html, .php, .asp, .aspx, .jsp, .htm) before query string
    const extensionRegex = /\.(html|php|asp|aspx|jsp|htm)(?=\?|$)/i;

    if (extensionRegex.test(originalUrl)) {
      const cleanUrl = originalUrl.replace(extensionRegex, "");

      // Permanent 301 SEO-Friendly Redirect for asset standard compliance
      res.setHeader("Cache-Control", "public, max-age=31536000");
      return res.redirect(301, cleanUrl);
    }

    next();
  }
}
